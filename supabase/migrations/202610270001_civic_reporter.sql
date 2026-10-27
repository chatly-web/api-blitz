begin;
create extension if not exists pgcrypto;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (length(handle) between 3 and 60),
  avatar_seed text not null check (avatar_seed ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);
create table public.official_emails (email text primary key check (email = lower(email)));
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  category text not null check (category in ('Pothole','Garbage','Streetlight','Water leak','Drainage','Other')),
  description text not null check (length(description) between 10 and 2000),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  ward text check (length(ward) <= 100),
  status text not null default 'open' check (status in ('open','acknowledged','in_progress','resolved')),
  claimed boolean not null default false,
  before_public_id text not null,
  after_public_id text,
  public_note text check (length(public_note) <= 2000),
  score integer not null default 0,
  created_at timestamptz not null default now(),
  constraint resolved_requires_photo check (status <> 'resolved' or after_public_id is not null)
);
create index reports_location on public.reports(category,lat,lng);
create index reports_created on public.reports(created_at desc);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (length(body) between 1 and 1500),
  score integer not null default 0,
  review_required boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_report on public.comments(report_id,created_at);
create table public.votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('report','comment')),
  target_id uuid not null,
  value smallint not null check (value in (1,-1)),
  primary key (user_id,target_type,target_id)
);
create index votes_target on public.votes(target_type,target_id);
create table public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  actor_id uuid not null,
  created_at timestamptz not null default now()
);
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  action text not null,
  report_id uuid not null references public.reports(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index audit_claim_lookup on public.audit_log(report_id,action,actor_id);
create table public.request_limits (
  actor_id uuid not null,
  bucket text not null,
  window_start bigint not null,
  hits integer not null default 1,
  primary key(actor_id,bucket,window_start)
);
create table public.upload_authorizations (
  public_id text primary key,
  actor_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('before','after')),
  created_at timestamptz not null default now()
);
create index upload_authorizations_actor on public.upload_authorizations(actor_id,created_at);
-- All browser roles are explicitly denied the sensitive tables. RLS remains a
-- second barrier even if a future deployment grants table privileges by mistake.
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;
alter table public.admin_notes enable row level security;
alter table public.audit_log enable row level security;
alter table public.official_emails enable row level security;
alter table public.request_limits enable row level security;
alter table public.upload_authorizations enable row level security;
revoke all on public.profiles,public.reports,public.comments,public.votes,public.admin_notes,public.audit_log,public.official_emails,public.request_limits,public.upload_authorizations from anon,authenticated;
revoke all on sequence public.audit_log_id_seq from anon,authenticated;
-- Community reads also go through server DTOs: no raw Auth UUID, author_id,
-- private upload owner, moderation flag or authority attribution is exposed.
-- No client SELECT policies or grants are created.
-- Writes go through authenticated server routes, which enforce signed receipts,
-- moderation and rate limits. No browser can bypass those checks using PostgREST.
grant all on public.profiles,public.reports,public.comments,public.votes,public.admin_notes,public.audit_log,public.official_emails,public.request_limits,public.upload_authorizations to service_role;
grant usage,select on sequence public.audit_log_id_seq to service_role;

create function public.validate_reply() returns trigger language plpgsql set search_path=public,pg_temp as $$
declare parent public.comments;
begin
  if new.parent_id is not null then
    select * into parent from public.comments where id=new.parent_id;
    if not found or parent.report_id<>new.report_id or parent.parent_id is not null then raise exception 'INVALID_REPLY'; end if;
  end if;
  return new;
end; $$;
create trigger enforce_one_reply_level before insert or update of parent_id,report_id on public.comments for each row execute function public.validate_reply();

create function public.sync_vote_score() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare target uuid; kind text; total integer;
begin
  if tg_op='DELETE' then target=old.target_id; kind=old.target_type; else target=new.target_id; kind=new.target_type; end if;
  select coalesce(sum(value),0)::integer into total from public.votes where target_id=target and target_type=kind;
  if kind='report' then update public.reports set score=total where id=target;
  else update public.comments set score=total where id=target; end if;
  return null;
end; $$;
create trigger votes_sync after insert or update or delete on public.votes for each row execute function public.sync_vote_score();

create function public.remove_target_votes() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  delete from public.votes where target_id=old.id and target_type=case when tg_table_name='reports' then 'report' else 'comment' end;
  return old;
end; $$;
create trigger report_votes_cleanup after delete on public.reports for each row execute function public.remove_target_votes();
create trigger comment_votes_cleanup after delete on public.comments for each row execute function public.remove_target_votes();

create function public.consume_rate_limit(p_actor uuid,p_bucket text,p_limit integer,p_window_seconds integer) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare slot bigint; used integer;
begin
  if p_limit<1 or p_window_seconds<1 then raise exception 'INVALID_LIMIT'; end if;
  slot=floor(extract(epoch from clock_timestamp())/p_window_seconds);
  insert into public.request_limits(actor_id,bucket,window_start) values(p_actor,p_bucket,slot)
    on conflict(actor_id,bucket,window_start) do update set hits=request_limits.hits+1 returning hits into used;
  delete from public.request_limits where actor_id=p_actor and bucket=p_bucket and window_start<slot-2;
  return used<=p_limit;
end; $$;

create function public.cast_vote(p_actor uuid,p_target_type text,p_target_id uuid,p_value smallint) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare previous smallint; total integer; next_value integer;
begin
  if p_target_type not in ('report','comment') or p_value not in (-1,1) then raise exception 'INVALID_VOTE'; end if;
  -- Serialize at the target so aggregate scores remain correct under concurrent users.
  if p_target_type='report' then perform 1 from public.reports where id=p_target_id for update;
  else perform 1 from public.comments where id=p_target_id for update; end if;
  if not found then raise exception 'NOT_FOUND'; end if;
  select value into previous from public.votes where user_id=p_actor and target_type=p_target_type and target_id=p_target_id;
  if previous=p_value then
    delete from public.votes where user_id=p_actor and target_type=p_target_type and target_id=p_target_id;
    next_value=0;
  else
    insert into public.votes values(p_actor,p_target_type,p_target_id,p_value)
      on conflict(user_id,target_type,target_id) do update set value=excluded.value;
    next_value=p_value;
  end if;
  if p_target_type='report' then select score into total from public.reports where id=p_target_id;
  else select score into total from public.comments where id=p_target_id; end if;
  return jsonb_build_object('score',total,'myVote',next_value);
end; $$;

create function public.nearby_reports(p_lat double precision,p_lng double precision,p_category text,p_radius_m double precision default 30)
returns table(id uuid,description text,status text,distance_m double precision) language sql stable security definer set search_path=public,pg_temp as $$
  select r.id,r.description,r.status,
    6371000*2*asin(sqrt(least(1.0,power(sin(radians(r.lat-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(r.lat))*power(sin(radians(r.lng-p_lng)/2),2)))) as distance_m
  from public.reports r
  where r.category=p_category and r.lat between p_lat-p_radius_m/111000.0 and p_lat+p_radius_m/111000.0
    and least(abs(r.lng-p_lng),360.0-abs(r.lng-p_lng))<=least(360.0,p_radius_m/(111000.0*greatest(abs(cos(radians(p_lat))),0.000001)))
    and 6371000*2*asin(sqrt(least(1.0,power(sin(radians(r.lat-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(r.lat))*power(sin(radians(r.lng-p_lng)/2),2))))<=least(greatest(p_radius_m,1),100)
  order by distance_m limit 5;
$$;

create function public.is_official_actor(p_actor uuid) returns boolean language sql stable security definer set search_path=public,auth,pg_temp as $$
  select exists(select 1 from auth.users u join public.official_emails o on o.email=lower(u.email) where u.id=p_actor and u.email_confirmed_at is not null);
$$;
revoke execute on function public.is_official_actor(uuid) from public,anon,authenticated;
grant execute on function public.is_official_actor(uuid) to service_role;

create function public.claim_report(p_actor uuid,p_report_id uuid) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if not public.is_official_actor(p_actor) then raise exception 'NOT_AUTHORIZED'; end if;
  update public.reports set claimed=true where id=p_report_id and claimed=false;
  if not found then raise exception 'ALREADY_CLAIMED'; end if;
  insert into public.audit_log(actor_id,action,report_id) values(p_actor,'claim',p_report_id);
  return true;
end; $$;

create function public.update_report(p_actor uuid,p_report_id uuid,p_status text,p_public_note text,p_internal_note text,p_after_public_id text default null)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare current_report public.reports;
begin
  if not public.is_official_actor(p_actor) then raise exception 'NOT_AUTHORIZED'; end if;
  select * into current_report from public.reports where id=p_report_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if not exists(select 1 from public.audit_log where report_id=p_report_id and actor_id=p_actor and action='claim') then raise exception 'CLAIM_REQUIRED'; end if;
  if p_status='resolved' and coalesce(p_after_public_id,current_report.after_public_id) is null then raise exception 'AFTER_PHOTO_REQUIRED'; end if;
  update public.reports set status=p_status,public_note=nullif(p_public_note,''),after_public_id=coalesce(p_after_public_id,after_public_id) where id=p_report_id;
  insert into public.audit_log(actor_id,action,report_id) values(p_actor,'status:'||p_status,p_report_id);
  if length(trim(coalesce(p_internal_note,'')))>0 then
    insert into public.admin_notes(report_id,body,actor_id) values(p_report_id,p_internal_note,p_actor);
    insert into public.audit_log(actor_id,action,report_id) values(p_actor,'internal_note',p_report_id);
  end if;
  return true;
end; $$;

-- PostgreSQL grants function EXECUTE to PUBLIC by default: revoke it explicitly.
revoke execute on function public.validate_reply(),public.sync_vote_score(),public.remove_target_votes() from public,anon,authenticated;
revoke execute on function public.consume_rate_limit(uuid,text,integer,integer),public.cast_vote(uuid,text,uuid,smallint),public.nearby_reports(double precision,double precision,text,double precision),public.claim_report(uuid,uuid),public.update_report(uuid,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(uuid,text,integer,integer),public.cast_vote(uuid,text,uuid,smallint),public.nearby_reports(double precision,double precision,text,double precision),public.claim_report(uuid,uuid),public.update_report(uuid,uuid,text,text,text,text) to service_role;
commit;

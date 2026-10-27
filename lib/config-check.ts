export type ConfigCheck = { name: string; required: boolean; status: 'ready' | 'missing' | 'invalid'; message: string };
const required = [
  'NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY',
  'AVATAR_HMAC_SECRET','NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET','CLOUDINARY_UPLOAD_PRESET','NEXT_PUBLIC_SITE_URL',
] as const;
const optional = ['NEXT_PUBLIC_GOOGLE_MAPS_KEY','GEMINI_API_KEY'] as const;
function validUrl(value: string) {
  try { const url=new URL(value); return url.protocol==='https:' || (url.protocol==='http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname)); }
  catch { return false; }
}
export function checkConfiguration(env: Record<string,string | undefined>): ConfigCheck[] {
  return [...required,...optional].map(name => {
    const isRequired = (required as readonly string[]).includes(name);
    const value=env[name]?.trim() || '';
    const check: ConfigCheck={name,required:isRequired,status:value?'ready':'missing',message:value?'Configured':isRequired?'Add this value.':'Optional; the manual/fallback path remains available.'};
    if (!value) return check;
    let error='';
    if (/^(?:replace[_ -]|your[_ -]|<)/i.test(value)) error='Replace the placeholder with a real value.';
    else if (['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SITE_URL'].includes(name) && !validUrl(value)) error='Use a valid HTTPS URL, or localhost for development.';
    else if (name==='NEXT_PUBLIC_SITE_URL') {
      const url=new URL(value);
      if (url.pathname!=='/' || url.search || url.hash || url.username || url.password) error='Use the site origin only, without a path, query or embedded credentials.';
    } else if (name==='AVATAR_HMAC_SECRET' && value.length<32) error='Use a stable, randomly generated secret of at least 32 characters.';
    else if (name==='SUPABASE_SERVICE_ROLE_KEY' && value===env.NEXT_PUBLIC_SUPABASE_ANON_KEY) error='The server service-role key must differ from the public anon key.';
    if (error) {check.status='invalid';check.message=error;}
    return check;
  });
}

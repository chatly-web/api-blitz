import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
const hidden = () => new NextResponse('<!doctype html><html lang="en"><title>Page not found</title><body><h1>Page not found</h1><p>This page is not available.</p><a href="/">Return to Civic</a></body></html>', { status:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'} });
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const adminPage = path === '/admin' || path.startsWith('/admin/');
  const protectedPage = adminPage || path === '/insights' || path.startsWith('/insights/') || path === '/map' || path === '/me' || path.startsWith('/report/') || path.startsWith('/r/');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !serviceKey || !process.env.AVATAR_HMAC_SECRET) {
    if (adminPage) return hidden();
    if (protectedPage) return NextResponse.redirect(new URL('/login',request.url));
    return response;
  }
  const supabase = createServerClient(url,key,{
    cookies:{
      getAll:()=>request.cookies.getAll(),
      setAll:values=>{
        values.forEach(({name,value})=>request.cookies.set(name,value));
        response=NextResponse.next({request});
        values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      },
    },
  });
  const {data:{user},error}=await supabase.auth.getUser();
  const authenticated=!error && user?.app_metadata.providers?.includes('google');
  if (adminPage) {
    if (!authenticated || !user?.email || !user.email_confirmed_at) return hidden();
    const db=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data:official,error:allowlistError}=await db.from('official_emails').select('email').eq('email',user.email.toLowerCase()).maybeSingle();
    if (allowlistError || !official) return hidden();
  } else if (protectedPage && !authenticated) return NextResponse.redirect(new URL('/login',request.url));
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|api/avatar).*)']};

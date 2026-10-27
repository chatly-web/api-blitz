import { createServerClient } from '@supabase/ssr';
import { NextResponse,type NextRequest } from 'next/server';
const hidden=()=>new NextResponse('Not found',{status:404,headers:{'Cache-Control':'private, no-store'}});
/** Refresh transport only. Every protected page/route independently validates getUser().
 * Never use the getSession user object below to grant access or decide authority roles. */
export async function proxy(request:NextRequest){
 let response=NextResponse.next({request});
 const path=request.nextUrl.pathname;
 const admin=path==='/admin'||path.startsWith('/admin/');
 const protectedPage=admin||path==='/map'||path==='/me'||path==='/insights'||path.startsWith('/insights/')||path.startsWith('/report/')||path.startsWith('/r/');
 const hasCookie=request.cookies.getAll().some(cookie=>cookie.name.startsWith('sb-')&&cookie.name.includes('-auth-token'));
 if(!hasCookie){if(admin)return hidden();if(protectedPage)return NextResponse.redirect(new URL('/login',request.url));return response;}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY;
 if(!url||!key)return response;
 const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 await supabase.auth.getSession();
 return response;
}
// Public samples and avatars do not need Supabase at all. Auth callback owns its PKCE cookies.
export const config={matcher:['/','/login','/map','/me','/insights/:path*','/report/:path*','/r/:path*','/admin/:path*','/api/((?!avatar).*)']};

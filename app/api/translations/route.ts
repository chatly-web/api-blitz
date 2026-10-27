import { NextResponse } from 'next/server';
import { languages, uiTexts } from '@/lib/languages';
const cached = new Map<string,Record<string,string>>();
const pending = new Map<string,Promise<Record<string,string>>>();
async function translate(target:string) {
  const response=await fetch('https://translation.googleapis.com/language/translate/v2',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':process.env.GOOGLE_TRANSLATE_API_KEY!},body:JSON.stringify({q:uiTexts,source:'en',target,format:'text'}),signal:AbortSignal.timeout(12000),cache:'no-store'});
  if (!response.ok) throw new Error('Translation unavailable');
  const payload=await response.json();
  const rows=payload.data?.translations;
  if (!Array.isArray(rows) || rows.length!==uiTexts.length || rows.some((row: {translatedText?: unknown})=>typeof row.translatedText!=='string')) throw new Error('Invalid translations');
  const dictionary=Object.fromEntries(uiTexts.map((text,index)=>[text,rows[index].translatedText as string]));
  cached.set(target,dictionary);return dictionary;
}
export async function GET(request:Request) {
  const target=new URL(request.url).searchParams.get('language') || 'en';
  if (!(Object.hasOwn(languages,target))) return NextResponse.json({error:'Unsupported language.'},{status:400});
  if (target==='en') return NextResponse.json({dictionary:{}});
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) return NextResponse.json({error:'Translation is not connected yet. English remains available.'},{status:503});
  try {
    let dictionary=cached.get(target);
    if (!dictionary) {
      let task=pending.get(target);
      if (!task) {task=translate(target);pending.set(target,task);}
      try { dictionary=await task; } finally {pending.delete(target);}
    }
    return NextResponse.json({dictionary},{headers:{'Cache-Control':'public, max-age=3600, s-maxage=86400'}});
  } catch {return NextResponse.json({error:'Translation is unavailable. Please try again. English remains available.'},{status:503});}
}

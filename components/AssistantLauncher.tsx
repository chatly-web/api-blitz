'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageCircle } from 'lucide-react';
import { T,useLanguage } from '@/components/LanguageProvider';
const Assistant=dynamic(()=>import('@/components/CivicAssistant').then(module=>module.CivicAssistant),{loading:()=> <div className="assistant-widget"><button className="assistant-toggle" type="button" disabled aria-label="Loading assistant"><MessageCircle size={19}/><span>Loading…</span></button></div>,ssr:false});
export function AssistantLauncher({signedIn}:{signedIn:boolean}){
 const [started,setStarted]=useState(false);const {t}=useLanguage();
 if(started)return <Assistant signedIn={signedIn} initiallyOpen/>;
 return <div className="assistant-widget"><button className="assistant-toggle" type="button" aria-label={t('Civic assistant')} aria-expanded={false} onClick={()=>setStarted(true)}><MessageCircle size={19}/><span><T>Civic assistant</T></span></button></div>;
}

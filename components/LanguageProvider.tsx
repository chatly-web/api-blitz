'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Languages, LoaderCircle } from 'lucide-react';
import { languages, type Language } from '@/lib/languages';
const LanguageContext=createContext({language:'en' as Language,t:(text:string)=>text,choose:async (_language:Language)=>{},busy:false,error:''});
export function LanguageProvider({children}:{children:React.ReactNode}) {
  const [language,setLanguage]=useState<Language>('en');const [dictionary,setDictionary]=useState<Record<string,string>>({});const [busy,setBusy]=useState(false);const [error,setError]=useState('');const sequence=useRef(0);
  async function choose(next:Language) {
    const current=++sequence.current;setError('');
    if(next==='en'){setLanguage('en');setDictionary({});setBusy(false);try{localStorage.setItem('civic-language','en');}catch{}return;}
    setBusy(true);
    try {
      const response=await fetch(`/api/translations?language=${next}`,{signal:AbortSignal.timeout(15000)});const data=await response.json();
      if(!response.ok)throw new Error(data.error || 'Translation unavailable.');
      if(current!==sequence.current)return;
      setDictionary(data.dictionary);setLanguage(next);try{localStorage.setItem('civic-language',next);}catch{}
    } catch(error){if(current===sequence.current)setError(error instanceof Error?error.message:'Translation unavailable.');}
    finally{if(current===sequence.current)setBusy(false);}
  }
  useEffect(()=>{try{const saved=localStorage.getItem('civic-language');if(saved && Object.hasOwn(languages,saved) && saved!=='en')void choose(saved as Language);}catch{}},[]);
  useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==='ur'?'rtl':'ltr';},[language]);
  return <LanguageContext.Provider value={{language,t:text=>dictionary[text] || text,choose,busy,error}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
export function T({children}:{children:string}){const {t}=useLanguage();return <>{t(children)}</>;}
export function LanguageSelector(){const {language,t,choose,busy,error}=useLanguage();return <div className="language-control"><label className="language-label"><Languages size={16} aria-hidden="true"/><span className="sr-only">{t('Language')}</span><select aria-label={t('Language')} value={language} disabled={busy} onChange={event=>void choose(event.target.value as Language)}>{Object.entries(languages).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select>{busy && <LoaderCircle className="spinner" size={14} aria-label="Translating"/>}</label>{error && <p className="language-error" role="status">{error}</p>}</div>;}

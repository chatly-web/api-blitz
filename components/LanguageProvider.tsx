'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { languages, type Language } from '@/lib/languages';
import { translateLabel } from '@/lib/translations';
const LanguageContext=createContext({language:'en' as Language,t:(text:string)=>text,choose:(_language:Language)=>{}});
export function LanguageProvider({children}:{children:React.ReactNode}) {
  const [language,setLanguage]=useState<Language>('en');
  function choose(next:Language) {
    if(!Object.hasOwn(languages,next))return;
    setLanguage(next);
    try{localStorage.setItem('civic-language',next);}catch{ /* The choice still works when storage is blocked. */ }
  }
  useEffect(()=>{try{const saved=localStorage.getItem('civic-language');if(saved && Object.hasOwn(languages,saved))setLanguage(saved as Language);}catch{}},[]);
  useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==='ur'?'rtl':'ltr';},[language]);
  return <LanguageContext.Provider value={{language,t:text=>translateLabel(language,text),choose}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
export function T({children}:{children:string}){const {t}=useLanguage();return <>{t(children)}</>;}
export function LanguageSelector(){const {language,t,choose}=useLanguage();return <div className="language-control"><label className="language-label"><Languages size={16} aria-hidden="true"/><span className="sr-only">{t('Language')}</span><select aria-label={t('Language')} value={language} onChange={event=>choose(event.target.value as Language)}>{Object.entries(languages).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label></div>;}

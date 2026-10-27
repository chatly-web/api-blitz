'use client';
import { T, useLanguage } from '@/components/LanguageProvider';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LoaderCircle, Sparkles, ShieldCheck, CopyCheck, Camera, FileText, MapPin, Check } from 'lucide-react';
import { categories, type Category, type UploadReceipt } from '@/lib/types';
import { mergePhotoSuggestions,type DetailRevisions,type SuggestedDetails } from '@/lib/auto-fill';
import { Avatar } from '@/components/Avatar';
import type { Identity } from '@/lib/types';
import { draftSchema, DRAFT_KEY } from '@/lib/assistant-contract';
import { postJson, errorMessage } from '@/lib/client-api';
import { PhotoUpload } from '@/components/PhotoUpload';
import { LocationPicker } from '@/components/LocationPicker';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
type Nearby = { id: string; description: string; distance_m: number };
export function ReportForm({identity}:{identity?:Identity}={}) {
  const {t} = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisions=useRef<DetailRevisions>({category:0,description:0});
  const fields=useRef({category:'Pothole' as Category,description:''});
  const manualWard=useRef(false);
  const lastAnalyzed=useRef('');
  const [photo,setPhoto] = useState<UploadReceipt | null>(null); const [category,setCategory] = useState<Category>('Pothole');
  const [description,setDescription] = useState(''); const [ward,setWard] = useState('');
  const [analysisCompleteKey,setAnalysisCompleteKey]=useState('');
  const [analysisFailed,setAnalysisFailed]=useState(false);
  const [analysisAttempt,setAnalysisAttempt]=useState(0);
  const photoKey=photo?`${photo.publicId}:${photo.version}`:'';
  const analysisPending=Boolean(photoKey&&analysisCompleteKey!==photoKey);
  fields.current={category,description};
  const [location,setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby,setNearby] = useState<Nearby[]>([]); const [acknowledged,setAcknowledged] = useState(false);
  const [photoBusy,setPhotoBusy] = useState(false);
  const [busy,setBusy] = useState(false); const [analyzing,setAnalyzing] = useState(false); const [error,setError] = useState(''); const [suggestion,setSuggestion] = useState('');
  useEffect(() => {
    setAcknowledged(false); setNearby([]);
    if (!location) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({ lat: String(location.lat), lng: String(location.lng), category });
        const response = await fetch(`/api/nearby?${query}`, { signal: controller.signal });
        if (response.ok) setNearby((await response.json()).nearby);
      } catch { /* Submission repeats the mandatory duplicate check. */ }
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [location,category]);
  useEffect(() => {
    if (searchParams.get('assistant')!=='1') return;
    try {
      const raw=sessionStorage.getItem(DRAFT_KEY);if(!raw)return;
      const value=JSON.parse(raw);const {savedAt,...draftFields}=value;
      const draft=draftSchema.safeParse(draftFields);
      if(!draft.success || typeof savedAt!=='number' || Date.now()-savedAt>30*60*1000 || savedAt>Date.now()){sessionStorage.removeItem(DRAFT_KEY);return;}
      revisions.current.category++;revisions.current.description++;manualWard.current=Boolean(draft.data.ward);
      fields.current={category:draft.data.category,description:draft.data.description};
      setCategory(draft.data.category);setDescription(draft.data.description);setWard(draft.data.ward);
      setSuggestion('Assistant draft loaded. Review the details, add your own photo and select the exact location.');
      sessionStorage.removeItem(DRAFT_KEY);
    }catch{ /* A blocked browser store never prevents manual reporting. */ }
  }, [searchParams]);
  useEffect(() => {
    if(!photo || photoBusy){setAnalyzing(false);if(!photo)setAnalysisFailed(false);return;}
    if(lastAnalyzed.current===photoKey)return;
    const controller=new AbortController();let cancelled=false;
    const started={...revisions.current};
    setAnalysisFailed(false);setAnalyzing(true);setSuggestion('Your face-blurred photo is being analyzed automatically…');
    void postJson<SuggestedDetails>('/api/analyze-photo',{photo},'POST',controller.signal).then(result=>{
      if(cancelled)return;
      const merged=mergePhotoSuggestions(fields.current,started,revisions.current,result);
      fields.current=merged;setCategory(merged.category);setDescription(merged.description);
      setSuggestion('Photo details filled automatically. Review and edit them before submitting.');
    }).catch(error=>{
      if(!cancelled){setAnalysisFailed(true);setSuggestion(`${errorMessage(error)} Your photo is kept; retry AI suggestions or fill in the details manually.`);}
    }).finally(()=>{
      if(!cancelled){lastAnalyzed.current=photoKey;setAnalysisCompleteKey(photoKey);setAnalyzing(false);}
    });
    return ()=>{cancelled=true;controller.abort();};
  }, [photoKey,photoBusy,analysisAttempt]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || photoBusy || analyzing || analysisPending) return;
    setError('');
    if (!photo || !location) { setError('Add a photo and an exact location before submitting.'); return; }
    setBusy(true);
    try {
      const result = await postJson<{ id: string }>('/api/reports', { photo, category, description, ward, ...location, duplicateAcknowledged: acknowledged });
      router.push(`/r/${result.id}`); router.refresh();
    } catch (error) {
      const payload = (error as { payload?: { nearby?: Nearby[] } }).payload;
      if (payload?.nearby) { setNearby(payload.nearby); setAcknowledged(false); }
      setError(errorMessage(error)); setBusy(false);
    }
  }
  return <form className="report-form" onSubmit={submit}><div className="report-step-guide" aria-label="Report checklist"><span data-complete={Boolean(photo)}>{photo?<Check size={15}/>:<Camera size={15}/>}<T>Photo evidence</T></span><span data-complete={description.trim().length>=10}>{description.trim().length>=10?<Check size={15}/>:<FileText size={15}/>}<T>Issue details</T></span><span data-complete={Boolean(location)}>{location?<Check size={15}/>:<MapPin size={15}/>}<T>Exact location</T></span></div><fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
    <section className="form-field report-category-field">
      <label className="field-label" htmlFor="category" style={{ fontSize: 16 }}><T>Issue category</T></label>
      <select id="category" className="input" value={category} onChange={event => {revisions.current.category++;fields.current.category=event.target.value as Category;setCategory(event.target.value as Category);}}>{categories.map(value => <option key={value} value={value}><T>{value}</T></option>)}</select>
      <p className="field-help">Category fills automatically from your uploaded photo. You can change it.</p>
    </section>
    <section className="form-section report-photo-section">
      <h2><T>Photo evidence</T></h2>
      <p className="muted small"><T>Document the issue as it is now.</T></p>
      <PhotoUpload purpose="before" category={category} value={photo} onChange={setPhoto} onBusyChange={setPhotoBusy} disabled={busy} />
      <div className="auto-fill-status" role="status" aria-live="polite">{analyzing||analysisPending?<LoaderCircle size={16} className="spinner"/>:<Sparkles size={16}/>}<p>{suggestion || 'Upload a photo to fill the category and description automatically. Your location is requested separately.'}</p></div>{analysisFailed&&photo&&!photoBusy&&<Button type="button" variant="outline" disabled={analyzing||busy} onClick={()=>{lastAnalyzed.current='';setAnalysisFailed(false);setAnalysisCompleteKey('');setAnalysisAttempt(value=>value+1);}}><Sparkles size={16}/>Retry AI suggestions</Button>}
    </section>
    <section className="form-section report-details-section">
      <h2><T>Issue details</T></h2>
      <div className="form-field"><label className="field-label" htmlFor="description"><T>What needs attention?</T></label><Textarea id="description" value={description} onChange={event => {revisions.current.description++;fields.current.description=event.target.value;setDescription(event.target.value);}} required minLength={10} maxLength={2000} placeholder={t("Describe what you can see and how it affects this public space.")} /><p className="field-help"><T>10–2,000 characters. Don’t include names, contact details or personal accusations.</T></p></div>
      <div className="form-field"><label className="field-label" htmlFor="ward"><T>Ward or neighborhood</T> <small>(<T>Optional</T>)</small></label><Input id="ward" value={ward} onChange={event => {manualWard.current=true;setWard(event.target.value);}} maxLength={100} placeholder={t("e.g. Central ward")} /></div>
    </section>
    <section className="form-section report-location-section">
      <h2><T>Exact location</T></h2>
      <LocationPicker value={location} onChange={setLocation} onPlaceResolved={place => {if(!manualWard.current)setWard((place.neighborhood || place.city || '').slice(0,100));}} />
      {nearby.length > 0 && <div className="duplicate-list"><h3><CopyCheck size={16} style={{ display: 'inline', marginRight: 6 }} />Similar reports within 30 meters</h3><p className="small">You may be able to add a comment to an existing issue.</p>{nearby.map(item => <Link href={`/r/${item.id}`} key={item.id}>{item.description.slice(0,100)} · {Math.round(item.distance_m)} m away →</Link>)}<label><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />I checked these reports. This is a separate issue.</label></div>}
    </section>
    <div className="form-footer">
      <p><ShieldCheck size={15} style={{ display: 'inline', marginRight: 5 }} /><T>Your report uses an anonymous handle. Your Google name and photo are never displayed.</T>{identity&&<span className="report-identity-preview"><Avatar identity={identity} size={28}/><span>{identity.handle}</span></span>}</p>
      <Button type="submit" disabled={!photo || !location || busy || photoBusy || analyzing || analysisPending || (nearby.length > 0 && !acknowledged)}>{t(busy ? 'Submitting…' : 'Submit report')}<ArrowRight size={16} /></Button>
    </div>
    <p className="form-error" role="status">{error}</p>
  </fieldset></form>;
}

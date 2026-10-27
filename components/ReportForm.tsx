'use client';
import { T, useLanguage } from '@/components/LanguageProvider';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, CopyCheck, Camera, FileText, MapPin, Check } from 'lucide-react';
import { categories, type Category, type UploadReceipt } from '@/lib/types';
import { draftSchema, DRAFT_KEY } from '@/lib/assistant-contract';
import { postJson, errorMessage } from '@/lib/client-api';
import { PhotoUpload } from '@/components/PhotoUpload';
import { LocationPicker } from '@/components/LocationPicker';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
type Nearby = { id: string; description: string; distance_m: number };
export function ReportForm() {
  const {t} = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [photo,setPhoto] = useState<UploadReceipt | null>(null); const [category,setCategory] = useState<Category>('Pothole');
  const [description,setDescription] = useState(''); const [ward,setWard] = useState('');
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
      const value=JSON.parse(raw);const {savedAt,...fields}=value;
      const draft=draftSchema.safeParse(fields);
      if(!draft.success || typeof savedAt!=='number' || Date.now()-savedAt>30*60*1000 || savedAt>Date.now()){sessionStorage.removeItem(DRAFT_KEY);return;}
      setCategory(draft.data.category);setDescription(draft.data.description);setWard(draft.data.ward);
      setSuggestion('Assistant draft loaded. Review the details, add your own photo and select the exact location.');
      sessionStorage.removeItem(DRAFT_KEY);
    }catch{ /* A blocked browser store never prevents manual reporting. */ }
  }, [searchParams]);
  async function analyze() {
    if (!photo) return;
    setAnalyzing(true); setSuggestion('');
    try {
      const result = await postJson<{ category: Category; description: string; severity: string }>('/api/analyze-photo', { photo });
      setCategory(result.category);
      setDescription(result.description);
      setSuggestion(`Suggested "${result.category}" (${result.severity} priority). Details filled below—feel free to edit before submitting.`);
    } catch (error) { setSuggestion(errorMessage(error)); }
    finally { setAnalyzing(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || photoBusy || analyzing) return;
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
      <select id="category" className="input" value={category} onChange={event => setCategory(event.target.value as Category)}>{categories.map(value => <option key={value} value={value}><T>{value}</T></option>)}</select>
      <p className="field-help"><T>Select the issue category. The photo field below automatically adapts its placeholder to this category.</T></p>
    </section>
    <section className="form-section report-photo-section">
      <h2><T>Photo evidence</T></h2>
      <p className="muted small"><T>Document the issue as it is now.</T></p>
      <PhotoUpload purpose="before" category={category} value={photo} onChange={setPhoto} onBusyChange={setPhotoBusy} disabled={busy} />
      <div style={{ marginTop: 14 }}>
        <Button variant="outline" type="button" onClick={analyze} disabled={!photo || photoBusy || analyzing}><Sparkles size={16} />{t(analyzing ? 'Analyzing photo…' : 'Suggest details from photo')}</Button>
        <p className="field-help" role="status">{suggestion || 'Optional. AI will analyze your photo and automatically populate the description.'}</p>
      </div>
    </section>
    <section className="form-section report-details-section">
      <h2><T>Issue details</T></h2>
      <div className="form-field"><label className="field-label" htmlFor="description"><T>What needs attention?</T></label><Textarea id="description" value={description} onChange={event => setDescription(event.target.value)} required minLength={10} maxLength={2000} placeholder={t("Describe what you can see and how it affects this public space.")} /><p className="field-help"><T>10–2,000 characters. Don’t include names, contact details or personal accusations.</T></p></div>
      <div className="form-field"><label className="field-label" htmlFor="ward"><T>Ward or neighborhood</T> <small>(<T>Optional</T>)</small></label><Input id="ward" value={ward} onChange={event => setWard(event.target.value)} maxLength={100} placeholder={t("e.g. Central ward")} /></div>
    </section>
    <section className="form-section report-location-section">
      <h2><T>Exact location</T></h2>
      <LocationPicker value={location} onChange={setLocation} onPlaceResolved={place => { if (!ward && place.neighborhood) setWard(place.neighborhood); }} />
      {nearby.length > 0 && <div className="duplicate-list"><h3><CopyCheck size={16} style={{ display: 'inline', marginRight: 6 }} />Similar reports within 30 meters</h3><p className="small">You may be able to add a comment to an existing issue.</p>{nearby.map(item => <Link href={`/r/${item.id}`} key={item.id}>{item.description.slice(0,100)} · {Math.round(item.distance_m)} m away →</Link>)}<label><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />I checked these reports. This is a separate issue.</label></div>}
    </section>
    <div className="form-footer">
      <p><ShieldCheck size={15} style={{ display: 'inline', marginRight: 5 }} /><T>Your report uses an anonymous handle. Your Google name and photo are never displayed.</T></p>
      <Button type="submit" disabled={!photo || !location || busy || photoBusy || analyzing || (nearby.length > 0 && !acknowledged)}>{t(busy ? 'Submitting…' : 'Submit report')}<ArrowRight size={16} /></Button>
    </div>
    <p className="form-error" role="status">{error}</p>
  </fieldset></form>;
}

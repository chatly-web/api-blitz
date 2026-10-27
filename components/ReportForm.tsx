'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, CopyCheck } from 'lucide-react';
import { categories, type Category, type UploadReceipt } from '@/lib/types';
import { postJson, errorMessage } from '@/lib/client-api';
import { PhotoUpload } from '@/components/PhotoUpload';
import { LocationPicker } from '@/components/LocationPicker';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
type Nearby = { id: string; description: string; distance_m: number };
export function ReportForm() {
  const router = useRouter();
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
  return <form onSubmit={submit}><fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
    <section className="form-field" style={{ marginBottom: 24 }}>
      <label className="field-label" htmlFor="category" style={{ fontSize: 16 }}>Issue category</label>
      <select id="category" className="input" value={category} onChange={event => setCategory(event.target.value as Category)}>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select>
      <p className="field-help">Select the issue category. The photo field below automatically adapts its placeholder to this category.</p>
    </section>
    <section className="form-section" style={{ marginTop: 0, paddingTop: 20 }}>
      <h2>Photo evidence</h2>
      <p className="muted small">Document the issue as it is now.</p>
      <PhotoUpload purpose="before" category={category} value={photo} onChange={setPhoto} onBusyChange={setPhotoBusy} disabled={busy} />
      <div style={{ marginTop: 14 }}>
        <Button variant="outline" type="button" onClick={analyze} disabled={!photo || photoBusy || analyzing}><Sparkles size={16} />{analyzing ? 'Analyzing photo…' : 'Suggest details from photo'}</Button>
        <p className="field-help" role="status">{suggestion || 'Optional. AI will analyze your photo and automatically populate the description.'}</p>
      </div>
    </section>
    <section className="form-section">
      <h2>Issue details</h2>
      <div className="form-field"><label className="field-label" htmlFor="description">What needs attention?</label><Textarea id="description" value={description} onChange={event => setDescription(event.target.value)} required minLength={10} maxLength={2000} placeholder="Describe what you can see and how it affects this public space." /><p className="field-help">10–2,000 characters. Don’t include names, contact details or personal accusations.</p></div>
      <div className="form-field"><label className="field-label" htmlFor="ward">Ward or neighborhood <small>(optional)</small></label><Input id="ward" value={ward} onChange={event => setWard(event.target.value)} maxLength={100} placeholder="e.g. Central ward" /></div>
    </section>
    <section className="form-section">
      <h2>Exact location</h2>
      <LocationPicker value={location} onChange={setLocation} onPlaceResolved={place => { if (!ward && place.neighborhood) setWard(place.neighborhood); }} />
      {nearby.length > 0 && <div className="duplicate-list"><h3><CopyCheck size={16} style={{ display: 'inline', marginRight: 6 }} />Similar reports within 30 meters</h3><p className="small">You may be able to add a comment to an existing issue.</p>{nearby.map(item => <Link href={`/r/${item.id}`} key={item.id}>{item.description.slice(0,100)} · {Math.round(item.distance_m)} m away →</Link>)}<label><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />I checked these reports. This is a separate issue.</label></div>}
    </section>
    <div className="form-footer">
      <p><ShieldCheck size={15} style={{ display: 'inline', marginRight: 5 }} />Your report uses an anonymous handle. Your Google name and photo are never displayed.</p>
      <Button type="submit" disabled={!photo || !location || busy || photoBusy || analyzing || (nearby.length > 0 && !acknowledged)}>{busy ? 'Submitting…' : 'Submit report'}<ArrowRight size={16} /></Button>
    </div>
    <p className="form-error" role="status">{error}</p>
  </fieldset></form>;
}

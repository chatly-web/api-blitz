'use client';
import { useEffect, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function LocationPicker({ value, onChange }: { value: { lat: number; lng: number } | null; onChange: (point: { lat: number; lng: number } | null) => void }) {
  const [latText,setLatText] = useState(value ? String(value.lat) : '');
  const [lngText,setLngText] = useState(value ? String(value.lng) : '');
  useEffect(() => { if (value) { setLatText(String(value.lat)); setLngText(String(value.lng)); } }, [value]);
  function changeCoordinates(latitude: string, longitude: string) {
    setLatText(latitude); setLngText(longitude);
    const lat=Number(latitude),lng=Number(longitude);
    if (latitude.trim() && longitude.trim() && Number.isFinite(lat) && Number.isFinite(lng) && lat>=-90 && lat<=90 && lng>=-180 && lng<=180) onChange({lat,lng});
    else onChange(null);
  }
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  function locate() {
    if (!navigator.geolocation) { setMessage('Location is unavailable. Enter the coordinates manually.'); return; }
    setBusy(true); setMessage('Waiting for location permission…');
    navigator.geolocation.getCurrentPosition(position => { onChange({ lat: position.coords.latitude, lng: position.coords.longitude }); setBusy(false); setMessage('Location added. Drag the pin to the exact issue.'); }, () => { setBusy(false); setMessage('Location permission was denied or GPS is unavailable. Enter the coordinates below.'); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }
  return <div className="location-picker"><div className="location-actions"><Button variant="outline" type="button" onClick={locate} disabled={busy}><LocateFixed size={16} />{busy ? 'Locating…' : 'Use my current location'}</Button><p className="field-help" style={{ margin: 0 }}>Or enter coordinates, then adjust the pin.</p></div><div className="form-grid"><div><label className="field-label" htmlFor="latitude">Latitude</label><Input id="latitude" type="number" step="any" min="-90" max="90" value={latText} onChange={event => changeCoordinates(event.target.value,lngText)} placeholder="e.g. 23.0225" required /></div><div><label className="field-label" htmlFor="longitude">Longitude</label><Input id="longitude" type="number" step="any" min="-180" max="180" value={lngText} onChange={event => changeCoordinates(latText,event.target.value)} placeholder="e.g. 72.5714" required /></div></div><p role="status" className="field-help" style={{ marginBottom: 12 }}>{message}</p>{value && <MapView value={value} onPick={onChange} />}<p className="field-help">The exact coordinates will be visible on the issue map. Choose a public location, not a private home.</p></div>;
}

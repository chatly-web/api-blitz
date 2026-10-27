'use client';
import { useEffect,useRef,useState } from 'react';
import { LoaderCircle,MapPin } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { Input } from '@/components/ui/input';
import { T } from '@/components/LanguageProvider';
import { shouldApplyDeviceLocation } from '@/lib/auto-fill';
import { reverseGeocodeGeoapify,type ResolvedPlace } from '@/lib/geoapify';
type Point={lat:number;lng:number};
export function LocationPicker({value,onChange,onPlaceResolved}:{value:Point|null;onChange:(point:Point|null)=>void;onPlaceResolved?:(place:ResolvedPlace)=>void}){
 const [latText,setLatText]=useState(value?String(value.lat):'');const [lngText,setLngText]=useState(value?String(value.lng):'');
 const [resolvedPlace,setResolvedPlace]=useState<ResolvedPlace|null>(null);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const manuallyEdited=useRef(false);const callbacks=useRef({onChange,onPlaceResolved});callbacks.current={onChange,onPlaceResolved};
 useEffect(()=>{if(value){setLatText(String(value.lat));setLngText(String(value.lng));}},[value]);
 useEffect(()=>{
  if(value)return;
  if(!navigator.geolocation){setMessage('GPS is unavailable. Enter the coordinates below.');return;}
  let cancelled=false;setBusy(true);setMessage('Requesting your current location…');
  navigator.geolocation.getCurrentPosition(position=>{
   if(shouldApplyDeviceLocation(manuallyEdited.current,cancelled)){
    callbacks.current.onChange({lat:position.coords.latitude,lng:position.coords.longitude});
    setMessage(`Device location added (about ±${Math.round(position.coords.accuracy)} m). Drag the pin if the issue is elsewhere.`);
   }
   if(!cancelled)setBusy(false);
  },error=>{
   if(cancelled)return;setBusy(false);
   if(!manuallyEdited.current)setMessage(error.code===1?'Location permission was denied. Enter coordinates below or enable location access in your browser.':'GPS could not determine your location. Enter coordinates below.');
  },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
  return ()=>{cancelled=true;};
  // Start one permission-aware device request on mount; edits never start another request.
 },[]);
 useEffect(()=>{
  setResolvedPlace(null);if(!value)return;
  const controller=new AbortController();let cancelled=false;
  const timer=setTimeout(()=>void reverseGeocodeGeoapify(value.lat,value.lng,controller.signal).then(place=>{if(!cancelled&&place){setResolvedPlace(place);callbacks.current.onPlaceResolved?.(place);}}),400);
  return ()=>{cancelled=true;controller.abort();clearTimeout(timer);};
 },[value?.lat,value?.lng]);
 function pick(point:Point|null){manuallyEdited.current=true;setBusy(false);setMessage(point?'Location selected. Review the pin before submitting.':'Enter both coordinates to select the exact location.');onChange(point);}
 function changeCoordinates(latitude:string,longitude:string){
  setLatText(latitude);setLngText(longitude);const lat=Number(latitude),lng=Number(longitude);
  pick(latitude.trim()&&longitude.trim()&&Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180?{lat,lng}:null);
 }
 return <div className="location-picker"><div className="auto-location-status" role="status" aria-live="polite">{busy?<LoaderCircle size={16} className="spinner"/>:<MapPin size={16}/>}<p>{message || 'Your browser will request location access. Coordinates stay editable.'}</p></div><div className="form-grid"><div><label className="field-label" htmlFor="latitude"><T>Latitude</T></label><Input id="latitude" type="number" step="any" min="-90" max="90" value={latText} onChange={event=>changeCoordinates(event.target.value,lngText)} placeholder="e.g. 23.0225" required/></div><div><label className="field-label" htmlFor="longitude"><T>Longitude</T></label><Input id="longitude" type="number" step="any" min="-180" max="180" value={lngText} onChange={event=>changeCoordinates(latText,event.target.value)} placeholder="e.g. 72.5714" required/></div></div>{value&&<MapView value={value} onPick={pick}/>}<div className="location-address" aria-live="polite">{resolvedPlace&&<p className="field-help"><MapPin size={14}/><span>{resolvedPlace.name&&<strong>{resolvedPlace.name} · </strong>}{resolvedPlace.formatted}</span></p>}</div><p className="field-help">Device location is an estimate, not a location extracted from the photo. Coordinates are shown to signed-in users. With Geoapify configured, coordinates are sent there to fill the neighborhood; otherwise enter it manually.</p></div>;
}

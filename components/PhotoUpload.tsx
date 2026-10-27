'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle, AlertCircle, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import { postJson,errorMessage } from '@/lib/client-api';
import type { UploadReceipt,Category } from '@/lib/types';
import { CloudImage } from '@/components/CloudImage';
import { T } from '@/components/LanguageProvider';
export function PhotoUpload({purpose,category,value,onChange,disabled=false,onBusyChange}:{purpose:'before'|'after';category?:Category|string;value:UploadReceipt|null;onChange:(receipt:UploadReceipt|null)=>void;disabled?:boolean;onBusyChange?:(busy:boolean)=>void}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [lastFile,setLastFile]=useState<File|null>(null);const active=useRef(false);const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function upload(file?:File){
  if(!file || active.current || disabled)return;setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Please choose a JPG, PNG or WebP photo.');return;}
  if(file.size===0 || file.size>8*1024*1024){setError('Choose a photo between 1 byte and 8 MB.');return;}
  active.current=true;setBusy(true);onBusyChange?.(true);setLastFile(file);let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const signed=await postJson<{params:Record<string,string>;signature:string;apiKey:string;cloudName:string}>('/api/upload-signature',{purpose});
   const form=new FormData();form.append('file',file);Object.entries(signed.params).forEach(([key,val])=>form.append(key,val));form.append('api_key',signed.apiKey);form.append('signature',signed.signature);
   controller.current=new AbortController();timer=setTimeout(()=>controller.current?.abort(),60000);
   const response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`,{method:'POST',body:form,signal:controller.current.signal});
   if(!response.ok)throw new Error('Photo upload failed. Check your connection and try again.');
   const image=await response.json();if(typeof image.public_id!=='string'||typeof image.signature!=='string'||typeof image.version!=='number')throw new Error('The upload response could not be checked. Please retry.');
   onChange({publicId:image.public_id,version:image.version,signature:image.signature});
  }catch(error){setError((error as Error)?.name==='AbortError'?'Upload timed out. Please try again.':errorMessage(error));}
  finally{if(timer)clearTimeout(timer);active.current=false;setBusy(false);onBusyChange?.(false);}
 }
 return <div><div className="upload-unified-field"><div className="upload-media-container">{value?<><CloudImage publicId={value.publicId} alt={purpose==='after'?'Uploaded resolution photo':'Uploaded issue photo'}/><span className="upload-unified-badge badge-success"><CheckCircle2 size={13}/>Photo uploaded</span></>:<div className="evidence-upload-empty"><Camera size={32} strokeWidth={1.5}/><strong>{purpose==='after'?'Show the completed work':'Photograph the issue'}</strong><p>{category?`${category} · `:''}Use your own photo of this location.</p><span>JPG, PNG or WebP · up to 8 MB</span></div>}{busy&&<div className="evidence-upload-busy" role="status"><LoaderCircle className="spinner" size={24}/><span>Uploading to Cloudinary…</span></div>}</div><div className="upload-unified-bar"><span className="upload-unified-bar-text">{value?'Delivery and ownership are checked before submission.':'Sample images are never submitted as evidence.'}</span><div className="upload-unified-actions"><label className={`button button-sm ${value?'button-outline':'button-primary'} upload-replace-label`} htmlFor={`photo-${purpose}`}>{value?<RefreshCw size={14}/>:<Camera size={14}/>}<T>{value?'Upload a photo':'Choose a photo'}</T><input id={`photo-${purpose}`} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy||disabled} onChange={event=>{void upload(event.target.files?.[0]);event.target.value='';}}/></label>{value&&<button type="button" className="button button-sm button-ghost" disabled={busy||disabled} onClick={()=>{onChange(null);setError('');}}><Trash2 size={14}/>Remove</button>}</div></div></div>{error&&<div className="upload-error-box" role="alert"><AlertCircle size={18}/><div><strong>Upload problem</strong><p>{error}</p>{lastFile&&<button type="button" className="button button-sm button-outline" disabled={busy||disabled} onClick={()=>void upload(lastFile)}><RefreshCw size={14}/>Retry upload</button>}</div></div>}<p className="field-help">Photos are sent to Cloudinary. Face blur is applied on delivery; avoid names, number plates and private documents in the original photo.</p></div>;
}

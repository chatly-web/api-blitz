'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle, AlertCircle, CheckCircle2, RefreshCw, Trash2, Shuffle } from 'lucide-react';
import { postJson,errorMessage } from '@/lib/client-api';
import type { UploadReceipt,Category } from '@/lib/types';
import { CloudImage } from '@/components/CloudImage';
import { getCategoryPlaceholder,placeholderPosition,type CategoryPlaceholder } from '@/lib/category-placeholders';
import { uploadPreviewStage } from '@/lib/upload-preview';
import { T } from '@/components/LanguageProvider';
export function PhotoUpload({purpose,category,value,onChange,disabled=false,onBusyChange}:{purpose:'before'|'after';category?:Category|string;value:UploadReceipt|null;onChange:(receipt:UploadReceipt|null)=>void;disabled?:boolean;onBusyChange?:(busy:boolean)=>void}){
 const [previewIndex,setPreviewIndex]=useState(0);
 const preview=getCategoryPlaceholder(category,previewIndex);
 const [heldPreview,setHeldPreview]=useState<CategoryPlaceholder|null>(null);
 const [heldPosition,setHeldPosition]=useState('50% 50%');
 const [readyKey,setReadyKey]=useState('');const [failedKey,setFailedKey]=useState('');const [deliveryAttempt,setDeliveryAttempt]=useState(0);
 const photoKey=value?`${value.publicId}:${value.version}`:'';
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [lastFile,setLastFile]=useState<File|null>(null);const active=useRef(false);const controller=useRef<AbortController|null>(null);
 const displayPreview=(value||busy)?heldPreview||preview:preview;
 const placeholder=displayPreview.src;
 const position=(value||busy)?heldPosition:placeholderPosition(category);
 const [placeholderFailed,setPlaceholderFailed]=useState(false);
 const stage=uploadPreviewStage(busy,photoKey,readyKey,failedKey);
 const waitingForPhoto=stage==='preparing';
 useEffect(()=>setPlaceholderFailed(false),[placeholder]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function upload(file?:File){
  if(!file || active.current || disabled)return;setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Please choose a JPG, PNG or WebP photo.');return;}
  if(file.size===0 || file.size>8*1024*1024){setError('Choose a photo between 1 byte and 8 MB.');return;}
  setHeldPreview(preview);setHeldPosition(placeholderPosition(category));setReadyKey('');setFailedKey('');
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
 return <div><div className="upload-unified-field"><div className="upload-media-container category-upload-preview" style={{'--preview-position':position} as React.CSSProperties}>
 {value&&!busy?<><CloudImage key={`${photoKey}:${deliveryAttempt}`} publicId={value.publicId} alt={purpose==='after'?'Uploaded resolution photo':'Uploaded issue photo'} placeholderSrc={placeholder} showShimmer={false} priority onReady={()=>{setReadyKey(photoKey);setFailedKey('');}} onDeliveryError={()=>setFailedKey(photoKey)}/>{readyKey===photoKey&&<span className="upload-unified-badge badge-success"><CheckCircle2 size={13}/>Photo ready</span>}</>:<div className="upload-sample-preview">{!placeholderFailed?<img src={placeholder} alt="" aria-hidden="true" onError={()=>setPlaceholderFailed(true)} decoding="async"/>:<div className="evidence-upload-empty"><Camera size={28} strokeWidth={1.5}/><div><strong>{purpose==='after'?'Show the completed work':'Photograph the issue'}</strong><p>Sample preview unavailable</p></div></div>}</div>}
 {(busy||waitingForPhoto)&&<div className="evidence-upload-busy" role="status"><LoaderCircle className="spinner" size={28}/><span>{busy?'Uploading your photo…':'Preparing your photo…'}</span><small>Category sample stays visible until your photo is ready</small></div>}
 </div><div className="upload-unified-bar"><span className="upload-unified-bar-text">{value?'Only your uploaded photo is used as evidence.':`${category||'Civic'} sample preview · Not your report photo.`}</span><div className="upload-unified-actions"><label className={`button button-sm ${value?'button-outline':'button-primary'} upload-replace-label`} htmlFor={`photo-${purpose}`}>{value?<RefreshCw size={14}/>:<Camera size={14}/>}<T>{value?'Upload a photo':'Choose a photo'}</T><input id={`photo-${purpose}`} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy||disabled} onChange={event=>{void upload(event.target.files?.[0]);event.target.value='';}}/></label>{!value&&<button type="button" className="button button-sm button-outline" disabled={busy||disabled} onClick={()=>setPreviewIndex(index=>index+1)}><Shuffle size={14}/>Refresh preview</button>}{value&&<button type="button" className="button button-sm button-ghost" disabled={busy||disabled} onClick={()=>{onChange(null);setReadyKey('');setFailedKey('');setError('');}}><Trash2 size={14}/>Remove</button>}{failedKey===photoKey&&value&&!busy&&<button type="button" className="button button-sm button-outline" disabled={disabled} onClick={()=>{setFailedKey('');setReadyKey('');setDeliveryAttempt(attempt=>attempt+1);}}><RefreshCw size={14}/>Retry photo loading</button>}</div></div></div>
 {(!value||busy||waitingForPhoto)&&<p className="placeholder-attribution"><a href="/photo-credits" target="_blank" rel="noreferrer">Sample photo credits</a></p>}
 {error&&<div className="upload-error-box" role="alert"><AlertCircle size={18}/><div><strong>Upload problem</strong><p>{error}</p>{lastFile&&<button type="button" className="button button-sm button-outline" disabled={busy||disabled} onClick={()=>void upload(lastFile)}><RefreshCw size={14}/>Retry upload</button>}</div></div>}
 <p className="field-help">Photos are sent to Cloudinary. Face blur is applied on delivery; avoid names, number plates and private documents in the original photo.{purpose==='before'&&' After upload, the face-blurred image is sent to Google AI to fill details automatically. Review the result before submitting.'}</p></div>;
}

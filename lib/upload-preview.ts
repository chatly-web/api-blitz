export type UploadPreviewStage='sample'|'uploading'|'preparing'|'ready'|'error';
export function uploadPreviewStage(uploading:boolean,photoKey:string,readyKey:string,failedKey:string):UploadPreviewStage{
 if(uploading)return 'uploading';
 if(!photoKey)return 'sample';
 if(failedKey===photoKey)return 'error';
 return readyKey===photoKey?'ready':'preparing';
}

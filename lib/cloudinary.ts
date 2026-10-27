import 'server-only';
import { v2 as cloudinary } from 'cloudinary';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { serviceClient } from '@/lib/supabase/service';
import { requiredEnv } from '@/lib/env';
import type { UploadReceipt } from '@/lib/types';
export function cloudinaryUrl(publicId: string, width = 1200, crop: 'limit' | 'fill' = 'limit') {
  const transform = crop === 'fill'
    ? [{ effect: 'blur_faces' }, { fetch_format: 'auto', quality: 'auto', crop: 'fill', gravity: 'auto', width, height: width }]
    : [{ effect: 'blur_faces' }, { fetch_format: 'auto', quality: 'auto', crop: 'limit', width }];

  return cloudinary.url(publicId, {
    cloud_name: requiredEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    api_key: requiredEnv('CLOUDINARY_API_KEY'), api_secret: requiredEnv('CLOUDINARY_API_SECRET'),
    type: 'authenticated', resource_type: 'image', secure: true, sign_url: true,
    transformation: transform,
  });
}

export function cloudinaryThumbnailUrl(publicId: string, size = 160) {
  return cloudinaryUrl(publicId, size, 'fill');
}

export function cloudinaryEvidenceCardUrl(publicId: string, status = 'RESOLVED') {
  return cloudinary.url(publicId, {
    cloud_name: requiredEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    api_key: requiredEnv('CLOUDINARY_API_KEY'), api_secret: requiredEnv('CLOUDINARY_API_SECRET'),
    type: 'authenticated', resource_type: 'image', secure: true, sign_url: true,
    transformation: [
      { width: 1200, height: 630, crop: 'fill', gravity: 'auto', effect: 'blur_faces' },
      { fetch_format: 'auto', quality: 'auto' }
    ],
  });
}
export function createUploadSignature() {
  const params = {
    allowed_formats: 'jpg,png,webp',
    type: 'authenticated',
    upload_preset: requiredEnv('CLOUDINARY_UPLOAD_PRESET'),
    overwrite: 'false',
    public_id: `civic/evidence/${randomUUID()}`,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };
  const serialized = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('&');
  const signature = createHash('sha1').update(serialized + requiredEnv('CLOUDINARY_API_SECRET')).digest('hex');
  return { params, signature, apiKey: requiredEnv('CLOUDINARY_API_KEY'), cloudName: requiredEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME') };
}
export function verifyReceipt(receipt: UploadReceipt) {
  if (!/^civic\/evidence\/[a-f0-9-]{36}$/.test(receipt.publicId)) return false;
  const expected = createHash('sha1').update(`public_id=${receipt.publicId}&version=${receipt.version}${requiredEnv('CLOUDINARY_API_SECRET')}`).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(receipt.signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function ownsUpload(publicId: string, actorId: string, purpose?: 'before' | 'after') {
  let query = serviceClient().from('upload_authorizations').select('public_id').eq('public_id',publicId).eq('actor_id',actorId);
  if (purpose) query=query.eq('purpose',purpose);
  const {data,error}=await query.maybeSingle();
  return !error && Boolean(data);
}
export async function verifyUploadedImage(receipt: UploadReceipt, actorId: string, purpose: 'before' | 'after') {
  if (!verifyReceipt(receipt) || !await ownsUpload(receipt.publicId,actorId,purpose)) return false;
  // Check provider-owned metadata rather than trusting client-supplied byte size.
  const cloud = requiredEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  const auth = Buffer.from(`${requiredEnv('CLOUDINARY_API_KEY')}:${requiredEnv('CLOUDINARY_API_SECRET')}`).toString('base64');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/resources/image/authenticated/${encodeURIComponent(receipt.publicId)}`, { headers: { Authorization: `Basic ${auth}` }, signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!response.ok) return false;
  const image = await response.json();
  if (!(image.resource_type === 'image' && image.bytes > 0 && image.bytes <= 8 * 1024 * 1024 && ['jpg','jpeg','png','webp'].includes(image.format))) return false;
  const delivery = await fetch(cloudinaryUrl(receipt.publicId, 100), { method: 'HEAD', signal: AbortSignal.timeout(10000), cache: 'no-store' });
  return delivery.ok;
}

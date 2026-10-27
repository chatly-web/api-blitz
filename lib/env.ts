function firstEnv(name: string, ...fallbacks: string[]) {
  for (const k of [name, ...fallbacks]) {
    const v = process.env[k];
    if (v) return v;
  }
  return '';
}

export function hasSupabase() {
  const url = firstEnv('NEXT_PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  const key = firstEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');
  return Boolean(url && key);
}

export function hasBackend() {
  return hasSupabase() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.AVATAR_HMAC_SECRET);
}

const envFallbacks: Record<string, string[]> = {
  NEXT_PUBLIC_SUPABASE_URL: ['PUBLIC_SUPABASE_URL', 'SUPABASE_URL'],
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ['PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'],
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ['PUBLIC_CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_CLOUD_NAME'],
  NEXT_PUBLIC_SITE_URL: ['PUBLIC_SITE_URL', 'SITE_URL'],
  NEXT_PUBLIC_GEOAPIFY_KEY: ['PUBLIC_GEOAPIFY_KEY', 'GEOAPIFY_KEY'],
};

export function requiredEnv(name: string) {
  const list = [name, ...(envFallbacks[name] || [])];
  for (const k of list) {
    const v = process.env[k];
    if (v) return v;
  }
  throw new Error(`Missing server configuration: ${name}`);
}

export function setupItems() {
  const cloudName = firstEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'PUBLIC_CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_CLOUD_NAME');
  return [
    { label: 'Supabase project', ready: hasSupabase(), detail: 'Database URL and public anon key' },
    { label: 'Server identity', ready: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.AVATAR_HMAC_SECRET), detail: 'Service-role key and avatar HMAC secret' },
    { label: 'Photo uploads', ready: Boolean(cloudName && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_UPLOAD_PRESET), detail: 'Cloudinary cloud name, API key and secret' },
  ];
}

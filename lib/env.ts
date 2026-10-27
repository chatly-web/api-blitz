export function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
export function hasBackend() {
  return hasSupabase() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.AVATAR_HMAC_SECRET);
}
export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}
export function setupItems() {
  return [
    { label: 'Supabase project', ready: hasSupabase(), detail: 'Database URL and public anon key' },
    { label: 'Server identity', ready: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.AVATAR_HMAC_SECRET), detail: 'Service-role key and avatar HMAC secret' },
    { label: 'Photo uploads', ready: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_UPLOAD_PRESET), detail: 'Cloudinary cloud name, API key and secret' },
  ];
}

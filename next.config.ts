import type { NextConfig } from 'next';

function getEnv(primary: string, ...fallbacks: string[]) {
  for (const key of [primary, ...fallbacks]) {
    const val = process.env[key];
    if (val) return val;
  }
  return '';
}

const config: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_URL', 'SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'PUBLIC_CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_CLOUD_NAME'),
    NEXT_PUBLIC_SITE_URL: getEnv('NEXT_PUBLIC_SITE_URL', 'PUBLIC_SITE_URL', 'SITE_URL'),
    NEXT_PUBLIC_GEOAPIFY_KEY: getEnv('NEXT_PUBLIC_GEOAPIFY_KEY', 'PUBLIC_GEOAPIFY_KEY', 'GEOAPIFY_KEY'),
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
    ] }];
  },
};
export default config;

import { existsSync } from 'node:fs';
import { checkConfiguration } from '../lib/config-check';
// Read only when explicitly run. Never print secret values or make API calls.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const checks=checkConfiguration(process.env);
console.log('Civic configuration check (values are never displayed)\n');
for (const check of checks) console.log(`${check.status.toUpperCase()} ${check.name}${check.required?'':' (optional)'} — ${check.message}`);
const missing=checks.filter(check=>check.required && check.status!=='ready');
console.log(missing.length ? '\nComplete the required fields before live testing.' : '\nLocal values pass basic validation. OAuth settings, the SQL migration, Cloudinary preset/blur support and deployed variables still need provider verification.');
process.exitCode=missing.length?1:0;

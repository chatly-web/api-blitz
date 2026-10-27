import test from 'node:test';
import assert from 'node:assert/strict';
import { checkConfiguration } from '../lib/config-check';
test('configuration checker reports required missing values and optional fallbacks without reading real env files',()=>{
  const checks=checkConfiguration({});
  assert.equal(checks.filter(row=>row.required && row.status==='missing').length,9);
  assert.equal(checks.find(row=>row.name==='GEMINI_API_KEY')?.required,false);
});
test('configuration diagnostics never expose secret values and reject unsafe site origins',()=>{
  const secret='private-secret-value-that-must-never-be-printed';
  const checks=checkConfiguration({SUPABASE_SERVICE_ROLE_KEY:secret,NEXT_PUBLIC_SUPABASE_ANON_KEY:secret,AVATAR_HMAC_SECRET:'short',NEXT_PUBLIC_SITE_URL:'https://example.invalid/path'});
  assert.equal(checks.find(row=>row.name==='SUPABASE_SERVICE_ROLE_KEY')?.status,'invalid');
  assert.equal(checks.find(row=>row.name==='NEXT_PUBLIC_SITE_URL')?.status,'invalid');
  assert.equal(checks.find(row=>row.name==='AVATAR_HMAC_SECRET')?.status,'invalid');
  assert.equal(JSON.stringify(checks).includes(secret),false);
});

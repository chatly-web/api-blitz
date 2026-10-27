import test from 'node:test';
import assert from 'node:assert/strict';
import { languages,uiTexts } from '../lib/languages';
import { translations,translateLabel } from '../lib/translations';
test('every offered language has a bundled translation for every catalog entry',()=>{
  for(const code of Object.keys(languages) as (keyof typeof languages)[]){
    if(code==='en')continue;
    for(const text of uiTexts)assert.ok(translations[code][text]?.trim(),`${code}: ${text}`);
    assert.equal(Object.keys(translations[code]).length,uiTexts.length);
  }
});
test('language changes use bundled dictionaries with safe English fallback',()=>{
  assert.equal(translateLabel('en','Submit report'),'Submit report');
  assert.equal(translateLabel('hi','Submit report'),'रिपोर्ट जमा करें');
  assert.equal(translateLabel('gu','Submit report'),'અહેવાલ સબમિટ કરો');
  assert.equal(translateLabel('ur','Language'),'زبان');
  assert.equal(translateLabel('ta','Unlisted label'),'Unlisted label');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { categories } from '../lib/types';
import { categoryPlaceholders,getCategoryPlaceholder } from '../lib/category-placeholders';
import { uploadPreviewStage } from '../lib/upload-preview';
test('every category has distinct local photos and complete source/license attribution',()=>{
 for(const category of categories){const photos=categoryPlaceholders[category];assert.ok(photos.length>=2);assert.equal(new Set(photos.map(photo=>photo.src)).size,photos.length);for(const photo of photos){assert.ok(existsSync(resolve('public',photo.src.slice(1))));assert.match(photo.src,/^\/placeholders\/[a-z-]+-\d+\.webp$/);assert.ok(photo.author&&photo.license&&photo.modifications);assert.match(photo.source,/^https:\/\/commons.wikimedia.org\//);}}
});
test('refresh cycles only through the selected category and never changes actual evidence',()=>{
 for(const category of categories){const first=getCategoryPlaceholder(category,0);assert.notEqual(getCategoryPlaceholder(category,1).src,first.src);assert.equal(getCategoryPlaceholder(category,categoryPlaceholders[category].length).src,first.src);for(let index=-3;index<8;index++)assert.ok(categoryPlaceholders[category].includes(getCategoryPlaceholder(category,index)));}
 assert.equal(getCategoryPlaceholder('unknown',0),categoryPlaceholders.Other[0]);
});
test('loading ring lasts through delivery and stale ready/error events cannot finish a new photo',()=>{
 assert.equal(uploadPreviewStage(false,'','',''),'sample');
 assert.equal(uploadPreviewStage(true,'old','old',''),'uploading');
 assert.equal(uploadPreviewStage(false,'new','old','old'),'preparing');
 assert.equal(uploadPreviewStage(false,'new','new',''),'ready');
 assert.equal(uploadPreviewStage(false,'new','','new'),'error');
 assert.equal(uploadPreviewStage(false,'new','',''),'preparing');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { mergePhotoSuggestions,shouldApplyDeviceLocation } from '../lib/auto-fill';
const result={category:'Garbage' as const,description:'Waste is blocking the public pavement.',severity:'medium' as const};
test('photo suggestions fill both fields when they have not been edited during analysis',()=>{
 assert.deepEqual(mergePhotoSuggestions({category:'Other',description:''},{category:0,description:0},{category:0,description:0},result),{category:result.category,description:result.description});
});
test('late analysis preserves independently edited fields including edits back to the previous value',()=>{
 const current={category:'Pothole' as const,description:'My manually reviewed account of the issue.'};
 assert.deepEqual(mergePhotoSuggestions(current,{category:0,description:0},{category:1,description:1},result),current);
 assert.deepEqual(mergePhotoSuggestions(current,{category:0,description:0},{category:1,description:0},result),{category:'Pothole',description:result.description});
});
test('GPS only fills a location while mounted and before any manual location selection',()=>{
 assert.equal(shouldApplyDeviceLocation(false,false),true);
 assert.equal(shouldApplyDeviceLocation(true,false),false);
 assert.equal(shouldApplyDeviceLocation(false,true),false);
 assert.equal(shouldApplyDeviceLocation(true,true),false);
});

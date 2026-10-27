import catalog from '@/lib/category-placeholders.json';
import type { Category } from '@/lib/types';
export type CategoryPlaceholder=(typeof catalog)['Pothole'][number];
export const categoryPlaceholders=catalog as Record<Category,CategoryPlaceholder[]>;
export function getCategoryPlaceholder(category?:string,index=0):CategoryPlaceholder{
 const key=category&&Object.hasOwn(categoryPlaceholders,category)?category as Category:'Other';
 const images=categoryPlaceholders[key];const offset=Number.isFinite(index)?Math.floor(index):0;
 return images[((offset%images.length)+images.length)%images.length];
}
export function placeholderPosition(category?:string){return category==='Streetlight'?'50% 8%':category==='Other'?'50% 65%':'50% 50%';}

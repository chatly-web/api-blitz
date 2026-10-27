import type { Category } from '@/lib/types';
export type SuggestedDetails={category:Category;description:string;severity:'low'|'medium'|'high'};
export type DetailFields={category:Category;description:string};
export type DetailRevisions={category:number;description:number};
/** A late AI response cannot replace something the citizen edited while waiting. */
export function mergePhotoSuggestions(current:DetailFields,started:DetailRevisions,latest:DetailRevisions,result:SuggestedDetails):DetailFields{
 return {category:started.category===latest.category?result.category:current.category,description:started.description===latest.description?result.description:current.description};
}
/** Late GPS must never move a point the citizen selected manually. */
export function shouldApplyDeviceLocation(manuallyEdited:boolean,cancelled:boolean){return !manuallyEdited&&!cancelled;}

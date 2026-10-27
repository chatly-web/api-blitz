export const CIVIC_PICSUM_IDS = [142, 84, 43, 164, 122, 1033, 1076, 274, 214] as const;

export function getCivicPicsumUrl(seedOrId: string | number, width = 1200, height = 800) {
  let hash = 0;
  const str = String(seedOrId);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const id = CIVIC_PICSUM_IDS[Math.abs(hash) % CIVIC_PICSUM_IDS.length];
  return `https://picsum.photos/id/${id}/${width}/${height}`;
}

// Generic demo imagery only; these photos do not document a real civic repair.
export const CIVIC_BEFORE_PHOTO = 'https://picsum.photos/id/142/1200/800';
export const CIVIC_AFTER_PHOTO = 'https://picsum.photos/id/84/1200/800';

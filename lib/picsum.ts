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

export const CATEGORY_PICSUM_MAP: Record<string, number> = {
  Pothole: 142,        // Road pavement & street maintenance
  Garbage: 274,        // Urban alley & street setting
  Streetlight: 84,     // City street with prominent street lamps
  'Water leak': 10,    // Water infrastructure / flow
  Drainage: 1033,      // Ground water channel / drainage
  Other: 43,           // Historic civic street & buildings
};

export function getCategoryPicsumUrl(category?: string, width = 800, height = 600): string {
  const id = (category && CATEGORY_PICSUM_MAP[category]) ? CATEGORY_PICSUM_MAP[category] : 43;
  return `https://picsum.photos/id/${id}/${width}/${height}`;
}

export const CIVIC_BEFORE_PHOTO = 'https://picsum.photos/id/142/1200/800'; // Real urban street undergoing roadwork/damage
export const CIVIC_AFTER_PHOTO = 'https://picsum.photos/id/84/1200/800';   // Cleanly paved street and sidewalk

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

// Authentic, verified civic category photos matching real-world municipal issues
export const CATEGORY_PLACEHOLDER_MAP: Record<string, string> = {
  // Real overflowing municipal garbage bin with street litter & discarded packaging
  Garbage: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1000&h=700&q=80',
  // Real asphalt pothole & cracked road surface
  Pothole: 'https://images.unsplash.com/photo-1683880695653-3afd290c9e41?auto=format&fit=crop&w=1000&h=700&q=80',
  // City street with prominent street lamp
  Streetlight: 'https://picsum.photos/id/84/1000/700',
  // Water pipeline flow / leak
  'Water leak': 'https://picsum.photos/id/10/1000/700',
  // Ground stormwater drainage channel
  Drainage: 'https://picsum.photos/id/1033/1000/700',
  // Civic street architecture
  Other: 'https://picsum.photos/id/43/1000/700',
};

// Legacy numeric ID map maintained for backward compatibility
export const CATEGORY_PICSUM_MAP: Record<string, number> = {
  Pothole: 142,        // Road pavement & street maintenance
  Garbage: 274,        // Urban alley & street setting
  Streetlight: 84,     // City street with prominent street lamps
  'Water leak': 10,    // Water infrastructure / flow
  Drainage: 1033,      // Ground water channel / drainage
  Other: 43,           // Historic civic street & buildings
};

export function getCategoryPicsumUrl(category?: string, width = 800, height = 600): string {
  if (category && CATEGORY_PLACEHOLDER_MAP[category]) {
    const url = CATEGORY_PLACEHOLDER_MAP[category];
    if (url.includes('unsplash.com')) {
      return url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
    }
    return url.replace(/\/1000\/700/, `/${width}/${height}`);
  }
  return `https://picsum.photos/id/43/${width}/${height}`;
}

export const CIVIC_BEFORE_PHOTO = 'https://picsum.photos/id/142/1200/800'; // Real urban street undergoing roadwork/damage
export const CIVIC_AFTER_PHOTO = 'https://picsum.photos/id/84/1200/800';   // Cleanly paved street and sidewalk

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

// Curated pools of authentic, verified photos for each civic issue category
export const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  Garbage: [
    // Municipal overflowing black trash bin with cups and plastic bottles
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1000&h=700&q=80',
    // Piled garbage bags and outdoor waste accumulation
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1000&h=700&q=80',
    // Public sidewalk street litter and discarded containers
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1000&h=700&q=80',
    // Plastic bottles and street debris needing cleanup
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&h=700&q=80',
    // Urban sidewalk litter near curbside
    'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=1000&h=700&q=80',
    // Dumpster and municipal overflow waste
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1000&h=700&q=80',
  ],
  Pothole: [
    // Deep fractured asphalt road crater
    'https://images.unsplash.com/photo-1683880695653-3afd290c9e41?auto=format&fit=crop&w=1000&h=700&q=80',
    // Damaged street pavement with road cracking
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1000&h=700&q=80',
    // Road surface erosion and potholes
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&h=700&q=80',
    // Asphalt surface damage on vehicle lane
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&h=700&q=80',
    // Urban road construction & street repair
    'https://picsum.photos/id/142/1000/700',
  ],
  Streetlight: [
    // Street lamp illuminating sidewalk
    'https://picsum.photos/id/84/1000/700',
    // Night urban street lighting fixture
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&h=700&q=80',
    // Historic city street lantern
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&h=700&q=80',
    // Urban lamppost on avenue
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&h=700&q=80',
  ],
  'Water leak': [
    // Flowing water pipeline / stream
    'https://picsum.photos/id/10/1000/700',
    // Street water leak and puddle
    'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=1000&h=700&q=80',
    // Urban surface water pooling
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1000&h=700&q=80',
    // Infrastructure water drip / pipe leak
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1000&h=700&q=80',
  ],
  Drainage: [
    // Concrete ground stormwater drainage channel
    'https://picsum.photos/id/1033/1000/700',
    // Stormwater grate & street drain
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&h=700&q=80',
    // Urban gutter runoff & drain
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&h=700&q=80',
    // Drainage channel in public space
    'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=1000&h=700&q=80',
  ],
  Other: [
    'https://picsum.photos/id/43/1000/700',
    'https://picsum.photos/id/164/1000/700',
    'https://picsum.photos/id/122/1000/700',
    'https://picsum.photos/id/1076/1000/700',
  ],
};

// Default mapping for backward compatibility
export const CATEGORY_PLACEHOLDER_MAP: Record<string, string> = {
  Garbage: CATEGORY_IMAGE_POOLS.Garbage[0],
  Pothole: CATEGORY_IMAGE_POOLS.Pothole[0],
  Streetlight: CATEGORY_IMAGE_POOLS.Streetlight[0],
  'Water leak': CATEGORY_IMAGE_POOLS['Water leak'][0],
  Drainage: CATEGORY_IMAGE_POOLS.Drainage[0],
  Other: CATEGORY_IMAGE_POOLS.Other[0],
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

function formatImageUrl(url: string, width: number, height: number): string {
  if (url.includes('unsplash.com')) {
    return url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
  }
  return url.replace(/\/1000\/700/, `/${width}/${height}`);
}

/**
 * Returns a randomized or seeded photo matching the given civic category.
 * If indexOrSeed is supplied, picks deterministically; otherwise randomizes.
 */
export function getCategoryPicsumUrl(
  category?: string,
  width = 800,
  height = 600,
  indexOrSeed?: number | string
): string {
  const pool = (category && CATEGORY_IMAGE_POOLS[category]) || CATEGORY_IMAGE_POOLS.Other;
  let idx = 0;
  if (typeof indexOrSeed === 'number') {
    idx = Math.abs(indexOrSeed) % pool.length;
  } else if (typeof indexOrSeed === 'string') {
    let hash = 0;
    for (let i = 0; i < indexOrSeed.length; i++) {
      hash = (hash << 5) - hash + indexOrSeed.charCodeAt(i);
      hash |= 0;
    }
    idx = Math.abs(hash) % pool.length;
  } else {
    idx = Math.floor(Math.random() * pool.length);
  }

  const selectedUrl = pool[idx] || pool[0];
  return formatImageUrl(selectedUrl, width, height);
}

export const CIVIC_BEFORE_PHOTO = 'https://picsum.photos/id/142/1200/800'; // Real urban street undergoing roadwork/damage
export const CIVIC_AFTER_PHOTO = 'https://picsum.photos/id/84/1200/800';   // Cleanly paved street and sidewalk

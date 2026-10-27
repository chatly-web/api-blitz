export const CIVIC_PICSUM_IDS = [142, 84, 43, 164, 122, 1033, 1076, 274, 214] as const;

export interface PicsumOptions {
  id?: number | string;
  width?: number;
  height?: number;
  grayscale?: boolean;
  blur?: number; // 1 to 10
}

export function getPicsumUrl(options: PicsumOptions = {}): string {
  const { id = 142, width = 1200, height = 800, grayscale = false, blur } = options;
  const baseUrl = `https://picsum.photos/id/${id}/${width}/${height}`;
  const params: string[] = [];
  if (grayscale) params.push('grayscale');
  if (blur && blur > 0) params.push(`blur=${Math.min(10, Math.max(1, Math.round(blur)))}`);
  return params.length ? `${baseUrl}?${params.join('&')}` : baseUrl;
}

export function getCivicPicsumUrl(seedOrId: string | number, width = 1200, height = 800, options: { grayscale?: boolean; blur?: number } = {}) {
  let hash = 0;
  const str = String(seedOrId);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const id = CIVIC_PICSUM_IDS[Math.abs(hash) % CIVIC_PICSUM_IDS.length];
  return getPicsumUrl({ id, width, height, ...options });
}

// Preset paired imagery for civic simulation testing
export const CIVIC_SIMULATION_PAIRS = [
  {
    category: 'Road & Pavements',
    title: 'Asphalt resurfacing',
    beforeId: 142,
    afterId: 84,
    description: 'Cracked roadway restored with uniform civic tarmac.'
  },
  {
    category: 'Parks & Greenery',
    title: 'Overgrowth clearance',
    beforeId: 164,
    afterId: 43,
    description: 'Fallen limbs removed and walkway restored for pedestrian safety.'
  },
  {
    category: 'Civic Structures',
    title: 'Public facility maintenance',
    beforeId: 122,
    afterId: 1076,
    description: 'Municipal perimeter wall repaired and repainted.'
  }
] as const;

// Generic demo imagery only; these photos do not document a real civic repair.
export const CIVIC_BEFORE_PHOTO = getPicsumUrl({ id: 142, width: 1200, height: 800 });
export const CIVIC_AFTER_PHOTO = getPicsumUrl({ id: 84, width: 1200, height: 800 });


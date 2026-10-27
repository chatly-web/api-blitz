export const categories = ['Pothole', 'Garbage', 'Streetlight', 'Water leak', 'Drainage', 'Other'] as const;
export const statuses = ['open', 'acknowledged', 'in_progress', 'resolved'] as const;
export type Category = typeof categories[number];
export type ReportStatus = typeof statuses[number];
export type Identity = { handle: string; avatarSeed: string };
export type Viewer = { id: string; identity: Identity; isAdmin: boolean };
export type Report = {
  id: string; category: Category; description: string; lat: number; lng: number;
  ward: string | null; status: ReportStatus; claimed: boolean;
  beforePublicId: string; afterPublicId: string | null; publicNote: string | null;
  score: number; createdAt: string; author: Identity; myVote: number;
};
export type Comment = {
  id: string; reportId: string; parentId: string | null; body: string; score: number;
  createdAt: string; author: Identity; myVote: number; isOwn: boolean;
};
export type UploadReceipt = { publicId: string; version: number; signature: string };
export type PrivateNote = { id: string; body: string; createdAt: string };

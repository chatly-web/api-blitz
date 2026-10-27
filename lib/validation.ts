import { z } from 'zod';
import { categories, statuses } from '@/lib/types';
export const receiptSchema = z.object({ publicId: z.string().min(1).max(250), version: z.number().int().positive(), signature: z.string().regex(/^[a-f0-9]{40,64}$/) });
export const locationSchema = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
export const reportSchema = locationSchema.extend({ category: z.enum(categories), description: z.string().trim().min(10, 'Describe the issue in at least 10 characters.').max(2000), ward: z.string().trim().max(100).optional(), photo: receiptSchema, duplicateAcknowledged: z.boolean().default(false) });
export const commentSchema = z.object({ reportId: z.uuid(), parentId: z.uuid().nullable().optional(), body: z.string().trim().min(1).max(1500) });
export const voteSchema = z.object({ targetType: z.enum(['report', 'comment']), targetId: z.uuid(), value: z.union([z.literal(1), z.literal(-1)]) });
export const adminUpdateSchema = z.object({ reportId: z.uuid(), status: z.enum(statuses), publicNote: z.string().trim().max(2000).default(''), internalNote: z.string().trim().max(2000).default(''), afterPhoto: receiptSchema.optional() });

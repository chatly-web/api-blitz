import { z } from 'zod';
import { categories } from '@/lib/types';
export const draftSchema = z.object({ category: z.enum(categories), description: z.string().min(10).max(2000), ward: z.string().max(100).default('') }).strict();
export const assistantReplySchema = z.object({ reply: z.string().min(1).max(1800), draft: draftSchema.nullable() }).strict();
export const assistantRequestSchema = z.object({ messages: z.array(z.object({ role: z.enum(['user','assistant']), content: z.string().min(1).max(2000) }).strict()).min(1).max(10), language: z.string().max(12).default('en') }).strict();
export type ReportDraft = z.infer<typeof draftSchema>;
export type AssistantReply = z.infer<typeof assistantReplySchema>;
export const DRAFT_KEY = 'civic-assistant-draft-v1';

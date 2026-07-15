import { z } from 'zod';
export const updateProfileSchema = z.object({ display_name: z.string().min(1).max(80).optional(), avatar_url: z.string().url().nullable().optional() }).refine((v)=>Object.keys(v).length>0,'At least one field is required');

import { z } from 'zod';
export const dateRangeSchema = z.object({ from_date: z.string().datetime().optional(), to_date: z.string().datetime().optional() });

import{z}from'zod';export const commitSchema=z.object({strategy:z.enum(['VALID_ONLY','ALL_OR_NOTHING']),duplicate_strategy:z.enum(['SKIP','UPDATE_EXISTING']).default('SKIP')});

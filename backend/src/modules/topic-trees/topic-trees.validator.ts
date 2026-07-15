import {z} from 'zod';
export const createTreeSchema=z.object({display_name:z.string().min(1).max(120),description:z.string().max(500).nullable().optional()});
export const updateTreeSchema=createTreeSchema.partial().refine((v)=>Object.keys(v).length>0,'At least one field is required');
export const createNodeSchema=z.object({parent_id:z.string().uuid().nullable().optional(),display_name:z.string().min(1).max(120),description:z.string().max(500).nullable().optional(),node_type:z.enum(['GROUP','VOCABULARY']),position:z.number().int().min(0).nullable().optional()});
export const updateNodeSchema=z.object({display_name:z.string().min(1).max(120).optional(),description:z.string().max(500).nullable().optional(),node_type:z.enum(['GROUP','VOCABULARY']).optional()}).refine((v)=>Object.keys(v).length>0,'At least one field is required');
export const moveNodeSchema=z.object({target_parent_id:z.string().uuid().nullable(),before_node_id:z.string().uuid().nullable().optional(),after_node_id:z.string().uuid().nullable().optional(),audit_note:z.string().max(300).nullable().optional()});

import { Router } from 'express';
export const systemRouter = Router();
systemRouter.get('/health', (_req, res) => res.json({ status: 'ok', version: '0.1.0' }));
systemRouter.get('/client-policy', (_req, res) => res.json({
  tree: { max_depth: 8, max_nodes_per_tree: 10_000 },
  imports: { allowed_extensions: ['xlsx','xls'], max_file_size_bytes: 10_485_760, max_rows: 5_000, required_columns: ['English','Vietnamese'], optional_columns: ['Pronunciation','Part of speech','Example','Image URL'], virus_scan_required: true },
  query: { max_preview_concepts: 20_000, timeout_ms: 2_000 },
  rate_limits: { auth_per_minute: 10, general_per_minute: 120 },
}));

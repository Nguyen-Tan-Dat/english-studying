import type { Role } from '../domain/models.js';
declare global {
  namespace Express {
    interface Request { user?: { id: string; roles: Role[] }; requestId?: string; }
  }
}
export {};

import type { Request } from 'express';
import { PreconditionRequiredError, VersionConflictError } from '../errors/app-error.js';
export const etag = (version: number) => `"${version}"`;
export function assertIfMatch(req: Request, currentVersion: number): void {
  const value = req.header('If-Match');
  if (!value) throw new PreconditionRequiredError();
  if (value !== etag(currentVersion) && value !== String(currentVersion)) throw new VersionConflictError(currentVersion);
}

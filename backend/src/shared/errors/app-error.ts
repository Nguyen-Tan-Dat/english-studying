export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
export class NotFoundError extends AppError { constructor(message = 'Resource not found') { super(404, 'NOT_FOUND', message); } }
export class ForbiddenError extends AppError { constructor(message = 'You do not have permission') { super(403, 'FORBIDDEN', message); } }
export class ConflictError extends AppError { constructor(code = 'CONFLICT', message = 'Resource conflict', details?: Record<string, unknown>) { super(409, code, message, details); } }
export class ValidationError extends AppError { constructor(message = 'Validation failed', details?: Record<string, unknown>) { super(422, 'VALIDATION_ERROR', message, details); } }
export class PreconditionRequiredError extends AppError { constructor() { super(428, 'PRECONDITION_REQUIRED', 'If-Match header is required'); } }
export class VersionConflictError extends AppError { constructor(currentVersion: number) { super(412, 'VERSION_CONFLICT', 'The resource was changed by another request', { current_version: currentVersion, current_etag: `"${currentVersion}"` }); } }
export class UnauthorizedError extends AppError { constructor(message = 'Authentication required') { super(401, 'UNAUTHORIZED', message); } }

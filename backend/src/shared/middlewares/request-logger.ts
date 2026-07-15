import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import { logger } from '../../config/logger.js';
export const requestLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const id = String(req.headers['x-request-id'] ?? randomUUID());
    res.setHeader('X-Request-ID', id);
    return id;
  },
  customProps(req) { return { trace_id: req.id }; },
});

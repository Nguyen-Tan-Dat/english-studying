import type { RequestHandler } from 'express';

import { healthService } from '../services/health.service';

export class HealthController {
  getHealth: RequestHandler = async (_request, response) => {
    const status = await healthService.getStatus();
    response.status(200).json({ success: true, data: status });
  };
}

export const healthController = new HealthController();

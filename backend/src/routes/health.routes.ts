import { Router } from 'express';

import { healthController } from '../controllers/health.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';

export const healthRouter = Router();

healthRouter.get('/health', asyncHandler(healthController.getHealth));

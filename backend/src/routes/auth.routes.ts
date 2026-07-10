import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(authController.login));

import { Router } from 'express';

import { vocabularyController } from '../controllers/vocabulary.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { authenticate } from '../middlewares/auth.middleware';

export const vocabularyRouter = Router();

vocabularyRouter.use(asyncHandler(authenticate));
vocabularyRouter.get('/', asyncHandler(vocabularyController.list));
vocabularyRouter.get('/due', asyncHandler(vocabularyController.listDue));
vocabularyRouter.post('/', asyncHandler(vocabularyController.create));
vocabularyRouter.post('/:id/review', asyncHandler(vocabularyController.review));

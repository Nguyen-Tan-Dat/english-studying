import type { RequestHandler } from 'express';

import { vocabularyService } from '../services/vocabulary.service';
import { ApiError } from '../utils/api-error';
import {
  optionalPositiveInteger,
  optionalString,
  requireIntegerInRange,
  requireString,
} from '../utils/request-validation';

function getAuthenticatedUserId(request: Parameters<RequestHandler>[0]): string {
  const userId = request.authUser?.id;

  if (!userId) {
    throw ApiError.unauthorized();
  }

  return userId;
}

export class VocabularyController {
  list: RequestHandler = async (request, response) => {
    const userId = getAuthenticatedUserId(request);
    const limit = optionalPositiveInteger(request.query.limit, 'limit', 50, 200);
    const vocabularies = await vocabularyService.listForUser(userId, limit);

    response.status(200).json({ success: true, data: vocabularies });
  };

  listDue: RequestHandler = async (request, response) => {
    const userId = getAuthenticatedUserId(request);
    const limit = optionalPositiveInteger(request.query.limit, 'limit', 20, 100);
    const vocabularies = await vocabularyService.listDueForUser(userId, limit);

    response.status(200).json({ success: true, data: vocabularies });
  };

  create: RequestHandler = async (request, response) => {
    const userId = getAuthenticatedUserId(request);
    const phonetic = optionalString(request.body?.phonetic, 'phonetic');
    const audioUrl = optionalString(request.body?.audioUrl, 'audioUrl');
    const description = optionalString(request.body?.description, 'description');
    const partOfSpeech = optionalString(
      request.body?.partOfSpeech,
      'partOfSpeech',
    );
    const imageUrl = optionalString(request.body?.imageUrl, 'imageUrl');

    const vocabulary = await vocabularyService.create(userId, {
      word: requireString(request.body?.word, 'word'),
      translation: requireString(request.body?.translation, 'translation'),
      ...(phonetic === undefined ? {} : { phonetic }),
      ...(audioUrl === undefined ? {} : { audioUrl }),
      ...(description === undefined ? {} : { description }),
      ...(partOfSpeech === undefined ? {} : { partOfSpeech }),
      ...(imageUrl === undefined ? {} : { imageUrl }),
    });

    response.status(201).json({ success: true, data: vocabulary });
  };

  review: RequestHandler = async (request, response) => {
    const userId = getAuthenticatedUserId(request);
    const vocabularyId = requireString(request.params.id, 'vocabulary id');
    const grade = requireIntegerInRange(request.body?.grade, 'grade', 0, 5);
    const questionType = requireString(
      request.body?.questionType,
      'questionType',
    );

    const result = await vocabularyService.review(userId, vocabularyId, {
      grade,
      questionType,
    });

    response.status(200).json({ success: true, data: result });
  };
}

export const vocabularyController = new VocabularyController();

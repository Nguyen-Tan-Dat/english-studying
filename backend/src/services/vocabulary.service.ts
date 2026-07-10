import { sql, type Transaction } from 'kysely';

import { db } from '../database/db';
import type { Database } from '../database/types';
import { ApiError } from '../utils/api-error';
import { calculateSrsSchedule } from './srs.service';

export interface CreateVocabularyInput {
  word: string;
  translation: string;
  phonetic?: string;
  audioUrl?: string;
  description?: string;
  partOfSpeech?: string;
  imageUrl?: string;
}

export interface ReviewVocabularyInput {
  grade: number;
  questionType: string;
}

export class VocabularyService {
  async listForUser(userId: string, limit: number) {
    return db
      .selectFrom('user_vocabularies as vocabulary')
      .innerJoin('english_words as english', 'english.id', 'vocabulary.english_id')
      .innerJoin(
        'vietnamese_meanings as vietnamese',
        'vietnamese.id',
        'vocabulary.vietnamese_id',
      )
      .select([
        'vocabulary.id',
        'english.word',
        'english.phonetic',
        'english.audio_url',
        'vietnamese.translation',
        'vietnamese.description',
        'vocabulary.part_of_speech',
        'vocabulary.image_url',
        'vocabulary.ease_factor',
        'vocabulary.interval_days',
        'vocabulary.consecutive_correct',
        'vocabulary.next_review_date',
        'vocabulary.created_at',
        'vocabulary.last_practiced_at',
      ])
      .where('vocabulary.user_id', '=', userId)
      .orderBy('vocabulary.created_at', 'desc')
      .limit(limit)
      .execute();
  }

  async listDueForUser(userId: string, limit: number) {
    const now = new Date();

    return db
      .selectFrom('user_vocabularies as vocabulary')
      .innerJoin('english_words as english', 'english.id', 'vocabulary.english_id')
      .innerJoin(
        'vietnamese_meanings as vietnamese',
        'vietnamese.id',
        'vocabulary.vietnamese_id',
      )
      .select([
        'vocabulary.id',
        'english.word',
        'english.phonetic',
        'english.audio_url',
        'vietnamese.translation',
        'vietnamese.description',
        'vocabulary.part_of_speech',
        'vocabulary.image_url',
        'vocabulary.ease_factor',
        'vocabulary.interval_days',
        'vocabulary.consecutive_correct',
        'vocabulary.next_review_date',
        'vocabulary.last_practiced_at',
      ])
      .where('vocabulary.user_id', '=', userId)
      .where((expressionBuilder) =>
        expressionBuilder.or([
          expressionBuilder('vocabulary.next_review_date', 'is', null),
          expressionBuilder('vocabulary.next_review_date', '<=', now),
        ]),
      )
      .orderBy('vocabulary.next_review_date', 'asc')
      .limit(limit)
      .execute();
  }

  async create(userId: string, input: CreateVocabularyInput) {
    const vocabularyId = await db.transaction().execute(async (transaction) => {
      const englishId = await this.findOrCreateEnglishWord(transaction, input);
      const vietnameseId = await this.findOrCreateVietnameseMeaning(
        transaction,
        input,
      );

      const vocabulary = await transaction
        .insertInto('user_vocabularies')
        .values({
          user_id: userId,
          english_id: englishId,
          vietnamese_id: vietnameseId,
          part_of_speech: input.partOfSpeech ?? null,
          image_url: input.imageUrl ?? null,
          next_review_date: new Date(),
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      return vocabulary.id;
    });

    return this.getById(userId, vocabularyId);
  }

  async review(
    userId: string,
    vocabularyId: string,
    input: ReviewVocabularyInput,
  ) {
    return db.transaction().execute(async (transaction) => {
      const vocabulary = await transaction
        .selectFrom('user_vocabularies')
        .select([
          'id',
          'ease_factor',
          'interval_days',
          'consecutive_correct',
        ])
        .where('id', '=', vocabularyId)
        .where('user_id', '=', userId)
        .executeTakeFirst();

      if (!vocabulary) {
        throw ApiError.notFound('Vocabulary was not found');
      }

      const reviewedAt = new Date();
      const schedule = calculateSrsSchedule(
        {
          easeFactor: vocabulary.ease_factor,
          intervalDays: vocabulary.interval_days,
          consecutiveCorrect: vocabulary.consecutive_correct,
        },
        input.grade,
        reviewedAt,
      );

      await transaction
        .updateTable('user_vocabularies')
        .set({
          ease_factor: schedule.easeFactor,
          interval_days: schedule.intervalDays,
          consecutive_correct: schedule.consecutiveCorrect,
          next_review_date: schedule.nextReviewDate,
          last_practiced_at: reviewedAt,
        })
        .where('id', '=', vocabularyId)
        .where('user_id', '=', userId)
        .executeTakeFirstOrThrow();

      await transaction
        .insertInto('review_logs')
        .values({
          user_vocabulary_id: vocabularyId,
          user_id: userId,
          question_type: input.questionType,
          grade: input.grade,
        })
        .execute();

      return {
        vocabularyId,
        grade: input.grade,
        reviewedAt: reviewedAt.toISOString(),
        nextReviewDate: schedule.nextReviewDate.toISOString(),
        easeFactor: schedule.easeFactor,
        intervalDays: schedule.intervalDays,
        consecutiveCorrect: schedule.consecutiveCorrect,
      };
    });
  }

  private async getById(userId: string, vocabularyId: string) {
    const vocabulary = await db
      .selectFrom('user_vocabularies as vocabulary')
      .innerJoin('english_words as english', 'english.id', 'vocabulary.english_id')
      .innerJoin(
        'vietnamese_meanings as vietnamese',
        'vietnamese.id',
        'vocabulary.vietnamese_id',
      )
      .select([
        'vocabulary.id',
        'english.word',
        'english.phonetic',
        'english.audio_url',
        'vietnamese.translation',
        'vietnamese.description',
        'vocabulary.part_of_speech',
        'vocabulary.image_url',
        'vocabulary.ease_factor',
        'vocabulary.interval_days',
        'vocabulary.consecutive_correct',
        'vocabulary.next_review_date',
        'vocabulary.created_at',
        'vocabulary.last_practiced_at',
      ])
      .where('vocabulary.id', '=', vocabularyId)
      .where('vocabulary.user_id', '=', userId)
      .executeTakeFirst();

    if (!vocabulary) {
      throw ApiError.notFound('Vocabulary was not found');
    }

    return vocabulary;
  }

  private async findOrCreateEnglishWord(
    transaction: Transaction<Database>,
    input: CreateVocabularyInput,
  ): Promise<string> {
    const existingWord = await transaction
      .selectFrom('english_words')
      .select('id')
      .where(sql<string>`lower(word)`, '=', input.word.toLowerCase())
      .executeTakeFirst();

    if (existingWord) {
      return existingWord.id;
    }

    const insertedWord = await transaction
      .insertInto('english_words')
      .values({
        word: input.word,
        phonetic: input.phonetic ?? null,
        audio_url: input.audioUrl ?? null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    return insertedWord.id;
  }

  private async findOrCreateVietnameseMeaning(
    transaction: Transaction<Database>,
    input: CreateVocabularyInput,
  ): Promise<string> {
    const existingMeaning = await transaction
      .selectFrom('vietnamese_meanings')
      .select('id')
      .where(
        sql<string>`lower(translation)`,
        '=',
        input.translation.toLowerCase(),
      )
      .executeTakeFirst();

    if (existingMeaning) {
      return existingMeaning.id;
    }

    const insertedMeaning = await transaction
      .insertInto('vietnamese_meanings')
      .values({
        translation: input.translation,
        description: input.description ?? null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    return insertedMeaning.id;
  }
}

export const vocabularyService = new VocabularyService();

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  consecutiveCorrect: number;
}

export interface SrsResult extends SrsState {
  nextReviewDate: Date;
}

const MINIMUM_EASE_FACTOR = 1.3;

export function calculateSrsSchedule(
  current: SrsState,
  grade: number,
  reviewedAt = new Date(),
): SrsResult {
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
    throw new RangeError('SRS grade must be an integer between 0 and 5');
  }

  let consecutiveCorrect = current.consecutiveCorrect;
  let intervalDays = current.intervalDays;
  let easeFactor = current.easeFactor;

  if (grade < 3) {
    consecutiveCorrect = 0;
    intervalDays = 1;
  } else {
    consecutiveCorrect += 1;

    if (consecutiveCorrect === 1) {
      intervalDays = 1;
    } else if (consecutiveCorrect === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }
  }

  const gradeDistance = 5 - grade;
  easeFactor = Math.max(
    MINIMUM_EASE_FACTOR,
    easeFactor + 0.1 - gradeDistance * (0.08 + gradeDistance * 0.02),
  );

  const nextReviewDate = new Date(reviewedAt);
  nextReviewDate.setUTCDate(nextReviewDate.getUTCDate() + intervalDays);

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    consecutiveCorrect,
    nextReviewDate,
  };
}

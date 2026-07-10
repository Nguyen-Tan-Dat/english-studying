import { describe, expect, it } from "vitest";

import { calculateSrsSchedule } from "../../src/services/srs.service";

describe("calculateSrsSchedule", () => {
  const reviewedAt = new Date("2026-07-10T00:00:00.000Z");

  it("schedules the first correct answer for the next day", () => {
    const result = calculateSrsSchedule(
      { easeFactor: 2.5, intervalDays: 0, consecutiveCorrect: 0 },
      5,
      reviewedAt,
    );

    expect(result).toMatchObject({
      easeFactor: 2.6,
      intervalDays: 1,
      consecutiveCorrect: 1,
    });
    expect(result.nextReviewDate.toISOString()).toBe(
      "2026-07-11T00:00:00.000Z",
    );
  });

  it("resets the learning streak after an incorrect answer", () => {
    const result = calculateSrsSchedule(
      { easeFactor: 2.5, intervalDays: 12, consecutiveCorrect: 4 },
      2,
      reviewedAt,
    );

    expect(result.intervalDays).toBe(1);
    expect(result.consecutiveCorrect).toBe(0);
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("rejects grades outside the supported range", () => {
    expect(() =>
      calculateSrsSchedule(
        { easeFactor: 2.5, intervalDays: 1, consecutiveCorrect: 1 },
        6,
      ),
    ).toThrow("SRS grade must be an integer between 0 and 5");
  });
});

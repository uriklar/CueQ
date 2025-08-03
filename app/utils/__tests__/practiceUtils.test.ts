import { Word, Difficulty } from "../../types";
import { selectPracticeWords } from "../practiceUtils";

describe("selectPracticeWords", () => {
  // Helper function to create test words
  const createTestWord = (id: string, difficulty?: Difficulty): Word => ({
    id,
    french: `french${id}`,
    english: `english${id}`,
    difficulty,
  });

  // Helper function to count words by difficulty
  const countByDifficulty = (words: Word[]) => {
    return words.reduce((acc, word) => {
      const difficulty = word.difficulty || "new";
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<Difficulty | "new", number>);
  };

  it("should select words according to the target distribution when enough words are available", async () => {
    // Create test data with plenty of words in each category
    const testWords: Word[] = [
      ...Array(50)
        .fill(null)
        .map((_, i) => createTestWord(`easy${i}`, "easy")),
      ...Array(50)
        .fill(null)
        .map((_, i) => createTestWord(`medium${i}`, "medium")),
      ...Array(50)
        .fill(null)
        .map((_, i) => createTestWord(`hard${i}`, "hard")),
      ...Array(50)
        .fill(null)
        .map((_, i) => createTestWord(`new${i}`)), // no difficulty = new
    ];

    const targetCount = 100;
    const selectedWords = await selectPracticeWords(testWords, targetCount);

    // Check total count
    expect(selectedWords.length).toBe(targetCount);

    // Check distribution
    const distribution = countByDifficulty(selectedWords);

    // Expected counts based on DEFAULT_PRACTICE_DISTRIBUTION
    expect(distribution.new).toBeCloseTo(targetCount * 0.6, 0); // 60% new words
    expect(distribution.hard).toBeCloseTo(targetCount * 0.2, 0); // 20% hard words
    expect(distribution.medium).toBeCloseTo(targetCount * 0.1, 0); // 10% medium words
    expect(distribution.easy).toBeCloseTo(targetCount * 0.1, 0); // 10% easy words
  });

  it("should handle cases when there are not enough words in some categories", async () => {
    // Create test data with limited words in some categories
    const testWords: Word[] = [
      ...Array(2)
        .fill(null)
        .map((_, i) => createTestWord(`easy${i}`, "easy")),
      ...Array(3)
        .fill(null)
        .map((_, i) => createTestWord(`medium${i}`, "medium")),
      ...Array(5)
        .fill(null)
        .map((_, i) => createTestWord(`hard${i}`, "hard")),
      ...Array(4)
        .fill(null)
        .map((_, i) => createTestWord(`new${i}`)),
    ];

    const targetCount = 20;
    const selectedWords = await selectPracticeWords(testWords, targetCount);

    // Should use all available words since total words (14) < targetCount (20)
    expect(selectedWords.length).toBe(14);

    // Check that all available words are used
    const distribution = countByDifficulty(selectedWords);
    expect(distribution.easy).toBe(2); // All easy words
    expect(distribution.medium).toBe(3); // All medium words
    expect(distribution.hard).toBe(5); // All hard words
    expect(distribution.new).toBe(4); // All new words
  });

  it("should prioritize hard and new words when filling remaining slots", async () => {
    // Create test data with more hard and new words
    const testWords: Word[] = [
      ...Array(2)
        .fill(null)
        .map((_, i) => createTestWord(`easy${i}`, "easy")),
      ...Array(2)
        .fill(null)
        .map((_, i) => createTestWord(`medium${i}`, "medium")),
      ...Array(10)
        .fill(null)
        .map((_, i) => createTestWord(`hard${i}`, "hard")),
      ...Array(10)
        .fill(null)
        .map((_, i) => createTestWord(`new${i}`)),
    ];

    const targetCount = 20;
    const selectedWords = await selectPracticeWords(testWords, targetCount);

    // Check total count
    expect(selectedWords.length).toBe(targetCount);

    // Check distribution - should have more hard and new words
    const distribution = countByDifficulty(selectedWords);
    expect(distribution.hard + distribution.new).toBeGreaterThan(
      distribution.medium + distribution.easy
    );
  });

  it("should return shuffled words", async () => {
    const testWords: Word[] = Array(50)
      .fill(null)
      .map((_, i) => createTestWord(`${i}`, "medium"));

    const selectedWords = await selectPracticeWords(testWords, 20);

    // Check that words are not in the same order as input
    // Note: This test has a very small chance of failing even when shuffle works correctly
    const originalIds = testWords.slice(0, 20).map((w) => w.id);
    const selectedIds = selectedWords.map((w) => w.id);
    expect(selectedIds).not.toEqual(originalIds);
  });

  it("should handle empty input array", async () => {
    const selectedWords = await selectPracticeWords([], 20);
    expect(selectedWords).toEqual([]);
  });

  it("should handle target count of 0", async () => {
    const testWords: Word[] = Array(10)
      .fill(null)
      .map((_, i) => createTestWord(`${i}`, "medium"));

    const selectedWords = await selectPracticeWords(testWords, 0);
    expect(selectedWords).toEqual([]);
  });
});

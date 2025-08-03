import { Word, Difficulty } from "../types";
import { getPracticeDistribution, PracticeDistribution } from "./settingsUtils";

// Helper function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const selectPracticeWords = async (
  allWords: Word[],
  targetCount: number = 20
): Promise<Word[]> => {
  // Get current practice distribution settings
  const practiceDistribution = await getPracticeDistribution();

  // Group words by difficulty
  const wordsByDifficulty: Record<Difficulty | "new", Word[]> = {
    easy: [],
    medium: [],
    hard: [],
    new: [],
  };

  // Categorize words
  allWords.forEach((word) => {
    const difficulty = word.difficulty || "new";
    wordsByDifficulty[difficulty].push(word);
  });

  // Calculate target counts for each difficulty
  const targetCounts = {
    new: Math.round(targetCount * practiceDistribution.new),
    hard: Math.round(targetCount * practiceDistribution.hard),
    medium: Math.round(targetCount * practiceDistribution.medium),
    easy: Math.round(targetCount * practiceDistribution.easy),
  };

  // Adjust counts if we don't have enough words in some categories
  let selectedWords: Word[] = [];
  let remainingCount = targetCount;

  // First, try to meet the minimum requirements for each difficulty
  Object.entries(targetCounts).forEach(([difficulty, count]) => {
    const availableWords = wordsByDifficulty[difficulty as Difficulty | "new"];
    const shuffledWords = shuffleArray(availableWords);
    const selectedCount = Math.min(count, shuffledWords.length);

    selectedWords.push(...shuffledWords.slice(0, selectedCount));
    remainingCount -= selectedCount;
  });

  // If we still need more words, prioritize hard and new words
  if (remainingCount > 0) {
    const priorityWords = [
      ...wordsByDifficulty.hard,
      ...wordsByDifficulty.new,
      ...wordsByDifficulty.medium,
    ].filter((word) => !selectedWords.includes(word));

    const additionalWords = shuffleArray(priorityWords).slice(
      0,
      remainingCount
    );
    selectedWords.push(...additionalWords);
  }

  // Shuffle the final selection to avoid grouping by difficulty
  return shuffleArray(selectedWords);
};

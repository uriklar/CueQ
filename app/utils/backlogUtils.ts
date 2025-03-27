import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "../types";

const BACKLOG_STORAGE_KEY = "@french_cards_backlog";

export const parseCSV = (csvContent: string): Omit<Word, "id">[] => {
  const lines = csvContent.split("\n");
  const words: Omit<Word, "id">[] = [];

  // Skip header row if it exists
  const startIndex = lines[0].toLowerCase().includes("french,english") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [french, english] = line.split(",").map((item) => item.trim());
    if (french && english) {
      words.push({ french, english });
    }
  }

  return words;
};

export const saveToBacklog = async (words: Omit<Word, "id">[]) => {
  try {
    const existingBacklogJson = await AsyncStorage.getItem(BACKLOG_STORAGE_KEY);
    const existingBacklog: Record<string, Word> = existingBacklogJson
      ? JSON.parse(existingBacklogJson)
      : {};

    const newWords = words.reduce((acc, word) => {
      const id = `backlog_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      acc[id] = { ...word, id };
      return acc;
    }, {} as Record<string, Word>);

    const updatedBacklog = { ...existingBacklog, ...newWords };
    await AsyncStorage.setItem(
      BACKLOG_STORAGE_KEY,
      JSON.stringify(updatedBacklog)
    );
    return Object.values(newWords);
  } catch (error) {
    console.error("Error saving to backlog:", error);
    return [];
  }
};

export const getBacklogWords = async (): Promise<Word[]> => {
  try {
    const backlogJson = await AsyncStorage.getItem(BACKLOG_STORAGE_KEY);
    const backlog: Record<string, Word> = backlogJson
      ? JSON.parse(backlogJson)
      : {};
    return Object.values(backlog);
  } catch (error) {
    console.error("Error getting backlog words:", error);
    return [];
  }
};

// Helper function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const moveWordsFromBacklog = async (count: number): Promise<Word[]> => {
  try {
    const backlogWords = await getBacklogWords();
    if (backlogWords.length === 0) return [];

    // Shuffle the backlog words and take the requested count
    const shuffled = shuffleArray(backlogWords);
    const wordsToMove = shuffled.slice(0, count);
    const remainingWords = shuffled.slice(count);

    // Update backlog with remaining words
    const remainingWordsRecord = remainingWords.reduce((acc, word) => {
      acc[word.id] = word;
      return acc;
    }, {} as Record<string, Word>);

    await AsyncStorage.setItem(
      BACKLOG_STORAGE_KEY,
      JSON.stringify(remainingWordsRecord)
    );

    return wordsToMove;
  } catch (error) {
    console.error("Error moving words from backlog:", error);
    return [];
  }
};

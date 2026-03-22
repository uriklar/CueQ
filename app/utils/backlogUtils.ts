import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "../types";
import { words as staticWords } from "../data/words";
import { getStoredWords, generateStableId } from "./wordUtils";

export const BACKLOG_STORAGE_KEY = "@french_cards_backlog";

export const loadWordsFromStatic = async (
  count: number = 10
): Promise<Omit<Word, "id">[]> => {
  const backlogWords = await getBacklogWords();
  const storedWords = await getStoredWords();

  // Build Sets for O(1) lookup instead of O(n) .some() scans
  const backlogKeys = new Set(
    backlogWords.map((w) => w.french.toLowerCase().trim())
  );
  const storedKeys = new Set(
    storedWords.map((w) => w.french.toLowerCase().trim())
  );

  const availableWords = staticWords.filter((word) => {
    const key = word.french.toLowerCase().trim();
    return !backlogKeys.has(key) && !storedKeys.has(key);
  });

  return availableWords.slice(0, count);
};

export const getBacklogWords = async (): Promise<Word[]> => {
  try {
    const backlogJson = await AsyncStorage.getItem(BACKLOG_STORAGE_KEY);
    return backlogJson ? JSON.parse(backlogJson) : [];
  } catch (error) {
    console.error("Error getting backlog words:", error);
    return [];
  }
};

export const saveToBacklog = async (words: Omit<Word, "id">[]) => {
  try {
    const existingWords = await getBacklogWords();
    const newWords = words.map((word) => ({
      ...word,
      id: generateStableId(word.french),
      source: "static" as const,
    }));

    await AsyncStorage.setItem(
      BACKLOG_STORAGE_KEY,
      JSON.stringify([...existingWords, ...newWords])
    );
  } catch (error) {
    console.error("Error saving to backlog:", error);
  }
};

export const moveWordsFromBacklog = async (count: number): Promise<Word[]> => {
  try {
    const backlogWords = await getBacklogWords();
    const wordsToMove = backlogWords.slice(0, count);
    const remainingWords = backlogWords.slice(count);

    await AsyncStorage.setItem(
      BACKLOG_STORAGE_KEY,
      JSON.stringify(remainingWords)
    );

    return wordsToMove;
  } catch (error) {
    console.error("Error moving words from backlog:", error);
    return [];
  }
};

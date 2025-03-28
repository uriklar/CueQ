import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "../types";
import { words as staticWords } from "../data/words";
import { getStoredWords } from "./wordUtils";

export const BACKLOG_STORAGE_KEY = "@french_cards_backlog";

export const loadWordsFromStatic = async (
  count: number = 10
): Promise<Omit<Word, "id">[]> => {
  console.log("Static words length:", staticWords.length);
  const backlogWords = await getBacklogWords();
  const storedWords = await getStoredWords();
  console.log("Backlog words length:", backlogWords.length);
  console.log("Stored words length:", storedWords.length);

  const availableWords = staticWords.filter(
    (word) =>
      !backlogWords.some(
        (backlogWord) =>
          backlogWord.french === word.french &&
          backlogWord.english === word.english
      ) &&
      !storedWords.some(
        (storedWord) =>
          storedWord.french === word.french &&
          storedWord.english === word.english
      )
  );
  console.log("Available words length:", availableWords.length);

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
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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

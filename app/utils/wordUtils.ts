import { Word, Difficulty, SwipeDirection } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { words as staticWords } from "../data/words";
import { fetchRemoteWords } from "../services/remoteWords";

const STORAGE_KEY = "@french_cards_words";
const DELETED_WORDS_KEY = "@french_cards_deleted_words";

export function generateStableId(french: string): string {
  return `static:${french.toLowerCase().trim()}`;
}

export function generateRemoteId(french: string): string {
  return `remote:${french.toLowerCase().trim()}`;
}

export const isVerb = (word: Word): boolean => {
  return !!(word.conjugation || word.past_participle);
};

export const getSwipeDifficulty = (direction: SwipeDirection): Difficulty => {
  switch (direction) {
    case "left":
      return "hard";
    case "right":
      return "easy";
    case "up":
      return "medium";
    default:
      return "hard";
  }
};

export const saveWordWithDifficulty = async (
  word: Word,
  difficulty: Difficulty
) => {
  try {
    const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const storedWords: Record<string, Word> = storedWordsJson
      ? JSON.parse(storedWordsJson)
      : {};

    storedWords[word.id] = {
      ...word,
      difficulty,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));
  } catch (error) {
    console.error("Error saving word:", error);
  }
};

export const getStoredWords = async (): Promise<Word[]> => {
  try {
    const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const storedWords: Record<string, Word> = storedWordsJson
      ? JSON.parse(storedWordsJson)
      : {};
    return Object.values(storedWords);
  } catch (error) {
    console.error("Error getting stored words:", error);
    return [];
  }
};

export const updateStoredWord = async (updatedWord: Word) => {
  try {
    const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const storedWords: Record<string, Word> = storedWordsJson
      ? JSON.parse(storedWordsJson)
      : {};

    if (!updatedWord.id) {
      console.error("Error updating word: ID is missing.");
      return;
    }

    storedWords[updatedWord.id] = updatedWord;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));
  } catch (error) {
    console.error("Error updating word in storage:", error);
  }
};

export const markWordAsDeleted = async (wordId: string) => {
  try {
    const deletedWordsJson = await AsyncStorage.getItem(DELETED_WORDS_KEY);
    const deletedWords: Record<string, boolean> = deletedWordsJson
      ? JSON.parse(deletedWordsJson)
      : {};

    deletedWords[wordId] = true;

    await AsyncStorage.setItem(
      DELETED_WORDS_KEY,
      JSON.stringify(deletedWords)
    );
  } catch (error) {
    console.error("Error marking word as deleted:", error);
  }
};

export const getDeletedWords = async (): Promise<Set<string>> => {
  try {
    const deletedWordsJson = await AsyncStorage.getItem(DELETED_WORDS_KEY);
    const deletedWords: Record<string, boolean> = deletedWordsJson
      ? JSON.parse(deletedWordsJson)
      : {};

    return new Set(Object.keys(deletedWords));
  } catch (error) {
    console.error("Error getting deleted words:", error);
    return new Set();
  }
};

export const deleteWord = async (word: Word): Promise<boolean> => {
  try {
    const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const storedWords: Record<string, Word> = storedWordsJson
      ? JSON.parse(storedWordsJson)
      : {};

    if (!storedWords[word.id]) {
      console.warn("Attempted to delete a non-existent word");
      return false;
    }

    // If this is a static or remote word, mark it as deleted to prevent re-import
    if (word.id.startsWith("static:") || word.id.startsWith("remote:")) {
      await markWordAsDeleted(word.id);
    }

    // Remove from storage
    delete storedWords[word.id];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));

    return true;
  } catch (error) {
    console.error("Error deleting word:", error);
    return false;
  }
};

export const loadAndMergeWords = async (): Promise<Word[]> => {
  try {
    const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const storedWordsMap: Record<string, Word> = storedWordsJson
      ? JSON.parse(storedWordsJson)
      : {};

    const deletedWords = await getDeletedWords();

    const mergedWordsMap = { ...storedWordsMap };
    let hasNewWords = false;

    for (const staticWord of staticWords) {
      const stableId = generateStableId(staticWord.french);

      // O(1) lookup by key
      if (mergedWordsMap[stableId]) continue;

      // Check if deleted
      if (deletedWords.has(stableId)) continue;

      mergedWordsMap[stableId] = {
        ...staticWord,
        id: stableId,
        source: "static",
      };
      hasNewWords = true;
    }

    // Merge remote words (fetch from GitHub, fallback to cache)
    const remoteWords = await fetchRemoteWords();
    if (remoteWords) {
      for (const remoteWord of remoteWords) {
        const remoteId = generateRemoteId(remoteWord.french);

        if (mergedWordsMap[remoteId]) continue;
        if (deletedWords.has(remoteId)) continue;

        mergedWordsMap[remoteId] = {
          ...remoteWord,
          id: remoteId,
          source: "remote",
        };
        hasNewWords = true;
      }
    }

    // Only write back if we added new words
    if (hasNewWords) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedWordsMap));
    }

    return Object.values(mergedWordsMap);
  } catch (error) {
    console.error("Error loading and merging words:", error);
    return await getStoredWords();
  }
};

import { Word, Difficulty, SwipeDirection } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { words as staticWords } from "../data/words";

const STORAGE_KEY = "@french_cards_words";

export const isVerb = (word: Word): boolean => {
  return !!(word.conjugation || word.past_particle);
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

export const loadAndMergeWords = async (): Promise<Word[]> => {
  try {
    // Get stored words from AsyncStorage
    const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const storedWordsMap: Record<string, Word> = storedWordsJson
      ? JSON.parse(storedWordsJson)
      : {};

    // Add static words with generated IDs if they don't already exist
    const mergedWordsMap = { ...storedWordsMap };

    staticWords.forEach((staticWord, index) => {
      // Check if this word already exists in stored words
      const existingWord = Object.values(storedWordsMap).find(
        (word) =>
          word.french === staticWord.french &&
          word.english === staticWord.english
      );

      if (!existingWord) {
        // Add the static word with a generated ID
        const id = `static_${index}_${Date.now()}`;
        const wordWithId: Word = {
          ...staticWord,
          id,
        };
        mergedWordsMap[id] = wordWithId;
      }
    });

    // Save the merged words back to storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedWordsMap));

    return Object.values(mergedWordsMap);
  } catch (error) {
    console.error("Error loading and merging words:", error);
    // Fallback to stored words only
    return await getStoredWords();
  }
};

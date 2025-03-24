import { Word, Difficulty, SwipeDirection } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@french_cards_words";

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

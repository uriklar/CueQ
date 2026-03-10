import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConjugationMistake } from "../types";

const STORAGE_KEY = "@conjugation_mistakes";
const MAX_MISTAKES = 500;

export const loadMistakes = async (): Promise<ConjugationMistake[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading mistakes:", error);
    return [];
  }
};

export const saveMistake = async (mistake: ConjugationMistake): Promise<void> => {
  try {
    const existing = await loadMistakes();
    const updated = [...existing, mistake].slice(-MAX_MISTAKES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving mistake:", error);
  }
};

export const clearMistakes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing mistakes:", error);
  }
};

export interface MistakeSummary {
  total: number;
  topVerbs: { name: string; count: number }[];
  topTenses: { name: string; count: number }[];
  topPronouns: { name: string; count: number }[];
}

export const getMistakeSummary = (mistakes: ConjugationMistake[]): MistakeSummary => {
  const countBy = (key: keyof ConjugationMistake) => {
    const counts: Record<string, number> = {};
    for (const m of mistakes) {
      const val = String(m[key]);
      counts[val] = (counts[val] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    total: mistakes.length,
    topVerbs: countBy("verb").slice(0, 5),
    topTenses: countBy("tense").slice(0, 5),
    topPronouns: countBy("pronoun").slice(0, 5),
  };
};

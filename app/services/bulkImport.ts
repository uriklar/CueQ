import { Word } from "../types";

export type BulkImportResult = Word[];

/**
 * Parses the raw JSON string into an array of Word-like objects.
 * - Ensures each word has french & english properties.
 * - Generates ids when missing.
 */
export const parseWords = (json: string): BulkImportResult => {
  const data = JSON.parse(json);
  if (!Array.isArray(data)) {
    throw new Error("Input must be an array of words");
  }

  const mapped: Word[] = data.map((item) => {
    if (typeof item !== "object" || !item.french || !item.english) {
      throw new Error(
        "Each word must be an object with 'french' and 'english' properties"
      );
    }
    return {
      id:
        item.id ??
        Date.now().toString() + Math.random().toString(36).slice(2, 9),
      french: item.french,
      english: item.english,
      examples: item.examples ?? "",
      gender: item.gender ?? null,
      difficulty: item.difficulty,
    } as Word;
  });

  return mapped;
};

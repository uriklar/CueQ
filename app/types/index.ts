export type Difficulty = "hard" | "medium" | "easy";

export type WordInfoMode =
  | "examples"
  | "conjugation"
  | "past_participle"
  | null;

export type WordSource = "static" | "manual" | "ai";

export interface Word {
  id: string;
  french: string;
  english: string;
  examples?: string;
  difficulty?: Difficulty;
  gender?: "masculine" | "feminine" | null;
  conjugation?: string;
  past_participle?: string;
  source?: WordSource;
}

export interface WordCard extends Word {
  isRevealed: boolean;
}

export type SwipeDirection = "left" | "right" | "up";

export interface Position {
  x: number;
  y: number;
}

export interface ConjugationMistake {
  verb: string;
  tense: string;
  pronoun: string;
  userAnswer: string;
  correctAnswer: string;
  timestamp: number;
}

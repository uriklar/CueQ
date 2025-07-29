export type Difficulty = "hard" | "medium" | "easy";

export interface Word {
  id: string;
  french: string;
  english: string;
  examples?: string;
  difficulty?: Difficulty;
  gender?: "masculine" | "feminine" | null;
  conjugation?: string;
  past_particle?: string;
}

export interface WordCard extends Word {
  isRevealed: boolean;
}

export type SwipeDirection = "left" | "right" | "up";

export interface Position {
  x: number;
  y: number;
}

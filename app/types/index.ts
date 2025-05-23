export type Difficulty = "hard" | "medium" | "easy";

export interface Word {
  id: string;
  french: string;
  english: string;
  difficulty?: Difficulty;
}

export interface WordCard extends Word {
  isRevealed: boolean;
}

export type SwipeDirection = "left" | "right" | "up";

export interface Position {
  x: number;
  y: number;
}

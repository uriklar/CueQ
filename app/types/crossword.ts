import { Difficulty, Word } from "./index";

export type CrosswordDirection = "across" | "down";
export type CrosswordCheckState = "unchecked" | "correct" | "incorrect" | "revealed";

export interface CrosswordEntrySource extends Word {
  normalizedAnswer: string;
}

export interface CrosswordPlacedEntry {
  id: string;
  answer: string;
  clue: string;
  sourceWordId: string;
  direction: CrosswordDirection;
  row: number;
  col: number;
  length: number;
  number: number;
}

export interface CrosswordCell {
  row: number;
  col: number;
  solution: string;
  number?: number;
  acrossId?: string;
  downId?: string;
}

export interface CrosswordPuzzle {
  width: number;
  height: number;
  cells: CrosswordCell[];
  entries: CrosswordPlacedEntry[];
}

export interface CrosswordSetupParams {
  wordCount: number;
  difficulties: (Difficulty | "new")[];
}

export interface CrosswordGenerationOptions {
  targetEntryCount: number;
  maxSize?: number;
  minSize?: number;
  attemptsPerSize?: number;
  random?: () => number;
}

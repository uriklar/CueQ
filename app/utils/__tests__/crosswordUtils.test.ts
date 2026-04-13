import { Word } from "../../types";
import { CrosswordCell, CrosswordPlacedEntry } from "../../types/crossword";
import {
  buildCrosswordPuzzle,
  getCrosswordCellCheckState,
  getCrosswordEligibleWords,
  getCrosswordEntryCheckState,
  normalizeCrosswordAnswer,
} from "../crosswordUtils";

function createWord(id: string, french: string, english = `${french} clue`): Word {
  return { id, french, english };
}

function createSequenceRandom(values: number[]) {
  let index = 0;

  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe("crosswordUtils", () => {
  it("keeps longer answers eligible but rejects sentence-length entries", () => {
    const eligible = getCrosswordEligibleWords(
      [
        createWord("1", "extraordinaire", "extraordinary"),
        createWord("2", "au revoir", "goodbye"),
        createWord("3", "je suis fatigue", "sentence"),
        createWord("4", "été", "summer"),
        createWord("5", "x", "too short"),
      ],
      []
    );

    expect(eligible.map((word) => word.normalizedAnswer)).toContain("EXTRAORDINAIRE");
    expect(eligible.map((word) => word.normalizedAnswer)).toContain("AUREVOIR");
    expect(eligible.map((word) => word.normalizedAnswer)).not.toContain("JESUISFATIGUE");
    expect(eligible.map((word) => word.normalizedAnswer)).not.toContain("X");
  });

  it("builds a puzzle that can include longer mixed-length entries", () => {
    const eligible = getCrosswordEligibleWords(
      [
        createWord("1", "abcdefghijkl", "long answer"),
        createWord("2", "cfi", "short cross"),
        createWord("3", "def", "short cross"),
        createWord("4", "ghi", "short cross"),
        createWord("5", "jkl", "short cross"),
      ],
      []
    );

    const puzzle = buildCrosswordPuzzle(eligible, {
      targetEntryCount: 4,
      attemptsPerSize: 1,
      random: createSequenceRandom([0.2, 0.4, 0.6, 0.8]),
    });

    expect(puzzle).not.toBeNull();
    expect(puzzle?.entries.some((entry) => entry.answer === "ABCDEFGHIJKL")).toBe(true);
    expect(puzzle?.entries.some((entry) => entry.length <= 3)).toBe(true);
    expect(Math.max(puzzle?.width ?? 0, puzzle?.height ?? 0)).toBeGreaterThanOrEqual(12);
  });

  it("responds to different random sequences with different puzzle layouts", () => {
    const eligible = getCrosswordEligibleWords(
      [
        createWord("1", "stone", "stone"),
        createWord("2", "tones", "tones"),
        createWord("3", "notes", "notes"),
        createWord("4", "onset", "onset"),
        createWord("5", "seton", "seton"),
        createWord("6", "nest", "nest"),
        createWord("7", "ones", "ones"),
        createWord("8", "tone", "tone"),
      ],
      []
    );

    const puzzleA = buildCrosswordPuzzle(eligible, {
      targetEntryCount: 5,
      attemptsPerSize: 1,
      random: createSequenceRandom([0.1, 0.3, 0.5, 0.7, 0.9]),
    });
    const puzzleB = buildCrosswordPuzzle(eligible, {
      targetEntryCount: 5,
      attemptsPerSize: 1,
      random: createSequenceRandom([0.9, 0.7, 0.5, 0.3, 0.1]),
    });

    expect(puzzleA).not.toBeNull();
    expect(puzzleB).not.toBeNull();
    expect(serializePuzzle(puzzleA!)).not.toEqual(serializePuzzle(puzzleB!));
  });

  it("returns explicit entry and cell check states", () => {
    const entry: CrosswordPlacedEntry = {
      id: "chat",
      answer: normalizeCrosswordAnswer("chat"),
      clue: "cat",
      sourceWordId: "chat",
      direction: "across",
      row: 0,
      col: 0,
      length: 4,
      number: 1,
    };
    const cell: CrosswordCell = {
      row: 0,
      col: 0,
      solution: "C",
      number: 1,
      acrossId: "chat",
    };

    const correctAnswers = {
      "0:0": "C",
      "0:1": "H",
      "0:2": "A",
      "0:3": "T",
    };
    const incorrectAnswers = {
      ...correctAnswers,
      "0:3": "X",
    };

    expect(getCrosswordEntryCheckState(entry, correctAnswers, new Set(["chat"]), new Set())).toBe("correct");
    expect(getCrosswordEntryCheckState(entry, incorrectAnswers, new Set(["chat"]), new Set())).toBe("incorrect");
    expect(getCrosswordEntryCheckState(entry, correctAnswers, new Set(), new Set(["chat"]))).toBe("revealed");
    expect(getCrosswordCellCheckState(cell, correctAnswers, new Set(["0:0"]), new Set())).toBe("correct");
    expect(getCrosswordCellCheckState(cell, {}, new Set(["0:0"]), new Set())).toBe("incorrect");
    expect(getCrosswordCellCheckState(cell, correctAnswers, new Set(), new Set(["0:0"]))).toBe("revealed");
  });
});

function serializePuzzle(puzzle: NonNullable<ReturnType<typeof buildCrosswordPuzzle>>) {
  return puzzle.entries
    .map((entry) => `${entry.id}:${entry.direction}:${entry.row}:${entry.col}`)
    .join("|");
}

import { Difficulty, Word } from "../types";
import {
  CrosswordCell,
  CrosswordDirection,
  CrosswordEntrySource,
  CrosswordGenerationOptions,
  CrosswordPlacedEntry,
  CrosswordPuzzle,
} from "../types/crossword";

const ALLOWED_PATTERN = /^[A-Z]+$/;

interface PlacementCandidate {
  row: number;
  col: number;
  direction: CrosswordDirection;
  intersections: number;
}

interface WorkingEntry {
  source: CrosswordEntrySource;
  row: number;
  col: number;
  direction: CrosswordDirection;
}

export function normalizeCrosswordAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
}

export function getCrosswordEligibleWords(
  words: Word[],
  difficulties: (Difficulty | "new")[]
): CrosswordEntrySource[] {
  const allowAll = difficulties.length === 0;
  const filtered = words.filter((word) => {
    if (!allowAll) {
      const matchesDifficulty = difficulties.some((difficulty) =>
        difficulty === "new"
          ? !word.difficulty
          : word.difficulty === difficulty
      );
      if (!matchesDifficulty) {
        return false;
      }
    }

    const normalizedAnswer = normalizeCrosswordAnswer(word.french);
    const clue = word.english?.trim();

    if (!clue || normalizedAnswer.length < 3 || normalizedAnswer.length > 10) {
      return false;
    }

    return ALLOWED_PATTERN.test(normalizedAnswer);
  });

  const seen = new Set<string>();
  return filtered
    .map((word) => ({ ...word, normalizedAnswer: normalizeCrosswordAnswer(word.french) }))
    .filter((word) => {
      if (seen.has(word.normalizedAnswer)) return false;
      seen.add(word.normalizedAnswer);
      return true;
    })
    .sort((a, b) => b.normalizedAnswer.length - a.normalizedAnswer.length);
}

export function buildCrosswordPuzzle(
  sourceWords: CrosswordEntrySource[],
  options: CrosswordGenerationOptions
): CrosswordPuzzle | null {
  const targetEntryCount = Math.max(3, options.targetEntryCount);
  const maxSize = options.maxSize ?? 11;
  const minSize = options.minSize ?? 7;

  const candidates = sourceWords.filter(
    (word) => word.normalizedAnswer.length <= maxSize
  );

  if (candidates.length < 3) {
    return null;
  }

  for (let size = minSize; size <= maxSize; size += 1) {
    const puzzle = tryBuildForSize(candidates, targetEntryCount, size);
    if (puzzle) {
      return puzzle;
    }
  }

  return null;
}

function tryBuildForSize(
  words: CrosswordEntrySource[],
  targetEntryCount: number,
  size: number
): CrosswordPuzzle | null {
  const limitedWords = words.slice(0, Math.min(words.length, 28));

  for (const seed of limitedWords) {
    if (seed.normalizedAnswer.length > size) continue;

    const grid = createGrid(size);
    const seedRow = Math.floor(size / 2);
    const seedCol = Math.floor((size - seed.normalizedAnswer.length) / 2);
    placeWord(grid, seed, seedRow, seedCol, "across");

    const placed: WorkingEntry[] = [
      {
        source: seed,
        row: seedRow,
        col: seedCol,
        direction: "across",
      },
    ];

    const remaining = limitedWords.filter((word) => word.id !== seed.id);
    const success = backtrackPlace(grid, placed, remaining, targetEntryCount, size);
    if (success.length >= Math.min(targetEntryCount, 3)) {
      return finalizePuzzle(success, size);
    }
  }

  return null;
}

function backtrackPlace(
  grid: (string | null)[][],
  placed: WorkingEntry[],
  remaining: CrosswordEntrySource[],
  targetEntryCount: number,
  size: number
): WorkingEntry[] {
  let best = [...placed];

  if (placed.length >= targetEntryCount) {
    return placed;
  }

  const orderedWords = remaining
    .map((word) => ({ word, placements: getPlacements(grid, word, size) }))
    .filter((item) => item.placements.length > 0)
    .sort((a, b) => b.placements[0].intersections - a.placements[0].intersections);

  for (const { word, placements } of orderedWords.slice(0, 12)) {
    for (const placement of placements.slice(0, 6)) {
      const nextGrid = cloneGrid(grid);
      placeWord(nextGrid, word, placement.row, placement.col, placement.direction);
      const nextPlaced: WorkingEntry[] = [
        ...placed,
        {
          source: word,
          row: placement.row,
          col: placement.col,
          direction: placement.direction,
        },
      ];

      const nextRemaining = remaining.filter((candidate) => candidate.id !== word.id);
      const result = backtrackPlace(
        nextGrid,
        nextPlaced,
        nextRemaining,
        targetEntryCount,
        size
      );

      if (result.length > best.length) {
        best = result;
      }
      if (best.length >= targetEntryCount) {
        return best;
      }
    }
  }

  return best;
}

function getPlacements(
  grid: (string | null)[][],
  word: CrosswordEntrySource,
  size: number
): PlacementCandidate[] {
  const placements: PlacementCandidate[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = grid[row][col];
      if (!cell) continue;

      for (let index = 0; index < word.normalizedAnswer.length; index += 1) {
        if (word.normalizedAnswer[index] !== cell) continue;

        const acrossStartCol = col - index;
        if (canPlaceWord(grid, word.normalizedAnswer, row, acrossStartCol, "across")) {
          placements.push({
            row,
            col: acrossStartCol,
            direction: "across",
            intersections: countIntersections(grid, word.normalizedAnswer, row, acrossStartCol, "across"),
          });
        }

        const downStartRow = row - index;
        if (canPlaceWord(grid, word.normalizedAnswer, downStartRow, col, "down")) {
          placements.push({
            row: downStartRow,
            col,
            direction: "down",
            intersections: countIntersections(grid, word.normalizedAnswer, downStartRow, col, "down"),
          });
        }
      }
    }
  }

  return dedupePlacements(placements)
    .filter((placement) => placement.intersections > 0)
    .sort((a, b) => b.intersections - a.intersections);
}

function dedupePlacements(placements: PlacementCandidate[]): PlacementCandidate[] {
  const seen = new Set<string>();
  return placements.filter((placement) => {
    const key = `${placement.direction}:${placement.row}:${placement.col}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canPlaceWord(
  grid: (string | null)[][],
  answer: string,
  row: number,
  col: number,
  direction: CrosswordDirection
): boolean {
  const size = grid.length;
  if (row < 0 || col < 0) return false;
  if (direction === "across" && col + answer.length > size) return false;
  if (direction === "down" && row + answer.length > size) return false;

  if (direction === "across") {
    if (col > 0 && grid[row][col - 1]) return false;
    if (col + answer.length < size && grid[row][col + answer.length]) return false;
  } else {
    if (row > 0 && grid[row - 1][col]) return false;
    if (row + answer.length < size && grid[row + answer.length][col]) return false;
  }

  let intersections = 0;

  for (let index = 0; index < answer.length; index += 1) {
    const currentRow = direction === "across" ? row : row + index;
    const currentCol = direction === "across" ? col + index : col;
    const existing = grid[currentRow][currentCol];
    const nextChar = answer[index];

    if (existing && existing !== nextChar) {
      return false;
    }

    if (!existing) {
      if (direction === "across") {
        if ((currentRow > 0 && grid[currentRow - 1][currentCol]) || (currentRow < size - 1 && grid[currentRow + 1][currentCol])) {
          return false;
        }
      } else if ((currentCol > 0 && grid[currentRow][currentCol - 1]) || (currentCol < size - 1 && grid[currentRow][currentCol + 1])) {
        return false;
      }
    } else {
      intersections += 1;
    }
  }

  return intersections > 0;
}

function countIntersections(
  grid: (string | null)[][],
  answer: string,
  row: number,
  col: number,
  direction: CrosswordDirection
): number {
  let intersections = 0;
  for (let index = 0; index < answer.length; index += 1) {
    const currentRow = direction === "across" ? row : row + index;
    const currentCol = direction === "across" ? col + index : col;
    if (grid[currentRow][currentCol] === answer[index]) {
      intersections += 1;
    }
  }
  return intersections;
}

function placeWord(
  grid: (string | null)[][],
  word: CrosswordEntrySource,
  row: number,
  col: number,
  direction: CrosswordDirection
) {
  for (let index = 0; index < word.normalizedAnswer.length; index += 1) {
    const currentRow = direction === "across" ? row : row + index;
    const currentCol = direction === "across" ? col + index : col;
    grid[currentRow][currentCol] = word.normalizedAnswer[index];
  }
}

function finalizePuzzle(placedEntries: WorkingEntry[], size: number): CrosswordPuzzle {
  const occupiedCells = new Set<string>();
  let minRow = size;
  let minCol = size;
  let maxRow = 0;
  let maxCol = 0;

  placedEntries.forEach((entry) => {
    for (let index = 0; index < entry.source.normalizedAnswer.length; index += 1) {
      const row = entry.direction === "across" ? entry.row : entry.row + index;
      const col = entry.direction === "across" ? entry.col + index : entry.col;
      occupiedCells.add(`${row}:${col}`);
      minRow = Math.min(minRow, row);
      minCol = Math.min(minCol, col);
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }
  });

  const numberedMap = new Map<string, number>();
  const cells: CrosswordCell[] = [];
  let nextNumber = 1;

  const normalizedEntries = placedEntries.map((entry) => ({
    ...entry,
    row: entry.row - minRow,
    col: entry.col - minCol,
  }));

  normalizedEntries.forEach((entry) => {
    const key = `${entry.row}:${entry.col}`;
    if (!numberedMap.has(key)) {
      numberedMap.set(key, nextNumber);
      nextNumber += 1;
    }
  });

  for (let row = minRow; row <= maxRow; row += 1) {
    for (let col = minCol; col <= maxCol; col += 1) {
      const sourceKey = `${row}:${col}`;
      if (!occupiedCells.has(sourceKey)) continue;

      const translatedRow = row - minRow;
      const translatedCol = col - minCol;
      const cellEntries = normalizedEntries.filter((entry) => {
        if (entry.direction === "across") {
          return entry.row === translatedRow && translatedCol >= entry.col && translatedCol < entry.col + entry.source.normalizedAnswer.length;
        }
        return entry.col === translatedCol && translatedRow >= entry.row && translatedRow < entry.row + entry.source.normalizedAnswer.length;
      });

      const number = numberedMap.get(`${translatedRow}:${translatedCol}`);
      const acrossEntry = cellEntries.find((entry) => entry.direction === "across");
      const downEntry = cellEntries.find((entry) => entry.direction === "down");
      const firstEntry = cellEntries[0];
      const solutionIndex = firstEntry.direction === "across"
        ? translatedCol - firstEntry.col
        : translatedRow - firstEntry.row;

      cells.push({
        row: translatedRow,
        col: translatedCol,
        solution: firstEntry.source.normalizedAnswer[solutionIndex],
        number,
        acrossId: acrossEntry?.source.id,
        downId: downEntry?.source.id,
      });
    }
  }

  const entries: CrosswordPlacedEntry[] = normalizedEntries
    .map((entry) => ({
      id: entry.source.id,
      answer: entry.source.normalizedAnswer,
      clue: entry.source.english.trim(),
      sourceWordId: entry.source.id,
      direction: entry.direction,
      row: entry.row,
      col: entry.col,
      length: entry.source.normalizedAnswer.length,
      number: numberedMap.get(`${entry.row}:${entry.col}`) ?? 0,
    }))
    .sort((a, b) => a.number - b.number || a.direction.localeCompare(b.direction));

  return {
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
    cells,
    entries,
  };
}

function createGrid(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

function cloneGrid(grid: (string | null)[][]) {
  return grid.map((row) => [...row]);
}

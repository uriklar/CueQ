import { Difficulty, Word } from "../types";
import {
  CrosswordCell,
  CrosswordCheckState,
  CrosswordDirection,
  CrosswordEntrySource,
  CrosswordGenerationOptions,
  CrosswordPlacedEntry,
  CrosswordPuzzle,
} from "../types/crossword";

const ALLOWED_PATTERN = /^[A-Z]+$/;
const MIN_ENTRY_LENGTH = 3;
const MAX_SOURCE_WORDS = 2;

interface PlacementCandidate {
  row: number;
  col: number;
  direction: CrosswordDirection;
  intersections: number;
  score: number;
}

interface WorkingEntry {
  source: CrosswordEntrySource;
  row: number;
  col: number;
  direction: CrosswordDirection;
}

type RandomFn = () => number;

export function normalizeCrosswordAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
}

export function isCrosswordEntrySolved(
  entry: CrosswordPlacedEntry,
  answersByCell: Record<string, string>
): boolean {
  for (let index = 0; index < entry.length; index += 1) {
    const row = entry.direction === "across" ? entry.row : entry.row + index;
    const col = entry.direction === "across" ? entry.col + index : entry.col;
    if ((answersByCell[toCellKey(row, col)] ?? "") !== entry.answer[index]) {
      return false;
    }
  }

  return true;
}

export function getCrosswordEntryCheckState(
  entry: CrosswordPlacedEntry,
  answersByCell: Record<string, string>,
  checkedEntryIds: Set<string>,
  revealedEntryIds: Set<string>
): CrosswordCheckState {
  if (revealedEntryIds.has(entry.id)) {
    return "revealed";
  }

  if (!checkedEntryIds.has(entry.id)) {
    return "unchecked";
  }

  return isCrosswordEntrySolved(entry, answersByCell) ? "correct" : "incorrect";
}

export function getCrosswordCellCheckState(
  cell: Pick<CrosswordCell, "row" | "col" | "solution">,
  answersByCell: Record<string, string>,
  checkedCells: Set<string>,
  revealedCells: Set<string>
): CrosswordCheckState {
  const key = toCellKey(cell.row, cell.col);

  if (revealedCells.has(key)) {
    return "revealed";
  }

  if (!checkedCells.has(key)) {
    return "unchecked";
  }

  return (answersByCell[key] ?? "") === cell.solution ? "correct" : "incorrect";
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
    const sourceWordCount = countCrosswordSourceWords(word.french);

    if (
      !clue ||
      sourceWordCount === 0 ||
      sourceWordCount > MAX_SOURCE_WORDS ||
      normalizedAnswer.length < MIN_ENTRY_LENGTH
    ) {
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
  const random = options.random ?? Math.random;
  const attemptsPerSize = Math.max(1, options.attemptsPerSize ?? 6);
  const candidates = sourceWords.filter(
    (word) => options.maxSize == null || word.normalizedAnswer.length <= options.maxSize
  );

  if (candidates.length < 3) {
    return null;
  }

  const longestEntryLength = Math.max(...candidates.map((word) => word.normalizedAnswer.length));
  const averageEntryLength =
    candidates.reduce(
      (total, word) => total + Math.min(word.normalizedAnswer.length, 9),
      0
    ) / candidates.length;
  const preferredLetterCount = averageEntryLength * Math.max(targetEntryCount, 4);
  const preferredSize = Math.max(
    options.minSize ?? 7,
    Math.ceil(Math.sqrt(Math.max(preferredLetterCount, MIN_ENTRY_LENGTH) * 1.8))
  );
  const minSize = options.minSize ?? 7;
  const maxSize = Math.max(
    minSize,
    options.maxSize ?? Math.max(preferredSize + 4, Math.min(longestEntryLength + 2, preferredSize + 6))
  );
  const sizeOrder = buildSizeSearchOrder(minSize, maxSize, clamp(preferredSize, minSize, maxSize));

  let bestPuzzle: CrosswordPuzzle | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const size of sizeOrder) {
    for (let attempt = 0; attempt < attemptsPerSize; attempt += 1) {
      const puzzle = tryBuildForSize(candidates, targetEntryCount, size, random);
      if (!puzzle) continue;

      const score = scorePuzzle(puzzle);
      if (score > bestScore) {
        bestPuzzle = puzzle;
        bestScore = score;
      }

      if (puzzle.entries.length >= targetEntryCount) {
        return puzzle;
      }
    }
  }

  return bestPuzzle;
}

function tryBuildForSize(
  words: CrosswordEntrySource[],
  targetEntryCount: number,
  size: number,
  random: RandomFn
): CrosswordPuzzle | null {
  const limitedWords = selectWordPool(words, size, targetEntryCount, random);
  let best: WorkingEntry[] = [];

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
    const success = backtrackPlace(grid, placed, remaining, targetEntryCount, size, random);
    if (scoreWorkingEntries(success) > scoreWorkingEntries(best)) {
      best = success;
    }
    if (success.length >= targetEntryCount) {
      return finalizePuzzle(success, size);
    }
  }

  return best.length >= Math.min(targetEntryCount, 3) ? finalizePuzzle(best, size) : null;
}

function backtrackPlace(
  grid: (string | null)[][],
  placed: WorkingEntry[],
  remaining: CrosswordEntrySource[],
  targetEntryCount: number,
  size: number,
  random: RandomFn
): WorkingEntry[] {
  let best = [...placed];

  if (placed.length >= targetEntryCount) {
    return placed;
  }

  const orderedWords = remaining
    .map((word) => {
      const placements = getPlacements(grid, word, size, random);
      if (placements.length === 0) return null;

      return {
        word,
        placements,
        score:
          placements[0].intersections * 14 +
          word.normalizedAnswer.length * 2 +
          countUniqueLetters(word.normalizedAnswer) +
          random(),
      };
    })
    .filter((item): item is { word: CrosswordEntrySource; placements: PlacementCandidate[]; score: number } => item !== null)
    .filter((item) => item.placements.length > 0)
    .sort((a, b) => b.score - a.score);

  for (const { word, placements } of orderedWords.slice(0, 16)) {
    for (const placement of placements.slice(0, 8)) {
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
        size,
        random
      );

      if (scoreWorkingEntries(result) > scoreWorkingEntries(best)) {
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
  size: number,
  random: RandomFn
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
            score: 0,
          });
        }

        const downStartRow = row - index;
        if (canPlaceWord(grid, word.normalizedAnswer, downStartRow, col, "down")) {
          placements.push({
            row: downStartRow,
            col,
            direction: "down",
            intersections: countIntersections(grid, word.normalizedAnswer, downStartRow, col, "down"),
            score: 0,
          });
        }
      }
    }
  }

  return dedupePlacements(placements)
    .filter((placement) => placement.intersections > 0)
    .map((placement) => ({
      ...placement,
      score: scorePlacement(placement, word.normalizedAnswer.length, size, random),
    }))
    .sort((a, b) => b.score - a.score);
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

function selectWordPool(
  words: CrosswordEntrySource[],
  size: number,
  targetEntryCount: number,
  random: RandomFn
): CrosswordEntrySource[] {
  const wordsThatFit = words.filter((word) => word.normalizedAnswer.length <= size);
  const poolSize = Math.min(wordsThatFit.length, Math.max(24, targetEntryCount * 6));
  const buckets = {
    short: wordsThatFit.filter((word) => word.normalizedAnswer.length <= 5),
    medium: wordsThatFit.filter((word) => word.normalizedAnswer.length >= 6 && word.normalizedAnswer.length <= 8),
    long: wordsThatFit.filter((word) => word.normalizedAnswer.length >= 9),
  };
  const quotaEntries: Array<{ key: keyof typeof buckets; ratio: number }> = [
    { key: "short", ratio: 0.35 },
    { key: "medium", ratio: 0.45 },
    { key: "long", ratio: 0.2 },
  ];

  const selected = new Map<string, CrosswordEntrySource>();

  quotaEntries.forEach(({ key, ratio }) => {
    const targetForBucket = Math.ceil(poolSize * ratio);
    scoreWordsForPool(buckets[key], random)
      .slice(0, targetForBucket)
      .forEach((word) => selected.set(word.id, word));
  });

  if (selected.size < poolSize) {
    scoreWordsForPool(wordsThatFit, random)
      .forEach((word) => {
        if (selected.size < poolSize) {
          selected.set(word.id, word);
        }
      });
  }

  return Array.from(selected.values())
    .map((word) => ({
      word,
      score: seedScore(word, random),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ word }) => word);
}

function seedScore(word: CrosswordEntrySource, random: RandomFn): number {
  return (
    getLengthBalanceScore(word.normalizedAnswer.length) * 2 +
    countUniqueLetters(word.normalizedAnswer) * 1.5 +
    random() * 5
  );
}

function scorePlacement(
  placement: PlacementCandidate,
  wordLength: number,
  size: number,
  random: RandomFn
): number {
  const center = (size - 1) / 2;
  const midRow =
    placement.direction === "down" ? placement.row + (wordLength - 1) / 2 : placement.row;
  const midCol =
    placement.direction === "across" ? placement.col + (wordLength - 1) / 2 : placement.col;
  const distanceFromCenter = Math.abs(midRow - center) + Math.abs(midCol - center);

  return (
    placement.intersections * 14 +
    getLengthBalanceScore(wordLength) -
    distanceFromCenter * 0.35 +
    random() * 2
  );
}

function scoreWorkingEntries(entries: WorkingEntry[]): number {
  if (entries.length === 0) return Number.NEGATIVE_INFINITY;

  const totalLetters = entries.reduce(
    (sum, entry) => sum + entry.source.normalizedAnswer.length,
    0
  );
  const uniqueLengths = new Set(entries.map((entry) => entry.source.normalizedAnswer.length)).size;

  return entries.length * 100 + totalLetters * 2 + uniqueLengths * 6;
}

function scorePuzzle(puzzle: CrosswordPuzzle): number {
  const totalLetters = puzzle.entries.reduce((sum, entry) => sum + entry.length, 0);
  const intersections = totalLetters - puzzle.cells.length;
  const uniqueLengths = new Set(puzzle.entries.map((entry) => entry.length)).size;
  const area = puzzle.width * puzzle.height;
  const density = puzzle.cells.length / Math.max(area, 1);

  return (
    puzzle.entries.length * 1000 +
    intersections * 40 +
    uniqueLengths * 20 +
    density * 100 -
    area
  );
}

function buildSizeSearchOrder(minSize: number, maxSize: number, preferredSize: number): number[] {
  const sizes: number[] = [];

  for (let offset = 0; sizes.length < maxSize - minSize + 1; offset += 1) {
    const smaller = preferredSize - offset;
    if (smaller >= minSize && !sizes.includes(smaller)) {
      sizes.push(smaller);
    }

    const larger = preferredSize + offset;
    if (larger <= maxSize && !sizes.includes(larger)) {
      sizes.push(larger);
    }
  }

  return sizes;
}

function countUniqueLetters(answer: string): number {
  return new Set(answer).size;
}

function countCrosswordSourceWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter((token) => /[A-Za-zÀ-ÿ]/.test(token))
    .length;
}

function scoreWordsForPool(words: CrosswordEntrySource[], random: RandomFn): CrosswordEntrySource[] {
  return words
    .map((word) => ({
      word,
      score:
        getLengthBalanceScore(word.normalizedAnswer.length) * 2 +
        countUniqueLetters(word.normalizedAnswer) +
        random() * 4,
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ word }) => word);
}

function getLengthBalanceScore(length: number): number {
  if (length <= 5) return 9;
  if (length <= 8) return 12;
  if (length <= 11) return 7;
  return 3;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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

function toCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

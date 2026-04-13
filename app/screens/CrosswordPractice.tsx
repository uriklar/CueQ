import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, spacing } from "../theme";
import { CrosswordCell, CrosswordPlacedEntry, CrosswordPuzzle } from "../types/crossword";
import {
  buildCrosswordPuzzle,
  getCrosswordEligibleWords,
  normalizeCrosswordAnswer,
} from "../utils/crosswordUtils";
import { getStoredWords, loadAndMergeWords } from "../utils/wordUtils";
import { Difficulty } from "../types";

const EMPTY_STATE: Record<string, string> = {};

export function CrosswordPractice() {
  const { wordCount, difficulties } = useLocalSearchParams<{ wordCount?: string; difficulties?: string }>();
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [entryDirection, setEntryDirection] = useState<"across" | "down">("across");
  const [answersByCell, setAnswersByCell] = useState<Record<string, string>>(EMPTY_STATE);
  const [checkedCells, setCheckedCells] = useState<Set<string>>(new Set());
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const hiddenInputRef = useRef<TextInput | null>(null);
  const { width } = useWindowDimensions();

  const targetWordCount = Number(wordCount) || 8;
  const selectedDifficulties = useMemo(
    () => (difficulties ? difficulties.split(",").filter(Boolean) : []) as (Difficulty | "new")[],
    [difficulties]
  );

  const sortedEntries = useMemo(
    () => (puzzle?.entries ?? []).sort((a, b) => a.number - b.number || a.direction.localeCompare(b.direction)),
    [puzzle]
  );

  const activeEntry = useMemo(() => {
    if (!puzzle || !activeEntryId) return sortedEntries[0] ?? null;
    return puzzle.entries.find((entry) => entry.id === activeEntryId) ?? sortedEntries[0] ?? null;
  }, [activeEntryId, puzzle, sortedEntries]);

  useEffect(() => {
    if (activeEntry && activeEntry.id !== activeEntryId) {
      setActiveEntryId(activeEntry.id);
    }
  }, [activeEntry, activeEntryId]);

  const gridSize = useMemo(() => {
    if (!puzzle) return 0;
    return Math.min(42, Math.max(28, Math.floor((width - 32) / puzzle.width)));
  }, [puzzle, width]);

  const loadPuzzle = useCallback(async () => {
    setIsLoading(true);
    await loadAndMergeWords();
    const words = await getStoredWords();
    const eligible = getCrosswordEligibleWords(words, selectedDifficulties);
    const nextPuzzle = buildCrosswordPuzzle(eligible, {
      targetEntryCount: targetWordCount,
      minSize: 7,
      maxSize: 11,
    });

    setPuzzle(nextPuzzle);
    setAnswersByCell({});
    setCheckedCells(new Set());
    setRevealedCells(new Set());
    setActiveEntryId(nextPuzzle?.entries[0]?.id ?? null);
    setEntryDirection(nextPuzzle?.entries[0]?.direction ?? "across");
    setIsLoading(false);
  }, [selectedDifficulties, targetWordCount]);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  const activeEntryCells = useMemo(() => {
    if (!activeEntry) return [] as CrosswordCell[];
    return getCellsForEntry(puzzle, activeEntry);
  }, [activeEntry, puzzle]);

  const activeEntryValue = useMemo(
    () => activeEntryCells.map((cell) => answersByCell[getCellKey(cell.row, cell.col)] ?? "").join(""),
    [activeEntryCells, answersByCell]
  );

  const completion = useMemo(() => {
    if (!puzzle) return { solved: 0, total: 0 };
    const solved = puzzle.entries.filter((entry) => isEntrySolved(entry, answersByCell)).length;
    return { solved, total: puzzle.entries.length };
  }, [answersByCell, puzzle]);

  const handleCellPress = (cell: CrosswordCell) => {
    if (!puzzle) return;

    let nextDirection = entryDirection;
    if (cell.acrossId && cell.downId) {
      nextDirection = activeEntry && activeEntry.id === cell.acrossId && entryDirection === "across" ? "down" : "across";
    } else if (cell.downId) {
      nextDirection = "down";
    } else {
      nextDirection = "across";
    }

    const nextEntryId = nextDirection === "across" ? cell.acrossId ?? cell.downId : cell.downId ?? cell.acrossId;
    if (!nextEntryId) return;

    setEntryDirection(nextDirection);
    setActiveEntryId(nextEntryId);
    requestAnimationFrame(() => hiddenInputRef.current?.focus());
  };

  const handleEntryPress = (entry: CrosswordPlacedEntry) => {
    setEntryDirection(entry.direction);
    setActiveEntryId(entry.id);
    requestAnimationFrame(() => hiddenInputRef.current?.focus());
  };

  const handleEntryChange = (value: string) => {
    if (!activeEntry) return;
    const normalized = normalizeCrosswordAnswer(value).slice(0, activeEntry.length);
    const nextAnswers = { ...answersByCell };

    activeEntryCells.forEach((cell, index) => {
      const key = getCellKey(cell.row, cell.col);
      nextAnswers[key] = normalized[index] ?? "";
    });

    setAnswersByCell(nextAnswers);
  };

  const handleCheckEntry = () => {
    if (!activeEntry) return;
    const nextChecked = new Set(checkedCells);
    activeEntryCells.forEach((cell) => nextChecked.add(getCellKey(cell.row, cell.col)));
    setCheckedCells(nextChecked);
  };

  const handleRevealEntry = () => {
    if (!activeEntry) return;
    const nextAnswers = { ...answersByCell };
    const nextRevealed = new Set(revealedCells);
    activeEntryCells.forEach((cell, index) => {
      const key = getCellKey(cell.row, cell.col);
      nextAnswers[key] = activeEntry.answer[index];
      nextRevealed.add(key);
    });
    setAnswersByCell(nextAnswers);
    setRevealedCells(nextRevealed);
  };

  const handleCheckPuzzle = () => {
    if (!puzzle) return;
    setCheckedCells(new Set(puzzle.cells.map((cell) => getCellKey(cell.row, cell.col))));
  };

  const handleRevealPuzzle = () => {
    if (!puzzle) return;
    Alert.alert("Reveal puzzle?", "This will fill in every answer.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reveal",
        style: "destructive",
        onPress: () => {
          const nextAnswers = { ...answersByCell };
          const nextRevealed = new Set(revealedCells);
          puzzle.cells.forEach((cell) => {
            const key = getCellKey(cell.row, cell.col);
            nextAnswers[key] = cell.solution;
            nextRevealed.add(key);
          });
          setAnswersByCell(nextAnswers);
          setRevealedCells(nextRevealed);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Building crossword...</Text>
      </View>
    );
  }

  if (!puzzle) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Couldn&apos;t build a crossword</Text>
        <Text style={styles.emptyText}>Try a different filter or add more single-word vocabulary.</Text>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Crossword</Text>
          <Text style={styles.subtitle}>{completion.solved}/{completion.total} clues solved</Text>
        </View>
        <Pressable onPress={loadPuzzle}>
          <Text style={styles.backText}>↻ New</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.boardCard}>
          {Array.from({ length: puzzle.height }, (_, row) => (
            <View key={row} style={styles.gridRow}>
              {Array.from({ length: puzzle.width }, (_, col) => {
                const cell = puzzle.cells.find((item) => item.row === row && item.col === col);
                if (!cell) {
                  return <View key={`${row}:${col}`} style={[styles.blockCell, { width: gridSize, height: gridSize }]} />;
                }

                const key = getCellKey(row, col);
                const value = answersByCell[key] ?? "";
                const isActive = activeEntry ? cellBelongsToEntry(cell, activeEntry) : false;
                const isCheckedWrong = checkedCells.has(key) && value && value !== cell.solution;
                const isRevealed = revealedCells.has(key);

                return (
                  <Pressable
                    key={key}
                    onPress={() => handleCellPress(cell)}
                    style={[
                      styles.cell,
                      { width: gridSize, height: gridSize },
                      isActive && styles.cellActive,
                      isCheckedWrong && styles.cellWrong,
                      isRevealed && styles.cellRevealed,
                    ]}
                  >
                    {cell.number ? <Text style={styles.cellNumber}>{cell.number}</Text> : null}
                    <Text style={styles.cellValue}>{value}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {activeEntry ? (
          <View style={styles.editorCard}>
            <Text style={styles.editorTitle}>
              {activeEntry.number} {activeEntry.direction === "across" ? "Across" : "Down"}
            </Text>
            <Text style={styles.editorClue}>{activeEntry.clue}</Text>
            <TextInput
              ref={hiddenInputRef}
              value={activeEntryValue}
              onChangeText={handleEntryChange}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="Type answer"
              placeholderTextColor={colors.neutral300}
              style={styles.answerInput}
            />
            <View style={styles.editorActions}>
              <Pressable onPress={handleCheckEntry} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Check clue</Text>
              </Pressable>
              <Pressable onPress={handleRevealEntry} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Reveal clue</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.globalActions}>
          <Pressable onPress={handleCheckPuzzle} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Check puzzle</Text>
          </Pressable>
          <Pressable onPress={handleRevealPuzzle} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>Reveal puzzle</Text>
          </Pressable>
        </View>

        <View style={styles.cluesSection}>
          <Text style={styles.sectionLabel}>Across</Text>
          {sortedEntries.filter((entry) => entry.direction === "across").map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => handleEntryPress(entry)}
              style={[styles.clueRow, activeEntry?.id === entry.id && styles.clueRowActive]}
            >
              <Text style={styles.clueNumber}>{entry.number}.</Text>
              <View style={styles.clueTextWrap}>
                <Text style={styles.clueText}>{entry.clue}</Text>
                <Text style={styles.clueMeta}>{entry.length} letters</Text>
              </View>
            </Pressable>
          ))}

          <Text style={styles.sectionLabel}>Down</Text>
          {sortedEntries.filter((entry) => entry.direction === "down").map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => handleEntryPress(entry)}
              style={[styles.clueRow, activeEntry?.id === entry.id && styles.clueRowActive]}
            >
              <Text style={styles.clueNumber}>{entry.number}.</Text>
              <View style={styles.clueTextWrap}>
                <Text style={styles.clueText}>{entry.clue}</Text>
                <Text style={styles.clueMeta}>{entry.length} letters</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function cellBelongsToEntry(cell: CrosswordCell, entry: CrosswordPlacedEntry) {
  if (entry.direction === "across") {
    return cell.row === entry.row && cell.col >= entry.col && cell.col < entry.col + entry.length;
  }
  return cell.col === entry.col && cell.row >= entry.row && cell.row < entry.row + entry.length;
}

function getCellsForEntry(puzzle: CrosswordPuzzle | null, entry: CrosswordPlacedEntry) {
  if (!puzzle) return [];
  return puzzle.cells
    .filter((cell) => cellBelongsToEntry(cell, entry))
    .sort((a, b) => (entry.direction === "across" ? a.col - b.col : a.row - b.row));
}

function isEntrySolved(entry: CrosswordPlacedEntry, answersByCell: Record<string, string>) {
  for (let index = 0; index < entry.length; index += 1) {
    const row = entry.direction === "across" ? entry.row : entry.row + index;
    const col = entry.direction === "across" ? entry.col + index : entry.col;
    const key = getCellKey(row, col);
    if ((answersByCell[key] ?? "") !== entry.answer[index]) {
      return false;
    }
  }
  return true;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  centered: { flex: 1, backgroundColor: colors.neutral50, justifyContent: "center", alignItems: "center", padding: spacing.xxl },
  loadingText: { fontSize: 18, color: colors.neutral700 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: colors.neutral900, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, lineHeight: 20, color: colors.neutral500, textAlign: "center", marginBottom: spacing.xl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: 48, paddingBottom: spacing.lg, borderBottomWidth: 1, borderColor: colors.neutral200 },
  headerCenter: { alignItems: "center" },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "700", color: colors.neutral900 },
  subtitle: { fontSize: 13, color: colors.neutral500, marginTop: 2 },
  content: { padding: spacing.lg, gap: spacing.lg },
  boardCard: { backgroundColor: colors.neutral700, padding: spacing.sm, borderRadius: 16, alignSelf: "center" },
  gridRow: { flexDirection: "row" },
  blockCell: { backgroundColor: colors.neutral700, borderWidth: 1, borderColor: colors.neutral700 },
  cell: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.neutral200, justifyContent: "center", alignItems: "center", position: "relative" },
  cellActive: { backgroundColor: colors.primarySurface },
  cellWrong: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
  cellRevealed: { backgroundColor: colors.accentLight },
  cellNumber: { position: "absolute", left: 2, top: 1, fontSize: 9, color: colors.neutral500 },
  cellValue: { fontSize: 18, fontWeight: "700", color: colors.neutral900 },
  editorCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.neutral200 },
  editorTitle: { fontSize: 14, fontWeight: "700", color: colors.neutral500, textTransform: "uppercase", letterSpacing: 0.5 },
  editorClue: { fontSize: 20, fontWeight: "700", color: colors.neutral900, marginTop: spacing.sm },
  answerInput: { marginTop: spacing.md, borderWidth: 1.5, borderColor: colors.neutral200, borderRadius: 12, padding: spacing.lg, fontSize: 24, letterSpacing: 6, color: colors.neutral900, backgroundColor: colors.neutral50 },
  editorActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  globalActions: { flexDirection: "row", gap: spacing.sm },
  primaryButton: { flex: 1, backgroundColor: colors.primary, padding: spacing.lg, borderRadius: 12, alignItems: "center" },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: "700" },
  secondaryButton: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, padding: spacing.md, borderRadius: 12, alignItems: "center" },
  secondaryButtonText: { color: colors.primary, fontWeight: "600" },
  ghostButton: { flex: 1, borderWidth: 1.5, borderColor: colors.neutral300, padding: spacing.lg, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface },
  ghostButtonText: { color: colors.neutral700, fontSize: 16, fontWeight: "600" },
  cluesSection: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.neutral200 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: colors.neutral500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.sm },
  clueRow: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.neutral100 },
  clueRowActive: { backgroundColor: colors.primarySurface, marginHorizontal: -spacing.sm, paddingHorizontal: spacing.sm, borderRadius: 10 },
  clueNumber: { width: 28, fontSize: 16, fontWeight: "700", color: colors.primary },
  clueTextWrap: { flex: 1 },
  clueText: { fontSize: 15, color: colors.neutral900 },
  clueMeta: { marginTop: 2, fontSize: 12, color: colors.neutral500 },
});

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { colors, spacing } from "../theme";
import { getStoredWords, loadAndMergeWords } from "../utils/wordUtils";
import { getCrosswordEligibleWords } from "../utils/crosswordUtils";
import { Difficulty } from "../types";

const SESSION_SIZES = [6, 8, 10];
const DIFFICULTY_OPTIONS: { label: string; value: Difficulty | "new" }[] = [
  { label: "New", value: "new" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

export function CrosswordSetup() {
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<Difficulty | "new">>(new Set());
  const [sessionSize, setSessionSize] = useState(8);
  const [eligibleCount, setEligibleCount] = useState(0);

  useEffect(() => {
    async function loadWords() {
      await loadAndMergeWords();
      const words = await getStoredWords();
      const eligible = getCrosswordEligibleWords(words, Array.from(selectedDifficulties));
      setEligibleCount(eligible.length);
    }

    loadWords();
  }, [selectedDifficulties]);

  const canStart = useMemo(() => eligibleCount >= 3, [eligibleCount]);

  const toggleDifficulty = (difficulty: Difficulty | "new") => {
    setSelectedDifficulties((current) => {
      const next = new Set(current);
      if (next.has(difficulty)) next.delete(difficulty);
      else next.add(difficulty);
      return next;
    });
  };

  const handleStart = () => {
    if (!canStart) return;
    router.push({
      pathname: "/crossword-practice",
      params: {
        wordCount: String(sessionSize),
        difficulties: Array.from(selectedDifficulties).join(","),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Crossword</Text>
        <Text style={styles.subtitle}>Build a real French crossword from your vocab list.</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Filter by difficulty</Text>
        <View style={styles.pillRow}>
          {DIFFICULTY_OPTIONS.map((option) => {
            const selected = selectedDifficulties.has(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleDifficulty(option.value)}
                style={[styles.pill, selected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionHint}>Leave all unselected to use every eligible word.</Text>

        <Text style={styles.sectionLabel}>Puzzle size</Text>
        <View style={styles.chipRow}>
          {SESSION_SIZES.map((size) => {
            const selected = sessionSize === size;
            return (
              <Pressable
                key={size}
                onPress={() => setSessionSize(size)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{size} words</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Eligible words</Text>
          <Text style={styles.infoCount}>{eligibleCount}</Text>
          <Text style={styles.infoText}>
            We use single-word entries with clean letter-only answers and English clues.
          </Text>
        </View>
      </ScrollView>

      <Pressable
        onPress={handleStart}
        disabled={!canStart}
        style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
      >
        <Text style={styles.startBtnText}>{canStart ? "START CROSSWORD" : "Need at least 3 eligible words"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  header: { padding: spacing.lg, paddingTop: 48, borderBottomWidth: 1, borderColor: colors.neutral200 },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.primary, fontSize: 16 },
  title: { fontSize: 22, fontWeight: "700", color: colors.neutral900 },
  subtitle: { fontSize: 14, lineHeight: 20, color: colors.neutral500, marginTop: spacing.xs },
  scroll: { flex: 1, padding: spacing.lg },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: colors.neutral500, marginTop: spacing.xl, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  sectionHint: { fontSize: 13, color: colors.neutral500, marginTop: spacing.sm },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1.5, borderColor: colors.neutral200, backgroundColor: colors.surface },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 14, color: colors.neutral700 },
  pillTextSelected: { color: colors.surface, fontWeight: "600" },
  chipRow: { flexDirection: "row", gap: spacing.sm },
  chip: { flex: 1, paddingVertical: spacing.md, borderRadius: 8, borderWidth: 1.5, borderColor: colors.neutral200, backgroundColor: colors.surface, alignItems: "center" },
  chipSelected: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.neutral700 },
  chipTextSelected: { color: colors.primary, fontWeight: "600" },
  infoCard: { marginTop: spacing.xxl, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.neutral200, padding: spacing.xl },
  infoTitle: { fontSize: 14, fontWeight: "600", color: colors.neutral500, textTransform: "uppercase" },
  infoCount: { fontSize: 40, fontWeight: "700", color: colors.primary, marginVertical: spacing.sm },
  infoText: { fontSize: 14, lineHeight: 20, color: colors.neutral700 },
  startBtn: { margin: spacing.lg, padding: spacing.lg, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  startBtnDisabled: { backgroundColor: colors.neutral300 },
  startBtnText: { color: colors.surface, fontSize: 16, fontWeight: "700", textAlign: "center" },
});

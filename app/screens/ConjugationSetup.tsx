import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { colors, spacing } from "../theme";
import { TENSE_LABELS, TenseKey } from "../data/verbsData";

const TENSES: TenseKey[] = ["présent", "imparfait", "futur", "passé_composé", "conditionnel", "subjonctif"];
const SESSION_SIZES = [5, 10, 15];

export function ConjugationSetup() {
  const [selectedTenses, setSelectedTenses] = useState<Set<TenseKey>>(new Set());
  const [sessionSize, setSessionSize] = useState(5);

  const canStart = selectedTenses.size > 0;

  const toggleTense = (t: TenseKey) => {
    setSelectedTenses(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const handleStart = () => {
    if (selectedTenses.size === 0) return;
    router.push({
      pathname: "/conjugation-practice",
      params: { tenses: Array.from(selectedTenses).join(","), sessionSize: String(sessionSize) },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Conjugation Practice</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tense picker */}
        <Text style={styles.sectionLabel}>Choose tenses</Text>
        <View style={styles.pillRow}>
          {TENSES.map(t => (
            <Pressable
              key={t}
              onPress={() => toggleTense(t)}
              style={[styles.pill, selectedTenses.has(t) && styles.pillSelected]}
            >
              <Text style={[styles.pillText, selectedTenses.has(t) && styles.pillTextSelected]}>
                {TENSE_LABELS[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Session size */}
        <Text style={styles.sectionLabel}>Session size</Text>
        <View style={styles.chipRow}>
          {SESSION_SIZES.map(n => (
            <Pressable
              key={n}
              onPress={() => setSessionSize(n)}
              style={[styles.chip, sessionSize === n && styles.chipSelected]}
            >
              <Text style={[styles.chipText, sessionSize === n && styles.chipTextSelected]}>
                {n} verbs
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Start button */}
      <Pressable
        onPress={handleStart}
        disabled={!canStart}
        style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
      >
        <Text style={styles.startBtnText}>START</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/mistakes-report" as any)}
        style={styles.weaknessBtn}
      >
        <Text style={styles.weaknessBtnText}>View My Weaknesses</Text>
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
  scroll: { flex: 1, padding: spacing.lg },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: colors.neutral500, marginTop: spacing.xl, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1.5, borderColor: colors.neutral200, backgroundColor: colors.surface },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 14, color: colors.neutral700 },
  pillTextSelected: { color: colors.surface, fontWeight: "600" },
  chipRow: { flexDirection: "row", gap: spacing.sm },
  chip: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, borderWidth: 1.5, borderColor: colors.neutral200, backgroundColor: colors.surface, alignItems: "center" },
  chipSelected: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.neutral700 },
  chipTextSelected: { color: colors.primary, fontWeight: "600" },
  startBtn: { margin: spacing.lg, padding: spacing.lg, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  startBtnDisabled: { backgroundColor: colors.neutral300 },
  startBtnText: { color: colors.surface, fontSize: 17, fontWeight: "700", letterSpacing: 0.5 },
  weaknessBtn: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, padding: spacing.lg, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center" },
  weaknessBtnText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
});

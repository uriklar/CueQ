import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, spacing } from "../theme";
import {
  VERBS_DATA, TENSE_LABELS, TENSE_DESCRIPTIONS, PRONOUN_LABELS, PRONOUN_KEYS, TenseKey, PronounKey
} from "../data/verbsData";
import {
  checkAnswer, getVerbsForSession, emptyAnswers, emptyResults
} from "../utils/conjugationUtils";
import { translateSentence } from "../services/gemini";

export function ConjugationPractice() {
  const { tense, sessionSize } = useLocalSearchParams<{ tense: string; sessionSize: string }>();
  const tenseKey = tense as TenseKey;
  const size = Number(sessionSize) || 5;

  const [sessionVerbs, setSessionVerbs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<PronounKey, string>>(emptyAnswers());
  const [results, setResults] = useState<Record<PronounKey, boolean | null>>(emptyResults());
  const [isChecked, setIsChecked] = useState(false);
  const [sessionScore, setSessionScore] = useState<{ verb: string; correct: number }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showTenseInfo, setShowTenseInfo] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const verbs = getVerbsForSession(tenseKey, size);
    setSessionVerbs(verbs);
  }, []);

  const currentVerb = sessionVerbs[currentIndex] ?? "";
  const correctTable = VERBS_DATA[currentVerb]?.[tenseKey];

  const checkAllAnswers = () => {
    if (!correctTable) return;
    const newResults = {} as Record<PronounKey, boolean>;
    PRONOUN_KEYS.forEach(p => {
      newResults[p] = checkAnswer(answers[p], correctTable[p]);
    });
    setResults(newResults);
    setIsChecked(true);
  };

  const advance = () => {
    const correctCount = Object.values(results).filter(Boolean).length;
    const newScore = [...sessionScore, { verb: currentVerb, correct: correctCount }];
    setSessionScore(newScore);

    if (currentIndex + 1 >= sessionVerbs.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setAnswers(emptyAnswers());
      setResults(emptyResults());
      setIsChecked(false);
      setTranslation(null);
    }
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const result = await translateSentence(currentVerb);
      setTranslation(result);
    } catch {
      setTranslation("(translation failed)");
    }
    setIsTranslating(false);
  };

  const reset = () => {
    const verbs = getVerbsForSession(tenseKey, size);
    setSessionVerbs(verbs);
    setCurrentIndex(0);
    setAnswers(emptyAnswers());
    setResults(emptyResults());
    setIsChecked(false);
    setSessionScore([]);
    setIsComplete(false);
    setTranslation(null);
  };

  // Score screen
  if (isComplete) {
    const totalCorrect = sessionScore.reduce((sum, s) => sum + s.correct, 0);
    const total = sessionScore.length * 6;
    const pct = Math.round((totalCorrect / total) * 100);
    return (
      <View style={styles.container}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Session Complete!</Text>
          <Text style={styles.scoreBig}>{pct}%</Text>
          <Text style={styles.scoreSubtitle}>{totalCorrect} / {total} forms correct</Text>
          {sessionScore.map((s, i) => (
            <View key={i} style={styles.scoreRow}>
              <Text style={styles.scoreVerb}>{s.verb}</Text>
              <Text style={styles.scoreCount}>{s.correct}/6</Text>
            </View>
          ))}
        </View>
        <View style={styles.scoreButtons}>
          <Pressable onPress={reset} style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Try Again</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>New Session</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!currentVerb) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.progress}>{currentIndex + 1} / {sessionVerbs.length}</Text>
        <Text style={styles.headerTitle}>Conjugation</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Verb */}
        <Text style={styles.verbTitle}>{currentVerb}</Text>

        {/* Tense badge */}
        <Pressable style={styles.tenseBadge} onPress={() => setShowTenseInfo(true)}>
          <Text style={styles.tenseBadgeText}>{TENSE_LABELS[tenseKey]}</Text>
          <Text style={styles.infoIcon}>  i</Text>
        </Pressable>

        {/* Translate button */}
        <View style={styles.translateWrap}>
          <Pressable style={styles.translateBtn} onPress={handleTranslate} disabled={isTranslating}>
            <Text style={styles.translateBtnText}>{isTranslating ? "Translating..." : "Translate"}</Text>
          </Pressable>
          {translation && <Text style={styles.translationText}>{translation}</Text>}
        </View>

        {/* Input rows */}
        {PRONOUN_KEYS.map((p, index) => {
          const result = results[p];
          const correct = correctTable?.[p] ?? "";
          return (
            <View key={p} style={styles.inputRow}>
              <Text style={styles.pronounLabel}>{PRONOUN_LABELS[p]}</Text>
              <View style={styles.inputWithCopy}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[
                      styles.input,
                      result === true && styles.inputCorrect,
                      result === false && styles.inputWrong,
                    ]}
                    value={answers[p]}
                    onChangeText={val => setAnswers(prev => ({ ...prev, [p]: val }))}
                    editable={!isChecked}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="..."
                    placeholderTextColor={colors.neutral300}
                  />
                  {result === false && (
                    <Text style={styles.correctAnswer}>{correct}</Text>
                  )}
                </View>
                {index > 0 && !isChecked && (
                  <Pressable
                    style={styles.copyDownBtn}
                    onPress={() => setAnswers(prev => ({ ...prev, [p]: prev[PRONOUN_KEYS[index - 1]] }))}
                  >
                    <Text style={styles.copyDownBtnText}>↓</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Check / Next button */}
      <Pressable
        style={styles.mainBtn}
        onPress={isChecked ? advance : checkAllAnswers}
      >
        <Text style={styles.mainBtnText}>{isChecked ? "NEXT →" : "CHECK ANSWERS"}</Text>
      </Pressable>

      {/* Tense info modal */}
      <Modal visible={showTenseInfo} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowTenseInfo(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{TENSE_LABELS[tenseKey]}</Text>
            <Text style={styles.modalBody}>{TENSE_DESCRIPTIONS[tenseKey]}</Text>
            <Pressable onPress={() => setShowTenseInfo(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.lg, paddingTop: 48, borderBottomWidth: 1, borderColor: colors.neutral200 },
  progress: { fontSize: 14, color: colors.neutral500, width: 50 },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.neutral900 },
  closeBtn: { fontSize: 18, color: colors.neutral500, width: 50, textAlign: "right" },
  scroll: { flex: 1, padding: spacing.lg },
  verbTitle: { fontSize: 32, fontWeight: "700", color: colors.primary, textAlign: "center", marginVertical: spacing.lg },
  tenseBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: spacing.xl },
  tenseBadgeText: { fontSize: 14, fontWeight: "600", color: colors.neutral700, backgroundColor: colors.neutral100, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 12 },
  infoIcon: { fontSize: 14 },
  translateWrap: { alignItems: "center", marginBottom: spacing.lg },
  translateBtn: { backgroundColor: colors.neutral100, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 12 },
  translateBtnText: { fontSize: 14, fontWeight: "600", color: colors.neutral700 },
  translationText: { fontSize: 14, color: colors.neutral500, marginTop: spacing.xs },
  inputRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.md },
  pronounLabel: { width: 90, paddingTop: 10, fontSize: 14, color: colors.neutral500, fontStyle: "italic" },
  inputWithCopy: { flex: 1, flexDirection: "row", alignItems: "flex-start" },
  inputWrap: { flex: 1 },
  copyDownBtn: { width: 32, height: 40, alignItems: "center", justifyContent: "center", marginLeft: 4 },
  copyDownBtnText: { fontSize: 18, color: colors.primaryLight },
  input: { borderWidth: 1.5, borderColor: colors.neutral200, borderRadius: 8, padding: spacing.md, fontSize: 16, color: colors.neutral900, backgroundColor: colors.surface },
  inputCorrect: { borderColor: colors.success, backgroundColor: colors.successLight },
  inputWrong: { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  correctAnswer: { fontSize: 13, color: colors.danger, marginTop: 2, paddingLeft: 2 },
  mainBtn: { margin: spacing.lg, padding: spacing.lg, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  mainBtnText: { color: colors.surface, fontSize: 17, fontWeight: "700" },
  scoreCard: { flex: 1, padding: spacing.xxl, alignItems: "center" },
  scoreTitle: { fontSize: 24, fontWeight: "700", color: colors.neutral900, marginBottom: spacing.sm },
  scoreBig: { fontSize: 64, fontWeight: "700", color: colors.primary, marginBottom: spacing.sm },
  scoreSubtitle: { fontSize: 16, color: colors.neutral500, marginBottom: spacing.xxl },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.neutral100 },
  scoreVerb: { fontSize: 16, color: colors.neutral700 },
  scoreCount: { fontSize: 16, fontWeight: "600", color: colors.primary },
  scoreButtons: { flexDirection: "row", gap: spacing.md, padding: spacing.lg },
  btnSecondary: { flex: 1, padding: spacing.lg, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center" },
  btnSecondaryText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  btnPrimary: { flex: 1, padding: spacing.lg, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  btnPrimaryText: { color: colors.surface, fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xxl, margin: spacing.xxl, width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.neutral900, marginBottom: spacing.md },
  modalBody: { fontSize: 15, color: colors.neutral700, lineHeight: 22, marginBottom: spacing.lg },
  modalClose: { alignSelf: "flex-end" },
  modalCloseText: { color: colors.primary, fontWeight: "600", fontSize: 15 },
});

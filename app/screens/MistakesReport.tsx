import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { colors, spacing } from "../theme";
import { ConjugationMistake } from "../types";
import { loadMistakes, clearMistakes, getMistakeSummary, MistakeSummary } from "../utils/mistakesTracker";
import { loadOpenAIApiKey } from "../services/openai";
import { TENSE_LABELS, TenseKey, PRONOUN_LABELS, PronounKey } from "../data/verbsData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AI_ANALYSIS_KEY = "@conjugation_ai_analysis";

export function MistakesReport() {
  const [mistakes, setMistakes] = useState<ConjugationMistake[]>([]);
  const [summary, setSummary] = useState<MistakeSummary | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await loadMistakes();
    setMistakes(data);
    setSummary(getMistakeSummary(data));

    const cached = await AsyncStorage.getItem(AI_ANALYSIS_KEY);
    if (cached) setAiAnalysis(cached);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClear = () => {
    Alert.alert("Clear All Mistakes", "This will delete all tracked mistakes and the AI analysis. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear", style: "destructive", onPress: async () => {
          await clearMistakes();
          await AsyncStorage.removeItem(AI_ANALYSIS_KEY);
          setMistakes([]);
          setSummary({ total: 0, topVerbs: [], topTenses: [], topPronouns: [] });
          setAiAnalysis(null);
        },
      },
    ]);
  };

  const generateAnalysis = async () => {
    const apiKey = await loadOpenAIApiKey();
    if (!apiKey) {
      setAnalysisError("OpenAI API key not set. Add it in Settings.");
      return;
    }
    if (mistakes.length === 0) {
      setAnalysisError("No mistakes to analyze yet.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const mistakeLines = mistakes.slice(-100).map(
      m => `${m.verb} (${m.tense}, ${m.pronoun}): wrote "${m.userAnswer}", correct "${m.correctAnswer}"`
    ).join("\n");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a French language tutor analyzing a student's conjugation mistakes. Be concise, encouraging, and actionable. Use markdown formatting with headers and bullet points.",
            },
            {
              role: "user",
              content: `Analyze these French conjugation mistakes and provide:\n1. Key patterns you notice\n2. Specific weak areas\n3. Targeted practice suggestions\n\nMistakes:\n${mistakeLines}`,
            },
          ],
          max_tokens: 600,
          temperature: 0.5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const text = response.data.choices[0]?.message?.content?.trim() ?? "";
      setAiAnalysis(text);
      await AsyncStorage.setItem(AI_ANALYSIS_KEY, text);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setAnalysisError("Invalid API key. Check Settings.");
      } else {
        setAnalysisError("Failed to generate analysis. Try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTense = (t: string) => TENSE_LABELS[t as TenseKey] ?? t;
  const formatPronoun = (p: string) => PRONOUN_LABELS[p as PronounKey] ?? p;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>My Weaknesses</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats overview */}
        <View style={styles.statCard}>
          <Text style={styles.statBig}>{summary?.total ?? 0}</Text>
          <Text style={styles.statLabel}>Total Mistakes Tracked</Text>
        </View>

        {summary && summary.total > 0 ? (
          <>
            {/* Top verbs */}
            <Text style={styles.sectionLabel}>Most Missed Verbs</Text>
            {summary.topVerbs.map(v => (
              <View key={v.name} style={styles.rankRow}>
                <Text style={styles.rankName}>{v.name}</Text>
                <Text style={styles.rankCount}>{v.count}x</Text>
              </View>
            ))}

            {/* Top tenses */}
            <Text style={styles.sectionLabel}>Weakest Tenses</Text>
            {summary.topTenses.map(t => (
              <View key={t.name} style={styles.rankRow}>
                <Text style={styles.rankName}>{formatTense(t.name)}</Text>
                <Text style={styles.rankCount}>{t.count}x</Text>
              </View>
            ))}

            {/* Top pronouns */}
            <Text style={styles.sectionLabel}>Trickiest Pronouns</Text>
            {summary.topPronouns.map(p => (
              <View key={p.name} style={styles.rankRow}>
                <Text style={styles.rankName}>{formatPronoun(p.name)}</Text>
                <Text style={styles.rankCount}>{p.count}x</Text>
              </View>
            ))}

            {/* AI Analysis */}
            <Text style={styles.sectionLabel}>AI Analysis</Text>
            {aiAnalysis ? (
              <View style={styles.analysisCard}>
                <Text style={styles.analysisText}>{aiAnalysis}</Text>
              </View>
            ) : analysisError ? (
              <Text style={styles.errorText}>{analysisError}</Text>
            ) : null}

            <Pressable
              onPress={generateAnalysis}
              disabled={isAnalyzing}
              style={[styles.analysisBtn, isAnalyzing && styles.analysisBtnDisabled]}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <Text style={styles.analysisBtnText}>
                  {aiAnalysis ? "Refresh Analysis" : "Generate Analysis"}
                </Text>
              )}
            </Pressable>

            {/* Clear */}
            <Pressable onPress={handleClear} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear All Mistakes</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No mistakes tracked yet. Practice some conjugations and come back!
            </Text>
          </View>
        )}
      </ScrollView>
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
  statCard: { alignItems: "center", backgroundColor: colors.primarySurface, borderRadius: 12, padding: spacing.xl, marginBottom: spacing.lg },
  statBig: { fontSize: 48, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 14, color: colors.neutral500, marginTop: spacing.xs },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: colors.neutral500, marginTop: spacing.xl, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  rankRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.neutral100 },
  rankName: { fontSize: 16, color: colors.neutral700 },
  rankCount: { fontSize: 16, fontWeight: "600", color: colors.primary },
  analysisCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.neutral200 },
  analysisText: { fontSize: 14, color: colors.neutral700, lineHeight: 22 },
  analysisBtn: { marginTop: spacing.md, padding: spacing.lg, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  analysisBtnDisabled: { backgroundColor: colors.neutral300 },
  analysisBtnText: { color: colors.surface, fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 14, color: colors.danger, marginBottom: spacing.sm },
  clearBtn: { marginTop: spacing.xxl, marginBottom: spacing.xxxl, padding: spacing.lg, borderRadius: 12, borderWidth: 1.5, borderColor: colors.danger, alignItems: "center" },
  clearBtnText: { color: colors.danger, fontSize: 16, fontWeight: "600" },
  emptyState: { alignItems: "center", padding: spacing.xxl },
  emptyText: { fontSize: 16, color: colors.neutral500, textAlign: "center", lineHeight: 24 },
});

# CueQ — Conjugation Mistakes Tracker & AI Analysis

## Overview

Track every wrong answer during conjugation practice, store it persistently, and use OpenAI to generate a personalized weakness report.

---

## Data Model

### `ConjugationMistake`

```typescript
export interface ConjugationMistake {
  id: string;             // uuid or timestamp-based
  timestamp: number;      // Date.now()
  verb: string;           // e.g. "être"
  tense: TenseKey;        // e.g. "passé_composé"
  pronoun: PronounKey;    // e.g. "nous"
  userAnswer: string;     // what the user typed
  correctAnswer: string;  // what the correct answer was
}
```

Storage key: `@conjugation_mistakes`
Cap at 500 most recent mistakes (drop oldest when over limit).

---

## New Files

### 1. `app/utils/mistakesTracker.ts`

Handles all persistence for mistakes.

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConjugationMistake } from "../types";

const STORAGE_KEY = "@conjugation_mistakes";
const MAX_MISTAKES = 500;

export async function loadMistakes(): Promise<ConjugationMistake[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveMistake(mistake: Omit<ConjugationMistake, "id">): Promise<void> {
  const existing = await loadMistakes();
  const newMistake: ConjugationMistake = {
    ...mistake,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  const updated = [...existing, newMistake].slice(-MAX_MISTAKES);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function clearMistakes(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getMistakeSummary(): Promise<{
  total: number;
  byVerb: Record<string, number>;
  byTense: Record<string, number>;
  byPronoun: Record<string, number>;
  recentMistakes: ConjugationMistake[];
}> {
  const mistakes = await loadMistakes();
  const byVerb: Record<string, number> = {};
  const byTense: Record<string, number> = {};
  const byPronoun: Record<string, number> = {};

  for (const m of mistakes) {
    byVerb[m.verb] = (byVerb[m.verb] ?? 0) + 1;
    byTense[m.tense] = (byTense[m.tense] ?? 0) + 1;
    byPronoun[m.pronoun] = (byPronoun[m.pronoun] ?? 0) + 1;
  }

  return {
    total: mistakes.length,
    byVerb,
    byTense,
    byPronoun,
    recentMistakes: mistakes.slice(-100), // last 100 for AI context
  };
}
```

---

### 2. `app/screens/MistakesReport.tsx`

Full-page analysis screen. Two states: **summary stats** + **AI analysis**.

**UI layout:**

```
┌─────────────────────────────────────┐
│ ← Back        My Weaknesses 📊      │
├─────────────────────────────────────┤
│  Total mistakes tracked: 47         │
│                                     │
│  WEAKEST TENSES          MISTAKES   │
│  Subjonctif présent         18      │
│  Passé composé              12      │
│  Conditionnel               8       │
│                                     │
│  HARDEST VERBS           MISTAKES   │
│  être                       11      │
│  vouloir                    7       │
│  prendre                    5       │
│                                     │
│  HARDEST PRONOUNS        MISTAKES   │
│  nous                       15      │
│  ils                        12      │
│  je                         9       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🤖 AI Analysis             │    │
│  │                             │    │
│  │  [Report text from GPT]     │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Generate / Refresh Analysis]      │
│  [Clear All Mistakes]               │
└─────────────────────────────────────┘
```

**Component structure:**

```typescript
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { loadMistakes, clearMistakes, getMistakeSummary } from "../utils/mistakesTracker";
import { TENSE_LABELS } from "../data/verbsData";

const REPORT_CACHE_KEY = "@conjugation_ai_report";

export function MistakesReport() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getMistakeSummary>> | null>(null);
  const [aiReport, setAiReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    loadData();
    loadCachedReport();
    loadApiKey();
  }, []);

  const loadData = async () => {
    const s = await getMistakeSummary();
    setSummary(s);
  };

  const loadCachedReport = async () => {
    const cached = await AsyncStorage.getItem(REPORT_CACHE_KEY);
    if (cached) setAiReport(cached);
  };

  const loadApiKey = async () => {
    // Reuse the same key storage as the existing AI features
    const key = await AsyncStorage.getItem("@openai_api_key");
    if (key) setApiKey(key);
  };

  const generateReport = async () => {
    if (!apiKey) {
      Alert.alert("API Key needed", "Please add your OpenAI API key in Settings first.");
      return;
    }
    if (!summary || summary.total === 0) {
      Alert.alert("No mistakes yet", "Practice some conjugations first to track mistakes.");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = buildPrompt(summary);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const report = data.choices?.[0]?.message?.content ?? "Could not generate report.";
      setAiReport(report);
      await AsyncStorage.setItem(REPORT_CACHE_KEY, report);
    } catch (e) {
      Alert.alert("Error", "Failed to generate report. Check your connection and API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      "Clear mistakes?",
      "This will delete all tracked mistakes and reset your report.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearMistakes();
            await AsyncStorage.removeItem(REPORT_CACHE_KEY);
            setSummary(null);
            setAiReport("");
            loadData();
          },
        },
      ]
    );
  };

  // Sort helpers
  const topEntries = (obj: Record<string, number>, limit = 5) =>
    Object.entries(obj).sort(([, a], [, b]) => b - a).slice(0, limit);

  const tenseLabel = (key: string) => TENSE_LABELS[key as keyof typeof TENSE_LABELS] ?? key;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>My Weaknesses 📊</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!summary || summary.total === 0 ? (
          <Text style={styles.empty}>No mistakes tracked yet. Start practicing!</Text>
        ) : (
          <>
            <Text style={styles.totalText}>Total mistakes tracked: {summary.total}</Text>

            {/* Weakest tenses */}
            <Text style={styles.sectionLabel}>Hardest Tenses</Text>
            {topEntries(summary.byTense).map(([tense, count]) => (
              <View key={tense} style={styles.statRow}>
                <Text style={styles.statLabel}>{tenseLabel(tense)}</Text>
                <Text style={styles.statCount}>{count}</Text>
              </View>
            ))}

            {/* Hardest verbs */}
            <Text style={styles.sectionLabel}>Hardest Verbs</Text>
            {topEntries(summary.byVerb).map(([verb, count]) => (
              <View key={verb} style={styles.statRow}>
                <Text style={styles.statLabel}>{verb}</Text>
                <Text style={styles.statCount}>{count}</Text>
              </View>
            ))}

            {/* Hardest pronouns */}
            <Text style={styles.sectionLabel}>Hardest Pronouns</Text>
            {topEntries(summary.byPronoun).map(([pronoun, count]) => (
              <View key={pronoun} style={styles.statRow}>
                <Text style={styles.statLabel}>{pronoun}</Text>
                <Text style={styles.statCount}>{count}</Text>
              </View>
            ))}

            {/* AI Report */}
            <Text style={styles.sectionLabel}>🤖 AI Analysis</Text>
            {aiReport ? (
              <View style={styles.reportCard}>
                <Text style={styles.reportText}>{aiReport}</Text>
              </View>
            ) : (
              <Text style={styles.noReport}>
                Tap "Generate Analysis" to get a personalized breakdown from AI.
              </Text>
            )}

            {/* Generate button */}
            <Pressable
              style={[styles.btn, isGenerating && styles.btnDisabled]}
              onPress={generateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.btnText}>
                  {aiReport ? "🔄 Refresh Analysis" : "✨ Generate Analysis"}
                </Text>
              )}
            </Pressable>

            {/* Clear button */}
            <Pressable style={styles.btnDanger} onPress={handleClear}>
              <Text style={styles.btnDangerText}>Clear All Mistakes</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function buildPrompt(summary: Awaited<ReturnType<typeof getMistakeSummary>>): string {
  const topVerbs = Object.entries(summary.byVerb)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([v, c]) => `${v} (${c} errors)`)
    .join(", ");

  const topTenses = Object.entries(summary.byTense)
    .sort(([, a], [, b]) => b - a)
    .map(([t, c]) => `${t} (${c} errors)`)
    .join(", ");

  const topPronouns = Object.entries(summary.byPronoun)
    .sort(([, a], [, b]) => b - a)
    .map(([p, c]) => `${p} (${c} errors)`)
    .join(", ");

  const recentSample = summary.recentMistakes.slice(-20).map(m =>
    `${m.verb} / ${m.tense} / ${m.pronoun}: typed "${m.userAnswer}", correct "${m.correctAnswer}"`
  ).join("\n");

  return `You are a French language tutor analyzing a student's conjugation mistakes. 
The student is a beginner learning French (Hebrew speaker).

Mistake summary (${summary.total} total mistakes):
- Hardest verbs: ${topVerbs}
- Hardest tenses: ${topTenses}  
- Hardest pronouns: ${topPronouns}

Recent mistake samples:
${recentSample}

Please write a short, encouraging analysis (3-5 paragraphs) that:
1. Identifies the main patterns in their mistakes
2. Explains WHY they might be making these mistakes (common traps)
3. Gives 2-3 specific, actionable tips to improve
4. Suggests which verbs/tenses to focus on next

Write in a warm, coach-like tone. Keep it concise and practical.`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  header: { padding: spacing[4], paddingTop: spacing[12], borderBottomWidth: 1, borderColor: colors.neutral200 },
  backText: { color: colors.primary, fontSize: 16, marginBottom: spacing[2] },
  title: { fontSize: 22, fontWeight: "700", color: colors.neutral900 },
  scroll: { flex: 1, padding: spacing[4] },
  empty: { fontSize: 16, color: colors.neutral500, textAlign: "center", marginTop: spacing[10] },
  totalText: { fontSize: 15, color: colors.neutral500, marginBottom: spacing[4] },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.neutral500, textTransform: "uppercase", letterSpacing: 0.8, marginTop: spacing[5], marginBottom: spacing[2] },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing[2], borderBottomWidth: 1, borderColor: colors.neutral100 },
  statLabel: { fontSize: 15, color: colors.neutral700 },
  statCount: { fontSize: 15, fontWeight: "600", color: colors.danger },
  reportCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing[4], borderWidth: 1, borderColor: colors.neutral200, marginBottom: spacing[3] },
  reportText: { fontSize: 15, color: colors.neutral700, lineHeight: 23 },
  noReport: { fontSize: 14, color: colors.neutral500, fontStyle: "italic", marginBottom: spacing[4] },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing[4], alignItems: "center", marginBottom: spacing[3] },
  btnDisabled: { backgroundColor: colors.neutral300 },
  btnText: { color: colors.surface, fontSize: 16, fontWeight: "600" },
  btnDanger: { borderWidth: 1.5, borderColor: colors.danger, borderRadius: 12, padding: spacing[3], alignItems: "center", marginBottom: spacing[8] },
  btnDangerText: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
```

---

### 3. `app/mistakes-report.tsx` (route file)

```typescript
import { MistakesReport } from "./screens/MistakesReport";
export default MistakesReport;
```

---

## Modified Files

### `app/types/index.ts` — add new type:

```typescript
export interface ConjugationMistake {
  id: string;
  timestamp: number;
  verb: string;
  tense: string;
  pronoun: string;
  userAnswer: string;
  correctAnswer: string;
}
```

### `app/screens/ConjugationPractice.tsx` — log mistakes on check:

In `checkAllAnswers()`, after computing results, add:

```typescript
import { saveMistake } from "../utils/mistakesTracker";

// Inside checkAllAnswers(), after setting results:
PRONOUN_KEYS.forEach(async (p) => {
  const isCorrect = checkAnswer(answers[p], correctTable[p]);
  if (!isCorrect && answers[p].trim() !== "") {
    // Only log if user actually tried (non-empty answer)
    await saveMistake({
      timestamp: Date.now(),
      verb: currentVerb,
      tense: tenseKey,
      pronoun: p,
      userAnswer: answers[p],
      correctAnswer: correctTable[p],
    });
  }
});
```

> **Note:** Only log mistakes where the user typed something (skip blanks). This avoids polluting data with "gave up" answers vs. genuine wrong answers.

### `app/screens/ConjugationSetup.tsx` — add "View Report" button:

Add a secondary button below START:

```typescript
<Pressable
  onPress={() => router.push("/mistakes-report")}
  style={styles.reportBtn}
>
  <Text style={styles.reportBtnText}>📊 View My Weaknesses</Text>
</Pressable>
```

```typescript
reportBtn: {
  padding: spacing[3],
  alignItems: "center",
  marginTop: spacing[2],
},
reportBtnText: {
  color: colors.primaryLight,
  fontSize: 15,
  fontWeight: "600",
},
```

### `app/_layout.tsx` — register new route:

```typescript
<Stack.Screen name="mistakes-report" options={{ headerShown: false }} />
```

---

## How it works end-to-end

```
Practice session
     │
     ▼
User types wrong answer
     │
     ▼
checkAllAnswers() fires
     │
     ├─ correct → green highlight, no log
     └─ wrong + non-empty → saveMistake() → AsyncStorage
          │
          ▼
   @conjugation_mistakes grows over time
          │
          ▼
   User taps "📊 View My Weaknesses"
          │
          ▼
   getMistakeSummary() → byVerb, byTense, byPronoun stats displayed
          │
          ▼
   User taps "Generate Analysis"
          │
          ▼
   buildPrompt(summary) → OpenAI gpt-4o-mini
          │
          ▼
   AI response cached in @conjugation_ai_report
          │
          ▼
   Report displayed + cached (no re-generation needed until new mistakes)
```

---

## Decisions

| Decision | Rationale |
|---|---|
| Cap at 500 mistakes | Prevent unbounded AsyncStorage growth |
| Only log non-empty wrong answers | Avoids noise from "skipped" pronouns |
| Cache AI report | Saves API calls; refresh is explicit |
| Use gpt-4o-mini | Fast and cheap for this kind of text task |
| Reuse existing `@openai_api_key` | No new settings UI needed |

---

## Out of scope (could add later)

- Per-session mistake review (show your errors right after each session)
- Streak / practice history calendar
- "Drill your weak verbs" mode that auto-selects your worst verbs
- Export mistakes as CSV

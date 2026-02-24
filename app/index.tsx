import { View, StyleSheet, Pressable, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { CardStack } from "./components/CardStack";
import { Dashboard } from "./screens/Dashboard";
import { Word, SwipeDirection } from "./types";
import {
  saveWordWithDifficulty,
  getSwipeDifficulty,
  getStoredWords,
  updateStoredWord,
  deleteWord,
} from "./utils/wordUtils";
import { selectPracticeWords } from "./utils/practiceUtils";
import { colors, shadows, borderRadius, spacing } from "./theme";

export default function Page() {
  const [showDashboard, setShowDashboard] = useState(true);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);

  const loadPracticeWords = async () => {
    const allWords = await getStoredWords();
    if (allWords.length === 0) {
      setPracticeWords([]);
      return;
    }

    // Select 20 words based on our distribution algorithm
    const selectedWords = await selectPracticeWords(allWords, 20);
    setPracticeWords(selectedWords);
  };

  const handleSwipe = async (word: Word, direction: SwipeDirection) => {
    const difficulty = getSwipeDifficulty(direction);
    await saveWordWithDifficulty(word, difficulty);
  };

  // Function to handle updating a word
  const handleUpdateWord = async (updatedWord: Word) => {
    // Update the word in the practiceWords state
    setPracticeWords((currentPracticeWords) =>
      currentPracticeWords.map((w) =>
        w.id === updatedWord.id ? updatedWord : w
      )
    );
    // Persist the updated word to AsyncStorage
    await updateStoredWord(updatedWord);
  };

  // Function to handle deleting a word
  const handleDeleteWord = async (word: Word) => {
    try {
      const success = await deleteWord(word);
      if (success) {
        setPracticeWords((currentPracticeWords) => {
          const filtered = currentPracticeWords.filter((w) => w.id !== word.id);
          return filtered;
        });
      }
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

  const handleStartPractice = async () => {
    await loadPracticeWords();
    setShowDashboard(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showDashboard ? (
        <>
          <Dashboard />
          <Pressable
            style={[
              styles.floatingButton,
              practiceWords.length === 0 && styles.floatingButtonDisabled,
            ]}
            onPress={handleStartPractice}
          >
            <Text style={styles.floatingButtonText}>Start Practice</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            style={styles.backButton}
            onPress={() => setShowDashboard(true)}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </Pressable>
          <CardStack
            words={practiceWords}
            onSwipe={handleSwipe}
            onUpdateWord={handleUpdateWord}
            onDeleteWord={handleDeleteWord}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.lg,
  },
  floatingButtonDisabled: {
    backgroundColor: colors.neutral300,
  },
  floatingButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

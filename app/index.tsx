import { View, StyleSheet, Pressable, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { CardStack } from "./components/CardStack";
import { Dashboard } from "./screens/Dashboard";
import { Word, SwipeDirection } from "./types";
import {
  saveWordWithDifficulty,
  getSwipeDifficulty,
  getStoredWords,
} from "./utils/wordUtils";
import { selectPracticeWords } from "./utils/practiceUtils";

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
    const selectedWords = selectPracticeWords(allWords, 20);
    setPracticeWords(selectedWords);
  };

  const handleSwipe = async (word: Word, direction: SwipeDirection) => {
    const difficulty = getSwipeDifficulty(direction);
    await saveWordWithDifficulty(word, difficulty);
  };

  const handleStartPractice = async () => {
    await loadPracticeWords();
    setShowDashboard(false);
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </Pressable>
          <CardStack words={practiceWords} onSwipe={handleSwipe} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  floatingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
});

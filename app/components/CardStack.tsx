import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Word, SwipeDirection } from "../types";
import { WordCard } from "./WordCard";
import { getFrenchExampleSentence } from "../services/wiktionaryService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface CardStackProps {
  words: Word[];
  onSwipe: (word: Word, direction: SwipeDirection) => void;
}

export const CardStack: React.FC<CardStackProps> = ({ words, onSwipe }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [exampleSentence, setExampleSentence] = useState<string | null>(null);
  const [isLoadingSentence, setIsLoadingSentence] = useState(false);
  const [sentenceError, setSentenceError] = useState<string | null>(null);

  const handleButtonPress = (direction: SwipeDirection) => {
    if (currentIndex < words.length) {
      const currentWord = words[currentIndex];
      onSwipe(currentWord, direction);
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      setExampleSentence(null);
      setSentenceError(null);
    }
  };

  const handleGetExampleSentence = async () => {
    if (currentIndex >= words.length) return;

    const currentWord = words[currentIndex];
    setIsLoadingSentence(true);
    setSentenceError(null);

    try {
      const sentence = await getFrenchExampleSentence(currentWord.french);
      setExampleSentence(sentence);
    } catch (error) {
      setSentenceError("Failed to fetch example sentence. Please try again.");
    } finally {
      setIsLoadingSentence(false);
    }
  };

  if (currentIndex >= words.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMoreCards}>No more cards!</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.sentenceButton}
        onPress={handleGetExampleSentence}
        disabled={isLoadingSentence}
      >
        <Text style={styles.sentenceButtonText}>
          {isLoadingSentence ? "Loading..." : "Use it in a sentence"}
        </Text>
      </Pressable>

      {isLoadingSentence && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      )}

      {exampleSentence && (
        <View style={styles.sentenceContainer}>
          <Text style={styles.sentenceText}>{exampleSentence}</Text>
        </View>
      )}

      {sentenceError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{sentenceError}</Text>
        </View>
      )}

      <WordCard
        {...currentWord}
        isRevealed={isRevealed}
        onReveal={() => setIsRevealed(!isRevealed)}
      />

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.hardButton]}
          onPress={() => handleButtonPress("left")}
        >
          <Text style={styles.buttonText}>Don't Know</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.mediumButton]}
          onPress={() => handleButtonPress("up")}
        >
          <Text style={styles.buttonText}>Kind Of</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.easyButton]}
          onPress={() => handleButtonPress("right")}
        >
          <Text style={styles.buttonText}>Know Well</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 50,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  hardButton: {
    backgroundColor: "#F44336", // Red
  },
  mediumButton: {
    backgroundColor: "#2196F3", // Blue
  },
  easyButton: {
    backgroundColor: "#4CAF50", // Green
  },
  noMoreCards: {
    fontSize: 24,
    color: "#666",
  },
  sentenceButton: {
    backgroundColor: "#9C27B0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  sentenceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  sentenceContainer: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: CARD_WIDTH,
  },
  sentenceText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  loadingContainer: {
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: CARD_WIDTH,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
});

import React, { useState } from "react";
import { StyleSheet, View, Pressable, Text, Dimensions } from "react-native";
import { Word, SwipeDirection } from "../types";
import { WordCard } from "./WordCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface CardStackProps {
  words: Word[];
  onSwipe: (word: Word, direction: SwipeDirection) => void;
}

export const CardStack: React.FC<CardStackProps> = ({ words, onSwipe }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleButtonPress = (direction: SwipeDirection) => {
    if (currentIndex < words.length) {
      const currentWord = words[currentIndex];
      onSwipe(currentWord, direction);
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
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
});

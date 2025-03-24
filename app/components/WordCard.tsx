import React from "react";
import { StyleSheet, Text, Dimensions, Pressable } from "react-native";
import { WordCard as WordCardType } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface WordCardProps extends WordCardType {
  onReveal: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  french,
  english,
  isRevealed,
  onReveal,
}) => {
  return (
    <Pressable onPress={onReveal} style={styles.card}>
      <Text style={styles.frenchText}>{french}</Text>
      {isRevealed && <Text style={styles.englishText}>{english}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  frenchText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  englishText: {
    fontSize: 24,
    color: "#666",
    textAlign: "center",
  },
});

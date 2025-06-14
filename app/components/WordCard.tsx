import React from "react";
import {
  StyleSheet,
  Text,
  Dimensions,
  Pressable,
  View,
  TouchableOpacity,
} from "react-native";
import { WordCard as WordCardType } from "../types";
import * as Speech from "expo-speech";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface WordCardProps extends WordCardType {
  onReveal: () => void;
  onLongPress?: () => void;
  // gender is already part of WordCardType via Word
}

export const WordCard: React.FC<WordCardProps> = ({
  french,
  english,
  isRevealed,
  onReveal,
  onLongPress,
  gender,
}) => {
  const getGenderMark = () => {
    if (!gender) return "";
    return gender === "masculine" ? " (m)" : " (f)";
  };

  const speakFrench = () => {
    Speech.speak(french, { language: "fr-FR" });
  };

  return (
    <Pressable onPress={onReveal} onLongPress={onLongPress} style={styles.card}>
      <View style={styles.frenchRow}>
        <Text style={styles.frenchText}>
          {french}
          {getGenderMark()}
        </Text>
        <TouchableOpacity
          onPress={speakFrench}
          style={styles.speakerIcon}
          accessibilityLabel="Play pronunciation"
        >
          <MaterialIcons name="volume-up" size={28} color="#2196F3" />
        </TouchableOpacity>
      </View>
      {isRevealed && <Text style={styles.englishText}>{english}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
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
    minHeight: 220,
    maxHeight: SCREEN_WIDTH * 1.2, // keep reasonable vertical size
  },
  frenchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  frenchText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  speakerIcon: {
    marginLeft: 10,
    padding: 4,
  },
  englishText: {
    fontSize: 24,
    color: "#666",
    textAlign: "center",
  },
});

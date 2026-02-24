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
import { colors, shadows, spacing, borderRadius, typography } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface WordCardProps extends WordCardType {
  onReveal: () => void;
  onLongPress?: () => void;
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
      <View style={styles.accentLine} />
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
          <MaterialIcons name="volume-up" size={28} color={colors.primaryLight} />
        </TouchableOpacity>
      </View>
      {isRevealed && <Text style={styles.englishText}>{english}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: spacing.xxxl,
    right: spacing.xxxl,
    height: 3,
    backgroundColor: colors.accent,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  frenchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  frenchText: {
    ...typography.displayLarge,
    color: colors.neutral900,
    textAlign: "center",
  },
  speakerIcon: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  englishText: {
    ...typography.displayMedium,
    color: colors.neutral500,
    textAlign: "center",
  },
});

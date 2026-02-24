import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SwipeDirection } from "../types";
import { colors, spacing, borderRadius } from "../theme";

interface SwipeActionButtonsProps {
  onSwipe: (direction: SwipeDirection) => void;
}

export const SwipeActionButtons: React.FC<SwipeActionButtonsProps> = ({
  onSwipe,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[styles.button, styles.hardButton]}
        onPress={() => onSwipe("left")}
      >
        <MaterialIcons name="thumb-down" size={28} color={colors.surface} />
      </Pressable>
      <Pressable
        style={[styles.button, styles.mediumButton]}
        onPress={() => onSwipe("up")}
      >
        <MaterialIcons name="sentiment-neutral" size={28} color={colors.surface} />
      </Pressable>
      <Pressable
        style={[styles.button, styles.easyButton]}
        onPress={() => onSwipe("right")}
      >
        <MaterialIcons name="thumb-up" size={28} color={colors.surface} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: spacing.xl,
    position: "absolute",
    bottom: 50,
    gap: spacing.xxl,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  hardButton: {
    backgroundColor: colors.danger,
  },
  mediumButton: {
    backgroundColor: colors.accent,
  },
  easyButton: {
    backgroundColor: colors.success,
  },
});

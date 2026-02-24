import React from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
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
        <MaterialIcons name="thumb-down" size={20} color={colors.surface} />
        <Text style={styles.buttonText}>Don't Know</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.mediumButton]}
        onPress={() => onSwipe("up")}
      >
        <MaterialIcons name="sentiment-neutral" size={20} color={colors.surface} />
        <Text style={styles.buttonText}>Kind Of</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.easyButton]}
        onPress={() => onSwipe("right")}
      >
        <MaterialIcons name="thumb-up" size={20} color={colors.surface} />
        <Text style={styles.buttonText}>Know Well</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: spacing.xl,
    position: "absolute",
    bottom: 50,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    minWidth: 100,
    alignItems: "center",
    gap: spacing.xs,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
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

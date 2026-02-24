import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Difficulty } from "../types";
import { colors, shadows, spacing, borderRadius } from "../theme";

interface DifficultyDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (difficulty: Difficulty | undefined) => void; // undefined = "new"
  current?: Difficulty | undefined;
}

const getDifficultyDot = (difficulty: Difficulty | undefined) => {
  switch (difficulty) {
    case "easy":
      return colors.success;
    case "medium":
      return colors.warning;
    case "hard":
      return colors.danger;
    default:
      return colors.neutral300;
  }
};

export const DifficultyDrawer: React.FC<DifficultyDrawerProps> = ({
  visible,
  onClose,
  onSelect,
  current,
}) => {
  const options: { label: string; value: Difficulty | undefined }[] = [
    { label: "New", value: undefined },
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <Text style={styles.title}>Set difficulty</Text>

          <View style={styles.optionsRow}>
            {options.map((option) => {
              const isSelected = current === option.value;
              return (
                <Pressable
                  key={option.label}
                  style={[styles.option, isSelected && styles.selected]}
                  onPress={() => onSelect(option.value)}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: getDifficultyDot(option.value) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
    textAlign: "center",
    color: colors.neutral900,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  option: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  selected: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    color: colors.neutral700,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: colors.primary,
  },
  cancel: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
  },
  cancelText: {
    fontWeight: "600",
    color: colors.neutral700,
  },
});

export default DifficultyDrawer;

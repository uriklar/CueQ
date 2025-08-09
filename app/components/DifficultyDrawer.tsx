import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Difficulty } from "../types";

interface DifficultyDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (difficulty: Difficulty | undefined) => void; // undefined = "new"
  current?: Difficulty | undefined;
}

export const DifficultyDrawer: React.FC<DifficultyDrawerProps> = ({
  visible,
  onClose,
  onSelect,
  current,
}) => {
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
            <Pressable
              style={[styles.option, current === undefined && styles.selected]}
              onPress={() => onSelect(undefined)}
            >
              <Text
                style={[
                  styles.optionText,
                  current === undefined && styles.optionTextSelected,
                ]}
              >
                New
              </Text>
            </Pressable>
            <Pressable
              style={[styles.option, current === "easy" && styles.selected]}
              onPress={() => onSelect("easy")}
            >
              <Text
                style={[
                  styles.optionText,
                  current === "easy" && styles.optionTextSelected,
                ]}
              >
                Easy
              </Text>
            </Pressable>
            <Pressable
              style={[styles.option, current === "medium" && styles.selected]}
              onPress={() => onSelect("medium")}
            >
              <Text
                style={[
                  styles.optionText,
                  current === "medium" && styles.optionTextSelected,
                ]}
              >
                Medium
              </Text>
            </Pressable>
            <Pressable
              style={[styles.option, current === "hard" && styles.selected]}
              onPress={() => onSelect("hard")}
            >
              <Text
                style={[
                  styles.optionText,
                  current === "hard" && styles.optionTextSelected,
                ]}
              >
                Hard
              </Text>
            </Pressable>
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
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheet: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  option: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#2196F3",
  },
  optionText: {
    color: "#333",
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "white",
  },
  cancel: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 12,
  },
  cancelText: {
    fontWeight: "600",
    color: "#333",
  },
});

export default DifficultyDrawer;

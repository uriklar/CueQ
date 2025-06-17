import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Difficulty } from "../types";

interface DifficultyPickerModalProps {
  visible: boolean;
  currentDifficulty?: Difficulty;
  onClose: () => void;
  /**
   * When the user selects a difficulty, we pass undefined to represent "new"
   */
  onSelect: (difficulty: Difficulty | undefined) => void;
}

export const DifficultyPickerModal: React.FC<DifficultyPickerModalProps> = ({
  visible,
  currentDifficulty,
  onClose,
  onSelect,
}) => {
  // Include "undefined" for the "new" option
  const difficulties: (Difficulty | undefined)[] = [
    undefined,
    "easy",
    "medium",
    "hard",
  ];

  const getLabel = (diff: Difficulty | undefined) => {
    return diff ?? "new";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.wrapper}>
        {/* Using TouchableWithoutFeedback to close when tapping outside */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          <Text style={styles.title}>Select Difficulty</Text>
          {difficulties.map((diff) => (
            <Pressable
              key={getLabel(diff)}
              style={[
                styles.option,
                currentDifficulty === diff ||
                (!currentDifficulty && diff === undefined)
                  ? styles.optionSelected
                  : undefined,
              ]}
              onPress={() => onSelect(diff)}
            >
              <Text
                style={
                  currentDifficulty === diff ||
                  (!currentDifficulty && diff === undefined)
                    ? styles.optionTextSelected
                    : styles.optionText
                }
              >
                {getLabel(diff).charAt(0).toUpperCase() +
                  getLabel(diff).slice(1)}
              </Text>
            </Pressable>
          ))}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionSelected: {
    backgroundColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  optionTextSelected: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

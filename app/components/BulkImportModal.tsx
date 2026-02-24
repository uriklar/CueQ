import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Word } from "../types";
import { colors, shadows, spacing, borderRadius } from "../theme";

interface BulkImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (words: Omit<Word, "id" | "difficulty">[]) => void;
}

export const BulkImportModal = ({
  visible,
  onClose,
  onImport,
}: BulkImportModalProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(jsonInput);

      if (!Array.isArray(parsedData)) {
        setError("Input must be an array of words");
        return;
      }

      // Validate each word has the required properties
      const isValid = parsedData.every(
        (word) =>
          typeof word === "object" &&
          typeof word.french === "string" &&
          typeof word.english === "string"
      );

      if (!isValid) {
        setError(
          "Each word must have at least 'french' and 'english' properties"
        );
        return;
      }

      onImport(parsedData);
      setJsonInput("");
      setError("");
      onClose();
    } catch (e) {
      setError("Invalid JSON format");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Bulk Import Words</Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.importButton]}
                onPress={handleImport}
              >
                <Text style={styles.importButtonText}>Import</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.label}>Paste JSON Array of Words</Text>
          <ScrollView style={styles.scrollView}>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={10}
              value={jsonInput}
              onChangeText={setJsonInput}
              placeholder="Paste your JSON array here"
              placeholderTextColor={colors.neutral300}
            />
          </ScrollView>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay,
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral900,
  },
  label: {
    fontSize: 16,
    marginBottom: spacing.sm,
    color: colors.neutral700,
  },
  scrollView: {
    height: 300,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    backgroundColor: colors.neutral50,
  },
  textInput: {
    fontSize: 14,
    textAlignVertical: "top",
    color: colors.neutral700,
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.neutral100,
  },
  cancelButtonText: {
    color: colors.neutral700,
    fontWeight: "600",
  },
  importButton: {
    backgroundColor: colors.success,
  },
  importButtonText: {
    color: colors.surface,
    fontWeight: "600",
  },
});

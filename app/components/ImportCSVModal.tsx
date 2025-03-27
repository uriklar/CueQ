import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { parseCSV, saveToBacklog } from "../utils/backlogUtils";

interface ImportCSVModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  visible,
  onClose,
  onImportComplete,
}) => {
  const [csvContent, setCSVContent] = useState("");
  const [error, setError] = useState("");

  const handleImport = async () => {
    try {
      setError("");
      const words = parseCSV(csvContent);

      if (words.length === 0) {
        setError("No valid words found in the CSV content");
        return;
      }

      await saveToBacklog(words);
      setCSVContent("");
      onImportComplete();
      onClose();
    } catch (error) {
      setError("Error importing CSV. Please check the format.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Import Words from CSV</Text>

          <Text style={styles.description}>
            Paste your CSV content below. Format:{"\n"}
            french, english{"\n"}
            Bonjour, Hello
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Paste CSV content here"
            value={csvContent}
            onChangeText={setCSVContent}
            multiline
            numberOfLines={6}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.importButton]}
              onPress={handleImport}
            >
              <Text style={[styles.buttonText, styles.importButtonText]}>
                Import
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 120,
    textAlignVertical: "top",
    maxHeight: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  importButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
  },
  importButtonText: {
    color: "white",
  },
  errorText: {
    color: "#F44336",
    marginBottom: 16,
  },
});

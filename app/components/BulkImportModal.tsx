import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Omit } from "utility-types";
import { Word } from "../types";
import { parseWords } from "../services/bulkImport";

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
      const words = parseWords(jsonInput);
      onImport(words.map(({ id, difficulty, ...rest }) => rest));
      setJsonInput("");
      setError("");
      onClose();
    } catch (e) {
      setError((e as Error).message || "Invalid JSON format");
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
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.importButton]}
                onPress={handleImport}
              >
                <Text style={styles.buttonText}>Import</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 16,
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
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flexShrink: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  scrollView: {
    height: 300,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
  },
  textInput: {
    fontSize: 14,
    textAlignVertical: "top",
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    flexShrink: 0,
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  importButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});

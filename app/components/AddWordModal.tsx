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
import { Word } from "../types";

interface AddWordModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (word: Omit<Word, "id">) => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [french, setFrench] = useState("");
  const [english, setEnglish] = useState("");

  const handleAdd = () => {
    if (french.trim() && english.trim()) {
      onAdd({
        french: french.trim(),
        english: english.trim(),
      });
      setFrench("");
      setEnglish("");
      onClose();
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
          <Text style={styles.title}>Add New Word</Text>

          <TextInput
            style={styles.input}
            placeholder="French word"
            value={french}
            onChangeText={setFrench}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="English translation"
            value={english}
            onChangeText={setEnglish}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.addButton]}
              onPress={handleAdd}
            >
              <Text style={[styles.buttonText, styles.addButtonText]}>
                Add Word
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
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  addButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  addButtonText: {
    color: "white",
  },
});

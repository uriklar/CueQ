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
  Alert,
} from "react-native";
import { Word } from "../types";

interface AddWordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (word: Word | Omit<Word, "id">, isEdit: boolean) => void;
  editingWord?: Word;
  onDelete?: (word: Word) => void | Promise<void>;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingWord,
  onDelete,
}) => {
  const [french, setFrench] = useState("");
  const [english, setEnglish] = useState("");
  const [examples, setExamples] = useState("");
  const [gender, setGender] = useState<"masculine" | "feminine" | null>(null);

  React.useEffect(() => {
    if (editingWord) {
      setFrench(editingWord.french);
      setEnglish(editingWord.english);
      setExamples(editingWord.examples || "");
      setGender(editingWord.gender ?? null);
    } else {
      // Clear fields when modal is opened for adding a new word
      setFrench("");
      setEnglish("");
      setExamples("");
      setGender(null);
    }
  }, [editingWord, visible]); // also run when visible changes to reset for 'add new'

  const handleSubmit = () => {
    if (french.trim() && english.trim()) {
      if (editingWord) {
        onSubmit(
          {
            ...editingWord,
            french: french.trim(),
            english: english.trim(),
            examples: examples.trim(),
            gender: gender,
          },
          true
        );
      } else {
        onSubmit(
          {
            french: french.trim(),
            english: english.trim(),
            examples: examples.trim(),
            gender: gender,
          },
          false
        );
      }
      // Don't reset fields here, onClose will handle it or useEffect for new word
      onClose();
    }
  };

  const handleClose = () => {
    // Resetting fields here ensures they are cleared on any close action
    // including backdrop press or cancel button.
    // useEffect will repopulate if editingWord is present when modal reopens.
    setFrench("");
    setEnglish("");
    setExamples("");
    setGender(null);
    onClose();
  };

  const handleGenderSelect = (selectedGender: "masculine" | "feminine") => {
    if (gender === selectedGender) {
      setGender(null);
    } else {
      setGender(selectedGender);
    }
  };

  const handleDelete = () => {
    if (!editingWord || !onDelete) return;

    Alert.alert("Delete Word", "Are you sure you want to delete this word?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await onDelete(editingWord);
          handleClose();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {editingWord ? "Edit Word" : "Add New Word"}
          </Text>

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

          <TextInput
            style={styles.input}
            placeholder="Examples (optional)"
            value={examples}
            onChangeText={setExamples}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender:</Text>
            <Pressable
              style={[
                styles.genderButton,
                gender === "masculine" && styles.genderButtonSelected,
              ]}
              onPress={() => handleGenderSelect("masculine")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "masculine" && styles.genderButtonTextSelected,
                ]}
              >
                Masculine
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                gender === "feminine" && styles.genderButtonSelected,
              ]}
              onPress={() => handleGenderSelect("feminine")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "feminine" && styles.genderButtonTextSelected,
                ]}
              >
                Feminine
              </Text>
            </Pressable>
          </View>

          {editingWord && onDelete && (
            <Pressable
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete Word</Text>
            </Pressable>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.addButton]}
              onPress={handleSubmit}
            >
              <Text style={[styles.buttonText, styles.addButtonText]}>
                {editingWord ? "Save Changes" : "Add Word"}
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
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  genderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
  },
  genderButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  genderButtonText: {
    fontSize: 14,
    color: "#666",
  },
  genderButtonTextSelected: {
    color: "white",
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
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F44336",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

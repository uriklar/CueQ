import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Word } from "../../types";
import { GenderToggle } from "../../ui/GenderToggle";
import { useAddWordForm } from "../../hooks/useAddWordForm";
import { styles } from "./styles";

interface AddWordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (word: Word | Omit<Word, "id">, isEdit: boolean) => void;
  editingWord?: Word;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingWord,
}) => {
  const {
    form: { french, english, examples, gender },
    setFrench,
    setEnglish,
    setExamples,
    handleGenderSelect,
    reset,
  } = useAddWordForm(editingWord);

  const handleSubmit = () => {
    if (!french.trim() || !english.trim()) return;

    if (editingWord) {
      onSubmit(
        {
          ...editingWord,
          french: french.trim(),
          english: english.trim(),
          examples: examples.trim(),
          gender,
        },
        true
      );
    } else {
      onSubmit(
        {
          french: french.trim(),
          english: english.trim(),
          examples: examples.trim(),
          gender,
        },
        false
      );
    }

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
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

          <GenderToggle value={gender} onChange={handleGenderSelect} />

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

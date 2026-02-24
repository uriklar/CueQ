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
import { colors, shadows, spacing, borderRadius } from "../theme";

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
      onClose();
    }
  };

  const handleClose = () => {
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
            placeholderTextColor={colors.neutral300}
            value={french}
            onChangeText={setFrench}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="English translation"
            placeholderTextColor={colors.neutral300}
            value={english}
            onChangeText={setEnglish}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Examples (optional)"
            placeholderTextColor={colors.neutral300}
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
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.addButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.addButtonText}>
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
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "90%",
    maxWidth: 400,
    ...shadows.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.xl,
    textAlign: "center",
    color: colors.neutral900,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
    color: colors.neutral700,
    backgroundColor: colors.neutral50,
  },
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  genderLabel: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: colors.neutral700,
  },
  genderButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.neutral50,
  },
  genderButtonSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryLight,
  },
  genderButtonText: {
    fontSize: 14,
    color: colors.neutral500,
  },
  genderButtonTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.neutral100,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral700,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  deleteButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
});

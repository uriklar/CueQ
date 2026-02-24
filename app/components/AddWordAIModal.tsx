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
  ActivityIndicator,
} from "react-native";
import { Word } from "../types";
import { getWordInfo } from "../services/openai";
import { colors, shadows, spacing, borderRadius } from "../theme";

interface AddWordAIModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (word: Omit<Word, "id">) => void;
}

export const AddWordAIModal: React.FC<AddWordAIModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [word, setWord] = useState("");
  const [language, setLanguage] = useState<"english" | "french">("french");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      // Clear fields when modal is opened
      setWord("");
      setLanguage("french");
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!word.trim()) {
      Alert.alert("Error", "Please enter a word");
      return;
    }

    setIsLoading(true);
    try {
      const wordInfo = await getWordInfo(word.trim(), language);

      // Add the word with default difficulty "New" (undefined = new)
      const wordToSubmit: Omit<Word, "id"> = {
        ...wordInfo,
        difficulty: undefined, // undefined means "new" in the practice system
      };

      onSubmit(wordToSubmit);
      onClose();
    } catch (error) {
      console.error("Error getting word info:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to get word information. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setWord("");
    setLanguage("french");
    onClose();
  };

  const handleLanguageSelect = (selectedLanguage: "english" | "french") => {
    setLanguage(selectedLanguage);
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
          <Text style={styles.title}>Add Word with AI</Text>
          <Text style={styles.subtitle}>
            Enter a word and let AI provide comprehensive information
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter word"
            placeholderTextColor={colors.neutral300}
            value={word}
            onChangeText={setWord}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <View style={styles.languageContainer}>
            <Text style={styles.languageLabel}>Language:</Text>
            <Pressable
              style={[
                styles.languageButton,
                language === "french" && styles.languageButtonSelected,
              ]}
              onPress={() => handleLanguageSelect("french")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === "french" && styles.languageButtonTextSelected,
                ]}
              >
                French
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.languageButton,
                language === "english" && styles.languageButtonSelected,
              ]}
              onPress={() => handleLanguageSelect("english")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === "english" && styles.languageButtonTextSelected,
                ]}
              >
                English
              </Text>
            </Pressable>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.cancelButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.addButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <Text style={styles.addButtonText}>Add Word</Text>
              )}
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
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.neutral900,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: "center",
    marginBottom: spacing.xl,
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
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  languageLabel: {
    fontSize: 16,
    marginRight: spacing.md,
    fontWeight: "500",
    color: colors.neutral700,
  },
  languageButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
    marginHorizontal: spacing.xs,
    minWidth: 80,
    alignItems: "center",
    backgroundColor: colors.neutral50,
  },
  languageButtonSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryLight,
  },
  languageButtonText: {
    fontSize: 14,
    color: colors.neutral500,
    fontWeight: "500",
  },
  languageButtonTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

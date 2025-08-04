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
              <Text style={styles.buttonText}>Cancel</Text>
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
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={[styles.buttonText, styles.addButtonText]}>
                  Add Word
                </Text>
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
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  languageLabel: {
    fontSize: 16,
    marginRight: 12,
    fontWeight: "500",
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: "center",
  },
  languageButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  languageButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  languageButtonTextSelected: {
    color: "white",
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
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  addButton: {
    backgroundColor: "#2196F3",
  },
  buttonDisabled: {
    opacity: 0.6,
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

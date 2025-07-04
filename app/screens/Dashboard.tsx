import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text, Alert } from "react-native";
import { WordList } from "../components/WordList";
import { AddWordModal } from "../components/AddWordModal/index";
import { BulkImportModal } from "../components/BulkImportModal";
import { DifficultyPickerModal } from "../components/DifficultyPickerModal";
import { Word, Difficulty } from "../types";
import { getStoredWords } from "../utils/wordUtils";
import {
  getBacklogWords,
  moveWordsFromBacklog,
  loadWordsFromStatic,
  saveToBacklog,
  BACKLOG_STORAGE_KEY,
} from "../utils/backlogUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";

const STORAGE_KEY = "@french_cards_words";

export const Dashboard = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [backlogCount, setBacklogCount] = useState(0);
  const [visibleWords, setVisibleWords] = useState<Word[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all" | "new"
  >("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isBulkImportModalVisible, setIsBulkImportModalVisible] =
    useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [wordForDifficultyChange, setWordForDifficultyChange] =
    useState<Word | null>(null);
  const [isDifficultyPickerVisible, setIsDifficultyPickerVisible] =
    useState(false);

  useEffect(() => {
    loadWords();
    loadBacklogCount();
  }, []);

  const loadWords = async () => {
    const storedWords = await getStoredWords();
    setWords(storedWords);
  };

  const loadBacklogCount = async () => {
    const backlogWords = await getBacklogWords();
    setBacklogCount(backlogWords.length);
  };

  const handleSubmitWord = async (
    wordData: Word | Omit<Word, "id">,
    isEdit: boolean
  ) => {
    try {
      const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const storedWords: Record<string, Word> = storedWordsJson
        ? JSON.parse(storedWordsJson)
        : {};

      if (isEdit) {
        // Ensure wordData has an id if it's an edit
        const wordToUpdate = wordData as Word;
        if (!wordToUpdate.id) {
          console.error("Error updating word: ID is missing for an edit.");
          return;
        }
        storedWords[wordToUpdate.id] = wordToUpdate;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));
        setWords((currentWords) =>
          currentWords.map((w) => (w.id === wordToUpdate.id ? wordToUpdate : w))
        );
      } else {
        const id = Date.now().toString();
        const wordWithId: Word = {
          ...(wordData as Omit<Word, "id">), // Cast to ensure correct type
          id,
        };
        storedWords[id] = wordWithId;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));
        setWords((current) => [...current, wordWithId]);
      }
    } catch (error) {
      console.error("Error saving word:", error);
    }
    // Reset editing state regardless of add or edit
    setEditingWord(null);
  };

  const handleBulkImport = async (
    importWords: Omit<Word, "id" | "difficulty">[]
  ) => {
    try {
      const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const storedWords: Record<string, Word> = storedWordsJson
        ? JSON.parse(storedWordsJson)
        : {};

      const newWords: Word[] = [];

      // Process each imported word
      importWords.forEach((wordData) => {
        const id =
          Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const wordWithId: Word = {
          ...wordData,
          id,
        };

        storedWords[id] = wordWithId;
        newWords.push(wordWithId);
      });

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));

      // Update state
      setWords((current) => [...current, ...newWords]);

      // Show confirmation
      Alert.alert(
        "Import Complete",
        `Successfully imported ${newWords.length} words.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error importing words:", error);
      Alert.alert("Import Error", "Failed to import words. Please try again.");
    }
  };

  const handleLoadFromStatic = async () => {
    console.log("Loading from static...");
    const newWords = await loadWordsFromStatic(10);
    console.log("Loaded words length:", newWords.length);
    if (newWords.length > 0) {
      console.log("Saving to backlog...");
      await saveToBacklog(newWords);
      console.log("Loading from backlog immediately...");
      await handleLoadFromBacklog();
    } else {
      console.log("No new words available");
    }
  };

  const handleLoadFromBacklog = async () => {
    const wordsToAdd = await moveWordsFromBacklog(10);
    if (wordsToAdd.length > 0) {
      try {
        const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
        const storedWords: Record<string, Word> = storedWordsJson
          ? JSON.parse(storedWordsJson)
          : {};

        const updatedWords = { ...storedWords };
        wordsToAdd.forEach((word) => {
          updatedWords[word.id] = word;
        });

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));
        setWords((current) => [...current, ...wordsToAdd]);
        loadBacklogCount();
      } catch (error) {
        console.error("Error adding words from backlog:", error);
      }
    }
  };

  const handleClearStorage = async () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all words? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                STORAGE_KEY,
                BACKLOG_STORAGE_KEY,
              ]);
              setWords([]);
              setBacklogCount(0);
              console.log("Storage cleared successfully");
            } catch (error) {
              console.error("Error clearing storage:", error);
            }
          },
        },
      ]
    );
  };

  const handleCopyVisibleWords = async () => {
    if (!visibleWords.length) {
      Alert.alert(
        "No words to copy",
        "There are no words in the current filter to copy."
      );
      return;
    }
    const frenchWords = visibleWords.map((w) => w.french).join(", ");
    try {
      await Clipboard.setStringAsync(frenchWords);
      Alert.alert("Copied", "All visible French words copied to clipboard.");
    } catch (error) {
      console.error("Error copying to clipboard", error);
      Alert.alert("Error", "Failed to copy words to clipboard.");
    }
  };

  const handleOpenAddModal = () => {
    setEditingWord(null); // Ensure we are in 'add' mode
    setIsAddModalVisible(true);
  };

  const handleOpenEditModal = (word: Word) => {
    setEditingWord(word);
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setEditingWord(null); // Clear editing state when modal closes
  };

  const handleOpenBulkImportModal = () => {
    setIsBulkImportModalVisible(true);
  };

  const handleCloseBulkImportModal = () => {
    setIsBulkImportModalVisible(false);
  };

  const handleDeleteWord = async (wordId: string) => {
    Alert.alert("Delete Word", "Are you sure you want to delete this word?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
            const storedWords: Record<string, Word> = storedWordsJson
              ? JSON.parse(storedWordsJson)
              : {};

            if (storedWords[wordId]) {
              delete storedWords[wordId];
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(storedWords)
              );
              setWords((currentWords) =>
                currentWords.filter((word) => word.id !== wordId)
              );
            } else {
              console.warn("Attempted to delete a non-existent word");
            }
          } catch (error) {
            console.error("Error deleting word:", error);
          }
        },
      },
    ]);
  };

  const handleDifficultyBadgePress = (word: Word) => {
    setWordForDifficultyChange(word);
    setIsDifficultyPickerVisible(true);
  };

  const handleSelectDifficulty = async (difficulty: Difficulty | undefined) => {
    if (!wordForDifficultyChange) return;

    const updatedWord: Word = {
      ...wordForDifficultyChange,
      difficulty,
    };

    try {
      const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const storedWords: Record<string, Word> = storedWordsJson
        ? JSON.parse(storedWordsJson)
        : {};

      storedWords[updatedWord.id] = updatedWord;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));

      setWords((current) =>
        current.map((w) => (w.id === updatedWord.id ? updatedWord : w))
      );
    } catch (error) {
      console.error("Error updating difficulty:", error);
    }

    setIsDifficultyPickerVisible(false);
    setWordForDifficultyChange(null);
  };

  const handleCloseDifficultyPicker = () => {
    setIsDifficultyPickerVisible(false);
    setWordForDifficultyChange(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <Pressable
            style={[styles.button, styles.importButton]}
            onPress={handleOpenBulkImportModal}
          >
            <Text style={styles.buttonText}>Bulk Import</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.addButton]}
            onPress={handleOpenAddModal}
          >
            <Text style={styles.buttonText}>Add Word</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.copyButton]}
            onPress={handleCopyVisibleWords}
          >
            <Text style={styles.buttonText}>Copy Words</Text>
          </Pressable>
        </View>
      </View>

      <WordList
        words={words}
        selectedDifficulty={selectedDifficulty}
        onDifficultySelect={setSelectedDifficulty}
        onEditWord={handleOpenEditModal}
        onDeleteWord={handleDeleteWord}
        onVisibleWordsChange={setVisibleWords}
        onDifficultyBadgePress={handleDifficultyBadgePress}
      />

      <AddWordModal
        visible={isAddModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitWord}
        editingWord={editingWord || undefined}
      />

      <BulkImportModal
        visible={isBulkImportModalVisible}
        onClose={handleCloseBulkImportModal}
        onImport={handleBulkImport}
      />

      <DifficultyPickerModal
        visible={isDifficultyPickerVisible}
        currentDifficulty={wordForDifficultyChange?.difficulty}
        onClose={handleCloseDifficultyPicker}
        onSelect={handleSelectDifficulty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerButtons: {
    flexDirection: "row",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: "#2196F3",
  },
  importButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  copyButton: {
    backgroundColor: "#FF9800",
  },
});

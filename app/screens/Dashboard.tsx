import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text, Alert } from "react-native";
import { WordList } from "../components/WordList";
import { AddWordModal } from "../components/AddWordModal";
import { BulkImportModal } from "../components/BulkImportModal";
import { Word, Difficulty } from "../types";
import { getStoredWords, loadAndMergeWords } from "../utils/wordUtils";
import {
  getBacklogWords,
  moveWordsFromBacklog,
  loadWordsFromStatic,
  saveToBacklog,
  BACKLOG_STORAGE_KEY,
} from "../utils/backlogUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@french_cards_words";

export const Dashboard = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [backlogCount, setBacklogCount] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isBulkImportModalVisible, setIsBulkImportModalVisible] =
    useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadWords();
    loadBacklogCount();
  }, []);

  const loadWords = async () => {
    const mergedWords = await loadAndMergeWords();
    setWords(mergedWords);
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

  // Compute filtered words count
  const filteredWords = (
    selectedDifficulty === "all"
      ? words
      : words.filter((word) => word.difficulty === selectedDifficulty)
  ).filter(
    (word) =>
      word.french.toLowerCase().includes(searchText.toLowerCase()) ||
      word.english.toLowerCase().includes(searchText.toLowerCase()) ||
      (word.examples &&
        word.examples.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <Pressable
            style={[styles.button, styles.clearButton]}
            onPress={handleClearStorage}
          >
            <Text style={styles.buttonText}>Clear All</Text>
          </Pressable>
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
        </View>
      </View>

      <WordList
        words={words}
        selectedDifficulty={selectedDifficulty}
        onDifficultySelect={setSelectedDifficulty}
        onEditWord={handleOpenEditModal}
        onDeleteWord={handleDeleteWord}
        searchText={searchText}
        onSearchChange={setSearchText}
        filteredCount={filteredWords.length}
        totalCount={words.length}
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
  clearButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});

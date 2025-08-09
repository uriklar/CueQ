import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WordList } from "../components/WordList";
import { DifficultyDrawer } from "../components/DifficultyDrawer";
import { AddWordModal } from "../components/AddWordModal";
import { AddWordAIModal } from "../components/AddWordAIModal";
import { BulkImportModal } from "../components/BulkImportModal";
import { SettingsModal } from "../components/SettingsModal";
import { Word, Difficulty } from "../types";
import { getStoredWords, loadAndMergeWords } from "../utils/wordUtils";
import {
  getBacklogWords,
  moveWordsFromBacklog,
  loadWordsFromStatic,
  saveToBacklog,
  BACKLOG_STORAGE_KEY,
} from "../utils/backlogUtils";
import {
  saveSettings,
  loadSettings,
  PracticeDistribution,
  AppSettings,
  DEFAULT_PRACTICE_DISTRIBUTION,
} from "../utils/settingsUtils";
import { saveOpenAIApiKey, loadOpenAIApiKey } from "../services/openai";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@french_cards_words";

export const Dashboard = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [backlogCount, setBacklogCount] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all" | "new"
  >("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAddAIModalVisible, setIsAddAIModalVisible] = useState(false);
  const [isBulkImportModalVisible, setIsBulkImportModalVisible] =
    useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isDifficultyDrawerVisible, setIsDifficultyDrawerVisible] =
    useState(false);
  const [difficultyTargetWord, setDifficultyTargetWord] = useState<Word | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [practiceDistribution, setPracticeDistribution] =
    useState<PracticeDistribution>(DEFAULT_PRACTICE_DISTRIBUTION);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    practiceDistribution: DEFAULT_PRACTICE_DISTRIBUTION,
    openaiApiKey: "",
  });

  useEffect(() => {
    loadWords();
    loadBacklogCount();
    loadAppSettings();
  }, []);

  const loadWords = async () => {
    const mergedWords = await loadAndMergeWords();
    setWords(mergedWords);
  };

  const loadBacklogCount = async () => {
    const backlogWords = await getBacklogWords();
    setBacklogCount(backlogWords.length);
  };

  const loadAppSettings = async () => {
    const settings = await loadSettings();

    // Check if there's an API key in the OpenAI service storage that's not in settings
    const openaiApiKey = await loadOpenAIApiKey();
    if (openaiApiKey && !settings.openaiApiKey) {
      // If OpenAI service has a key but settings don't, update settings
      settings.openaiApiKey = openaiApiKey;
      await saveSettings(settings);
    } else if (settings.openaiApiKey && !openaiApiKey) {
      // If settings have a key but OpenAI service doesn't, sync it
      await saveOpenAIApiKey(settings.openaiApiKey);
    }

    setPracticeDistribution(settings.practiceDistribution);
    setAppSettings(settings);
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

  const handleSubmitAIWord = async (wordData: Omit<Word, "id">) => {
    try {
      const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const storedWords: Record<string, Word> = storedWordsJson
        ? JSON.parse(storedWordsJson)
        : {};

      const id = Date.now().toString();
      const wordWithId: Word = {
        ...wordData,
        id,
        difficulty: undefined, // undefined means "new" in the practice system
      };

      storedWords[id] = wordWithId;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));
      setWords((current) => [...current, wordWithId]);
    } catch (error) {
      console.error("Error saving AI word:", error);
    }
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

    // Check if user has OpenAI API key to determine which modal to show
    if (appSettings.openaiApiKey && appSettings.openaiApiKey.trim()) {
      setIsAddAIModalVisible(true);
    } else {
      setIsAddModalVisible(true);
    }
  };

  const handleOpenEditModal = (word: Word) => {
    setEditingWord(word);
    setIsAddModalVisible(true);
  };

  const handleOpenDifficultyDrawer = (word: Word) => {
    setDifficultyTargetWord(word);
    setIsDifficultyDrawerVisible(true);
  };

  const handleCloseDifficultyDrawer = () => {
    setIsDifficultyDrawerVisible(false);
    setDifficultyTargetWord(null);
  };

  const handleSelectDifficulty = async (difficulty: Difficulty | undefined) => {
    if (!difficultyTargetWord) return;

    try {
      const updated: Word = { ...difficultyTargetWord, difficulty };
      // Persist to storage
      const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const storedWords: Record<string, Word> = storedWordsJson
        ? JSON.parse(storedWordsJson)
        : {};
      storedWords[updated.id] = updated;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));

      // Update state
      setWords((current) =>
        current.map((w) => (w.id === updated.id ? updated : w))
      );
    } catch (e) {
      console.error("Error setting difficulty:", e);
    } finally {
      handleCloseDifficultyDrawer();
    }
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setEditingWord(null); // Clear editing state when modal closes
  };

  const handleCloseAIModal = () => {
    setIsAddAIModalVisible(false);
  };

  const handleOpenBulkImportModal = () => {
    setIsBulkImportModalVisible(true);
  };

  const handleCloseBulkImportModal = () => {
    setIsBulkImportModalVisible(false);
  };

  const handleOpenSettingsModal = () => {
    setIsSettingsModalVisible(true);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalVisible(false);
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setPracticeDistribution(newSettings.practiceDistribution);
    setAppSettings(newSettings);
    await saveSettings(newSettings);

    // Also save the API key to the OpenAI service storage for consistency
    if (newSettings.openaiApiKey) {
      await saveOpenAIApiKey(newSettings.openaiApiKey);
    }
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
      : selectedDifficulty === "new"
      ? words.filter((word) => !word.difficulty)
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
        <Pressable
          style={styles.settingsButton}
          onPress={handleOpenSettingsModal}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
        </Pressable>
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
        onPressDifficulty={handleOpenDifficultyDrawer}
        searchText={searchText}
        onSearchChange={setSearchText}
        filteredCount={filteredWords.length}
        totalCount={words.length}
      />

      <DifficultyDrawer
        visible={isDifficultyDrawerVisible}
        onClose={handleCloseDifficultyDrawer}
        onSelect={handleSelectDifficulty}
        current={difficultyTargetWord?.difficulty}
      />

      <AddWordModal
        visible={isAddModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitWord}
        editingWord={editingWord || undefined}
      />

      <AddWordAIModal
        visible={isAddAIModalVisible}
        onClose={handleCloseAIModal}
        onSubmit={handleSubmitAIWord}
      />

      <BulkImportModal
        visible={isBulkImportModalVisible}
        onClose={handleCloseBulkImportModal}
        onImport={handleBulkImport}
      />

      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={handleCloseSettingsModal}
        onSave={handleSaveSettings}
        initialSettings={appSettings}
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
  settingsButton: {
    padding: 8,
    borderRadius: 8,
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

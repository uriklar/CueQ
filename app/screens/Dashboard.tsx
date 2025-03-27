import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { WordList } from "../components/WordList";
import { AddWordModal } from "../components/AddWordModal";
import { ImportCSVModal } from "../components/ImportCSVModal";
import { Word, Difficulty } from "../types";
import { getStoredWords } from "../utils/wordUtils";
import { getBacklogWords, moveWordsFromBacklog } from "../utils/backlogUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@french_cards_words";

export const Dashboard = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [backlogCount, setBacklogCount] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

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

  const handleAddWord = async (newWord: Omit<Word, "id">) => {
    const id = Date.now().toString();
    const wordWithId: Word = {
      ...newWord,
      id,
    };

    try {
      const storedWordsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const storedWords: Record<string, Word> = storedWordsJson
        ? JSON.parse(storedWordsJson)
        : {};

      storedWords[id] = wordWithId;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));

      setWords((current) => [...current, wordWithId]);
    } catch (error) {
      console.error("Error adding word:", error);
    }
  };

  const handleImportComplete = () => {
    loadBacklogCount();
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>French Words</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={[styles.button, styles.importButton]}
            onPress={() => setIsImportModalVisible(true)}
          >
            <Text style={styles.buttonText}>Import CSV</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.addButton]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.buttonText}>Add Word</Text>
          </Pressable>
        </View>
      </View>

      {backlogCount > 0 && (
        <Pressable style={styles.backlogButton} onPress={handleLoadFromBacklog}>
          <Text style={styles.backlogButtonText}>
            Load 10 words from backlog ({backlogCount} remaining)
          </Text>
        </Pressable>
      )}

      <WordList
        words={words}
        selectedDifficulty={selectedDifficulty}
        onDifficultySelect={setSelectedDifficulty}
      />

      <AddWordModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddWord}
      />

      <ImportCSVModal
        visible={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        onImportComplete={handleImportComplete}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
  backlogButton: {
    backgroundColor: "#FF9800",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backlogButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

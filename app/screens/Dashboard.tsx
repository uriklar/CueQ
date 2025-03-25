import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { WordList } from "../components/WordList";
import { AddWordModal } from "../components/AddWordModal";
import { Word, Difficulty } from "../types";
import { getStoredWords } from "../utils/wordUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@french_cards_words";

export const Dashboard = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    const storedWords = await getStoredWords();
    setWords(storedWords);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>French Words</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Word</Text>
        </Pressable>
      </View>

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
  addButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Word, SwipeDirection } from "../types";
import { WordCard } from "./WordCard";
import { WordInfoPanel } from "./WordInfoPanel";
import { SwipeActionButtons } from "./SwipeActionButtons";
import { AddWordModal } from "./AddWordModal";

interface CardStackProps {
  words: Word[];
  onSwipe: (word: Word, direction: SwipeDirection) => void;
  onUpdateWord: (updatedWord: Word) => void;
}

export const CardStack: React.FC<CardStackProps> = ({
  words,
  onSwipe,
  onUpdateWord,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [wordToEdit, setWordToEdit] = useState<Word | null>(null);

  const handleButtonPress = (direction: SwipeDirection) => {
    if (currentIndex < words.length) {
      const currentWord = words[currentIndex];
      onSwipe(currentWord, direction);
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    }
  };

  const handleLongPressOnCard = (word: Word) => {
    setWordToEdit(word);
    setIsEditModalVisible(true);
  };

  const handleModalSubmit = (
    updatedWordData: Word | Omit<Word, "id">,
    isEdit: boolean
  ) => {
    if (isEdit && wordToEdit) {
      const fullUpdatedWord: Word = {
        ...wordToEdit,
        ...(updatedWordData as Partial<Word>),
        id: wordToEdit.id,
      };
      onUpdateWord(fullUpdatedWord);
    }
    setIsEditModalVisible(false);
    setWordToEdit(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setWordToEdit(null);
  };

  if (currentIndex >= words.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMoreCards}>No more cards!</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <View style={styles.container}>
      <WordInfoPanel word={currentWord} />

      <View style={styles.cardContainer}>
        <WordCard
          {...currentWord}
          isRevealed={isRevealed}
          onReveal={() => setIsRevealed(!isRevealed)}
          onLongPress={() => handleLongPressOnCard(currentWord)}
        />
      </View>

      <View style={styles.spacer} />

      <SwipeActionButtons onSwipe={handleButtonPress} />

      {wordToEdit && (
        <AddWordModal
          visible={isEditModalVisible}
          onClose={handleCloseEditModal}
          onSubmit={handleModalSubmit}
          editingWord={wordToEdit}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  cardContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  spacer: {
    height: 20,
  },
  noMoreCards: {
    fontSize: 24,
    color: "#666",
    marginTop: "50%",
  },
});

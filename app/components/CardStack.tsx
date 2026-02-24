import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Word, SwipeDirection } from "../types";
import { WordCard } from "./WordCard";
import { useCardStack } from "../hooks/useCardStack";
import { AddWordModal } from "./AddWordModal/index";
import { BlurView } from "expo-blur";
import * as Speech from "expo-speech";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

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
  const {
    currentWord,
    currentIndex,
    isRevealed,
    setIsRevealed,
    exampleSentence,
    isLoadingSentence,
    sentenceError,
    handleButtonPress,
    handleGetExampleSentence,
  } = useCardStack({ words, onSwipe });

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [wordToEdit, setWordToEdit] = useState<Word | null>(null);

  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [showBottomBlur, setShowBottomBlur] = useState(false);

  const [translatedExample, setTranslatedExample] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Reset translation when example changes
  useEffect(() => {
    setTranslatedExample(null);
    setIsTranslating(false);
  }, [exampleSentence]);

  const handleSpeakExample = () => {
    if (exampleSentence) {
      Speech.speak(exampleSentence, { language: "fr-FR" });
    }
  };

  const handleTranslateExample = async () => {
    if (!exampleSentence) return;
    setIsTranslating(true);
    try {
      const encoded = encodeURIComponent(exampleSentence);
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encoded}&langpair=fr|en`
      );
      const data = await res.json();
      const translation = data?.responseData?.translatedText;
      setTranslatedExample(translation || "Translation unavailable");
    } catch {
      setTranslatedExample("Translation failed. Try again.");
    } finally {
      setIsTranslating(false);
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
      <View style={styles.emptyContainer}>
        <Text style={styles.noMoreCards}>No more cards!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <Pressable
          style={styles.sentenceButton}
          onPress={handleGetExampleSentence}
          disabled={isLoadingSentence}
        >
          <Text style={styles.sentenceButtonText}>
            {isLoadingSentence
              ? "Loading..."
              : currentWord?.examples
              ? "Show Examples"
              : "Use it in a sentence"}
          </Text>
        </Pressable>
      </View>

      {/* Example & Error Section */}
      <View style={styles.exampleSection}>
        {isLoadingSentence && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        )}

        {exampleSentence && (
          <View
            style={styles.sentenceContainer}
            onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
          >
            {/* Example text row with speaker icon */}
            <View style={styles.exampleRow}>
              <ScrollView
                style={styles.exampleScrollView}
                showsVerticalScrollIndicator={true}
                onContentSizeChange={(w, h) => setContentHeight(h)}
                onScroll={(e) => {
                  const y = e.nativeEvent.contentOffset.y;
                  setShowBottomBlur(y + containerHeight < contentHeight);
                }}
                scrollEventThrottle={16}
              >
                <Text style={styles.sentenceText} selectable={true}>
                  {exampleSentence}
                </Text>
              </ScrollView>
              <TouchableOpacity
                onPress={handleSpeakExample}
                style={styles.speakerIcon}
                accessibilityLabel="Play example pronunciation"
              >
                <MaterialIcons name="volume-up" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>

            {/* Translation */}
            {translatedExample && (
              <Text style={styles.translationText}>{translatedExample}</Text>
            )}

            {/* Translate button */}
            {!translatedExample && (
              <TouchableOpacity
                style={styles.translateButton}
                onPress={handleTranslateExample}
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.translateButtonText}>Translate</Text>
                )}
              </TouchableOpacity>
            )}

            {showBottomBlur && (
              <BlurView
                intensity={10}
                style={styles.bottomBlur}
                tint="light"
                pointerEvents="none"
              />
            )}
          </View>
        )}

        {sentenceError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{sentenceError}</Text>
          </View>
        )}
      </View>

      {/* Card */}
      <View style={styles.cardWrapper}>
        {currentWord && (
          <WordCard
            {...currentWord}
            isRevealed={isRevealed}
            onReveal={() => setIsRevealed(!isRevealed)}
            onLongPress={() => handleLongPressOnCard(currentWord)}
          />
        )}
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.bottomButton, styles.hardButton]}
          onPress={() => handleButtonPress("left")}
        >
          <Text style={styles.buttonText}>Don't Know</Text>
        </Pressable>
        <Pressable
          style={[styles.bottomButton, styles.mediumButton]}
          onPress={() => handleButtonPress("up")}
        >
          <Text style={styles.buttonText}>Kind Of</Text>
        </Pressable>
        <Pressable
          style={[styles.bottomButton, styles.easyButton]}
          onPress={() => handleButtonPress("right")}
        >
          <Text style={styles.buttonText}>Know Well</Text>
        </Pressable>
      </View>

      {/* Edit Modal */}
      {wordToEdit && (
        <AddWordModal
          visible={isEditModalVisible}
          onClose={handleCloseEditModal}
          onSubmit={handleModalSubmit}
          editingWord={wordToEdit}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topControls: {
    alignItems: "center",
    marginTop: 8,
  },
  exampleSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
  },
  bottomButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  hardButton: {
    backgroundColor: "#F44336",
  },
  mediumButton: {
    backgroundColor: "#2196F3",
  },
  easyButton: {
    backgroundColor: "#4CAF50",
  },
  noMoreCards: {
    fontSize: 24,
    color: "#666",
  },
  sentenceButton: {
    backgroundColor: "#9C27B0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  sentenceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  sentenceContainer: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: CARD_WIDTH,
    maxHeight: 220,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  exampleScrollView: {
    flex: 1,
    maxHeight: 100,
  },
  sentenceText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  speakerIcon: {
    marginLeft: 8,
    paddingTop: 2,
  },
  translateButton: {
    marginTop: 10,
    backgroundColor: "#FF9800",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: "flex-start",
    minWidth: 80,
    alignItems: "center",
  },
  translateButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  translationText: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
    lineHeight: 20,
  },
  loadingContainer: {
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: CARD_WIDTH,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  bottomBlur: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
  },
});

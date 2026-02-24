import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Word, WordInfoMode } from "../types";
import { getExampleSentence } from "../services/gemini";
import { generateFrenchExample } from "../services/openai";
import { isVerb } from "../utils/wordUtils";
import * as Speech from "expo-speech";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface WordInfoPanelProps {
  word: Word;
}

export const WordInfoPanel: React.FC<WordInfoPanelProps> = ({ word }) => {
  const [currentMode, setCurrentMode] = useState<WordInfoMode>(null);
  const [exampleSentence, setExampleSentence] = useState<string | null>(null);
  const [isLoadingSentence, setIsLoadingSentence] = useState(false);
  const [sentenceError, setSentenceError] = useState<string | null>(null);
  const [translatedExample, setTranslatedExample] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Reset panel state when word changes
  useEffect(() => {
    setCurrentMode(null);
    setExampleSentence(null);
    setIsLoadingSentence(false);
    setSentenceError(null);
    setTranslatedExample(null);
    setIsTranslating(false);
  }, [word]);

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

  const wordIsVerb = isVerb(word);

  const handleGetExampleSentence = async () => {
    if (currentMode === "examples") {
      // Toggle off if already selected
      setCurrentMode(null);
      setExampleSentence(null);
      setSentenceError(null);
      return;
    }

    if (word.examples) {
      setExampleSentence(word.examples);
      setCurrentMode("examples");
      return;
    }

    setIsLoadingSentence(true);
    setSentenceError(null);
    setCurrentMode("examples");

    try {
      const sentence = await getExampleSentence(word.french);
      setExampleSentence(sentence);
    } catch (error) {
      setSentenceError("Failed to fetch example sentence. Please try again.");
    } finally {
      setIsLoadingSentence(false);
    }
  };

  const handleShowConjugation = async () => {
    if (currentMode === "conjugation") {
      setCurrentMode(null);
    } else {
      setCurrentMode("conjugation");
    }
    setExampleSentence(null);
    setSentenceError(null);
    setTranslatedExample(null);
  };

  const handleShowPastParticiple = async () => {
    if (currentMode === "past_participle") {
      setCurrentMode(null);
    } else {
      setCurrentMode("past_participle");
    }
    setExampleSentence(null);
    setSentenceError(null);
    setTranslatedExample(null);
  };

  const renderContent = () => {
    if (isLoadingSentence) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      );
    }

    if (currentMode === "examples") {
      if (sentenceError) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{sentenceError}</Text>
          </View>
        );
      }
      if (exampleSentence) {
        return (
          <View style={styles.contentContainer}>
            <View style={styles.exampleRow}>
              <Text style={[styles.contentText, { flex: 1 }]} selectable={true}>
                {exampleSentence}
              </Text>
              <TouchableOpacity
                onPress={handleSpeakExample}
                style={styles.speakerIcon}
                accessibilityLabel="Play example pronunciation"
              >
                <MaterialIcons name="volume-up" size={22} color="#2196F3" />
              </TouchableOpacity>
            </View>
            {translatedExample ? (
              <Text style={styles.translationText}>{translatedExample}</Text>
            ) : (
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
          </View>
        );
      }
    }

    if (currentMode === "conjugation" && word.conjugation) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentLabel}>Conjugation:</Text>
          <Text style={styles.contentText} selectable={true}>
            {word.conjugation}
          </Text>
        </View>
      );
    }

    if (currentMode === "past_participle" && word.past_particle) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentLabel}>Past Participle:</Text>
          <Text style={styles.contentText} selectable={true}>
            {word.past_particle}
          </Text>
        </View>
      );
    }

    return null;
  };

  // Create button group array based on word type
  const getButtonGroupConfig = () => {
    const buttons = [
      {
        key: "examples",
        label: isLoadingSentence ? "Loading..." : "Examples",
        onPress: () => handleGetExampleSentence(),
        disabled: isLoadingSentence,
      },
    ];

    if (wordIsVerb && word.conjugation) {
      buttons.push({
        key: "conjugation",
        label: "Conjugation",
        onPress: () => handleShowConjugation(),
        disabled: false,
      });
    }

    if (wordIsVerb && word.past_particle) {
      buttons.push({
        key: "past_participle",
        label: "Past Participle",
        onPress: () => handleShowPastParticiple(),
        disabled: false,
      });
    }

    return buttons;
  };

  const renderButtons = () => {
    const buttonConfig = getButtonGroupConfig();
    const isSingle = buttonConfig.length === 1;

    if (isSingle) {
      const button = buttonConfig[0];
      const isSelected = currentMode === button.key;

      return (
        <Pressable
          style={[
            styles.singleButton,
            isSelected && styles.singleButtonSelected,
            button.disabled && styles.disabledButton,
          ]}
          onPress={button.onPress}
          disabled={button.disabled}
        >
          <Text
            style={[
              styles.singleButtonText,
              isSelected && styles.selectedButtonText,
              button.disabled && styles.disabledButtonText,
            ]}
          >
            {button.label}
          </Text>
        </Pressable>
      );
    }

    // Button group for verbs
    return (
      <View style={styles.buttonGroup}>
        {buttonConfig.map((button, index) => {
          const isFirst = index === 0;
          const isLast = index === buttonConfig.length - 1;
          const isSelected = currentMode === button.key;

          return (
            <Pressable
              key={button.key}
              style={[
                styles.groupButton,
                isFirst && styles.firstButton,
                isLast && styles.lastButton,
                isSelected && styles.selectedGroupButton,
                button.disabled && styles.disabledButton,
              ]}
              onPress={button.onPress}
              disabled={button.disabled}
            >
              <Text
                style={[
                  styles.groupButtonText,
                  isSelected && styles.selectedButtonText,
                  button.disabled && styles.disabledButtonText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {button.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderButtons()}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    padding: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    alignSelf: "center",
  },
  singleButtonGroup: {
    backgroundColor: "transparent",
    padding: 0,
    borderWidth: 0,
    alignSelf: "center",
  },
  groupButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    minWidth: 80,
  },
  firstButton: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  lastButton: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  singleButton: {
    backgroundColor: "#9C27B0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    marginBottom: 10,
  },
  singleButtonSelected: {
    backgroundColor: "#7B1FA2",
  },
  singleButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedGroupButton: {
    backgroundColor: "#9C27B0",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  groupButtonText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedButtonText: {
    color: "white",
    fontWeight: "700",
  },
  disabledButtonText: {
    color: "#999",
  },
  loadingContainer: {
    paddingVertical: 15,
  },
  contentContainer: {
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 8,
    width: CARD_WIDTH,
    marginTop: 0,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  contentText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 8,
    borderRadius: 8,
    width: CARD_WIDTH,
    marginTop: 0,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
});

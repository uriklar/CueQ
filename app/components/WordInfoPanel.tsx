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
import { colors, shadows, spacing, borderRadius } from "../theme";

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
          <ActivityIndicator size="small" color={colors.primary} />
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
                <MaterialIcons name="volume-up" size={22} color={colors.primary} />
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
                  <ActivityIndicator size="small" color={colors.surface} />
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
    marginBottom: spacing.md,
  },
  buttonGroup: {
    flexDirection: "row",
    backgroundColor: colors.neutral200,
    borderRadius: borderRadius.sm,
    padding: 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral200,
    alignSelf: "center",
  },
  groupButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    minWidth: 80,
  },
  firstButton: {
    borderTopLeftRadius: borderRadius.sm,
    borderBottomLeftRadius: borderRadius.sm,
  },
  lastButton: {
    borderTopRightRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
  },
  singleButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    marginBottom: spacing.md,
  },
  singleButtonSelected: {
    backgroundColor: colors.primaryLight,
  },
  singleButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedGroupButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  groupButtonText: {
    color: colors.neutral500,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedButtonText: {
    color: colors.surface,
    fontWeight: "700",
  },
  disabledButtonText: {
    color: colors.neutral300,
  },
  loadingContainer: {
    paddingVertical: 15,
  },
  contentContainer: {
    backgroundColor: colors.neutral50,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    width: CARD_WIDTH,
    marginTop: 0,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral500,
    marginBottom: spacing.xs,
  },
  contentText: {
    fontSize: 16,
    color: colors.neutral700,
    lineHeight: 20,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  speakerIcon: {
    marginLeft: spacing.sm,
    paddingTop: 2,
  },
  translateButton: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
    minWidth: 80,
    alignItems: "center",
  },
  translateButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },
  translationText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.neutral500,
    fontStyle: "italic",
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    width: CARD_WIDTH,
    marginTop: 0,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
});

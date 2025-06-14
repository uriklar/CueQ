import { useCallback, useMemo, useState } from "react";
import { Word, SwipeDirection } from "../types";
import { getExampleSentence } from "../services/gemini";

interface UseCardStackParams {
  words: Word[];
  onSwipe: (word: Word, direction: SwipeDirection) => void;
}

export const useCardStack = ({ words, onSwipe }: UseCardStackParams) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [exampleSentence, setExampleSentence] = useState<string | null>(null);
  const [isLoadingSentence, setIsLoadingSentence] = useState(false);
  const [sentenceError, setSentenceError] = useState<string | null>(null);

  const currentWord = useMemo(() => words[currentIndex], [words, currentIndex]);

  const handleButtonPress = useCallback(
    (direction: SwipeDirection) => {
      if (currentIndex >= words.length) return;
      const word = words[currentIndex];
      onSwipe(word, direction);
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      setExampleSentence(null);
      setSentenceError(null);
    },
    [currentIndex, onSwipe, words]
  );

  const handleGetExampleSentence = useCallback(async () => {
    if (!currentWord) return;

    if (currentWord.examples) {
      setExampleSentence(currentWord.examples);
      return;
    }

    setIsLoadingSentence(true);
    setSentenceError(null);
    try {
      const sentence = await getExampleSentence(currentWord.french);
      setExampleSentence(sentence);
    } catch {
      setSentenceError("Failed to fetch example sentence. Please try again.");
    } finally {
      setIsLoadingSentence(false);
    }
  }, [currentWord]);

  return {
    currentWord,
    currentIndex,
    isRevealed,
    setIsRevealed,
    exampleSentence,
    isLoadingSentence,
    sentenceError,
    handleButtonPress,
    handleGetExampleSentence,
  } as const;
};

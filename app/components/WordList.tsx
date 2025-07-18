import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Word, Difficulty } from "../types";
import { SearchInput } from "./SearchInput";
import { Swipeable } from "react-native-gesture-handler";

interface WordListProps {
  words: Word[];
  selectedDifficulty: Difficulty | "all" | "new";
  onDifficultySelect: (difficulty: Difficulty | "all" | "new") => void;
  onEditWord: (word: Word) => void;
  onDeleteWord: (wordId: string) => void;
  /**
   * Optional callback that is called whenever the list of words currently visible
   * after all filters/search are applied changes. Allows parent components
   * (e.g. Dashboard) to know which words are on screen.
   */
  onVisibleWordsChange?: (visibleWords: Word[]) => void;
  /**
   * Called when the user taps on a word's difficulty badge so the parent can
   * open a picker / modal to change the difficulty.
   */
  onDifficultyBadgePress: (word: Word) => void;
}

const DifficultyFilter: React.FC<{
  selected: Difficulty | "all" | "new";
  onSelect: (difficulty: Difficulty | "all" | "new") => void;
}> = ({ selected, onSelect }) => {
  const filters: (Difficulty | "all" | "new")[] = [
    "all",
    "new",
    "easy",
    "medium",
    "hard",
  ];

  return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <Pressable
          key={filter}
          style={[
            styles.filterButton,
            selected === filter && styles.filterButtonSelected,
          ]}
          onPress={() => onSelect(filter)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selected === filter && styles.filterButtonTextSelected,
            ]}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export const WordList: React.FC<WordListProps> = ({
  words,
  selectedDifficulty,
  onDifficultySelect,
  onEditWord,
  onDeleteWord,
  onVisibleWordsChange,
  onDifficultyBadgePress,
}) => {
  const [search, setSearch] = React.useState("");

  let filteredByDifficulty: Word[];
  if (selectedDifficulty === "all") {
    filteredByDifficulty = words;
  } else if (selectedDifficulty === "new") {
    filteredByDifficulty = words.filter((word) => !word.difficulty);
  } else {
    filteredByDifficulty = words.filter(
      (word) => word.difficulty === selectedDifficulty
    );
  }

  const filteredWords = filteredByDifficulty.filter(
    (word) =>
      word.french.toLowerCase().includes(search.toLowerCase()) ||
      word.english.toLowerCase().includes(search.toLowerCase()) ||
      (word.examples &&
        word.examples.toLowerCase().includes(search.toLowerCase()))
  );

  // Notify parent only when the *contents* of the visible words list changes,
  // not on every render. This avoids triggering an update loop between parent
  // and child (filteredWords is a new array reference each render).
  const prevIdsRef = React.useRef<string>("");
  React.useEffect(() => {
    if (!onVisibleWordsChange) return;

    const currentIds = filteredWords.map((w) => w.id).join(",");
    if (currentIds !== prevIdsRef.current) {
      prevIdsRef.current = currentIds;
      onVisibleWordsChange(filteredWords);
    }
  }, [filteredWords, onVisibleWordsChange]);

  const renderItem = ({ item }: { item: Word }) => {
    const getGenderMark = () => {
      if (!item.gender) return "";
      return item.gender === "masculine" ? " (m)" : " (f)";
    };

    const renderRightActions = (progress: any, dragX: any, wordId: string) => {
      const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: "clamp",
      });
      return (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteWord(wordId)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item.id)
        }
        overshootRight={false}
      >
        <Pressable
          onPress={() => onEditWord(item)}
          style={styles.wordItemPressable}
        >
          <View style={styles.wordItem}>
            <View style={styles.wordContent}>
              <Text style={styles.frenchText}>
                {item.french}
                {getGenderMark()}
              </Text>
              <Text style={styles.englishText}>{item.english}</Text>
              {item.examples ? (
                <Text style={styles.examplesText}>{item.examples}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => onDifficultyBadgePress(item)}
              style={[
                styles.difficultyBadge,
                getDifficultyStyle(item.difficulty),
              ]}
            >
              <Text style={styles.difficultyText}>
                {item.difficulty || "new"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <DifficultyFilter
        selected={selectedDifficulty}
        onSelect={onDifficultySelect}
      />
      <SearchInput value={search} onChangeText={setSearch} />
      <FlatList
        data={filteredWords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const getDifficultyStyle = (difficulty?: Difficulty) => {
  switch (difficulty) {
    case "easy":
      return styles.easyBadge;
    case "medium":
      return styles.mediumBadge;
    case "hard":
      return styles.hardBadge;
    default:
      return styles.newBadge;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  filterButtonSelected: {
    backgroundColor: "#2196F3",
  },
  filterButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  filterButtonTextSelected: {
    color: "white",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  wordItemPressable: {
    marginBottom: 8,
  },
  wordItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  wordContent: {
    flex: 1,
  },
  frenchText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  englishText: {
    fontSize: 16,
    color: "#666",
  },
  examplesText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  easyBadge: {
    backgroundColor: "#4CAF50",
  },
  mediumBadge: {
    backgroundColor: "#2196F3",
  },
  hardBadge: {
    backgroundColor: "#F44336",
  },
  newBadge: {
    backgroundColor: "#9E9E9E",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    paddingVertical: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

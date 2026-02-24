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
import { colors, shadows, spacing, borderRadius } from "../theme";

interface WordListProps {
  words: Word[];
  selectedDifficulty: Difficulty | "all" | "new";
  onDifficultySelect: (difficulty: Difficulty | "all" | "new") => void;
  onEditWord: (word: Word) => void;
  onDeleteWord: (wordId: string) => void;
  onPressDifficulty: (word: Word) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  filteredCount: number;
  totalCount: number;
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
  onPressDifficulty,
  searchText,
  onSearchChange,
  filteredCount,
  totalCount,
}) => {
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

  const renderItem = ({ item }: { item: Word }) => {
    const getGenderMark = () => {
      if (!item.gender) return "";
      return item.gender === "masculine" ? " (m)" : " (f)";
    };

    const renderRightActions = (
      progress: unknown,
      dragX: any,
      wordId: string
    ) => {
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

    const getDifficultyBadgeStyle = () => {
      switch (item.difficulty) {
        case "easy":
          return { bg: colors.successLight, text: colors.success };
        case "medium":
          return { bg: colors.warningLight, text: colors.warning };
        case "hard":
          return { bg: colors.dangerLight, text: colors.danger };
        default:
          return { bg: colors.neutral200, text: colors.neutral500 };
      }
    };

    const badgeColors = getDifficultyBadgeStyle();

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
            <View style={styles.wordAccent} />
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
              onPress={() => onPressDifficulty(item)}
              style={[
                styles.difficultyBadge,
                { backgroundColor: badgeColors.bg },
              ]}
            >
              <Text style={[styles.difficultyText, { color: badgeColors.text }]}>
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
      <SearchInput value={searchText} onChangeText={onSearchChange} />
      <View style={styles.wordCount}>
        <Text style={styles.wordCountText}>
          {filteredCount} of {totalCount} words
        </Text>
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral100,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  filterButtonSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryLight,
  },
  filterButtonText: {
    color: colors.neutral500,
    fontWeight: "600",
  },
  filterButtonTextSelected: {
    color: colors.primary,
  },
  wordCount: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  wordCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral500,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  wordItemPressable: {
    marginBottom: spacing.sm,
  },
  wordItem: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    overflow: "hidden",
    ...shadows.md,
  },
  wordAccent: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  wordContent: {
    flex: 1,
  },
  frenchText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.neutral900,
    marginBottom: spacing.xs,
  },
  englishText: {
    fontSize: 16,
    color: colors.neutral500,
  },
  examplesText: {
    fontSize: 14,
    color: colors.neutral500,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
  },
  deleteButtonText: {
    color: colors.surface,
    fontWeight: "bold",
  },
});

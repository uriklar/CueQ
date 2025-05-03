import React from "react";
import { StyleSheet, View, Text, FlatList, Pressable } from "react-native";
import { Word, Difficulty } from "../types";
import { SearchInput } from "./SearchInput";

interface WordListProps {
  words: Word[];
  selectedDifficulty: Difficulty | "all";
  onDifficultySelect: (difficulty: Difficulty | "all") => void;
}

const DifficultyFilter: React.FC<{
  selected: Difficulty | "all";
  onSelect: (difficulty: Difficulty | "all") => void;
}> = ({ selected, onSelect }) => {
  const filters: (Difficulty | "all")[] = ["all", "easy", "medium", "hard"];

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
}) => {
  const [search, setSearch] = React.useState("");

  const filteredWords = (
    selectedDifficulty === "all"
      ? words
      : words.filter((word) => word.difficulty === selectedDifficulty)
  ).filter(
    (word) =>
      word.french.toLowerCase().includes(search.toLowerCase()) ||
      word.english.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Word }) => (
    <View style={styles.wordItem}>
      <View style={styles.wordContent}>
        <Text style={styles.frenchText}>{item.french}</Text>
        <Text style={styles.englishText}>{item.english}</Text>
      </View>
      <View
        style={[styles.difficultyBadge, getDifficultyStyle(item.difficulty)]}
      >
        <Text style={styles.difficultyText}>{item.difficulty || "new"}</Text>
      </View>
    </View>
  );

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
  wordItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
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
});

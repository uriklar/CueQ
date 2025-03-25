import { View, StyleSheet, Pressable, Text } from "react-native";
import { useState } from "react";
import { CardStack } from "./components/CardStack";
import { Dashboard } from "./screens/Dashboard";
import { Word, SwipeDirection } from "./types";
import { saveWordWithDifficulty, getSwipeDifficulty } from "./utils/wordUtils";

export default function Page() {
  const [showDashboard, setShowDashboard] = useState(true);

  const handleSwipe = async (word: Word, direction: SwipeDirection) => {
    const difficulty = getSwipeDifficulty(direction);
    await saveWordWithDifficulty(word, difficulty);
  };

  return (
    <View style={styles.container}>
      {showDashboard ? (
        <>
          <Dashboard />
          <Pressable
            style={styles.floatingButton}
            onPress={() => setShowDashboard(false)}
          >
            <Text style={styles.floatingButtonText}>Start Practice</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            style={styles.backButton}
            onPress={() => setShowDashboard(true)}
          >
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </Pressable>
          <CardStack
            words={[
              { id: "1", french: "Bonjour", english: "Hello" },
              { id: "2", french: "Au revoir", english: "Goodbye" },
              { id: "3", french: "Merci", english: "Thank you" },
              { id: "4", french: "S'il vous plaît", english: "Please" },
              { id: "5", french: "Oui", english: "Yes" },
            ]}
            onSwipe={handleSwipe}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
});

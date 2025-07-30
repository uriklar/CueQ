import React from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { SwipeDirection } from "../types";

interface SwipeActionButtonsProps {
  onSwipe: (direction: SwipeDirection) => void;
}

export const SwipeActionButtons: React.FC<SwipeActionButtonsProps> = ({
  onSwipe,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[styles.button, styles.hardButton]}
        onPress={() => onSwipe("left")}
      >
        <Text style={styles.buttonText}>Don't Know</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.mediumButton]}
        onPress={() => onSwipe("up")}
      >
        <Text style={styles.buttonText}>Kind Of</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.easyButton]}
        onPress={() => onSwipe("right")}
      >
        <Text style={styles.buttonText}>Know Well</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 50,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  hardButton: {
    backgroundColor: "#F44336", // Red
  },
  mediumButton: {
    backgroundColor: "#2196F3", // Blue
  },
  easyButton: {
    backgroundColor: "#4CAF50", // Green
  },
});

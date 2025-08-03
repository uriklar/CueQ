import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { PracticeDistribution } from "../utils/settingsUtils";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (distribution: PracticeDistribution) => void;
  initialDistribution: PracticeDistribution;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialDistribution,
}) => {
  const [distribution, setDistribution] =
    useState<PracticeDistribution>(initialDistribution);

  useEffect(() => {
    setDistribution(initialDistribution);
  }, [initialDistribution, visible]);

  const adjustDistribution = (
    type: keyof PracticeDistribution,
    newValue: number
  ) => {
    const oldValue = distribution[type];
    const difference = newValue - oldValue;

    if (Math.abs(difference) < 0.01) return; // Avoid tiny changes

    // Create a copy of current distribution
    const newDistribution = { ...distribution };
    newDistribution[type] = newValue;

    // Find which category has the highest value (excluding the one being changed)
    const otherCategories = Object.keys(distribution).filter(
      (key) => key !== type
    ) as (keyof PracticeDistribution)[];

    // Sort by current value descending to reduce from the largest
    otherCategories.sort((a, b) => newDistribution[b] - newDistribution[a]);

    // Distribute the difference across other categories, starting with the largest
    let remainingDifference = -difference;

    for (const category of otherCategories) {
      if (Math.abs(remainingDifference) < 0.01) break;

      const currentValue = newDistribution[category];
      const maxReduction = Math.min(
        currentValue,
        Math.abs(remainingDifference)
      );

      if (remainingDifference > 0) {
        // We need to increase others
        newDistribution[category] = Math.min(1, currentValue + maxReduction);
        remainingDifference -= maxReduction;
      } else {
        // We need to decrease others
        newDistribution[category] = Math.max(0, currentValue - maxReduction);
        remainingDifference += maxReduction;
      }
    }

    // Ensure the sum is exactly 1 by adjusting the last category if needed
    const sum = Object.values(newDistribution).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.01) {
      const lastCategory = otherCategories[otherCategories.length - 1];
      newDistribution[lastCategory] += 1 - sum;
      newDistribution[lastCategory] = Math.max(
        0,
        Math.min(1, newDistribution[lastCategory])
      );
    }

    setDistribution(newDistribution);
  };

  const handleSave = () => {
    onSave(distribution);
    onClose();
  };

  const handleClose = () => {
    setDistribution(initialDistribution);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Practice Word Distribution</Text>
            <Text style={styles.sectionDescription}>
              Adjust how words are distributed during practice sessions. All
              values must sum to 100%.
            </Text>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>
                  New Words: {Math.round(distribution.new * 100)}%
                </Text>
                <View style={styles.sliderControls}>
                  <Pressable
                    style={[styles.sliderButton, styles.decreaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "new",
                        Math.max(0, distribution.new - 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>-</Text>
                  </Pressable>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          width: `${distribution.new * 100}%`,
                          backgroundColor: "#2196F3",
                        },
                      ]}
                    />
                  </View>
                  <Pressable
                    style={[styles.sliderButton, styles.increaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "new",
                        Math.min(1, distribution.new + 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>
                  Hard Words: {Math.round(distribution.hard * 100)}%
                </Text>
                <View style={styles.sliderControls}>
                  <Pressable
                    style={[styles.sliderButton, styles.decreaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "hard",
                        Math.max(0, distribution.hard - 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>-</Text>
                  </Pressable>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          width: `${distribution.hard * 100}%`,
                          backgroundColor: "#F44336",
                        },
                      ]}
                    />
                  </View>
                  <Pressable
                    style={[styles.sliderButton, styles.increaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "hard",
                        Math.min(1, distribution.hard + 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>
                  Medium Words: {Math.round(distribution.medium * 100)}%
                </Text>
                <View style={styles.sliderControls}>
                  <Pressable
                    style={[styles.sliderButton, styles.decreaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "medium",
                        Math.max(0, distribution.medium - 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>-</Text>
                  </Pressable>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          width: `${distribution.medium * 100}%`,
                          backgroundColor: "#FF9800",
                        },
                      ]}
                    />
                  </View>
                  <Pressable
                    style={[styles.sliderButton, styles.increaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "medium",
                        Math.min(1, distribution.medium + 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>
                  Easy Words: {Math.round(distribution.easy * 100)}%
                </Text>
                <View style={styles.sliderControls}>
                  <Pressable
                    style={[styles.sliderButton, styles.decreaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "easy",
                        Math.max(0, distribution.easy - 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>-</Text>
                  </Pressable>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          width: `${distribution.easy * 100}%`,
                          backgroundColor: "#4CAF50",
                        },
                      ]}
                    />
                  </View>
                  <Pressable
                    style={[styles.sliderButton, styles.increaseButton]}
                    onPress={() =>
                      adjustDistribution(
                        "easy",
                        Math.min(1, distribution.easy + 0.05)
                      )
                    }
                  >
                    <Text style={styles.sliderButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Text style={styles.totalText}>
              Total:{" "}
              {Math.round(
                (distribution.new +
                  distribution.hard +
                  distribution.medium +
                  distribution.easy) *
                  100
              )}
              %
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderRow: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  decreaseButton: {
    backgroundColor: "#FF6B6B",
  },
  increaseButton: {
    backgroundColor: "#4ECDC4",
  },
  sliderButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
});

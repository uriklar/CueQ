import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { PracticeDistribution, AppSettings } from "../utils/settingsUtils";
import { colors, shadows, spacing, borderRadius } from "../theme";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  initialSettings: AppSettings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSettings,
}) => {
  const [distribution, setDistribution] = useState<PracticeDistribution>(
    initialSettings.practiceDistribution
  );
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(
    initialSettings.openaiApiKey || ""
  );

  useEffect(() => {
    setDistribution(initialSettings.practiceDistribution);
    setOpenaiApiKey(initialSettings.openaiApiKey || "");
  }, [initialSettings, visible]);

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
    onSave({
      practiceDistribution: distribution,
      openaiApiKey: openaiApiKey,
    });
    onClose();
  };

  const handleClose = () => {
    setDistribution(initialSettings.practiceDistribution);
    setOpenaiApiKey(initialSettings.openaiApiKey || "");
    onClose();
  };

  const getSliderColor = (type: string) => {
    switch (type) {
      case "new":
        return colors.primaryLight;
      case "hard":
        return colors.danger;
      case "medium":
        return colors.warning;
      case "easy":
        return colors.success;
      default:
        return colors.neutral300;
    }
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
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>OpenAI API Configuration</Text>
            <Text style={styles.sectionDescription}>
              Enter your OpenAI API key to enable AI-powered features like
              automatic example generation.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>OpenAI API Key</Text>
              <TextInput
                style={styles.textInput}
                value={openaiApiKey}
                onChangeText={setOpenaiApiKey}
                placeholder="sk-..."
                placeholderTextColor={colors.neutral300}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHelp}>
                Get your API key from https://platform.openai.com/api-keys
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Practice Word Distribution</Text>
            <Text style={styles.sectionDescription}>
              Adjust how words are distributed during practice sessions. All
              values must sum to 100%.
            </Text>

            <View style={styles.sliderContainer}>
              {(["new", "hard", "medium", "easy"] as const).map((type) => (
                <View key={type} style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} Words:{" "}
                    {Math.round(distribution[type] * 100)}%
                  </Text>
                  <View style={styles.sliderControls}>
                    <Pressable
                      style={[styles.sliderButton, styles.decreaseButton]}
                      onPress={() =>
                        adjustDistribution(
                          type,
                          Math.max(0, distribution[type] - 0.05)
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
                            width: `${distribution[type] * 100}%`,
                            backgroundColor: getSliderColor(type),
                          },
                        ]}
                      />
                    </View>
                    <Pressable
                      style={[styles.sliderButton, styles.increaseButton]}
                      onPress={() =>
                        adjustDistribution(
                          type,
                          Math.min(1, distribution[type] + 0.05)
                        )
                      }
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
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
    backgroundColor: colors.overlay,
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral900,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.neutral100,
  },
  cancelButtonText: {
    color: colors.neutral700,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.surface,
    fontWeight: "600",
  },
  scrollView: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral900,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.neutral500,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  sliderContainer: {
    marginBottom: spacing.xl,
  },
  sliderRow: {
    marginBottom: spacing.xxl,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.neutral700,
    marginBottom: spacing.sm,
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
    backgroundColor: colors.neutral300,
  },
  increaseButton: {
    backgroundColor: colors.primary,
  },
  sliderButtonText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "bold",
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral200,
    borderRadius: 4,
    marginHorizontal: spacing.md,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral700,
    textAlign: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.sm,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.neutral700,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    backgroundColor: colors.neutral50,
    color: colors.neutral700,
    marginBottom: spacing.xs,
  },
  inputHelp: {
    fontSize: 12,
    color: colors.neutral500,
    lineHeight: 16,
  },
});

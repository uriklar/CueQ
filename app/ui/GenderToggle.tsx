import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type GenderValue = "masculine" | "feminine" | null;

interface GenderToggleProps {
  value: GenderValue;
  onChange: (value: Exclude<GenderValue, null>) => void;
}

export const GenderToggle: React.FC<GenderToggleProps> = ({
  value,
  onChange,
}) => {
  const isSelected = (g: Exclude<GenderValue, null>) => value === g;

  const renderButton = (g: Exclude<GenderValue, null>, label: string) => (
    <Pressable
      style={[
        styles.genderButton,
        isSelected(g) && styles.genderButtonSelected,
      ]}
      onPress={() => onChange(g)}
    >
      <Text
        style={[
          styles.genderButtonText,
          isSelected(g) && styles.genderButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.genderLabel}>Gender:</Text>
      {renderButton("masculine", "Masculine")}
      {renderButton("feminine", "Feminine")}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  genderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
  },
  genderButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  genderButtonText: {
    fontSize: 14,
    color: "#666",
  },
  genderButtonTextSelected: {
    color: "white",
  },
});

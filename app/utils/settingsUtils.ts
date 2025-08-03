import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PracticeDistribution {
  new: number;
  hard: number;
  medium: number;
  easy: number;
}

const SETTINGS_STORAGE_KEY = "@french_cards_settings";

// Default distribution values
export const DEFAULT_PRACTICE_DISTRIBUTION: PracticeDistribution = {
  new: 0.6, // 60% new words
  hard: 0.2, // 20% hard words
  medium: 0.1, // 10% medium words
  easy: 0.1, // 10% easy words
};

export const saveSettings = async (settings: {
  practiceDistribution: PracticeDistribution;
}) => {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const loadSettings = async (): Promise<{
  practiceDistribution: PracticeDistribution;
}> => {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      return {
        practiceDistribution:
          settings.practiceDistribution || DEFAULT_PRACTICE_DISTRIBUTION,
      };
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }

  return {
    practiceDistribution: DEFAULT_PRACTICE_DISTRIBUTION,
  };
};

export const getPracticeDistribution =
  async (): Promise<PracticeDistribution> => {
    const settings = await loadSettings();
    return settings.practiceDistribution;
  };

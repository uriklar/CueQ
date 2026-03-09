import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppState, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Updates from "expo-updates";

function useOTAUpdates() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (__DEV__) return;

    async function checkForUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {
        // silently ignore update errors
      }
    }

    // Check on mount
    checkForUpdate();

    // Check when app returns to foreground
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        checkForUpdate();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  useOTAUpdates();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

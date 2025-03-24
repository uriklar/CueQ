import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CardStack } from './components/CardStack';
import { Word, SwipeDirection } from './types';
import { saveWordWithDifficulty, getSwipeDifficulty } from './utils/wordUtils';

const sampleWords: Word[] = [
  { id: '1', french: 'Bonjour', english: 'Hello' },
  { id: '2', french: 'Au revoir', english: 'Goodbye' },
  { id: '3', french: 'Merci', english: 'Thank you' },
  { id: '4', french: 'S\'il vous plaît', english: 'Please' },
  { id: '5', french: 'Oui', english: 'Yes' },
];

export default function Page() {
  const handleSwipe = async (word: Word, direction: SwipeDirection) => {
    const difficulty = getSwipeDifficulty(direction);
    await saveWordWithDifficulty(word, difficulty);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <CardStack words={sampleWords} onSwipe={handleSwipe} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});

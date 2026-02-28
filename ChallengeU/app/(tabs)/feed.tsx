import { StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity } from 'lucide-react-native';

export default function FeedScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f4f3ef', dark: '#1D3D47' }}
      headerImage={<Activity size={178} color="#e80e0e" style={styles.headerIcon} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Activity Feed</ThemedText>
      </ThemedView>
      <ThemedText>Users will share workouts and updates here.</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
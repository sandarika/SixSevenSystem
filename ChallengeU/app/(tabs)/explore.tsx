import { StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function EventsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f4f3ef', dark: '#353636' }}
      headerImage={
        <Calendar
          size={310}
          color="#808080"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Events
        </ThemedText>
      </ThemedView>
      <ThemedText>Placeholder for the social events platform.</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

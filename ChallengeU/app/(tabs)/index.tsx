import React from 'react';
import { StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// lucide icons for header or decorations if desired
import { Activity } from 'lucide-react-native';
import { isAuthenticated } from '@/utils/auth';

export default function ActivityScreen() {
  // declarative redirect to avoid navigation-before-mount errors
  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  // fake occupancy data
  const facilities = [
    { name: 'Campus Rec Center', current: 320, capacity: 500 },
    { name: 'East Campus Rec Center', current: 150, capacity: 200 },
    { name: 'Outdoor Adventure Center', current: 85, capacity: 100 },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f4f3ef', dark: '#1D3D47' }}
      headerImage={
        <Activity
          size={178}
          color="#e80e0e"
          style={styles.headerIcon}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Activity Hub</ThemedText>
      </ThemedView>
      <ThemedView style={styles.listContainer}>
        {facilities.map((f, idx) => (
          <ThemedView key={idx} style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.facilityName}>
              {f.name}
            </ThemedText>
            <ThemedText>
              {f.current} / {f.capacity} users
            </ThemedText>
            <ThemedText style={styles.status}>
              {Math.round((f.current / f.capacity) * 100)}% busy
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
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
  listContainer: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  facilityName: {
    fontSize: 18,
  },
  status: {
    marginTop: 4,
    color: '#e80e0e',
    fontWeight: '600',
  },
});

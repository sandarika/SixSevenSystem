import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Redirect } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// lucide icons for header or decorations if desired
import { Dumbbell } from 'lucide-react-native';
import { isAuthenticated } from '@/utils/auth';

export default function ActivityScreen() {
  // declarative redirect to avoid navigation-before-mount errors
  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  // fake occupancy and hours data
  const facilities = [
    { name: 'Campus Rec Center', current: 320, capacity: 500, hours: '5:45 AM - 12 AM', distribution: [20, 30, 40, 60, 80, 100, 90, 70, 50, 40, 30, 20], sports: ['Basketball', 'Volleyball', 'Badminton', 'Pickleball', 'Weights', 'Cardio', 'Football', 'Soccer', 'Swim', 'Racket Ball', 'Yoga'] },
    { name: 'East Campus Rec Center', current: 150, capacity: 200, hours: '5:45 AM - 11 PM', distribution: [10, 20, 30, 50, 70, 90, 80, 60, 40, 30, 20, 10], sports: ['Basketball', 'Volleyball', 'Badminton', 'Pickleball', 'Weights', 'Cardio', 'Football', 'Soccer', 'Swim', 'Racket Ball', 'Yoga'] },
    { name: 'Outdoor Adventure Center', current: 85, capacity: 100, hours: '10 AM - 10 PM', distribution: [0, 0, 0, 10, 30, 50, 60, 50, 40, 30, 20, 10], sports: ['Rock Climbing', 'Cycling'] },
    { name: 'HSSV Courts', current: 60, capacity: 150, hours: '6 AM - 11 PM', distribution: [5, 10, 20, 40, 60, 80, 70, 50, 30, 20, 10, 5], sports: ['Tennis', 'Pickleball', 'Sand Volleyball', 'Basketball'] },
    { name: 'Suite Courts', current: 45, capacity: 80, hours: '6 AM - 11 PM', distribution: [5, 10, 15, 30, 50, 70, 60, 40, 20, 10, 5, 5], sports: ['Sand Volleyball', 'Basketball'] },
    { name: 'Cather Courts', current: 90, capacity: 120, hours: '6 AM - 11 PM', distribution: [10, 20, 30, 50, 70, 90, 80, 60, 40, 30, 20, 10], sports: ['Tennis', 'Pickleball', 'Football', 'Soccer'] },
  ];
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [expandedSportsIndex, setExpandedSportsIndex] = React.useState<number | null>(null);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f4f3ef', dark: '#1D3D47' }}
      headerImage={
        <Dumbbell
          size={178}
          color="#e80e0e"
          style={styles.headerIcon}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Facility Capacity</ThemedText>
      </ThemedView>
      <ThemedView style={styles.listContainer}>
        {facilities.map((f, idx) => {
          const isOpen = expandedIndex === idx;
          return (
            <ThemedView key={idx} style={styles.card}>
              <TouchableOpacity onPress={() => setExpandedIndex(isOpen ? null : idx)}>
                <ThemedText type="defaultSemiBold" style={styles.facilityName}>
                  {f.name} {isOpen ? '▲' : '▼'}
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.status}>
                {Math.round((f.current / f.capacity) * 100)}% busy
              </ThemedText>
              {isOpen && (
                <ThemedView style={styles.details}>
                  <TouchableOpacity onPress={() => setExpandedSportsIndex(expandedSportsIndex === idx ? null : idx)}>
                    <ThemedText style={styles.sportsHeader}>
                      Available Activities {expandedSportsIndex === idx ? '▲' : '▼'}
                    </ThemedText>
                  </TouchableOpacity>
                  {expandedSportsIndex === idx && (
                    <ThemedView style={styles.sportsList}>
                      {f.sports.map((sport, i) => (
                        <ThemedText key={i} style={styles.sportItem}>
                          • {sport}
                        </ThemedText>
                      ))}
                    </ThemedView>
                  )}
                  <ThemedText>Hours: {f.hours}</ThemedText>
                  <ThemedText>Typical wait time: 15-45 min</ThemedText>
                  <ThemedView style={styles.graphContainer}>
                    {f.distribution.map((val, i) => (
                      <ThemedView
                        key={i}
                        style={[
                          styles.bar,
                          {
                            height: `${(val / 100) * 80}%`,
                            backgroundColor: i === 6 ? '#e80e0e' : '#ccc',
                          },
                        ]}
                      />
                    ))}
                  </ThemedView>
                </ThemedView>
              )}
            </ThemedView>
          );
        })}
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
  details: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: '#eee',
    gap: 4,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 80,
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 3,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    paddingVertical: 4,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  sportsHeader: {
    fontWeight: '600',
    color: '#e80e0e',
    marginVertical: 4,
  },
  sportsList: {
    paddingLeft: 12,
    gap: 4,
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingRight: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  sportItem: {
    fontSize: 13,
    color: '#333',
  },
});

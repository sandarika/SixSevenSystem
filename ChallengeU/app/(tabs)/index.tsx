import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Redirect } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CAPACITY_DATASETS } from '@/constants/capacity-data';

// lucide icons for header or decorations if desired
import { Dumbbell } from 'lucide-react-native';
import { isAuthenticated } from '@/utils/auth';

export default function ActivityScreen() {
  // declarative redirect to avoid navigation-before-mount errors
  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  const [currentMinutes, setCurrentMinutes] = React.useState(
    () => new Date().getHours() * 60 + new Date().getMinutes()
  );

  React.useEffect(() => {
    const syncCurrentTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };

    // Align to the next minute boundary, then update every minute.
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      syncCurrentTime();
      intervalId = setInterval(syncCurrentTime, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const toMinutes = (hour: number, minute: number, suffix: string) => {
    let h = hour % 12;
    if (suffix.toLowerCase() === 'pm') h += 12;
    return h * 60 + minute;
  };

  const formatTime = (hour24: number, minute: number) => {
    const suffix = hour24 >= 12 ? 'pm' : 'am';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}${suffix}`;
  };

  const buildHourlyLabels = (startHour24: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
      const hour = (startHour24 + i) % 24;
      return `${formatTime(hour, 0)} - ${formatTime(hour, 59)}`;
    });

  const resampleDistribution = (values: number[], targetLength: number) => {
    if (targetLength <= 0) return [];
    if (values.length === targetLength) return values;
    if (values.length === 0) return Array.from({ length: targetLength }, () => 0);
    if (values.length === 1) return Array.from({ length: targetLength }, () => values[0]);

    const sourceLast = values.length - 1;
    const targetLast = targetLength - 1;
    return Array.from({ length: targetLength }, (_, i) => {
      const srcPos = (i / targetLast) * sourceLast;
      const low = Math.floor(srcPos);
      const high = Math.min(sourceLast, Math.ceil(srcPos));
      const t = srcPos - low;
      const blended = values[low] * (1 - t) + values[high] * t;
      return Math.round(blended);
    });
  };

  const getCurrentIntervalIndex = (timeLabels?: string[], nowMinutes?: number) => {
    if (!timeLabels?.length) return -1;
    const effectiveMinutes = nowMinutes ?? (new Date().getHours() * 60 + new Date().getMinutes());

    for (let i = 0; i < timeLabels.length; i += 1) {
      const label = timeLabels[i];
      const match = label.match(
        /^(\d{2}):(\d{2})(am|pm)\s-\s(\d{2}):(\d{2})(am|pm)$/i
      );
      if (!match) continue;

      const start = toMinutes(Number(match[1]), Number(match[2]), match[3]);
      const end = toMinutes(Number(match[4]), Number(match[5]), match[6]);

      // Intervals are inclusive of start and end minute in this dataset.
      if (effectiveMinutes >= start && effectiveMinutes <= end) {
        return i;
      }
    }

    return -1;
  };

  const toShortHourLabel = (hour24: number, extraShift = 0) => {
    const shiftedHour24 = (hour24 + 1 + extraShift + 24) % 24;
    const hour12 = shiftedHour24 % 12 === 0 ? 12 : shiftedHour24 % 12;
    if (hour12 === 12) return '12';
    return `${hour12}${shiftedHour24 >= 12 ? 'p' : 'a'}`;
  };

  const getHourLabels = (timeLabels?: string[], extraShift = 0) => {
    if (!timeLabels?.length) return [];
    return timeLabels.map((label) => {
      const match = label.match(/^(\d{2}):(\d{2})(am|pm)\s-\s(\d{2}):(\d{2})(am|pm)$/i);
      if (!match) return '';
      const startHour = toMinutes(Number(match[1]), Number(match[2]), match[3]);
      return toShortHourLabel(Math.floor(startHour / 60), extraShift);
    });
  };

  // CREC/RWC distributions are generated from CSVs in data/capacity via scripts/generate-capacity-data.js.
  const facilities = [
    { name: 'Campus Rec Center', current: 320, capacity: 500, hours: '5:45 AM - 12 AM', distribution: CAPACITY_DATASETS.CREC.distribution, timeLabels: CAPACITY_DATASETS.CREC.labels, hourLabelShift: 0, sports: ['Basketball', 'Volleyball', 'Badminton', 'Pickleball', 'Weights', 'Cardio', 'Football', 'Soccer', 'Swim', 'Racket Ball', 'Yoga'] },
    { name: 'East Campus Rec Center', current: 150, capacity: 200, hours: '5:45 AM - 11 PM', distribution: CAPACITY_DATASETS.RWC.distribution, timeLabels: CAPACITY_DATASETS.RWC.labels, hourLabelShift: 0, sports: ['Basketball', 'Volleyball', 'Badminton', 'Pickleball', 'Weights', 'Cardio', 'Football', 'Soccer', 'Swim', 'Racket Ball', 'Yoga'] },
    { name: 'Outdoor Adventure Center', current: 85, capacity: 100, hours: '10 AM - 10 PM', distribution: resampleDistribution([0, 0, 0, 10, 30, 50, 60, 50, 40, 30, 20, 10], 13), timeLabels: buildHourlyLabels(10, 13), hourLabelShift: -1, sports: ['Rock Climbing', 'Cycling'] },
    { name: 'HSSV Courts', current: 60, capacity: 150, hours: '6 AM - 11 PM', distribution: [4, 5, 6, 8, 10, 12, 15, 18, 22, 30, 42, 58, 72, 86, 96, 100, 84, 62], timeLabels: buildHourlyLabels(6, 18), hourLabelShift: -1, sports: ['Tennis', 'Pickleball', 'Sand Volleyball', 'Basketball'] },
    { name: 'Suite Courts', current: 45, capacity: 80, hours: '6 AM - 11 PM', distribution: [3, 4, 5, 7, 9, 12, 18, 26, 36, 48, 60, 72, 84, 92, 100, 90, 70, 52], timeLabels: buildHourlyLabels(6, 18), hourLabelShift: -1, sports: ['Sand Volleyball', 'Basketball'] },
    { name: 'Cather Courts', current: 90, capacity: 120, hours: '6 AM - 11 PM', distribution: [6, 8, 10, 14, 20, 28, 38, 52, 66, 80, 92, 100, 96, 88, 76, 64, 50, 38], timeLabels: buildHourlyLabels(6, 18), hourLabelShift: -1, sports: ['Tennis', 'Pickleball', 'Football', 'Soccer'] },
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
          const currentIntervalIdx = getCurrentIntervalIndex(f.timeLabels, currentMinutes);
          const hourLabels = getHourLabels(f.timeLabels, f.hourLabelShift ?? 0);
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
                  <ThemedView style={styles.graphContainer}>
                    {f.distribution.map((val, i) => (
                      <ThemedView key={i} style={styles.barSlot}>
                        <ThemedView
                          style={[
                            styles.bar,
                            {
                              height: `${(val / 100) * 80}%`,
                              backgroundColor: i === currentIntervalIdx ? '#e80e0e' : '#ccc',
                            },
                          ]}
                        />
                      </ThemedView>
                    ))}
                  </ThemedView>
                  {!!hourLabels.length && (
                    <ThemedView style={styles.graphLabelsContainer}>
                      {hourLabels.map((hourLabel, i) => (
                        <ThemedView key={`hour-${i}`} style={styles.tickCell}>
                          <ThemedText style={styles.tickText}>
                            {i % 3 === 0 ? hourLabel : ''}
                          </ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  )}
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
    backgroundColor: '#fff',
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 80,
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 3,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 4,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#fff',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  graphLabelsContainer: {
    flexDirection: 'row',
    marginTop: 2,
    paddingHorizontal: 4,
    gap: 3,
    backgroundColor: '#fff',
  },
  tickCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tickText: {
    fontSize: 10,
    color: '#e80e0e',
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

import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Colors } from '@/constants/theme';
import { UserRoundPen, X } from 'lucide-react-native';
// chart library (run `expo install react-native-chart-kit react-native-svg`)
// @ts-ignore - types may not be installed in the managed workspace
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { signOut } from '@/utils/auth';

let AppleHealthKit: any = null;
try {
  // optional native module; will be undefined in Expo managed without dev client / native install
  // npm: react-native-health (requires native setup and HealthKit entitlement)
  // This file only requests read permissions (no write).
  // If not installed the UI will show not available.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AppleHealthKit = require('react-native-health');
} catch (e) {
  AppleHealthKit = null;
}

export default function AccountScreen() {
  const [name, setName] = useState<string>('Student');
  const [healthStatus, setHealthStatus] = useState<string>('Not connected');
  const [connected, setConnected] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [historicalSteps, setHistoricalSteps] = useState<number[]>([]);
  const [historicalDistance, setHistoricalDistance] = useState<number[]>([]);
  const [historicalCalories, setHistoricalCalories] = useState<number[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [showCheckinsModal, setShowCheckinsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('studentName');
      if (stored) setName(stored);
      const storedPhoto = await AsyncStorage.getItem('profilePicture');
      if (storedPhoto) setPhotoUri(storedPhoto);
    })();
  }, []);

  const disconnectFromHealth = () => {
    // clear metrics and revert state
    setConnected(false);
    setHealthStatus('Not connected');
    setStepCount(null);
    setDistance(null);
    setCalories(null);
    setHistoricalSteps([]);
    setHistoricalDistance([]);
    setHistoricalCalories([]);
  };

  const connectToHealth = async () => {
    if (Platform.OS !== 'ios') {
      setHealthStatus('HealthKit only available on iOS');
      return;
    }
    if (!AppleHealthKit || !AppleHealthKit.initHealthKit) {
      // expo go or no native install: pretend we're connected with dummy values
      setHealthStatus('Connected');
      setConnected(true);
      setStepCount(6234);
      setDistance(1.8);
      setCalories(220);
      // mock history
      setHistoricalSteps([5067, 6000, 7090, 8000, 9000, 4000, 3200]);
      setHistoricalDistance([1.2, 1.5, 2.0, 2.1, 1.8, 1.3, 1.0]);
      setHistoricalCalories([180, 200, 220, 210, 230, 190, 170]);
      return;
    }

    const permissions = {
      permissions: {
        read: [
          'StepCount',
          'DistanceWalkingRunning',
          'ActiveEnergyBurned',
          // add other read types as needed
        ],
        // no write permissions requested
      },
    };

    AppleHealthKit.initHealthKit(permissions, (err: any) => {
      if (err) {
        setHealthStatus('Permission denied or init error');
        setConnected(false);
        return;
      }
      setHealthStatus('Connected (read permissions granted)');
      setConnected(true);

      // read a sample step count for today
      const options = { startDate: new Date(new Date().setHours(0,0,0,0)).toISOString(), endDate: new Date().toISOString() };
      AppleHealthKit.getStepCount(options, (err2: any, results: any) => {
        if (!err2 && results?.value != null) {
          setStepCount(results.value);
        }
      });
      // also try other metrics if available
      AppleHealthKit.getDistanceWalkingRunning(options, (err3: any, dist: any) => {
        if (!err3 && dist?.value != null) {
          setDistance(dist.value);
        }
      });
      // active energy (calories) samples may return array - grab total or last
      AppleHealthKit.getActiveEnergyBurnedSamples(options, (err4: any, cal: any) => {
        if (!err4 && Array.isArray(cal) && cal.length > 0) {
          const last = cal[cal.length - 1];
          if (last?.value != null) setCalories(last.value);
        }
      });
      // fetch last week of daily totals
      const weekOptions = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      };
      AppleHealthKit.getDailyStepCountSamples(weekOptions, (err5: any, steps: any) => {
        if (!err5 && Array.isArray(steps)) {
          // map array to just values sorted by date
          setHistoricalSteps(steps.map((s: any) => s.value));
        }
      });
      AppleHealthKit.getDailyDistanceWalkingRunningSamples(weekOptions, (err6: any, dists: any) => {
        if (!err6 && Array.isArray(dists)) {
          setHistoricalDistance(dists.map((d: any) => d.value));
        }
      });
      AppleHealthKit.getDailyActiveEnergyBurnedSamples(weekOptions, (err7: any, cals: any) => {
        if (!err7 && Array.isArray(cals)) {
          setHistoricalCalories(cals.map((c: any) => c.value));
        }
      });
    });
  };

  const pickImage = async () => {
    // ask for permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access images is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // demo friend list
  const friends = [
    { id: 1, name: 'Vittoria', photo: 'https://placecats.com/100/100' },
    { id: 2, name: 'Lucy', photo: 'https://placecats.com/101/101' },
    { id: 3, name: 'Sandi', photo: 'https://placecats.com/102/102' },
    { id: 4, name: 'Landen', photo: 'https://placecats.com/103/103' },
    { id: 5, name: 'Mia', photo: 'https://placecats.com/104/104' },
    { id: 6, name: 'Dante', photo: 'https://placecats.com/105/105' },
    { id: 7, name: 'Jake', photo: 'https://placecats.com/106/106' },
    { id: 8, name: 'Kenny', photo: 'https://placecats.com/107/107' },
    { id: 9, name: 'Ivan', photo: 'https://placecats.com/108/108' },
    { id: 10, name: 'Judy', photo: 'https://placecats.com/109/109' },
  ];

  // demo checkins per facility (using capacity names)
  const checkins = [
    { name: 'Campus Rec Center', count: 3 },
    { name: 'East Campus Rec Center', count: 1 },
    { name: 'Outdoor Adventure Center', count: 2 },
    { name: 'HSSV Courts', count: 0 },
    { name: 'Suite Courts', count: 1 },
    { name: 'Cather Courts', count: 4 },
  ];

  return (
    <>
      <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* profile picture centered with padding above */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickImage} style={styles.photoWrapper}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoLarge} />
          ) : (
            <View style={styles.photoPlaceholderLarge}>
              <UserRoundPen size={60} color={Colors.light.tint} />
            </View>
          )}
        </TouchableOpacity>
        <ThemedText
          type="title"
          style={[styles.title, { color: Colors.light.tint, marginTop: 8 }]}
        >
          {name}
        </ThemedText>
      </View>

      {/* friends summary row */}
      <TouchableOpacity onPress={() => setShowFriends(true)} style={styles.accountRow}>
        <ThemedText style={styles.label}>Friends:</ThemedText>
        <ThemedText style={styles.value}>{friends.length}</ThemedText>
      </TouchableOpacity>

      {/* checkins summary row (opens modal) */}
      <TouchableOpacity onPress={() => setShowCheckinsModal(true)} style={styles.accountRow}>
        <ThemedText style={styles.label}>Check‑ins this month:</ThemedText>
        <ThemedText style={styles.value}>{checkins.reduce((sum, c) => sum + c.count, 0)}</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.statusLabel}>Health:</ThemedText>
      <ThemedText style={styles.status}>{healthStatus}</ThemedText>
      <View style={{ height: 12 }} />
      {calories !== null && (
        <ThemedText style={styles.metric}>Calories burned: {calories}</ThemedText>
      )}
      {historicalCalories.length > 0 && (
        <LineChart
          data={{
            labels: historicalCalories.map((_, i) => `${i + 1}`),
            datasets: [{ data: historicalCalories }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: Colors.light.background,
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(232,14,14, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: 'rgba(232,14,14,1)' },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      )}
      {stepCount !== null && (
        <ThemedText style={styles.metric}>Today's steps: {stepCount}</ThemedText>
      )}
      {historicalSteps.length > 0 && (
        <LineChart
          data={{
            labels: historicalSteps.map((_, i) => `${i + 1}`),
            datasets: [{ data: historicalSteps }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: Colors.light.background,
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(14,14,232, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: 'rgba(14,14,232,1)' },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      )}
      {distance !== null && (
        <ThemedText style={styles.metric}>Today's distance: {distance} mi</ThemedText>
      )}
      {historicalDistance.length > 0 && (
        <LineChart
          data={{
            labels: historicalDistance.map((_, i) => `${i + 1}`),
            datasets: [{ data: historicalDistance }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: Colors.light.background,
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(16,119,16, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: 'rgb(16, 119, 16)' },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      )}
      
      <Button
        title={connected ? 'Disconnect Health' : 'Connect to Health'}
        onPress={connected ? disconnectFromHealth : connectToHealth}
      />
      
      <View style={{ height: 24 }} />
      <Button
        title="Logout"
        color={Colors.light.tint}
        onPress={() => {
          signOut();
          router.replace('/login');
        }}
      />
      </ScrollView>
    </ThemedView>

    {/* friends modal */}
    <Modal visible={showFriends} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">My Friends</ThemedText>
            <TouchableOpacity onPress={() => setShowFriends(false)} style={styles.modalClose}>
              <X size={24} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {friends.map((f) => (
              <View key={f.id} style={styles.friendItem}>
                <Image source={{ uri: f.photo }} style={styles.friendPhoto} />
                <ThemedText style={styles.friendName}>{f.name}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* checkins modal */}
    <Modal visible={showCheckinsModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Check-ins</ThemedText>
            <TouchableOpacity onPress={() => setShowCheckinsModal(false)} style={styles.modalClose}>
              <X size={24} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {checkins.map((c) => (
              <View key={c.name} style={styles.checkinItem}>
                <ThemedText style={styles.valueBold}>{c.name}</ThemedText>
                <ThemedText style={styles.value}>{c.count}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  photoSection: {
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginRight: 8 },
  value: { fontSize: 16 },
  valueBold: { fontSize: 16, fontWeight: '500' },
  statusLabel: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  status: { fontSize: 14, color: '#333', marginBottom: 8 },
  metric: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 6 },
  note: { marginTop: 12, fontSize: 12, color: '#666' },
  photoWrapper: {
    marginRight: 12,
  },
  photoLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholderLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  checkinDetails: {
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e80e0e',
  },
  checkinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    // borderBottomWidth: 1,
    // borderBottomColor: '#e80e0e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: Colors.light.background,
    padding: 20,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalClose: {
    padding: 4,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    // borderBottomWidth: 1,
    // borderBottomColor: '#e80e0e',
  },
  friendPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    textAlign: 'center',
    color: Colors.light.tint,
    marginBottom: 10,
  },
});
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Dimensions, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Colors } from '@/constants/theme';
import { Bell, UserRoundPen, X } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
// chart library (run `expo install react-native-chart-kit react-native-svg`)
// @ts-ignore - types may not be installed in the managed workspace
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { signOut } from '@/utils/auth';

const HEALTH_SEED_STORAGE_KEY = 'health_seed_steps_imported_feb2026_v1';
const HEALTH_SEED_STEPS: Array<{ date: string; steps: number }> = require('@/assets/health-seed-steps.json');

const resolveAppleHealthKit = () => {
  try {
    // optional native module; will be undefined in Expo managed without dev client / native install
    // npm: react-native-health (requires native setup and HealthKit entitlement)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const healthModule = require('react-native-health');
    const moduleFromPackage = healthModule?.default ?? healthModule;
    if (moduleFromPackage?.initHealthKit) {
      return moduleFromPackage;
    }
  } catch {
    // fallback to direct native module lookups below
  }

  const nativeModuleCandidates = [
    NativeModules?.AppleHealthKit,
    NativeModules?.RCTAppleHealthKit,
    NativeModules?.RNAppleHealthKit,
  ];

  return nativeModuleCandidates.find((candidate) => candidate?.initHealthKit) ?? null;
};

let AppleHealthKit: any = resolveAppleHealthKit();

try {
  // optional module; if unavailable, in-app notifications list still works
  Notifications = runtimeRequire ? runtimeRequire('expo-notifications') : null;
} catch {
  Notifications = null;
}

export default function AccountScreen() {
  const [name, setName] = useState<string>('Student');
  const [healthStatus, setHealthStatus] = useState<string>('Not connected');
  const [connected, setConnected] = useState<boolean>(false);
  const [healthAvailable, setHealthAvailable] = useState<boolean>(Platform.OS === 'ios' && !!AppleHealthKit?.initHealthKit);
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [stepsDateLabel, setStepsDateLabel] = useState<string | null>(null);
  const [distanceDateLabel, setDistanceDateLabel] = useState<string | null>(null);
  const [caloriesDateLabel, setCaloriesDateLabel] = useState<string | null>(null);
  const [historicalSteps, setHistoricalSteps] = useState<number[]>([]);
  const [historicalDistance, setHistoricalDistance] = useState<number[]>([]);
  const [historicalCalories, setHistoricalCalories] = useState<number[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [showCheckinsModal, setShowCheckinsModal] = useState(false);
  const [notifications, setNotifications] = useState([DEFAULT_HERBIE_NOTIFICATION]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const router = useRouter();
  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('studentName');
      if (stored) setName(stored);
      const storedPhoto = await AsyncStorage.getItem('profilePicture');
      if (storedPhoto) setPhotoUri(storedPhoto);

      if (Platform.OS === 'ios' && AppleHealthKit?.isAvailable) {
        AppleHealthKit.isAvailable((err: any, available: boolean) => {
          if (err || !available) {
            setHealthAvailable(false);
            return;
          }
          setHealthAvailable(true);
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!Notifications?.setNotificationHandler) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  const openNotifications = () => {
    setShowNotificationsModal(true);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  useEffect(() => {
    const scheduleDefaultNotification = async () => {
      if (!Notifications?.scheduleNotificationAsync) return;
      try {
        const alreadySent = await AsyncStorage.getItem(HERBIE_DEFAULT_NOTIFICATION_SENT_KEY);
        if (alreadySent) return;

        const currentPermissions = await Notifications.getPermissionsAsync();
        let finalStatus = currentPermissions.status;
        if (finalStatus !== 'granted') {
          const requestResult = await Notifications.requestPermissionsAsync();
          finalStatus = requestResult.status;
        }
        if (finalStatus !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: DEFAULT_HERBIE_NOTIFICATION.title,
            body: DEFAULT_HERBIE_NOTIFICATION.body,
            sound: true,
          },
          trigger: null,
        });
        await AsyncStorage.setItem(HERBIE_DEFAULT_NOTIFICATION_SENT_KEY, 'true');
      } catch {
        // ignore notification setup failures and keep account UI functional
      }
    };

    scheduleDefaultNotification();
  }, []);

  const disconnectFromHealth = () => {
    // clear metrics and revert state
    setConnected(false);
    setHealthStatus('Not connected');
    setStepCount(null);
    setDistance(null);
    setCalories(null);
    setStepsDateLabel(null);
    setDistanceDateLabel(null);
    setCaloriesDateLabel(null);
    setHistoricalSteps([]);
    setHistoricalDistance([]);
    setHistoricalCalories([]);
  };

  const refreshHealthData = (windowDays: number = 7) => {
    if (!AppleHealthKit) {
      return;
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const rangeStart = new Date(now.getTime() - Math.max(windowDays, 1) * 24 * 60 * 60 * 1000).toISOString();
    const headlineStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const rangeOptions = { startDate: rangeStart, endDate: nowIso };
    const headlineOptions = { startDate: headlineStart, endDate: nowIso };

    const estimateMilesFromSteps = (steps: number) => Number((steps / 2000).toFixed(2));
    const estimateCaloriesFromSteps = (steps: number) => Math.round(steps * 0.04);
    const formatDateLabel = (isoDate: string) => {
      const date = new Date(isoDate);
      if (Number.isNaN(date.getTime())) {
        return isoDate;
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const seededRows = [...HEALTH_SEED_STEPS]
      .filter((row) => Number(row?.steps ?? 0) > 0)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    if (seededRows.length > 0) {
      const latestSeeded = seededRows[seededRows.length - 1];
      const latestLabel = formatDateLabel(`${latestSeeded.date}T12:00:00`);
      const seededWindow = seededRows.slice(-Math.max(windowDays, 1));

      setStepCount(latestSeeded.steps);
      setStepsDateLabel(latestLabel);

      setDistance(estimateMilesFromSteps(latestSeeded.steps));
      setDistanceDateLabel(latestLabel);

      setCalories(estimateCaloriesFromSteps(latestSeeded.steps));
      setCaloriesDateLabel(latestLabel);

      setHistoricalSteps(seededWindow.map((row) => row.steps));
      setHistoricalDistance(seededWindow.map((row) => estimateMilesFromSteps(row.steps)));
      setHistoricalCalories(seededWindow.map((row) => estimateCaloriesFromSteps(row.steps)));
      return;
    }

    const getActiveEnergySamples = (
      queryOptions: { startDate: string; endDate: string },
      callback: (error: any, samples: any[]) => void,
    ) => {
      const fn =
        AppleHealthKit?.getActiveEnergyBurned ??
        AppleHealthKit?.getActiveEnergyBurnedSamples;

      if (typeof fn !== 'function') {
        callback('ActiveEnergyBurned method unavailable', []);
        return;
      }

      fn(queryOptions, (sampleError: any, samples: any) => {
        callback(sampleError, Array.isArray(samples) ? samples : []);
      });
    };

    AppleHealthKit.getDailyStepCountSamples(headlineOptions, (error: any, steps: any) => {
      if (!error && Array.isArray(steps)) {
        const latestStepSample = [...steps]
          .sort((a: any, b: any) => String(a?.startDate ?? '').localeCompare(String(b?.startDate ?? '')))
          .reverse()
          .find((item: any) => Number(item?.value ?? 0) > 0);

        if (latestStepSample != null) {
          setStepCount(Math.round(Number(latestStepSample?.value ?? 0)));
          setStepsDateLabel(formatDateLabel(String(latestStepSample?.startDate ?? '')));
          return;
        }

        setStepCount(0);
        setStepsDateLabel(null);
      }
    });

    AppleHealthKit.getDailyDistanceWalkingRunningSamples(headlineOptions, (error: any, distances: any) => {
      if (!error && Array.isArray(distances)) {
        const latestDistanceSample = [...distances]
          .sort((a: any, b: any) => String(a?.startDate ?? '').localeCompare(String(b?.startDate ?? '')))
          .reverse()
          .find((item: any) => Number(item?.value ?? 0) > 0);

        if (latestDistanceSample != null) {
          setDistance(Number(Number(latestDistanceSample?.value ?? 0).toFixed(2)));
          setDistanceDateLabel(formatDateLabel(String(latestDistanceSample?.startDate ?? '')));
          return;
        }

        AppleHealthKit.getDailyStepCountSamples(headlineOptions, (stepError: any, steps: any) => {
          if (!stepError && Array.isArray(steps)) {
            const latestStepSample = [...steps]
              .sort((a: any, b: any) => String(a?.startDate ?? '').localeCompare(String(b?.startDate ?? '')))
              .reverse()
              .find((item: any) => Number(item?.value ?? 0) > 0);

            if (latestStepSample != null) {
              setDistance(estimateMilesFromSteps(Number(latestStepSample?.value ?? 0)));
              setDistanceDateLabel(formatDateLabel(String(latestStepSample?.startDate ?? '')));
              return;
            }

            setDistance(0);
            setDistanceDateLabel(null);
          }
        });
      }
    });

    AppleHealthKit.getDailyStepCountSamples(headlineOptions, (stepError: any, steps: any) => {
      if (!stepError && Array.isArray(steps)) {
        const latestStepSample = [...steps]
          .sort((a: any, b: any) => String(a?.startDate ?? '').localeCompare(String(b?.startDate ?? '')))
          .reverse()
          .find((item: any) => Number(item?.value ?? 0) > 0);

        if (latestStepSample) {
          const stepValue = Number(latestStepSample?.value ?? 0);
          setCalories(estimateCaloriesFromSteps(stepValue));
          setCaloriesDateLabel(formatDateLabel(String(latestStepSample?.startDate ?? '')));
          return;
        }
      }

      setCalories(0);
      setCaloriesDateLabel(null);
    });

    AppleHealthKit.getDailyStepCountSamples(rangeOptions, (error: any, steps: any) => {
      if (!error && Array.isArray(steps)) {
        const values = steps.map((item: any) => Number(item?.value ?? 0)).slice(-windowDays);
        setHistoricalSteps(values);

      }
    });

    AppleHealthKit.getDailyDistanceWalkingRunningSamples(rangeOptions, (error: any, distances: any) => {
      if (!error && Array.isArray(distances)) {
        const values = distances.map((item: any) => Number(item?.value ?? 0)).slice(-windowDays);
        setHistoricalDistance(values);
        return;
      }

      AppleHealthKit.getDailyStepCountSamples(rangeOptions, (stepError: any, steps: any) => {
        if (!stepError && Array.isArray(steps)) {
          const values = steps
            .map((item: any) => estimateMilesFromSteps(Number(item?.value ?? 0)))
            .slice(-windowDays);
          setHistoricalDistance(values);
          return;
        }

        setHistoricalDistance([]);
      });
    });

    AppleHealthKit.getDailyStepCountSamples(rangeOptions, (stepError: any, steps: any) => {
      if (!stepError && Array.isArray(steps)) {
        const values = steps
          .map((item: any) => estimateCaloriesFromSteps(Number(item?.value ?? 0)))
          .slice(-windowDays);
        setHistoricalCalories(values);
        return;
      }

      setHistoricalCalories([]);
    });
  };

  const connectToHealth = async () => {
    AppleHealthKit = resolveAppleHealthKit();

    if (Platform.OS !== 'ios') {
      setHealthStatus('HealthKit only available on iOS');
      return;
    }
    if (!AppleHealthKit || !AppleHealthKit.initHealthKit) {
      setHealthStatus('Apple Health native module unavailable. Rebuild iOS app after prebuild and ensure Health capability is enabled.');
      setConnected(false);
      setHealthAvailable(false);
      return;
    }

    const permissionsConstants = AppleHealthKit?.Constants?.Permissions;
    const readPermissions = [
      permissionsConstants?.StepCount ?? 'StepCount',
      permissionsConstants?.DistanceWalkingRunning ?? 'DistanceWalkingRunning',
      permissionsConstants?.ActiveEnergyBurned ?? 'ActiveEnergyBurned',
    ];

    if (AppleHealthKit?.isAvailable) {
      AppleHealthKit.isAvailable((availabilityError: any, available: boolean) => {
        if (availabilityError || !available) {
          const details = availabilityError?.message || availabilityError || 'HealthKit not available on this device.';
          setHealthStatus(`Apple Health unavailable: ${String(details)}`);
          setConnected(false);
          setHealthAvailable(false);
          return;
        }
        setHealthAvailable(true);
      });
    }

    const permissions = {
      permissions: {
        read: readPermissions,
        write: [permissionsConstants?.StepCount ?? 'StepCount'],
      },
    };

    AppleHealthKit.initHealthKit(permissions, (err: any) => {
      if (err) {
        const details = err?.message || err || 'Unknown HealthKit init error';
        setHealthStatus(`Apple Health init failed: ${String(details)}`);
        setConnected(false);
        return;
      }
      setHealthStatus('Connected (read permissions granted)');
      setConnected(true);
      void importSeedDataToHealth();
      refreshHealthData(7);
    });
  };

  const importSeedDataToHealth = async () => {
    if (Platform.OS !== 'ios' || !AppleHealthKit?.saveSteps) {
      setHealthStatus('Unable to import seed data on this device/runtime.');
      return;
    }

    const alreadyImported = await AsyncStorage.getItem(HEALTH_SEED_STORAGE_KEY);
    if (alreadyImported) {
      setHealthStatus('Seed data already imported into Apple Health.');
      refreshHealthData(30);
      return;
    }

    let importedCount = 0;

    for (const row of HEALTH_SEED_STEPS) {
      await new Promise<void>((resolve) => {
        AppleHealthKit.saveSteps(
          {
            value: row.steps,
            startDate: `${row.date}T00:00:00.000Z`,
            endDate: `${row.date}T23:59:59.000Z`,
            metadata: { HKWasUserEntered: true },
          } as any,
          (saveError: any) => {
            if (!saveError) {
              importedCount += 1;
            }
            resolve();
          },
        );
      });
    }

    await AsyncStorage.setItem(HEALTH_SEED_STORAGE_KEY, '1');
    setHealthStatus(`Imported ${importedCount} days of steps into Apple Health`);
    refreshHealthData(30);
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
        <TouchableOpacity
          onPress={openNotifications}
          style={styles.notificationButton}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
        >
          <Bell size={24} color={Colors.light.tint} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{unreadNotificationCount}</Text>
          </View>
        </TouchableOpacity>
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
        <ThemedText style={styles.metric}>
          Daily calories burned{caloriesDateLabel ? ` (${caloriesDateLabel})` : ''}: {calories}
        </ThemedText>
      )}
      {historicalCalories.length > 0 && (
        <LineChart
          data={{
            labels: historicalCalories.map((_, i) => (i % 2 === 0 ? `${i + 1}` : '')),
            datasets: [{ data: historicalCalories }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          fromZero
          withVerticalLabels
          withHorizontalLabels
          withDots
          withInnerLines
          withVerticalLines={false}
          withOuterLines={false}
          segments={3}
          chartConfig={{
            backgroundColor: Colors.light.background,
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(232,14,14, ${opacity * 0.9})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${Math.max(opacity, 0.7)})`,
            fillShadowGradientFrom: 'rgba(232,14,14,0.05)',
            fillShadowGradientTo: 'rgba(232,14,14,0.005)',
            fillShadowGradientFromOpacity: 0.16,
            fillShadowGradientToOpacity: 0.03,
            style: { borderRadius: 16 },
            propsForDots: { r: '5', strokeWidth: '0.5', stroke: 'rgba(232,14,14,1)', fill: 'rgba(232,14,14,1)' },
            propsForBackgroundLines: { stroke: 'rgba(232,14,14,0.20)', strokeWidth: 1, strokeDasharray: '6 10' },
          }}
          style={{ marginVertical: 8, borderRadius: 16, paddingRight: 8 }}
        />
      )}
      {stepCount !== null && (
        <ThemedText style={styles.metric}>Today&apos;s steps: {stepCount}</ThemedText>
      )}
      {historicalSteps.length > 0 && (
        <LineChart
          data={{
            labels: historicalSteps.map((_, i) => (i % 2 === 0 ? `${i + 1}` : '')),
            datasets: [{ data: historicalSteps }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          fromZero
          withVerticalLabels
          withHorizontalLabels
          withDots
          withInnerLines
          withVerticalLines={false}
          withOuterLines={false}
          segments={3}
          chartConfig={{
            backgroundColor: Colors.light.background,
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(14,14,232, ${opacity * 0.9})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${Math.max(opacity, 0.7)})`,
            fillShadowGradientFrom: 'rgba(14,14,232,0.05)',
            fillShadowGradientTo: 'rgba(14,14,232,0.005)',
            fillShadowGradientFromOpacity: 0.16,
            fillShadowGradientToOpacity: 0.03,
            style: { borderRadius: 16 },
            propsForDots: { r: '5', strokeWidth: '0.5', stroke: 'rgba(14,14,232,1)', fill: 'rgba(14,14,232,1)' },
            propsForBackgroundLines: { stroke: 'rgba(14,14,232,0.20)', strokeWidth: 1, strokeDasharray: '6 10' },
          }}
          style={{ marginVertical: 8, borderRadius: 16, paddingRight: 8 }}
        />
      )}
      {distance !== null && (
        <ThemedText style={styles.metric}>Today&apos;s distance: {distance} mi</ThemedText>
      )}
      {historicalDistance.length > 0 && (
        <LineChart
          data={{
            labels: historicalDistance.map((_, i) => (i % 2 === 0 ? `${i + 1}` : '')),
            datasets: [{ data: historicalDistance }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          fromZero
          withVerticalLabels
          withHorizontalLabels
          withDots
          withInnerLines
          withVerticalLines={false}
          withOuterLines={false}
          segments={3}
          chartConfig={{
            backgroundColor: Colors.light.background,
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(16,119,16, ${opacity * 0.9})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${Math.max(opacity, 0.7)})`,
            fillShadowGradientFrom: 'rgba(16,119,16,0.045)',
            fillShadowGradientTo: 'rgba(16,119,16,0.005)',
            fillShadowGradientFromOpacity: 0.16,
            fillShadowGradientToOpacity: 0.03,
            style: { borderRadius: 16 },
            propsForDots: { r: '5', strokeWidth: '0.5', stroke: 'rgb(16, 119, 16)', fill: 'rgb(16, 119, 16)' },
            propsForBackgroundLines: { stroke: 'rgba(16,119,16,0.20)', strokeWidth: 1, strokeDasharray: '6 10' },
          }}
          style={{ marginVertical: 8, borderRadius: 16, paddingRight: 8 }}
        />
      )}
      
      <Button
        title={connected ? 'Disconnect Apple Health' : 'Connect to Apple Health'}
        onPress={connected ? disconnectFromHealth : connectToHealth}
      />
      {!healthAvailable && Platform.OS === 'ios' && (
        <ThemedText style={styles.status}>Tip: use an iOS development build to enable Apple Health.</ThemedText>
      )}
      
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

    {/* notifications modal */}
    <Modal visible={showNotificationsModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Notifications</ThemedText>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)} style={styles.modalClose}>
              <X size={24} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <ThemedText style={styles.valueBold}>{notification.title}</ThemedText>
                <ThemedText style={styles.notificationBody}>{notification.body}</ThemedText>
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
    alignItems: 'center',
    position: 'relative',
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
    marginRight: 0,
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
  notificationButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#e80e0e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  notificationBody: {
    fontSize: 14,
    color: '#222',
    marginTop: 4,
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
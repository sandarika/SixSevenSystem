import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
// lucide icons
import { Dumbbell, Calendar, Activity, Users } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Capacity',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size ?? 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meetup"
        options={{
          title: 'Meetup',
          tabBarIcon: ({ color, size }) => <Calendar size={size ?? 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Activity size={size ?? 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color, size }) => <Users size={size ?? 28} color={color} />,
        }}
      />
    </Tabs>
  );
}

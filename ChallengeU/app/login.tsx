import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Mail, Lock } from 'lucide-react-native';
import { authenticate, isAuthenticated } from '@/utils/auth';

export default function LoginScreen() {
  const router = useRouter();
  // pre-populate with demo credentials
  const [email, setEmail] = useState('herbie@nebraska.edu');
  const [password, setPassword] = useState('password123');

  if (isAuthenticated()) {
    return <Redirect href="/" />;
  }


  const handleLogin = async () => {
    // stub: replace with real authentication
    authenticate();

    // if using demo account, store a demo student name locally
    if (email.toLowerCase() === 'herbie@nebraska.edu') {
      try {
        await AsyncStorage.setItem('studentName', 'Herbie Husker');
      } catch (e) {
        console.warn('Failed to store student name', e);
      }
    }

    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topWrapper}>
        <Image source={require('../assets/images/image.png')} style={styles.logo} />
      </View>
      <ThemedText type="title" style={styles.title}>
        Welcome to ChallengeU
      </ThemedText>
      <View style={styles.inputWrapper}>
        <Mail size={24} color="#e80e0e" />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputWrapper}>
        <Lock size={24} color="#e80e0e" />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  topWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'cover',
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#e80e0e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#b00000',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
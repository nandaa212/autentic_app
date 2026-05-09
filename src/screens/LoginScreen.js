import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      Alert.alert('Login gagal', e.message);
    }
  };

  const handleBiometric = async () => {
    // Cek apakah ada token tersimpan (sudah pernah login sebelumnya)
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      Alert.alert('Belum ada sesi', 'Silakan login dulu dengan email & password.');
      return;
    }

    // Cek hardware biometric tersedia
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert('Tidak Tersedia', 'Perangkat ini tidak mendukung biometric.');
      return;
    }

    // Cek biometric sudah terdaftar di perangkat
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      Alert.alert('Belum Terdaftar', 'Silakan daftarkan Face ID / Fingerprint di pengaturan perangkat.');
      return;
    }

    // Tampilkan prompt Face ID / Fingerprint
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login dengan biometric',
      fallbackLabel: 'Gunakan password',
      cancelLabel: 'Batal',
      disableDeviceFallback: false,
    });

    if (result.success) {
      Alert.alert('Berhasil', 'Selamat datang kembali!');
      // AuthContext sudah memegang user dari token → otomatis masuk AppStack
    } else {
      Alert.alert('Gagal', result.error === 'user_cancel' ? 'Dibatalkan.' : 'Biometric tidak cocok.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
      <TextInput style={styles.input} placeholder="Password" value={password}
        onChangeText={setPassword} secureTextEntry/>
      <Button title="Login" onPress={handleLogin}/>
      <Button title="Login dengan Biometric" onPress={handleBiometric} color="#555"/>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Belum punya akun? Daftar
      </Text>
      <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
        Lupa password?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 16 },
  link: { marginTop: 16, color: 'blue', textAlign: 'center' },
});
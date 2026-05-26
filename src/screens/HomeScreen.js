import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [biometricStatus, setBiometricStatus] = useState('idle');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const avatarScale = useRef(new Animated.Value(0.5)).current;
  const biometricShake = useRef(new Animated.Value(0)).current;

  const handleBiometric = async () => {
    setBiometricStatus('loading');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setBiometricStatus('unavailable');
      Alert.alert('Tidak Tersedia', 'Perangkat ini tidak mendukung biometric.');
      return;
    }
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      setBiometricStatus('unavailable');
      Alert.alert('Belum Terdaftar', 'Silakan daftarkan Face ID / Fingerprint di pengaturan perangkat.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verifikasi identitas kamu',
      fallbackLabel: 'Gunakan password',
      cancelLabel: 'Batal',
      disableDeviceFallback: false,
    });
    if (result.success) {
      setBiometricStatus('success');
      Alert.alert('✅ Berhasil', 'Biometric terverifikasi!');
      setTimeout(() => setBiometricStatus('idle'), 3000);
    } else {
      setBiometricStatus('fail');
      Animated.sequence([
        Animated.timing(biometricShake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(biometricShake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(biometricShake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(biometricShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      Alert.alert('❌ Gagal', result.error === 'user_cancel' ? 'Dibatalkan.' : 'Biometric tidak cocok.');
      setTimeout(() => setBiometricStatus('idle'), 3000);
    }
  };

  const getBiometricStyle = () => {
    switch (biometricStatus) {
      case 'success': return { borderColor: '#22C55E', backgroundColor: '#052e16' };
      case 'fail':    return { borderColor: '#EF4444', backgroundColor: '#2d0a0a' };
      default:        return { borderColor: '#334155', backgroundColor: '#1E293B' };
    }
  };

  const getBiometricTextColor = () => {
    switch (biometricStatus) {
      case 'success': return '#86EFAC';
      case 'fail':    return '#FCA5A5';
      default:        return '#94A3B8';
    }
  };

  const getBiometricLabel = () => {
    switch (biometricStatus) {
      case 'loading':     return '⏳  Memverifikasi...';
      case 'success':     return '✅  Biometric Berhasil';
      case 'fail':        return '❌  Biometric Gagal';
      case 'unavailable': return '⚠️  Tidak Tersedia';
      default:            return '🔐  Test Biometric';
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const getInitial = () => {
    if (user?.displayName) return user.displayName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Pengguna';
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitial()}</Text>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.greeting}>Selamat datang,</Text>
        <Text style={styles.username}>{getDisplayName()} 👋</Text>

        <View style={styles.emailChip}>
          <Text style={styles.emailIcon}>✉</Text>
          <Text style={styles.emailText} numberOfLines={1}>{user?.email}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardIconWrap}>
            <Text style={styles.cardIcon}>⏱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Auto Logout Aktif</Text>
            <Text style={styles.cardDesc}>Kamu akan otomatis logout setelah 10 detik tidak aktif.</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Sesi aktif</Text>
        </View>

        {/* Tombol Chat */}
        <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat')} activeOpacity={0.85}>
          <Text style={styles.chatText}>💬  Buka Chat</Text>
        </TouchableOpacity>

        {/* Tombol Profil */}
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
          <Text style={styles.profileText}>👤  Profil Saya</Text>
        </TouchableOpacity>

        {/* Tombol Biometric */}
        <Animated.View style={{ width: '100%', transform: [{ translateX: biometricShake }], marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.biometricBtn, getBiometricStyle()]}
            onPress={handleBiometric}
            activeOpacity={0.85}
            disabled={biometricStatus === 'loading'}
          >
            <Text style={[styles.biometricText, { color: getBiometricTextColor() }]}>
              {getBiometricLabel()}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tombol Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgCircle1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: '#1E3A5F', top: -80, right: -80, opacity: 0.6 },
  bgCircle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#0EA5E9', bottom: 60, left: -60, opacity: 0.08 },
  bgCircle3: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#38BDF8', bottom: 200, right: -30, opacity: 0.06 },
  content: { width: width * 0.88, alignItems: 'center' },
  avatarWrapper: { marginBottom: 24 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#38BDF8', justifyContent: 'center', alignItems: 'center', padding: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0EA5E9', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  greeting: { fontSize: 15, color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  username: { fontSize: 26, fontWeight: '800', color: '#F1F5F9', marginBottom: 16, textAlign: 'center' },
  emailChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginBottom: 28, borderWidth: 1, borderColor: '#334155', maxWidth: '90%' },
  emailIcon: { fontSize: 13, color: '#38BDF8', marginRight: 8 },
  emailText: { fontSize: 13, color: '#94A3B8', flexShrink: 1 },
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 20, width: '100%', borderWidth: 1, borderColor: '#0EA5E9', gap: 12 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0c2d44', justifyContent: 'center', alignItems: 'center' },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#38BDF8', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  statusText: { fontSize: 12, color: '#22C55E', fontWeight: '600', letterSpacing: 0.5 },
  chatBtn: { width: '100%', paddingVertical: 15, borderRadius: 14, backgroundColor: '#0c2d44', alignItems: 'center', borderWidth: 1, borderColor: '#38BDF8', marginBottom: 12 },
  chatText: { color: '#38BDF8', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  profileBtn: { width: '100%', paddingVertical: 15, borderRadius: 14, backgroundColor: '#3d0b25', alignItems: 'center', borderWidth: 1, borderColor: '#f472b6', marginBottom: 12 },
  profileText: { color: '#f9a8d4', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  biometricBtn: { width: '100%', paddingVertical: 15, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  biometricText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  logoutBtn: { width: '100%', paddingVertical: 15, borderRadius: 14, backgroundColor: '#7F1D1D', alignItems: 'center', borderWidth: 1, borderColor: '#EF4444', marginTop: 12 },
  logoutText: { color: '#FCA5A5', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
});
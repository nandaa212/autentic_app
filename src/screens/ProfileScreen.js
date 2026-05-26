import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [photoURL, setPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Ambil foto profil dari Firestore
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setPhotoURL(docSnap.data().photoURL);
      }
    };
    fetchProfile();
  }, []);

  const pickAndUpload = async () => {
    // Minta izin akses galeri
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin ditolak', 'Izinkan akses galeri di pengaturan.');
      return;
    }

    // Buka galeri
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      // Konversi ke blob
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      // Upload ke Firebase Storage
      const storageRef = ref(storage, `profiles/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);

      // Ambil URL download
      const url = await getDownloadURL(storageRef);

      // Simpan URL ke Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      setPhotoURL(url);

      Alert.alert('Sukses', 'Foto profil berhasil diupload!');
    } catch (e) {
      Alert.alert('Gagal', e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foto Profil</Text>

      {/* Avatar */}
      <TouchableOpacity onPress={pickAndUpload} style={styles.avatarWrapper}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {user?.email[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.editBadge}>
          <Text style={styles.editText}>✏️</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.hint}>Tap foto untuk ganti</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {uploading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#be185d" />
          <Text style={styles.loadingText}>Mengupload...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={pickAndUpload}
        disabled={uploading}
      >
        <Text style={styles.uploadText}>Pilih Foto dari Galeri</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2d0a1e', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#fce7f3', marginBottom: 32 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#be185d' },
  avatarPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#be185d',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#f472b6',
  },
  avatarInitial: { fontSize: 48, fontWeight: '700', color: '#fff' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#f472b6', borderRadius: 16,
    width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center',
  },
  editText: { fontSize: 14 },
  hint: { fontSize: 13, color: '#f9a8d4', marginBottom: 8 },
  email: { fontSize: 14, color: '#94A3B8', marginBottom: 32 },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  loadingText: { color: '#f9a8d4', fontSize: 14 },
  uploadBtn: {
    backgroundColor: '#be185d', paddingVertical: 14,
    paddingHorizontal: 32, borderRadius: 14,
    borderWidth: 1, borderColor: '#f472b6',
  },
  uploadText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
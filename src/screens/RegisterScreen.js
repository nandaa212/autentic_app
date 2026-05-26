import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Simpan data user ke Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: email.split('@')[0],
        email: email,
        photoURL: '',
        isOnline: true,
        createdAt: new Date(),
      });

      await sendEmailVerification(cred.user);
      Alert.alert('Sukses', 'Cek email kamu untuk verifikasi.');
    } catch (e) {
      Alert.alert('Registrasi gagal', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
      <TextInput style={styles.input} placeholder="Password" value={password}
        onChangeText={setPassword} secureTextEntry/>
      <Button title="Daftar" onPress={handleRegister}/>
      <Text style={styles.link} onPress={() => navigation.goBack()}>
        Sudah punya akun? Login
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
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../config/firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken();
        await SecureStore.setItemAsync('auth_token', token);
      } else {
        await SecureStore.deleteItemAsync('auth_token');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // AUTO-LOGOUT 5 MENIT IDLE (Tugas Mandiri)
  useEffect(() => {
    if (!user) return;
    let timer = null;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        await logout();
      }, 10 * 1000); // ganti ke 5 * 60 * 1000 setelah demo
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') resetTimer();
      else resetTimer();
    });

    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, [user]);

  const logout = async () => {
    await signOut(auth);
    await SecureStore.deleteItemAsync('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
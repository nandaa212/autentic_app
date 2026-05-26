import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setOnlineStatus = async (uid, status) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isOnline: status });
    } catch (e) {}
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken();
        await SecureStore.setItemAsync('auth_token', token);
        await setOnlineStatus(u.uid, true); // online saat login
      } else {
        await SecureStore.deleteItemAsync('auth_token');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Update online status saat app background/foreground
  useEffect(() => {
    if (!user) return;
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        await setOnlineStatus(user.uid, true);
      } else {
        await setOnlineStatus(user.uid, false);
      }
    });
    return () => subscription.remove();
  }, [user]);

  // Auto logout idle
  useEffect(() => {
    if (!user) return;
    let timer = null;
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        await logout();
      }, 5 * 60 * 1000);
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
    if (user) await setOnlineStatus(user.uid, false); // offline saat logout
    await signOut(auth);
    await SecureStore.deleteItemAsync('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
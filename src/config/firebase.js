import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';  
import { getStorage } from 'firebase/storage';      
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB0e52Z9jOSJzpCAgCm0NrZ3l7Hhm4NOIk",
  authDomain:"auntentic-login.firebaseapp.com" ,
  projectId: "auntentic-login",
  storageBucket: "auntentic-login.firebasestorage.app",
  messagingSenderId: "529035446632",
  appId: "1:529035446632:web:5dcc628b321f856395eedd",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);      
export const storage = getStorage(app);  
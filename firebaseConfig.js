import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAxcSbYXsEMT3saRXdiI0szB68J49qZWPQ",
  authDomain: "chat-app-native-b1410.firebaseapp.com",
  projectId: "chat-app-native-b1410",
  storageBucket: "chat-app-native-b1410.firebasestorage.app",
  messagingSenderId: "311539238091",
  appId: "1:311539238091:web:f8e4279835178ae03ac74e",
};

// Firebase'i başlatıyoruz
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth ve Firestore referanslarını buradan export ediyoruz
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);

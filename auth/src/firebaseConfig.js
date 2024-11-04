// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDY7jtIQOxelvVe8zkFtDGCmMa0X-CpVmc",
    authDomain: "haske-17982.firebaseapp.com",
    projectId: "haske-17982",
    storageBucket: "haske-17982.firebasestorage.app",
    messagingSenderId: "874070373595",
    appId: "1:874070373595:web:b4aa36bc05fd5ffebb88fe"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

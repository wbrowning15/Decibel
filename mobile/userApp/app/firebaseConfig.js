// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDUDN--eZr6mYs7RPWo5QMXZm7yFCAJfJQ",
    authDomain: "aura-71a95.firebaseapp.com",
    projectId: "aura-71a95",
    storageBucket: "aura-71a95.appspot.com",
    messagingSenderId: "865363911549",
    appId: "1:865363911549:web:1cc4c7473766ae41176214",
    measurementId: "G-E63T9Y358Q"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
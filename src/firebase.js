// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxPFXCKJ2qe65ugxFUsgA5gZbZeIelaTg",
  authDomain: "rhms-19dad.firebaseapp.com",
  projectId: "rhms-19dad",
  storageBucket: "rhms-19dad.firebasestorage.app",
  messagingSenderId: "895315243515",
  appId: "1:895315243515:web:7a10034f239de838441b5e",
  measurementId: "G-3DVTMCL2D2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
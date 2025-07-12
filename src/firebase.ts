// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5RqAItWQ8Y2dlF1ttv1LkI_a6bX9hFzM",
  authDomain: "fir-store-d44ed.firebaseapp.com",
  projectId: "fir-store-d44ed",
  storageBucket: "fir-store-d44ed.firebasestorage.app",
  messagingSenderId: "676821470474",
  appId: "1:676821470474:web:96fb17459ce5fcd13a3ef3",
  measurementId: "G-7XT8FLWK55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
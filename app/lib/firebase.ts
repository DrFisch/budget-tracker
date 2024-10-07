// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5MEkCFMJeH480LH218y3rxPghupSRE2k",
  authDomain: "budget-tracker-54473.firebaseapp.com",
  projectId: "budget-tracker-54473",
  storageBucket: "budget-tracker-54473.appspot.com",
  messagingSenderId: "73824090425",
  appId: "1:73824090425:web:4fcfefb76c76ce4f6f90e8",
  measurementId: "G-8YF5GLJJKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 



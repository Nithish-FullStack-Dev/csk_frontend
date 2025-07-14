import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyATJBUYfxh8OI6_rjFj0NR1raQnKfaGhGo",
  authDomain: "react-firebase-practice-e1407.firebaseapp.com",
  databaseURL: "https://react-firebase-practice-e1407-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "react-firebase-practice-e1407",
  storageBucket: "react-firebase-practice-e1407.firebasestorage.app",
  messagingSenderId: "1045958114919",
  appId: "1:1045958114919:web:197085ce45043edad51ec2",
  measurementId: "G-KJ7SNM2RTK"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };

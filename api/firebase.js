// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCC_cEqxB99hMW16aowMs6AJ3-k52VasW0",
  authDomain: "sham-marianas.firebaseapp.com",
  projectId: "sham-marianas",
  storageBucket: "sham-marianas.firebasestorage.app",
  messagingSenderId: "607689609153",
  appId: "1:607689609153:web:3d76a1c337979a691a6940",
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };

const functions = getFunctions(app);

export { functions };

const auth = getAuth(app);
export { auth };

const storage = getStorage(app);
export { storage };

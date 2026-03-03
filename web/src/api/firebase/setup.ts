import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAueAFqxcqFElKzHW2sTXpDNa-Peez3FSc",
  authDomain: "send-flow-unnichat-test.firebaseapp.com",
  projectId: "send-flow-unnichat-test",
  storageBucket: "send-flow-unnichat-test.firebasestorage.app",
  messagingSenderId: "617524766010",
  appId: "1:617524766010:web:875b22a91f269d29101c03",
  measurementId: "G-VVRLPKFG40",
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

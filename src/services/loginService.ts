import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../api/firebase/setup";
import type { UserProfile } from "../types/User";

export const loginService = {
  register: async (email: string, password: string, profile?: UserProfile) => {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (profile) {
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        ...profile,
        email,
      });
    }

    return userCredential.user;
  },

  login: async (email: string, password: string) => {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const userRef = doc(db, "users", userCredential.user.uid);

    const docSnap = await getDoc(userRef);
    const profileData = docSnap.exists()
      ? (docSnap.data() as UserProfile)
      : null;

    return {
      user: userCredential.user,
      profile: profileData,
    };
  },

  logout: async () => {
    await signOut(auth);
  },
};

import { create } from "zustand";
import { onAuthStateChanged, type User } from "firebase/auth";

import { loginService } from "../services/loginService";
import type { UserProfile } from "../types/User";
import { auth } from "../api/firebase/setup";

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    profile: UserProfile,
  ) => Promise<void>;
  logout: () => Promise<void>;
  initAuthListener: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { user, profile } = await loginService.login(email, password);
      set({ user, profile });
    } finally {
      set({ loading: false });
    }
  },

  register: async (email, password, profileData) => {
    set({ loading: true });
    try {
      const user = await loginService.register(email, password, profileData);
      set({ user, profile: profileData });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await loginService.logout();
    set({ user: null, profile: null });
  },

  initAuthListener: () => {
    set({ loading: true });
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      set({ user: currentUser, loading: false });
    });
    return unsubscribe;
  },
}));

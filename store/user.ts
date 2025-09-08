// types/userStore.ts

import { type StateCreator } from "zustand";
import { Store } from "./store";

export type User = {
  id?: string;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  userType?: "unverified" | "verified";
  role?: string;
};

export type UserStore = {
  user: User | null;
  token: string | null;

  setUser: (user: User) => void;
  completeUserProfile: (userData: Partial<User>) => void;
  storeUserToken: (token: string) => void;
  loadUserToken: () => void;
  clearUser: () => void;
  setUserType: (type: "unverified" | "verified") => void;
};

export const useUserStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  UserStore> = (set, get) => ({
  user: null,
  token: null,


  setUser: (user) => {
    set((state) => {
      state.user = user;
    });
  },

  completeUserProfile: (userData) => {
    set((state) => {
      if (!state.user) return;
      state.user = { ...state.user, ...userData };
    });
  },

  storeUserToken: (token) => {
    set((state) => {
      state.token = token;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("userToken", token);
      }
    });
  },

  loadUserToken: () => {
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("userToken");
      if (storedToken) {
        set((state) => {
          state.token = storedToken;
        });
      }
    }
  },

  clearUser: () => {
    set((state) => {
      state.user = null;
      state.token = null;
    });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userToken");
    }
  },
  setUserType: (type) =>
    set((state) => {
      if (state.user) {
        state.user.userType = type;
      }
    }),
});

// types/userStore.ts
import { type StateCreator } from "zustand";
import { Store } from "./store";

export type User = {
  _id?: string;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  userType?: "unverified" | "verified";
  role?: "user" | "admin";
};

export type UserStore = {
  user: User | null;
  token: string | null;
  tokenExpiresAt?: number;

  setUser: (user: User) => void;
  completeUserProfile: (userData: Partial<User>) => void;
  storeUserToken: (token: string, expiresAt?: number) => void;
  loadUserToken: () => void;
  clearUser: () => void;
  setUserType: (type: "unverified" | "verified") => void;
};

// Random-looking storage key
const TOKEN_KEY = "Blxd4PzUPOmpH96cN9sHP1eM5Zyzzyr48";

export const useUserStore: StateCreator<
  Store,
  [],
  [],
  UserStore> = (set, get) => ({
  user: null,
  token: null,
  tokenExpiresAt: undefined,

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

  storeUserToken: (token, expiresAt) => {
    set((state) => {
      state.token = token;
      if (expiresAt) state.tokenExpiresAt = expiresAt;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(TOKEN_KEY, token);
        if (expiresAt) sessionStorage.setItem(TOKEN_KEY + "_exp", expiresAt.toString());
      }
    });
  },

  loadUserToken: () => {
    if (typeof window === "undefined") return;

    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiresStr = sessionStorage.getItem(TOKEN_KEY + "_exp");

    if (token && expiresStr) {
      const expiresAt = parseInt(expiresStr, 10);
      if (expiresAt > Date.now()) {
        set((state) => {
          state.token = token;
          state.tokenExpiresAt = expiresAt;
        });
      } else {
        get().clearUser(); 
      }
    }
  },

  clearUser: () => {
    set((state) => {
      state.user = null;
      state.token = null;
      state.tokenExpiresAt = undefined;
    });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY + "_exp");
    }
  },

  setUserType: (type) =>
    set((state) => {
      if (state.user) {
        state.user.userType = type;
      }
    }),
});

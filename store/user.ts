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
  userData: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setUserType: (type: "unverified" | "verified") => void;
};

export const useUserStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  UserStore> = (set, get) => ({
  userData: null,
  token: null,
  tokenExpiresAt: undefined,

  setUser: (user) => {
    set((state) => {
      state.userData = user;
    });
  },


  clearUser: () => {
    set((state) => {
      state.userData = null;
    });
  },

  setUserType: (type) =>
    set((state) => {
      if (state.userData) {
        state.userData.userType = type;
      }
    }),
});

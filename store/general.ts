import { StateCreator } from "zustand";
import { Store } from "./store";

export type GeneralStore = {
  isMobile: boolean;
  setIsMobile: (stat: boolean) => void;
};

export const useGenralStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  GeneralStore
> = (set) => ({
  isMobile: false,
  setIsMobile: (stat) =>
    set({
      isMobile: stat,
    }),
});

import { StateCreator } from "zustand";
import { Store } from "./store";

export type GeneralStore = {
  isMobile: boolean;
  sizeGuild: boolean;
  setSizeGuild: () => void;
  setIsMobile: (stat: boolean) => void;
  routeChange: boolean;
  setRouteChange: () => void;
};

export const useGenralStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  GeneralStore
> = (set) => ({
  isMobile: false,
  routeChange: false,
  sizeGuild: false,
  setSizeGuild: () =>
    set((state) => {
      state.sizeGuild = !state.sizeGuild;
    }),
  setIsMobile: (stat) =>
    set({
      isMobile: stat,
    }),
  setRouteChange: () =>
    set((state) => {
      state.routeChange = !state.routeChange;
    }),
});

import { StateCreator } from "zustand";
import { Store } from "./store";

export type GeneralStore = {
  isMobile: boolean;
  setIsMobile: (stat: boolean) => void;
  routeChange:boolean,
  setRouteChange:()=> void;
};

export const useGenralStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  GeneralStore
> = (set) => ({
  isMobile: false,
  routeChange:false,
  setIsMobile: (stat) =>
    set({
      isMobile: stat,
    }),
  setRouteChange:()=>set((state)=>{
    state.routeChange = !state.routeChange
  })
});

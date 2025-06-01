import { type StateCreator } from "zustand";
import { Store } from "./store";

export type SearchStore = {
  navSearch: string;
  setNavSearch: (word: string) => void;
  productSearch: string;
  setProductSearch: () => void;
  curtain: "show" | "hide";
  navContent: "mens" | "search" | "new in" | "outlet" | "idle";
  curtainState: (
    curt: "mens" | "search" | "new in" | "outlet" | "idle"
  ) => void;
  hideCurtain: () => void;
  showCurtain: () => void;
};

export const useSearch: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  SearchStore
> = (set) => ({
  navSearch: "",
  productSearch: "",
  curtain: "hide",
  navContent: "idle",
  setNavSearch: (word) =>
    set({
      navSearch: word,
    }),
  setProductSearch: () => {},
  curtainState: (curt) =>
    set({
      navContent: curt,
    }),
  hideCurtain: () =>
    set({
      curtain: "hide",
    }),
  showCurtain: () =>
    set({
      curtain: "show",
    }),
});

import { type StateCreator } from "zustand";
import { Store } from "./store";

export type ModalStore = {
  modal: boolean;
  device: "mobile" | "desktop";
  modalDisplay: "cart" | "wardrope" | "menu" | "idle";
  setModal: (dis: "cart" | "wardrope" | "menu" |"idle") => void;
  closeModal: () => void;
  setDevice: (dev: "mobile" | "desktop") => void;
};

export const useModalStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  ModalStore
> = (set) => ({
  modal: false,
  device: "desktop",
  modalDisplay: "idle",
  setModal: (dis) =>
    set((state) => {
      state.modal = !state.modal;
      state.modalDisplay = dis;
    }),
  closeModal: () =>
    set({
      modal: false,
    }),
  setDevice: (dev: "mobile" | "desktop") => {

  },
});

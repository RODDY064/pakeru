import { type StateCreator } from "zustand";
import { Store } from "./store";

type Notification = {
  _id: string;
  title: string;
  content: string;
  about: "product" | "order" | "content";
  type: "unread" | "read" ;
};

export type NotificationStore = {
  notifactions: Notification[];
  isNotModalOpen:boolean,
  toggleNotModal:()=>void
};



export const useNotificationStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  NotificationStore
> = (set, get) => ({
  notifactions:[],
  isNotModalOpen:false,

  toggleNotModal: () =>
    set((state) => {
      state.isNotModalOpen = !state.isNotModalOpen;
    }),
})
import { type StateCreator } from 'zustand'
import { Store } from './store'

export type ModalStore = {
    modal: boolean,
    modalDisplay: "cart" | "wardrope",
    setModal: (dis: "cart" | "wardrope") => void,
    closeModal:()=>void,
}

export const useModalStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  ModalStore
> = (set) => ({
    modal: false,
    modalDisplay: "cart",
    setModal: (dis) => set((state) => {
        state.modal = !state.modal
        state.modalDisplay = dis
    }),
    closeModal:()=>set({
        modal:false
    })
})
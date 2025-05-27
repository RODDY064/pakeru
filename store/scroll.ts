
import { type StateCreator } from 'zustand'
import { Store } from './store'
import { RefObject } from 'react'

export type ScrollStore = {
  scrollAmount: number
  ref: RefObject<HTMLElement> | null
  setScrollRef: (ref: RefObject<HTMLElement>) => void
  setScrollAmount: (val: number) => void
}

export const useScrollStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  ScrollStore
> = (set) => ({
  scrollAmount: 0,
  ref: null,
  setScrollRef: (ref) =>
    set({ ref }),
 setScrollAmount: (val) =>
    set((state) => {
      state.scrollAmount = val
    }),
})

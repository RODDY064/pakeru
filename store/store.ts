import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ScrollStore, useScrollStore } from "./scroll";
import { SearchStore, useSearch } from "./search";
import { FilterStore, useFilterStore } from "./filter";
import { CartStore, useCartStore } from "./cart";
import { ModalStore, useModalStore } from "./modal";
import { ImgSlideStore, useSliderStore } from "./slider";
import { UserStore, useUserStore } from "./user";


export type Store = ScrollStore & SearchStore & FilterStore & CartStore & ModalStore & ImgSlideStore & UserStore


export const useBoundStore = create<Store>()(
    immer((...a)=>({
      ...useScrollStore(...a),
      ...useSearch(...a),
      ...useFilterStore(...a),
      ...useCartStore(...a),
      ...useModalStore(...a),
      ...useSliderStore(...a),
      ...useUserStore(...a)
    }))
)


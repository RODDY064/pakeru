import { StateCreator } from "zustand";
import { Store } from "./store";
import { ProductData } from "./dashbaord/products";
type ModalDisplay = "idle" | "cart" | "menu" | "wardrope";

export type MenuItem = {
  title: string;
  isActive: boolean;
  images: {
    src: string;
    title: string;
  }[];
  catID?: string | null;
  menuProducts: ProductData[]
};

export type ModalStore = {
  modal: boolean;
  modalDisplay: ModalDisplay;
  menuItems: MenuItem[];
  renderedSubBar: boolean;
  setModal: (dis: ModalDisplay) => void;
  closeModal: () => void;
  toggleMenuItem: (title: string) => void;
  assignCatID: () => Promise<void>;
};

const categoryMap: Record<string, string> = {
  "NEW IN": "Hoodies",
  MEN: "Shirts",
  WOMEN: "Jackets",
  "T-SHIRT": "Shorts",
  SHORTS: "Pants",
  TROUSERS: "Jeans",
  "OUR STORY": "",
};

export const useModalStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  ModalStore
> = (set, get) => ({
  modal: false,
  renderedSubBar: false,
  modalDisplay: "idle",
  menuItems: [
    {
      title: "NEW IN",
      isActive: false,
      images: [
        { src: "/images/hero.png", title: "New Arrivals" },
        { src: "/images/hero-2.png", title: "Fresh Picks" },
      ],
      catID: "68335c83c02fdcea12545e06",
      menuProducts: [],
    },
    {
      title: "MEN",
      isActive: false,
      images: [
        { src: "/images/hero-2.png", title: "Damir Classic" },
        { src: "/images/hero.png", title: "All In BB" },
      ],
      catID: "68335c83c02fdcea12545e07",
      menuProducts: [],
    },
    {
      title: "WOMEN",
      isActive: false,
      images: [
        { src: "/images/women-1.png", title: "Everyday Chic" },
        { src: "/images/women-2.png", title: "Bold Looks" },
      ],
      catID: "68335c83c02fdcea12545e0a",
      menuProducts: [],
    },
    {
      title: "T-SHIRT",
      isActive: false,
      images: [
        { src: "/images/tshirt-1.png", title: "Graphics" },
        { src: "/images/tshirt-2.png", title: "Plain Tees" },
      ],
      catID: "68335c83c02fdcea12545e0b",
      menuProducts: [],
    },
    {
      title: "SHORTS",
      isActive: false,
      images: [
        { src: "/images/shorts-1.png", title: "Casual Shorts" },
        { src: "/images/shorts-2.png", title: "Sporty Fits" },
      ],
      catID: "68335c83c02fdcea12545e08",
      menuProducts: [],
    },
    {
      title: "TROUSERS",
      isActive: false,
      images: [
        { src: "/images/trousers-1.png", title: "Formal Wear" },
        { src: "/images/trousers-2.png", title: "Relaxed Fit" },
      ],
      catID: "68471b88f21c2aeeda95fd48",
      menuProducts: [],
    },
    {
      title: "OUR STORY",
      isActive: false,
      images: [
        { src: "/images/hero-2.png", title: "Damir Classic" },
        { src: "/images/hero.png", title: "All In BB" },
      ],
      menuProducts: [],
    },
  ],

  setModal: (dis) =>
    set((state) => {
      const isOpening = !state.modal;
      state.modal = isOpening;
      state.modalDisplay = dis;

      if (!isOpening) {
        state.menuItems.forEach((item) => (item.isActive = false));
        state.renderedSubBar = false;
      }
    }),

  closeModal: () =>
    set((state) => {
      state.modal = false;
      state.modalDisplay = "idle";
      state.renderedSubBar = false;
      state.menuItems.forEach((item) => (item.isActive = false));
      state.isSearching = false;
    }),

  toggleMenuItem: (title) =>
  set((state) => {
    state.menuItems.forEach((item) => {
      item.isActive = item.title === title ? !item.isActive : false;
    });
    state.renderedSubBar = state.menuItems.some((item) => item.isActive);
  }),

  assignCatID: async () => {
    await get().loadCategories();

    set((state) => {
      state.menuItems.forEach((menuItem, index) => {
        const matchedProducts = state.products.filter(
          (product) => product?.category === menuItem.catID
        );
        state.menuItems[index].menuProducts = matchedProducts;
      });
    });
  },
});

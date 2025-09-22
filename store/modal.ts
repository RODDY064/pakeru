import { StateCreator } from "zustand";
import { Store } from "./store";
import { ProductData } from "./dashbaord/products";

type ModalDisplay = "idle" | "cart" | "menu" | "wardrobe";

export type MenuItem = {
  category: string;
  isActive: boolean;
  images: {
    _id: string;
    url: string;
    publicUrl?: string;
  }[];
  catID?: string | null;
  menuProducts: ProductData[];
};

export type ModalStore = {
  // State
  modal: boolean;
  modalDisplay: ModalDisplay;
  menuItems: MenuItem[];
  isSubBarRendered: boolean;

  // Actions
  openModal: (modalDisplay: ModalDisplay) => void;
  closeModal: () => void;
  toggleMenuItem: (catID: string) => void;
  initializeMenuItems: () => Promise<void>;
  loadMenuProducts: () => Promise<void>;
};

export const useModalStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  ModalStore
> = (set, get) => ({
  // Initial state - clean and predictable
  modal: false,
  modalDisplay: "idle",
  menuItems: [],
  isSubBarRendered: false,

  // Open modal with specific   modalDisplay type
  openModal: (modalDisplay) =>
    set((state) => {
      const isOpening = !state.modal;
      state.modal = isOpening;
      state.modalDisplay = modalDisplay;

      if (!isOpening) {
        state.menuItems.forEach((item) => (item.isActive = false));
        state.isSubBarRendered = false;
      }
    }),

  // Close modal and reset all related state
  closeModal: () =>
    set((state) => {
      state.modal = false;
      state.modalDisplay = "idle";
      state.isSubBarRendered = false;

      // Deactivate all menu items
      state.menuItems.forEach((item) => {
        item.isActive = false;
      });

      // Clear search state if it exists
      if ("isSearching" in state) {
        state.isSearching = false;
      }
    }),

  // Toggle specific menu item, ensuring only one is active
  toggleMenuItem: (catID) =>
    set((state) => {
      let hasActiveItem = false;

      state.menuItems.forEach((item) => {
        const shouldActivate = item.category === catID && !item.isActive;
        item.isActive = shouldActivate;
        if (shouldActivate) hasActiveItem = true;
      });

      state.isSubBarRendered = hasActiveItem;
    }),

  // Initialize menu items from categories
  initializeMenuItems: async () => {
    const state = get();

    try {
      if (state.categories.length === 0) {
        await state.loadCategories();
      }

      if (state.products.length === 0) {
        await state.loadProducts();
      }

      if (!state.categories?.length) {
        console.warn("No product available for menu initialization");
        return;
      }

      if (!state.categories?.length) {
        console.warn("No categories available for menu initialization");
        return;
      }

      console.log(state.categories," categories")

      set((draft) => {
        draft.menuItems = state.categories.map((category) => {
          const categoryProducts = state.products.filter(
            (product) => product?.category === category._id
          );


          return {
            category: category.name,
            isActive: false,
            images: [
              { _id: "1", url: "/images/women-2.png" },
              { _id: "2", url: "/images/women-2.png" },
            ],
            catID: category._id,
            menuProducts: categoryProducts, 
          };
        });
      });
    } catch (error) {
      console.error("Failed to initialize menu items:", error);
    }
  },

  // Load products for each menu category
  loadMenuProducts: async () => {
    const state = get();

    try {
      // await state.loadCategories();

      set((draft) => {
        draft.menuItems.forEach((menuItem, index) => {
          const categoryProducts = state.products.filter(
            (product) => product?.category === menuItem.catID
          );

          console.log(state.menuItems, "menu item");

          draft.menuItems[index].menuProducts = categoryProducts;
        });
      });
    } catch (error) {
      console.error("Failed to load menu products:", error);
    }
  },
});

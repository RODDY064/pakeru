import { StateCreator } from "zustand";
import { Store } from "./store";
import { ProductData } from "./dashbaord/products";

type ModalDisplay = "idle" | "cart" | "menu" | "wardrobe";

export type MenuItem = {
  category: string;
  parentCategory?: string;
  isActive: boolean;
  image: {
    _id: string;
    url: string;
    publicId?: string;
  };
  catID?: string | null;
  menuProducts: ProductData[];
};

export type ModalStore = {
  // State
  modal: boolean;
  modalDisplay: ModalDisplay;
  menuItems: MenuItem[];
  isSubBarRendered: boolean;
  menuLoading: boolean;
  lastToggleTime: number;
  toggleCooldown: number;

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
  // --- Initial State ---
  modal: false,
  modalDisplay: "idle",
  menuItems: [],
  isSubBarRendered: false,
  menuLoading: false,
  lastToggleTime: 0,
  toggleCooldown: 150,

  // --- Actions ---

  openModal: (modalDisplay) =>
    set((state) => {
      const isOpening = !state.modal;
      state.modal = isOpening;
      state.modalDisplay = modalDisplay;
      state.menuLoading = false;

      if (!isOpening) {
        state.menuItems.forEach((item) => (item.isActive = false));
        state.isSubBarRendered = false;
      }
    }),

  closeModal: () =>
    set((state) => {
      state.modal = false;
      state.modalDisplay = "idle";
      state.isSubBarRendered = false;
      state.menuLoading = false;

      state.menuItems.forEach((item) => {
        item.isActive = false;
      });

      if ("isSearching" in state) {
        state.isSearching = false;
      }
    }),

  toggleMenuItem: (catID: string) => {
    const now = Date.now();
    const { lastToggleTime, toggleCooldown, menuItems } = get();

    // Prevent rapid toggles within cooldown period
    if (now - lastToggleTime < toggleCooldown) {
      return;
    }

    set((state) => {
      // Find the item to toggle
      const targetItem = state.menuItems.find(
        (item) => item.category === catID
      );

      if (!targetItem) return state;

      // If clicking active item - deactivate only that one
      if (targetItem.isActive) {
        return {
          ...state,
          menuItems: state.menuItems.map((item) =>
            item.category === catID ? { ...item, isActive: false } : item
          ),
          isSubBarRendered: false,
          lastToggleTime: now,
        };
      }

      // Find currently active item
      const currentlyActive = state.menuItems.find((item) => item.isActive);

      // Deactivate current active item if different
      const updatedItems = state.menuItems.map((item) => {
        if (
          currentlyActive &&
          currentlyActive.category !== catID &&
          item.category === currentlyActive.category
        ) {
          return { ...item, isActive: false };
        }
        if (item.category === catID) {
          return { ...item, isActive: true };
        }
        return item;
      });

      return {
        ...state,
        menuItems: updatedItems,
        isSubBarRendered: true,
        lastToggleTime: now,
      };
    });
  },

  // --- Initialize menu items from categories ---
  initializeMenuItems: async () => {
    const state = get();

    // Early return if already loading
    if (state.menuLoading) {
      console.log("⏳ Menu initialization already in progress...");
      return;
    }

    console.log("🚀 Initializing menu items...");

    // Set loading state immediately
    set((draft) => {
      draft.menuLoading = true;
    });

    try {
      // Load categories if needed
      if (!state.categories || state.categories.length === 0) {
        console.log("📦 Loading categories...");
        await state.loadCategories();
      }

      // Get fresh state after categories load
      const updatedState = get();

      if (!updatedState.categories || updatedState.categories.length === 0) {
        console.warn("⚠️ No categories available");
        set((draft) => {
          draft.menuLoading = false;
        });
        return;
      }

      // Check if already initialized with products
      const alreadyInitialized =
        updatedState.menuItems.length > 0 &&
        updatedState.menuItems.every((item) => item.menuProducts?.length > 0);

      if (alreadyInitialized) {
        console.log("✅ Menu items already initialized");
        set((draft) => {
          draft.menuLoading = false;
        });
        return;
      }

      // Fetch products per category in parallel
      const menuData = await Promise.all(
        updatedState.categories.map(async (category) => {
          try {
            const res = await fetch(`/api/products?category=${category._id}`);

            if (!res.ok) {
              throw new Error(`Failed to load products for ${category.name}`);
            }

            const products = await res.json();

            return {
              category: category.name,
              parentCategory: category.parentCategory ?? "",
              isActive: false,
              image: category.image,
              catID: category._id,
              menuProducts: products?.data ?? [],
            };
          } catch (err) {
            console.error(
              `❌ Error loading products for ${category.name}:`,
              err
            );
            return {
              category: category.name,
              parentCategory: category.parentCategory ?? "",
              isActive: false,
              image: category.image,
              catID: category._id,
              menuProducts: [],
            };
          }
        })
      );

      set((draft) => {
        draft.menuItems = menuData;
        draft.menuLoading = false;
      });

      console.log("✅ Menu items initialized successfully");
    } catch (error) {
      console.error("Failed to initialize menu items:", error);
      set((draft) => {
        draft.menuLoading = false;
      });
    }
  },

  loadMenuProducts: async () => {
    const state = get();

    try {
      set((draft) => {
        draft.menuItems.forEach((menuItem, index) => {
          const categoryProducts = state.products.filter(
            (product) => product?.category === menuItem.catID
          );

          draft.menuItems[index].menuProducts = categoryProducts;
        });
      });
    } catch (error) {
      console.error("❌ Failed to load menu products:", error);
    }
  },
});

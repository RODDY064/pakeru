import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, PersistOptions } from "zustand/middleware";
import { ScrollStore, useScrollStore } from "./scroll";
import { SearchStore, useSearch } from "./search";
import { FilterStore, useFilterStore } from "./filter";
import { CartStore, useCartStore } from "./cart";
import { ModalStore, useModalStore } from "./modal";
import { ImgSlideStore, useSliderStore } from "./slider";
import { UserStore, useUserStore } from "./user";
import { GeneralStore, useGeneralStore } from "./general";
import { CategoryStore, CategoryType, useCategory } from "./category";
import { OrdersStore, useOrdersStore } from "./dashbaord/orders-store/orders";
import {
  ProductData,
  StoreProductStore,
  useStoreProductStore,
} from "./dashbaord/products";
import { PaginationStore, usePaginationStore } from "./dashbaord/pagination";
import {
  ContentStore,
  GalleryContent,
  HeroContent,
  useContentStore,
} from "./dashbaord/content-store/content";
import { NotificationStore, useNotificationStore } from "./notification";

export type Store = ScrollStore &
  SearchStore &
  FilterStore &
  CartStore &
  ModalStore &
  ImgSlideStore &
  UserStore &
  GeneralStore &
  CategoryStore &
  OrdersStore &
  StoreProductStore &
  NotificationStore &
  ContentStore &
  PaginationStore & {
    initializeWithServerData: (
      products: ProductData[],
      categories: CategoryType[],
      productTotal?:number,
    ) => void;
    isServerInitialized: boolean;
  };

// 🔖  persisted state
type PersistedState = Pick<
  Store,
  "cartItems" | "cartInView" | "bookMarks" | "userData"
>;

const persistOptions: PersistOptions<Store, PersistedState> = {
  name: "app-storage",

  // 💾 persistence
  partialize: (state): PersistedState => ({
    cartItems: state.cartItems,
    cartInView: state.cartInView,
    bookMarks: state.bookMarks,
    userData: state.userData,
  }),

  storage: {
    getItem: (name: string) => {
      try {
        const str = localStorage.getItem(name);
        if (!str) return null;

        const parsed = JSON.parse(str);

        // Validate bookmark structure on retrieval
        if (parsed.state?.bookMarks && Array.isArray(parsed.state.bookMarks)) {
          parsed.state.bookMarks = parsed.state.bookMarks.filter(
            (bookmark: any) => {
              return (
                bookmark &&
                typeof bookmark._id === "string" &&
                typeof bookmark.bookmarkId === "string" &&
                typeof bookmark.bookmarkCreatedAt === "string"
              );
            }
          );
        }

        return parsed;
      } catch (error) {
        console.warn(`Failed to get item ${name} from localStorage:`, error);
        // Try to recover by removing corrupted data
        localStorage.removeItem(name);
        return null;
      }
    },

    setItem: (name: string, value: any) => {
      try {
        // Validate bookmarks before persisting
        if (value.state?.bookMarks && Array.isArray(value.state.bookMarks)) {
          value.state.bookMarks = value.state.bookMarks.filter(
            (bookmark: any) => {
              const isValid =
                bookmark &&
                typeof bookmark._id === "string" &&
                typeof bookmark.bookmarkId === "string" &&
                typeof bookmark.bookmarkCreatedAt === "string" &&
                typeof bookmark.name === "string" &&
                typeof bookmark.price === "number";

              if (!isValid) {
                console.warn(
                  "Invalid bookmark filtered out during persistence:",
                  bookmark
                );
              }
              return isValid;
            }
          );
        }

        localStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to set item ${name} in localStorage:`, error);

        // If storage is full, try to free up space by clearing old data
        if (error instanceof DOMException && error.code === 22) {
          console.warn("Storage quota exceeded, attempting to clear old data");
          try {
            // Keep only the most recent bookmarks (last 50)
            if (
              value.state?.bookMarks &&
              Array.isArray(value.state.bookMarks)
            ) {
              value.state.bookMarks = value.state.bookMarks
                .sort(
                  (a: any, b: any) =>
                    new Date(b.bookmarkCreatedAt).getTime() -
                    new Date(a.bookmarkCreatedAt).getTime()
                )
                .slice(0, 50);

              localStorage.setItem(name, JSON.stringify(value));
              console.log("Successfully saved data after cleanup");
            }
          } catch (cleanupError) {
            console.error("Failed to save even after cleanup:", cleanupError);
          }
        }
      }
    },

    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn(`Failed to remove item ${name} from localStorage:`, error);
      }
    },
  },

  // Enhanced type-safe merge function
  merge: (persistedState: unknown, currentState: Store): Store => {
    const persisted = persistedState as PersistedState;

    // Ensure bookmarks array exists and is valid
    const validBookmarks = Array.isArray(persisted?.bookMarks)
      ? persisted.bookMarks.filter(
          (bookmark) =>
            bookmark &&
            typeof bookmark._id === "string" &&
            typeof bookmark.bookmarkId === "string"
        )
      : [];

    return {
      ...currentState,
      ...persisted,
      bookMarks: validBookmarks,
      userData: persisted?.userData ?? null,
    };
  },

  // 🔄 Enhanced migration function with comprehensive bookmark support
  migrate: (persistedState: unknown, version: number): PersistedState => {
    const state = persistedState as any;

    // Migration from version 0 to 1 - Enhanced cart items
    if (version < 1) {
      if (state.cartItems && Array.isArray(state.cartItems)) {
        state.cartItems = state.cartItems.map((item: any) => ({
          ...item,
          cartItemId:
            item.cartItemId ||
            `${item._id}-${item.selectedColor || "default"}-${
              item.selectedSize || "default"
            }`,
        }));
      }
    }

    // Migration from version 1 to 2 - Add bookmarks support
    if (version < 2) {
      if (!state.bookMarks) {
        state.bookMarks = [];
      }

      // Ensure existing bookmarks have proper structure
      if (state.bookMarks && Array.isArray(state.bookMarks)) {
        state.bookMarks = state.bookMarks.map((bookmark: any) => ({
          ...bookmark,
          id:
            bookmark._id ||
            bookmark.productId ||
            `bookmark-${Date.now()}-${Math.random()}`,
          productId: bookmark.productId || bookmark._id,
          selectedColor: bookmark.selectedColor,
          selectedSize: bookmark.selectedSize,
          bookmarkCreatedAt:
            bookmark.bookmarkCreatedAt ||
            bookmark.createdAt ||
            new Date().toISOString(),
          bookmarkId:
            bookmark.bookmarkId ||
            `bookmark-${bookmark.productId || bookmark._id}-${
              bookmark.selectedColor || "default"
            }-${bookmark.selectedSize || "default"}`,
        }));
      }
    }

    // Migration from version 2 to 3 - Enhanced bookmark validation
    if (version < 3) {
      if (state.bookMarks && Array.isArray(state.bookMarks)) {
        state.bookMarks = state.bookMarks
          .filter((bookmark: any) => {
            // Remove invalid bookmarks
            return (
              bookmark &&
              bookmark._id &&
              bookmark.bookmarkId &&
              bookmark.name &&
              typeof bookmark.price === "number"
            );
          })
          .map((bookmark: any) => ({
            ...bookmark,
            // Ensure all required fields exist
            bookmarkCreatedAt:
              bookmark.bookmarkCreatedAt || new Date().toISOString(),
            colors: bookmark.colors || [],
            sizes: bookmark.sizes || [],
            images: bookmark.images || [],
            stock: bookmark.stock || 0,
            isActive:
              bookmark.isActive !== undefined ? bookmark.isActive : true,
            rating: bookmark.rating || 0,
            category: bookmark.category || "uncategorized",
            mainImage: bookmark.mainImage || bookmark.images?.[0]?.url || "",
          }));
      }
    }

    return state as PersistedState;
  },

  // Updated version for enhanced bookmark validation
  version: 3,
  skipHydration: true,

  // Add onRehydrateStorage for additional validation
  onRehydrateStorage: (state) => {
    return (state, error) => {
      if (error) {
        console.error("Error rehydrating store:", error);
        // Reset bookmarks on error to prevent crashes
        if (state) {
          state.bookMarks = [];
        }
      } else if (state?.bookMarks) {
        // Validate and clean bookmarks after rehydration
        const validBookmarks = state.bookMarks.filter((bookmark) => {
          const isValid =
            bookmark &&
            typeof bookmark._id === "string" &&
            typeof bookmark.bookmarkId === "string" &&
            typeof bookmark.name === "string" &&
            typeof bookmark.price === "number";

          if (!isValid) {
            console.warn(
              "Invalid bookmark removed after rehydration:",
              bookmark
            );
          }
          return isValid;
        });

        if (validBookmarks.length !== state.bookMarks.length) {
          console.log(
            `Cleaned ${
              state.bookMarks.length - validBookmarks.length
            } invalid bookmarks`
          );
          state.bookMarks = validBookmarks;
        }
      } else if (state?.userData) {
        const { email } = state.userData;
        if (typeof email !== "string" || !email.includes("@")) {
          console.warn(
            "Invalid user data removed after rehydration:",
            state.userData
          );
          state.userData = null;
        }
      }
    };
  },
};

export const useBoundStore = create<Store>()(
  persist(
    immer((set, get, store) => ({
      ...useScrollStore(set, get, store),
      ...useSearch(set, get, store),
      ...useFilterStore(set, get, store),
      ...useCartStore(set, get, store),
      ...useModalStore(set, get, store),
      ...useSliderStore(set, get, store),
      ...useUserStore(set, get, store),
      ...useGeneralStore(set, get, store),
      ...useCategory(set, get, store),
      ...useOrdersStore(set, get, store),
      ...useStoreProductStore(set, get, store),
      ...usePaginationStore(set, get, store),
      ...useContentStore(set, get, store),
      ...useNotificationStore(set, get, store),
      // custom state
      isServerInitialized: false,

      // initialization logic
      initializeWithServerData: (products:ProductData[],categories:CategoryType[],productTotal) => {
        if (get().isServerInitialized) return;

        set((state) => {
          state.setProducts(products,productTotal);
          state.setDashProducts(products, productTotal)
          state.setCategories(categories);
          state.isServerInitialized = true;
          state.cartProductState = products.length > 0 ? "success" : "idle";
          state.syncCartWithProducts();
          state.syncBookmarksWithProducts();
        });

        console.log(`✅ Store initialized with ${productTotal} products and ${categories.length} categories and product total`);
      },
    })),
    persistOptions
  )
);

// 🚀store initialization
export const initializeStore = async (
  serverProducts?: ProductData[],
  serverCategories?: CategoryType[],
  productTotal?:number,
  Content?: { hero: HeroContent; galleries: GalleryContent }
) => {
  if (typeof window !== "undefined") {
    try {
      // Rehydrate persisted state first
      useBoundStore.persist.rehydrate();

      // Wait for rehydration to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (Content?.hero && Content.galleries) {
         
        useBoundStore.getState().setHero(Content.hero)
        useBoundStore.getState().setGalleries(Content.galleries.items)

      } else {
        await useBoundStore.getState().fetchContent();
      }
      // If server data is provided, use it (this is the preferred path)
      if (serverProducts || serverCategories) {

        useBoundStore.getState().initializeWithServerData(serverProducts as ProductData[], serverCategories as CategoryType[], productTotal);
      } else {
        // Fallback to client-side loading if no server data
        console.log( "No server data provided, falling back to client-side loading...");
        await useBoundStore.getState().loadProducts?.();
        await useBoundStore.getState().loadCategories?.();
      }

      // Sync bookmarks with products
      useBoundStore.getState().syncBookmarksWithProducts?.();

      const bookmarkCount = useBoundStore.getState().bookMarks?.length || 0;
      console.log(`Store initialized with ${bookmarkCount} bookmarks`);

      // Cleanup old bookmarks
      const maxBookmarks = 100;
      if (bookmarkCount > maxBookmarks) {
        const bookmarks = useBoundStore.getState().bookMarks || [];
        const recentBookmarks = bookmarks
          .sort(
            (a, b) =>
              new Date(b.bookmarkCreatedAt).getTime() -
              new Date(a.bookmarkCreatedAt).getTime()
          )
          .slice(0, maxBookmarks);

        useBoundStore.setState((state) => {
          state.bookMarks = recentBookmarks;
        });

        console.log(
          `Cleaned up old bookmarks, kept ${maxBookmarks} most recent`
        );
      }
    } catch (error) {
      console.error("Error initializing store:", error);
      useBoundStore.setState((state) => {
        state.bookMarks = [];
      });
    }
  }
};

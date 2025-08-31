import { type StateCreator } from "zustand";
import { Store } from "./store";
import { v4 as uuidv4 } from "uuid";
import {  ProductData } from "./dashbaord/products";


// 🛒 Cart Item with unique identifier for color/size combinations
export type CartItemType = ProductData & {
  quantity: number;
  cartItemId: string; // Unique ID for this specific cart item combination
};

// 🔖 Bookmark Type - Now properly extends ProductData
export type BookmarkType = ProductData & {
  bookmarkId: string; // Unique ID for this specific bookmark combination
  bookmarkCreatedAt: string; // Renamed to avoid conflict with ProductData.createdAt
};

// 📊 Cart Statistics
export type CartStats = {
  totalItems: number;
  totalPrice: number;
  uniqueProducts: number;
};

// 📊 Bookmark Statistics
export type BookmarkStats = {
  totalBookmarks: number;
  uniqueProducts: number;
  categoriesBookmarked: string[];
};

// 🏬 Enhanced Cart Store
export type CartStore = {
  cartItems: CartItemType[];
  cartInView: boolean;
  products: ProductData[];
  cartState: "idle" | "loading" | "success" | "error";
  error: string | null;
  bookMarks: BookmarkType[];

  // Computed getters
  getCartStats: () => CartStats;
  getBookmarkStats: () => BookmarkStats;
  getCartItem: (
    productId: string,
    color?: string,
    size?: string
  ) => CartItemType | undefined;
  getBookmark: (
    productId: string,
    color?: string,
    size?: string
  ) => BookmarkType | undefined;
  isInCart: (productId: string, color?: string, size?: string) => boolean;
  isBookmarked: (productId: string, color?: string, size?: string) => boolean;
  getBookmarkedProducts: () => BookmarkType[];

  // Actions
  setCartInView: (inView?: boolean) => void;
  addToCart: (product: ProductData, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateSize: (cartItemId: string, newSize: string) => void;
  updateColor: (cartItemId: string, newColor: string) => void;

  // Bookmark actions
  addBookmark: (product: ProductData) => void;
  removeBookmark: (bookmarkId: string) => void;
  toggleBookmark: (product: ProductData) => void;
  clearBookmarks: () => void;

  // Bulk operations
  addBookmarksToCart: (bookmarkIds: string[], quantity?: number) => void;
  addAllBookmarksToCart: (quantity?: number) => void;
  removeMultipleBookmarks: (bookmarkIds: string[]) => void;

  // Product management
  loadProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  syncCartWithProducts: () => void;
  syncBookmarksWithProducts: () => void;
  getProductById: (productId: string) => ProductData | undefined;
};

// 🔧 Helper function to generate unique cart item ID
const generateCartItemId = (
  productId: string,
  color?: string,
  size?: string
): string => {
  return `${productId}-${color || "default"}-${size || "default"}`;
};

// 🔧 Helper function to generate unique bookmark ID
const generateBookmarkId = (
  productId: string,
  color?: string,
  size?: string
): string => {
  return `bookmark-${productId}-${color || "default"}-${size || "default"}`;
};

// 🔧 Helper function to validate product before adding to cart
const validateProduct = (product: ProductData): boolean => {
  return !!(
    product.id &&
    product.name &&
    product.price >= 0 &&
    product.stock > 0 &&
    product.isActive
  );
};

// 🏬 Enhanced Zustand Store Creator
export const useCartStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  CartStore
> = (set, get) => ({
  cartItems: [],
  cartInView: false,
  cartState: "idle",
  products: [],
  error: null,
  bookMarks: [],

  // 📊 Computed getters
  getCartStats: () => {
    const { cartItems } = get();
    return cartItems.reduce(
      (stats, item) => ({
        totalItems: stats.totalItems + item.quantity,
        totalPrice: stats.totalPrice + item.price * item.quantity,
        uniqueProducts: stats.uniqueProducts + 1,
      }),
      { totalItems: 0, totalPrice: 0, uniqueProducts: 0 }
    );
  },

  getBookmarkStats: () => {
    const { bookMarks } = get();
    const categories = new Set<string>();

    bookMarks.forEach((bookmark) => {
      categories.add(bookmark.category);
    });

    return {
      totalBookmarks: bookMarks.length,
      uniqueProducts: new Set(bookMarks.map((b) => b.id)).size,
      categoriesBookmarked: Array.from(categories),
    };
  },

  getCartItem: (productId, color, size) => {
    const { cartItems } = get();
    const cartItemId = generateCartItemId(productId, color, size);
    return cartItems.find((item) => item.cartItemId === cartItemId);
  },

  getBookmark: (productId, color, size) => {
    const { bookMarks } = get();
    const bookmarkId = generateBookmarkId(productId, color, size);
    return bookMarks.find((bookmark) => bookmark.bookmarkId === bookmarkId);
  },

  isInCart: (productId, color, size) => {
    return !!get().getCartItem(productId, color, size);
  },

  isBookmarked: (productId, color, size) => {
    return !!get().getBookmark(productId, color, size);
  },

  getBookmarkedProducts: () => {
    const { bookMarks } = get();
    return bookMarks;
  },

  getProductById: (productId) => {
    const { products } = get();
    return products.find((product) => product.id === productId);
  },

  // 🎛️ Cart view toggle
  setCartInView: (inView) =>
    set((state) => {
      state.cartInView = inView !== undefined ? inView : !state.cartInView;
    }),

  // ➕ Enhanced add to cart with validation
  addToCart: (product, quantity = 1) =>
    set((state) => {
      // Validation
      if (!validateProduct(product)) {
        console.error("Invalid product:", product);
        return;
      }

      if (quantity <= 0) {
        console.error("Invalid quantity:", quantity);
        return;
      }

      const cartItemId = generateCartItemId(
        product.id,
        product.selectedColor,
        product.selectedSize
      );

      const existingItem = state.cartItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        // Check stock before increasing quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= product.stock) {
          existingItem.quantity = newQuantity;
        } else {
          console.warn(
            `Cannot add ${quantity} items. Only ${
              product.stock - existingItem.quantity
            } left in stock.`
          );
          existingItem.quantity = product.stock;
        }
      } else {
        // Check stock before adding new item
        const finalQuantity = Math.min(quantity, product.stock);
        state.cartItems.push({
          ...product,
          quantity: finalQuantity,
          cartItemId,
        });
      }
    }),

  // ❌ Remove entire cart item
  removeFromCart: (cartItemId) =>
    set((state) => {
      const index = state.cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (index !== -1) {
        state.cartItems.splice(index, 1);
      }
    }),

  // 🗑️ Clear entire cart
  clearCart: () =>
    set((state) => {
      state.cartItems = [];
    }),

  // ⬆️ Increase quantity with stock validation
  increaseQuantity: (cartItemId) =>
    set((state) => {
      const item = state.cartItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (item && item.quantity < item.stock) {
        item.quantity += 1;
      } else if (item) {
        console.warn(
          `Cannot increase quantity. Maximum stock (${item.stock}) reached.`
        );
      }
    }),

  // ⬇️ Decrease quantity or remove if zero
  decreaseQuantity: (cartItemId) =>
    set((state) => {
      const index = state.cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (index !== -1) {
        const item = state.cartItems[index];
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.cartItems.splice(index, 1);
        }
      }
    }),

  // 🔢 Set specific quantity
  updateQuantity: (cartItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const index = state.cartItems.findIndex(
          (item) => item.cartItemId === cartItemId
        );
        if (index !== -1) {
          state.cartItems.splice(index, 1);
        }
        return;
      }

      const item = state.cartItems.find(
        (item) => item.cartItemId === cartItemId
      );
      if (item) {
        item.quantity = Math.min(quantity, item.stock);
      }
    }),

  // 🎨 Update color - works both before and after adding to cart
  updateColor: (identifier, newColor) =>
    set((state) => {
      // Try to find cart item first (for items already in cart)
      const cartItem = state.cartItems.find(
        (item) => item.cartItemId === identifier
      );

      if (cartItem && cartItem.colors.includes(newColor)) {
        // SCENARIO 1: Item exists in cart - update cart item + product
        const product = state.products.find((p) => p.id === cartItem.id);
        const newCartItemId = generateCartItemId(
          cartItem.id,
          newColor,
          cartItem.selectedSize
        );

        // Check if item with new color already exists in cart
        const existingItem = state.cartItems.find(
          (item) => item.cartItemId === newCartItemId
        );

        if (existingItem) {
          // Merge quantities
          existingItem.quantity += cartItem.quantity;
          // Remove old item
          const index = state.cartItems.findIndex(
            (item) => item.cartItemId === identifier
          );
          if (index !== -1) {
            state.cartItems.splice(index, 1);
          }
        } else {
          // Update existing cart item
          cartItem.selectedColor = newColor;
          cartItem.cartItemId = newCartItemId;
        }

        // Update corresponding product
        if (product) {
          product.selectedColor = newColor;
        }
      } else {
        // update product (before adding to cart)
        const product = state.products.find((p) => p.id === identifier);
        if (product && product.colors.includes(newColor)) {
          product.selectedColor = newColor;
        }
      }
    }),

  // 📏 Update size - works both before and after adding to cart
  updateSize: (identifier, newSize) =>
    set((state) => {
      //  find cart item first (for items already in cart)
      const cartItem = state.cartItems.find(
        (item) => item.cartItemId === identifier
      );

      if (cartItem && cartItem.sizes.includes(newSize)) {
        // Item exists in cart - update cart item + product
        const product = state.products.find((p) => p.id === cartItem.id);
        const newCartItemId = generateCartItemId(
          cartItem.id,
          cartItem.selectedColor,
          newSize
        );

        // Check if item with new size already exists in cart
        const existingItem = state.cartItems.find(
          (item) => item.cartItemId === newCartItemId
        );

        if (existingItem) {
          // Merge quantities
          existingItem.quantity += cartItem.quantity;
          // Remove old item
          const index = state.cartItems.findIndex(
            (item) => item.cartItemId === identifier
          );
          if (index !== -1) {
            state.cartItems.splice(index, 1);
          }
        } else {
          // Update existing cart item
          cartItem.selectedSize = newSize;
          cartItem.cartItemId = newCartItemId;
        }

        // Update corresponding product
        if (product) {
          product.selectedSize = newSize;
        }
      } else {
        // just update product (before adding to cart)
        const product = state.products.find((p) => p.id === identifier);
        if (product && product.sizes.includes(newSize)) {
          product.selectedSize = newSize;
        }
      }
    }),

  // 🔖 Add bookmark
  addBookmark: (product) =>
    set((state) => {
      const bookmarkId = generateBookmarkId(
        product.id,
        product.selectedColor,
        product.selectedSize
      );

      const existingBookmark = state.bookMarks.find(
        (bookmark) => bookmark.bookmarkId === bookmarkId
      );

      if (!existingBookmark) {
        const newBookmark: BookmarkType = {
          ...product, // Include all product properties
          bookmarkId,
          bookmarkCreatedAt: new Date().toISOString(),
        };
        state.bookMarks.push(newBookmark);
      }
    }),

  // 🔖 Remove bookmark
  removeBookmark: (bookmarkId) =>
    set((state) => {
      const index = state.bookMarks.findIndex(
        (bookmark) => bookmark.bookmarkId === bookmarkId
      );
      if (index !== -1) {
        state.bookMarks.splice(index, 1);
      }
    }),

  // 🔖 Toggle bookmark
  toggleBookmark: (product) =>
    set((state) => {
      const bookmarkId = generateBookmarkId(
        product.id,
        product.selectedColor,
        product.selectedSize
      );

      const existingIndex = state.bookMarks.findIndex(
        (bookmark) => bookmark.bookmarkId === bookmarkId
      );

      if (existingIndex !== -1) {
        // Remove if exists
        state.bookMarks.splice(existingIndex, 1);
      } else {
        // Add if doesn't exist
        const newBookmark: BookmarkType = {
          ...product, // Include all product properties
          bookmarkId,
          bookmarkCreatedAt: new Date().toISOString(),
        };
        state.bookMarks.push(newBookmark);
      }
    }),

  // 🔖 Clear all bookmarks
  clearBookmarks: () =>
    set((state) => {
      state.bookMarks = [];
    }),

  addBookmarksToCart: (bookmarkIds, quantity = 1) => {
    const state = get();
    const updatedCartItems = [...state.cartItems];

    bookmarkIds.forEach((bookmarkId) => {
      const bookmark = state.bookMarks.find((b) => b.bookmarkId === bookmarkId);

      if (bookmark && validateProduct(bookmark)) {
        const cartItemId = generateCartItemId(
          bookmark.id,
          bookmark.selectedColor,
          bookmark.selectedSize
        );

        const existingItem = updatedCartItems.find(
          (item) => item.cartItemId === cartItemId
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          existingItem.quantity = Math.min(newQuantity, bookmark.stock);
        } else {
          const finalQuantity = Math.min(quantity, bookmark.stock);
          updatedCartItems.push({
            ...bookmark,
            quantity: finalQuantity,
            cartItemId,
          });
        }
      }
    });

    const updatedBookMarks = state.bookMarks.filter(
      (b) => !bookmarkIds.includes(b.bookmarkId)
    );

    set({
      cartItems: updatedCartItems,
      bookMarks: updatedBookMarks, 
      modalDisplay: "cart",
    });
  },

  addAllBookmarksToCart: (quantity = 1) => {
    const allBookmarkIds = get().bookMarks.map((b) => b.bookmarkId);
    get().addBookmarksToCart(allBookmarkIds, quantity);
  },

  // 🔖❌ Remove multiple bookmarks
  removeMultipleBookmarks: (bookmarkIds) =>
    set((state) => {
      state.bookMarks = state.bookMarks.filter(
        (bookmark) => !bookmarkIds.includes(bookmark.bookmarkId)
      );
    }),

  // 🔄 Sync cart with products
  syncCartWithProducts: () =>
    set((state) => {
      if (state.products.length === 0 || state.cartItems.length === 0) {
        return; // Nothing to sync
      }

      // Update cart items with fresh product data
      state.cartItems = state.cartItems
        .map((cartItem) => {
          const product = state.products.find((p) => p.id === cartItem.id);
          if (!product) {
            console.warn(
              `Product ${cartItem.id} not found, removing from cart`
            );
            return null; // Will be filtered out
          }

          // Check if selected color/size still exists in product
          const isValidColor =
            !cartItem.selectedColor ||
            product.colors.includes(cartItem.selectedColor);
          const isValidSize =
            !cartItem.selectedSize ||
            product.sizes.includes(cartItem.selectedSize);

          if (!isValidColor || !isValidSize) {
            console.warn(
              `Invalid color/size for product ${cartItem.id}, updating cart item`
            );
            return {
              ...product, // Fresh product data
              cartItemId: cartItem.cartItemId,
              quantity: Math.min(cartItem.quantity, product.stock), // Respect stock limits
              selectedColor: isValidColor
                ? cartItem.selectedColor
                : product.colors[0],
              selectedSize: isValidSize
                ? cartItem.selectedSize
                : product.sizes[0],
            };
          }

          // Merge fresh product data with cart item
          return {
            ...product, // Fresh product data (price, stock, etc.)
            cartItemId: cartItem.cartItemId,
            quantity: Math.min(cartItem.quantity, product.stock),
            selectedColor: cartItem.selectedColor,
            selectedSize: cartItem.selectedSize,
          };
        })
        .filter(Boolean) as CartItemType[]; // Remove null items
    }),

  // 🔄 Sync bookmarks with products
  syncBookmarksWithProducts: () =>
    set((state) => {
      if (state.products.length === 0 || state.bookMarks.length === 0) {
        return; // Nothing to sync
      }

      // Update bookmarks with fresh product data
      state.bookMarks = state.bookMarks
        .map((bookmark) => {
          const product = state.products.find((p) => p.id === bookmark.id);

          if (!product || !product.isActive) {
            console.warn(
              `Product ${bookmark.id} not found or inactive, removing bookmark`
            );
            return null; // Will be filtered out
          }

          // Check if selected color/size still exists in product
          const isValidColor =
            !bookmark.selectedColor ||
            product.colors.includes(bookmark.selectedColor);
          const isValidSize =
            !bookmark.selectedSize ||
            product.sizes.includes(bookmark.selectedSize);

          // Create updated bookmark with fresh product data
          const updatedBookmark: BookmarkType = {
            ...product, // Fresh product data
            bookmarkId: bookmark.bookmarkId,
            bookmarkCreatedAt: bookmark.bookmarkCreatedAt,
            selectedColor: isValidColor
              ? bookmark.selectedColor
              : product.colors[0],
            selectedSize: isValidSize
              ? bookmark.selectedSize
              : product.sizes[0],
          };

          // Update bookmark ID if color/size changed
          if (!isValidColor || !isValidSize) {
            console.warn(
              `Invalid color/size for bookmark ${bookmark.bookmarkId}, updating bookmark`
            );
            updatedBookmark.bookmarkId = generateBookmarkId(
              product.id,
              updatedBookmark.selectedColor,
              updatedBookmark.selectedSize
            );
          }

          return updatedBookmark;
        })
        .filter(Boolean) as BookmarkType[]; // Remove null items
    }),

  // Enhanced loadProducts to sync with cart and bookmarks after loading
  loadProducts: async () => {
    set((state) => {
      state.cartState = "loading";
      state.error = null;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      const response = await fetch(`${baseUrl}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(100000),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(result)

      if (!result || !Array.isArray(result.data)) {
        throw new Error(
          "Invalid response format: expected { data: ProductData[] }"
        );
      }

      const products: ProductData[] = result.data.map((product: any) => ({
        ...product,
        id: product._id,
        selectedColor: product?.colors?.[0] || undefined,
        mainImage: product.images?.[0]?.url || product.mainImage || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
      }));

      set((state) => {
        state.products = products;
        state.cartState = "success";
      });

      // Sync cart and bookmarks with fresh product data
      get().syncCartWithProducts();
      get().syncBookmarksWithProducts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to load products:", error);
      set((state) => {
        state.cartState = "error";
        state.error = errorMessage;
      });
    }
  },

  refreshProducts: async () => {
    await get().loadProducts();
  }
});

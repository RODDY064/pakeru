import { type StateCreator } from "zustand";
import { Store } from "./store";
import { v4 as uuidv4 } from "uuid";
import { ProductData, ProductVariant } from "./dashbaord/products";
import { useApiClient } from "@/libs/useApiClient";
import { produce } from "immer";

// Cart Item with unique identifier for color/size combinations
export type CartItemType = ProductData & {
  quantity: number;
  cartItemId: string; // Unique ID for this specific cart item combination
  selectedVariant?: ProductVariant; // Reference to the selected variant
};

// Bookmark Type - Now properly extends ProductData
export type BookmarkType = ProductData & {
  bookmarkId: string; // Unique ID for this specific bookmark combination
  bookmarkCreatedAt: string; // Renamed to avoid conflict with ProductData.createdAt
  selectedVariant?: ProductVariant; // Reference to the selected variant
};

// Cart Statistics
export type CartStats = {
  totalItems: number;
  totalPrice: number;
  uniqueProducts?: number;
};

// Bookmark Statistics
export type BookmarkStats = {
  totalBookmarks: number;
  uniqueProducts: number;
  categoriesBookmarked: string[];
};

// Enhanced Cart Store
export type CartStore = {
  cartItems: CartItemType[];
  cartInView: boolean;
  products: ProductData[];
  cartState: "idle" | "loading" | "success" | "error";
  productPaginationState: "idle" | "loading" | "success" | "error";
  error: string | null;
  bookMarks: BookmarkType[];

  // Computed getters
  getCartStats: () => CartStats;
  getBookmarkStats: () => BookmarkStats;
  getCartItem: (
    productId: string,
    colorId?: string,
    size?: string
  ) => CartItemType | undefined;
  getBookmark: (
    productId: string,
    colorId?: string,
    size?: string
  ) => BookmarkType | undefined;
  isInCart: (productId: string, colorId?: string, size?: string) => boolean;
  isBookmarked: (productId: string, colorId?: string, size?: string) => boolean;
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
  updateColor: (cartItemId: string, newColorId: string) => void;

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
  loadProducts: (
    force?: boolean,
    page?: number,
    limit?: number,
    filters?: FilterQueries
  ) => Promise<void>;
  refreshProducts: () => Promise<void>;
  syncCartWithProducts: () => void;
  syncBookmarksWithProducts: () => void;
  getProductById: (productId: string) => ProductData | undefined;
  getVariantByColorId: (
    product: ProductData,
    colorId: string
  ) => ProductVariant | undefined;
  getAvailableColorsForProduct: (
    productId: string
  ) => { id: string; color: string; colorHex?: string }[];
  getAvailableSizesForColor: (productId: string, colorId: string) => string[];
  getVariantStock: (product: ProductData, colorId?: string) => number;
};

// Helper function to generate unique cart item ID
const generateCartItemId = (
  productId: string,
  colorId?: string,
  size?: string
): string => {
  return `${productId}-${colorId || "default"}-${size || "default"}`;
};

// Helper function to generate unique bookmark ID
const generateBookmarkId = (
  productId: string,
  colorId?: string,
  size?: string
): string => {
  return `bookmark-${productId}-${colorId || "default"}-${size || "default"}`;
};

// Helper function to validate product before adding to cart
const validateProduct = (product: ProductData): boolean => {
  return !!(
    product._id &&
    product.name &&
    product.price >= 0 &&
    product.totalNumber > 0 &&
    product.status === "active"
  );
};

// Helper function to get variant stock
const getVariantStock = (product: ProductData, colorId?: string): number => {
  if (!colorId) {
    // Return total stock across all variants
    return product.variants.reduce(
      (total, variant) => total + variant.stock,
      0
    );
  }

  const variant = product.variants.find((v) => v._id === colorId);
  return variant ? variant.stock : 0;
};

interface FilterQueries {
  category?: string[];
  sort_by?: string;
  price?: string;
  products?: string[];
  name?: string;
  createdAt?: string;
}

const sortMapping: { [key: string]: string } = {
  "Price: Low to High": "price",
  "Price: High to Low": "-price",
  "Rating: High to Low": "-averageRating,numReviews,stock,-createdAt,price",
  "Rating: Low to High": "averageRating,numReviews,stock,-createdAt,price",
  "Newest First": "-createdAt,price",
  "Oldest First": "createdAt,price",
  "Name: A to Z": "name,price",
  "Name: Z to A": "-name,price",
  "Stock: High to Low": "-stock,price",
  "Stock: Low to High": "stock,price",
  "Most Reviews": "-numReviews,averageRating,price",
  "Least Reviews": "numReviews,averageRating,price",
};

// Enhanced Zustand Store Creator
export const useCartStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  CartStore
> = (set, get) => ({
  cartItems: [],
  cartInView: false,
  cartState: "idle",
  productPaginationState: "idle",
  products: [],
  error: null,
  bookMarks: [],

  // Computed getters
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
      uniqueProducts: new Set(bookMarks.map((b) => b._id)).size,
      categoriesBookmarked: Array.from(categories),
    };
  },

  getCartItem: (productId, colorId, size) => {
    const { cartItems } = get();
    const cartItemId = generateCartItemId(productId, colorId, size);
    return cartItems.find((item) => item.cartItemId === cartItemId);
  },

  getBookmark: (productId, colorId, size) => {
    const { bookMarks } = get();
    const bookmarkId = generateBookmarkId(productId, colorId, size);
    return bookMarks.find((bookmark) => bookmark.bookmarkId === bookmarkId);
  },

  isInCart: (productId, colorId, size) => {
    return !!get().getCartItem(productId, colorId, size);
  },

  isBookmarked: (productId, colorId, size) => {
    return !!get().getBookmark(productId, colorId, size);
  },

  getBookmarkedProducts: () => {
    const { bookMarks } = get();
    return bookMarks;
  },

  getProductById: (productId) => {
    const { products } = get();
    return products.find((product) => product._id === productId);
  },

  getVariantByColorId: (product, colorId) => {
    return product.variants.find((variant) => variant._id === colorId);
  },

  getAvailableColorsForProduct: (productId) => {
    const { products } = get();
    const product = products.find((p) => p._id === productId);
    if (!product) return [];

    return product.variants.map((variant) => ({
      id: variant._id,
      color: variant.color,
      colorHex: variant.colorHex,
    }));
  },

  getAvailableSizesForColor: (productId, colorId) => {
    const { products } = get();
    const product = products.find((p) => p._id === productId);
    if (!product) return [];

    const variant = product.variants.find((v) => v._id === colorId);
    return variant ? variant.sizes : [];
  },

  getVariantStock: (product, colorId) => {
    return getVariantStock(product, colorId);
  },

  // Cart view toggle
  setCartInView: (inView) =>
    set((state) => {
      state.cartInView = inView !== undefined ? inView : !state.cartInView;
    }),

  // Enhanced add to cart with variant-based stock validation
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

      // Get the selected variant
      const selectedVariant = product.variants.find(
        (v) => v._id === product.selectedColor
      );

      // console.log(selectedVariant);
      // console.log(product, "product");

      if (!selectedVariant) {
        console.error("No variant selected or variant not found");
        return;
      }

      // Check if the selected size is available in the variant
      if (
        product.selectedSize &&
        !selectedVariant.sizes.includes(product.selectedSize)
      ) {
        console.error("Selected size not available in this variant");
        return;
      }

      const cartItemId = generateCartItemId(
        product._id,
        product.selectedColor,
        product.selectedSize
      );

      const existingItem = state.cartItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        // Check variant stock before increasing quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= selectedVariant.stock) {
          existingItem.quantity = newQuantity;
        } else {
          console.warn(
            `Cannot add ${quantity} items. Only ${
              selectedVariant.stock - existingItem.quantity
            } left in stock for this variant.`
          );
          existingItem.quantity = selectedVariant.stock;
        }
      } else {
        // Check variant stock before adding new item
        const finalQuantity = Math.min(quantity, selectedVariant.stock);
        state.cartItems.push({
          ...product,
          quantity: finalQuantity,
          cartItemId,
          selectedVariant,
        });
      }
    }),

  // Remove entire cart item
  removeFromCart: (cartItemId) =>
    set((state) => {
      const index = state.cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (index !== -1) {
        state.cartItems.splice(index, 1);
      }
    }),

  // Clear entire cart
  clearCart: () =>
    set((state) => {
      state.cartItems = [];
    }),

  // Increase quantity with variant stock validation
  increaseQuantity: (cartItemId) =>
    set((state) => {
      const item = state.cartItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (item && item.selectedVariant) {
        if (item.quantity < item.selectedVariant.stock) {
          item.quantity += 1;
        } else {
          console.warn(
            `Cannot increase quantity. Maximum stock (${item.selectedVariant.stock}) reached for this variant.`
          );
        }
      }
    }),

  // Decrease quantity or remove if zero
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

  // Set specific quantity with variant stock validation
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
      if (item && item.selectedVariant) {
        item.quantity = Math.min(quantity, item.selectedVariant.stock);
      }
    }),
  updateColor: (identifier, newColorId) =>
    set((state) => {
      const updateSizeIfNeeded = (
        entity: { selectedSize?: string; sizes?: string[] },
        newVariant: ProductVariant
      ) => {
        entity.sizes = [...newVariant.sizes];

        if (
          entity.selectedSize &&
          !newVariant.sizes.includes(entity.selectedSize)
        ) {
          entity.selectedSize = undefined;
        }
      };

      // --- SCENARIO 1: Updating an item already in the cart ---
      const cartItem = state.cartItems.find(
        (item) => item.cartItemId === identifier
      );

      if (cartItem) {
        const product = state.products.find((p) => p._id === cartItem._id);
        const newVariant = product?.variants.find((v) => v._id === newColorId);
        if (!newVariant) return;

        const newCartItemId = generateCartItemId(
          cartItem._id,
          newColorId,
          cartItem.selectedSize
        );

        const existingItem = state.cartItems.find(
          (item) => item.cartItemId === newCartItemId
        );

        if (existingItem) {
          // Merge quantities, respect stock
          existingItem.quantity = Math.min(
            existingItem.quantity + cartItem.quantity,
            newVariant.stock
          );

          // Remove old cart item
          state.cartItems = state.cartItems.filter(
            (item) => item.cartItemId !== identifier
          );
        } else {
          // Update this cart item
          cartItem.selectedColor = newColorId;
          cartItem.cartItemId = newCartItemId;
          cartItem.selectedVariant = newVariant;

          updateSizeIfNeeded(cartItem, newVariant);

          // Adjust quantity
          cartItem.quantity = Math.min(cartItem.quantity, newVariant.stock);
        }

        // Sync product selection with variant
        if (product) {
          product.selectedColor = newColorId;
          updateSizeIfNeeded(product, newVariant);
        }

        return;
      }

      // --- SCENARIO 2: Updating product (before adding to cart) ---
      const product = state.products.find((p) => p._id === identifier);
      const newVariant = product?.variants.find((v) => v._id === newColorId);

      if (product && newVariant) {
        product.selectedColor = newColorId;
        updateSizeIfNeeded(product, newVariant);
      }
    }),

  // Update size - works both before and after adding to cart
  updateSize: (identifier, newSize) =>
    set((state) => {
      // Try to find cart item first (for items already in cart)
      const cartItem = state.cartItems.find(
        (item) => item.cartItemId === identifier
      );

      if (cartItem) {
        // SCENARIO 1: Item exists in cart - update cart item + product
        const product = state.products.find((p) => p._id === cartItem._id);
        const currentVariant = product?.variants.find(
          (v) => v._id === cartItem.selectedColor
        );

        if (!currentVariant || !currentVariant.sizes.includes(newSize)) {
          console.error(
            `Size ${newSize} not available for current color variant`
          );
          return;
        }

        const newCartItemId = generateCartItemId(
          cartItem._id,
          cartItem.selectedColor,
          newSize
        );

        // Check if item with new size already exists in cart
        const existingItem = state.cartItems.find(
          (item) => item.cartItemId === newCartItemId
        );

        if (existingItem) {
          // Merge quantities (respecting variant stock)
          const maxQuantity = Math.min(
            existingItem.quantity + cartItem.quantity,
            currentVariant.stock
          );
          existingItem.quantity = maxQuantity;

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
        // SCENARIO 2: Update product (before adding to cart)
        const product = state.products.find((p) => p._id === identifier);
        const currentVariant = product?.variants.find(
          (v) => v._id === product.selectedColor
        );

        if (
          product &&
          currentVariant &&
          currentVariant.sizes.includes(newSize)
        ) {
          product.selectedSize = newSize;
        }
      }
    }),

  // Add bookmark with variant support
  addBookmark: (product) =>
    set((state) => {
      const bookmarkId = generateBookmarkId(
        product._id,
        product.selectedColor,
        product.selectedSize
      );

      const existingBookmark = state.bookMarks.find(
        (bookmark) => bookmark.bookmarkId === bookmarkId
      );

      if (!existingBookmark) {
        const selectedVariant = product.variants.find(
          (v) => v._id === product.selectedColor
        );

        const newBookmark: BookmarkType = {
          ...product, // Include all product properties
          bookmarkId,
          bookmarkCreatedAt: new Date().toISOString(),
          selectedVariant,
        };
        state.bookMarks.push(newBookmark);
      }
    }),

  // Remove bookmark
  removeBookmark: (bookmarkId) =>
    set((state) => {
      const index = state.bookMarks.findIndex(
        (bookmark) => bookmark.bookmarkId === bookmarkId
      );
      if (index !== -1) {
        state.bookMarks.splice(index, 1);
      }
    }),

  // Toggle bookmark with variant support
  toggleBookmark: (product) =>
    set((state) => {
      const bookmarkId = generateBookmarkId(
        product._id,
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
        const selectedVariant = product.variants.find(
          (v) => v._id === product.selectedColor
        );

        const newBookmark: BookmarkType = {
          ...product, // Include all product properties
          bookmarkId,
          bookmarkCreatedAt: new Date().toISOString(),
          selectedVariant,
        };
        state.bookMarks.push(newBookmark);
      }
    }),

  // Clear all bookmarks
  clearBookmarks: () =>
    set((state) => {
      state.bookMarks = [];
    }),

  addBookmarksToCart: (bookmarkIds, quantity = 1) => {
    const state = get();
    const updatedCartItems = [...state.cartItems];

    bookmarkIds.forEach((bookmarkId) => {
      const bookmark = state.bookMarks.find((b) => b.bookmarkId === bookmarkId);

      if (bookmark && validateProduct(bookmark) && bookmark.selectedVariant) {
        const cartItemId = generateCartItemId(
          bookmark._id,
          bookmark.selectedColor,
          bookmark.selectedSize
        );

        const existingItem = updatedCartItems.find(
          (item) => item.cartItemId === cartItemId
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          existingItem.quantity = Math.min(
            newQuantity,
            bookmark.selectedVariant.stock
          );
        } else {
          const finalQuantity = Math.min(
            quantity,
            bookmark.selectedVariant.stock
          );
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
    });
  },

  addAllBookmarksToCart: (quantity = 1) => {
    const allBookmarkIds = get().bookMarks.map((b) => b.bookmarkId);
    get().addBookmarksToCart(allBookmarkIds, quantity);
  },

  // Remove multiple bookmarks
  removeMultipleBookmarks: (bookmarkIds) =>
    set((state) => {
      state.bookMarks = state.bookMarks.filter(
        (bookmark) => !bookmarkIds.includes(bookmark.bookmarkId)
      );
    }),

  // Sync cart with products (updated for variants)
  syncCartWithProducts: () =>
    set((state) => {
      if (state.products.length === 0 || state.cartItems.length === 0) {
        return; // Nothing to sync
      }

      // Update cart items with fresh product data
      state.cartItems = state.cartItems
        .map((cartItem) => {
          const product = state.products.find((p) => p._id === cartItem._id);
          if (!product) {
            console.warn(
              `Product ${cartItem._id} not found, removing from cart`
            );
            return null; // Will be filtered out
          }

          // Find the variant for the selected color
          const selectedVariant = product.variants.find(
            (v) => v._id === cartItem.selectedColor
          );

          // Check if selected color/size still exists in product variants
          const isValidColor = !!selectedVariant;
          const isValidSize =
            !cartItem.selectedSize ||
            (selectedVariant &&
              selectedVariant.sizes.includes(cartItem.selectedSize));

          if (!isValidColor || !isValidSize) {
            console.warn(
              `Invalid color/size for product ${cartItem._id}, updating cart item`
            );

            // Use first available variant and size
            const firstVariant = product.variants[0];
            const newSelectedColor = firstVariant?._id;
            const newSelectedSize = isValidSize
              ? cartItem.selectedSize
              : firstVariant?.sizes[0];

            return {
              ...product, // Fresh product data
              cartItemId: generateCartItemId(
                product._id,
                newSelectedColor,
                newSelectedSize
              ),
              quantity: Math.min(cartItem.quantity, firstVariant?.stock || 0),
              selectedColor: newSelectedColor,
              selectedSize: newSelectedSize,
              selectedVariant: firstVariant,
            };
          }

          // Merge fresh product data with cart item
          return {
            ...product, // Fresh product data (price, etc.)
            cartItemId: cartItem.cartItemId,
            quantity: Math.min(cartItem.quantity, selectedVariant.stock),
            selectedColor: cartItem.selectedColor,
            selectedSize: cartItem.selectedSize,
            selectedVariant: selectedVariant,
          };
        })
        .filter(Boolean) as CartItemType[]; // Remove null items
    }),

  // Sync bookmarks with products (updated for variants)
  syncBookmarksWithProducts: () =>
    set((state) => {
      if (state.products.length === 0 || state.bookMarks.length === 0) {
        return; // Nothing to sync
      }

      // Update bookmarks with fresh product data
      state.bookMarks = state.bookMarks
        .map((bookmark) => {
          const product = state.products.find((p) => p._id === bookmark._id);

          if (!product || !product.isActive || product.status !== "active") {
            console.warn(
              `Product ${bookmark._id} not found or inactive, removing bookmark`
            );
            return null; // Will be filtered out
          }

          // Find the variant for the selected color
          const selectedVariant = product.variants.find(
            (v) => v._id === bookmark.selectedColor
          );

          // Check if selected color/size still exists in product variants
          const isValidColor = !!selectedVariant;
          const isValidSize =
            !bookmark.selectedSize ||
            (selectedVariant &&
              selectedVariant.sizes.includes(bookmark.selectedSize));

          // Use first available variant and size if current selection is invalid
          const firstVariant = product.variants[0];
          const newSelectedColor = isValidColor
            ? bookmark.selectedColor
            : firstVariant?._id;
          const newSelectedSize = isValidSize
            ? bookmark.selectedSize
            : (selectedVariant || firstVariant)?.sizes[0];
          const finalVariant = selectedVariant || firstVariant;

          // Create updated bookmark with fresh product data
          const updatedBookmark: BookmarkType = {
            ...product, // Fresh product data
            bookmarkId: generateBookmarkId(
              product._id,
              newSelectedColor,
              newSelectedSize
            ),
            bookmarkCreatedAt: bookmark.bookmarkCreatedAt,
            selectedColor: newSelectedColor,
            selectedSize: newSelectedSize,
            selectedVariant: finalVariant,
          };

          if (!isValidColor || !isValidSize) {
            console.warn(
              `Invalid color/size for bookmark ${bookmark.bookmarkId}, updating bookmark`
            );
          }

          return updatedBookmark;
        })
        .filter(Boolean) as BookmarkType[]; // Remove null items
    }),

  //  loadProducts to sync with cart and bookmarks after loading
  loadProducts: async (force, page, limit = 25, filters) => {
    const state = get();

    if (!force && page === undefined && state.products.length !== 0) return;
    const isFreshLoad = force || page === 1 || state.products.length === 0;

    if (isFreshLoad) {
      set((state) => {
        state.cartState = "loading";
        state.error = null;
      });
    } else {
      set((state) => {
        state.productPaginationState = "loading";
      });
    }

    const RESET_DELAY_MS = 3000;

    try {
      // Build query parameters
      const query = new URLSearchParams();
      state.loadCategories();

      query.append("status", "active");

      if (page && page !== 1) {
        query.append("page", page.toString());
      }

      if (limit) {
        query.append("limit", limit.toString());
      }

      // Add filter parameters
      if (filters) {
        if (filters.name) {
          query.append("name", filters.name);
        }

        if (filters.createdAt) {
          query.append("createdAt", filters.createdAt);
        }

        // Category filter - join multiple categories with comma
        if (filters?.category && filters.category.length > 0) {
          query.append("category", filters.category.join(","));
        }

        if (filters.products && filters.products.length > 0) {
          query.append("id", filters.products.join(","));
        }

        // Sort filter - convert to API format
        if (filters.sort_by) {
          const apiSortFormat = sortMapping[filters.sort_by] || filters.sort_by;
          query.append("sort", apiSortFormat);
        }

        // Price filter
        if (filters.price) {
          const [minPrice, maxPrice] = filters.price.split("-");

          if (minPrice) {
            query.append("minPrice", minPrice);
          }

          if (maxPrice) {
            query.append("maxPrice", maxPrice);
          }
        }
      }

      // Store current filters in state for pagination
      set((state) => {
        state.currentFilters = filters ?? null;
      });

      if (process.env.NODE_ENV === "development") {
        console.log(query.toString(), "Query parameters");
        console.log(filters, "Applied filters");
      }

      // Fetch products from API with query parameters
      const response = await fetch(`/api/products?${query.toString()}`, {
        cache: "no-cache",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch products: ${response.statusText}\n${errorText}`
        );
      }

      let result: { data: ProductData; total: number };
      try {
        result = await response.json();
      } catch (error) {
        throw new Error("Failed to parse response JSON");
      }

      if (!result || !Array.isArray(result.data)) {
        throw new Error(
          "Invalid response format: expected { data: ProductData[] }"
        );
      }

      // Transform products
      const transformedProducts: ProductData[] = result.data.map(
        (product: any) => {
          const firstVariant = product?.variants?.[0];
          return {
            ...product,
            id: product._id,
            colors:
              product.variants?.map((variant: any) => variant.color) || [],
            selectedColor: firstVariant?._id || null,
            mainImage: product.images?.[0]?.url || product.mainImage || "",
            sizes: firstVariant?.sizes || [],
            variants:
              product.variants?.map((variant: any) => ({
                ...variant,
                id: variant._id,
              })) || [],
          };
        }
      );

      // Merge new products with existing ones, avoiding duplicates
      set(
        produce((state: Store) => {
          // Clear products if force is true or page is 1
          if (force || page === 1) {
            state.products = [];
          }
          const existingProductIds = new Set(state.products.map((p) => p._id));
          const newProducts = transformedProducts.filter(
            (product) => product._id && !existingProductIds.has(product._id)
          );
          state.products = [...state.products, ...newProducts];
          if (result.total !== undefined) {
            state.totalItems = result.total;
          }

          // Set appropriate success state
          if (isFreshLoad) {
            state.cartState = "success";
          } else {
            state.productPaginationState = "success";
          }
        })
      );

      if (!isFreshLoad) {
        setTimeout(() => {
          set((state) => {
            state.productPaginationState = "idle";
          });
        }, RESET_DELAY_MS);
      }

      // Sync cart and bookmarks with fresh product data
      get().syncCartWithProducts();
      get().syncBookmarksWithProducts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to load products:", error);

      // Only update cartState for fresh loads
      if (isFreshLoad) {
        set((state) => {
          state.cartState = "error";
          state.error = errorMessage;
        });
      } else {
        set((state) => {
          state.productPaginationState = "error";
        });

        setTimeout(() => {
          set((state) => {
            state.productPaginationState = "idle";
          });
        }, RESET_DELAY_MS);

        console.warn("Pagination fetch failed:", errorMessage);
      }
    }
  },

  refreshProducts: async () => {
    await get().loadProducts();
  },
});

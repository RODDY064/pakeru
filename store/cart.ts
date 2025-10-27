import { type StateCreator } from "zustand";
import { Store } from "./store";
import { ProductData, ProductVariant } from "./dashbaord/products";
import { produce } from "immer";

// ============================================
// Types
// ============================================

export type CartItemType = ProductData & {
  quantity: number;
  cartItemId: string;
  selectedVariant?: ProductVariant;
};

export type BookmarkType = ProductData & {
  bookmarkId: string;
  bookmarkCreatedAt: string;
  selectedVariant?: ProductVariant;
};

export type CartStats = {
  totalItems: number;
  totalPrice: number;
  uniqueProducts: number;
};

export type BookmarkStats = {
  totalBookmarks: number;
  uniqueProducts: number;
  categoriesBookmarked: string[];
};

export type FilterQueries = {
  category?: string[];
  sort_by?: string;
  price?: string;
  products?: string[];
  name?: string;
  createdAt?: string;
};

export type CartStore = {
  // State
  cartItems: CartItemType[];
  bookMarks: BookmarkType[];
  cartInView: boolean;
  products: ProductData[];
  cartProductState: "idle" | "loading" | "success" | "error";
  productPaginationState: "idle" | "loading" | "success" | "error";
  error: string | null;
  totalPages: number;
  currentFilters: FilterQueries | null;

  // Cart - Stats & Queries
  getCartStats: () => CartStats;
  getCartItem: (
    productId: string,
    colorId?: string,
    size?: string
  ) => CartItemType | undefined;
  isInCart: (productId: string, colorId?: string, size?: string) => boolean;

  // Cart - Actions
  setCartInView: (inView?: boolean) => void;
  addToCart: (product: ProductData, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateSize: (cartItemId: string, newSize: string) => void;
  updateColor: (cartItemId: string, newColorId: string) => void;
  setProducts: (products: ProductData[], total?: number) => void;

  // Bookmarks - Stats & Queries
  getBookmarkStats: () => BookmarkStats;
  getBookmark: (
    productId: string,
    colorId?: string,
    size?: string
  ) => BookmarkType | undefined;
  isBookmarked: (productId: string, colorId?: string, size?: string) => boolean;
  getBookmarkedProducts: () => BookmarkType[];

  // Bookmarks - Actions
  addBookmark: (product: ProductData) => void;
  removeBookmark: (bookmarkId: string) => void;
  toggleBookmark: (product: ProductData) => void;
  clearBookmarks: () => void;
  addBookmarksToCart: (bookmarkIds: string[], quantity?: number) => void;
  addAllBookmarksToCart: (quantity?: number) => void;
  removeMultipleBookmarks: (bookmarkIds: string[]) => void;

  // Products - Management
  addProductToStore: (product: ProductData) => void;
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

  // Products - Loading & Sync
  loadProducts: (
    force?: boolean,
    page?: number,
    limit?: number,
    filters?: FilterQueries
  ) => Promise<void>;
  refreshProducts: () => Promise<void>;
  syncCartWithProducts: () => void;
  syncBookmarksWithProducts: () => void;
};

// ============================================
// Constants
// ============================================

const SORT_MAPPING: Record<string, string> = {
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

const RESET_DELAY_MS = 3000;
const REQUEST_TIMEOUT_MS = 10000;

// ============================================
// Helpers - Pure functions
// ============================================

const createItemId = (
  productId: string,
  colorId?: string,
  size?: string
): string => {
  return `${productId}-${colorId || "default"}-${size || "default"}`;
};

const createBookmarkId = (
  productId: string,
  colorId?: string,
  size?: string
): string => {
  return `bookmark-${createItemId(productId, colorId, size)}`;
};

const isProductValid = (product: ProductData): boolean => {
  return !!(
    product._id &&
    product.name &&
    product.price >= 0 &&
    product.totalNumber > 0 &&
    product.status === "active"
  );
};

const getVariantStock = (product: ProductData, colorId?: string): number => {
  if (!colorId) {
    return product.variants.reduce((total, v) => total + v.stock, 0);
  }
  const variant = product.variants.find((v) => v._id === colorId);
  return variant?.stock || 0;
};

export const findVariant = (
  product: ProductData | undefined,
  colorId?: string
): ProductVariant | undefined => {
  if (!product) return undefined;
  return product.variants.find((v) => v._id === colorId);
};

const clampQuantity = (quantity: number, maxStock: number): number => {
  return Math.max(1, Math.min(quantity, maxStock));
};

const buildQueryParams = (
  page?: number,
  limit?: number,
  filters?: FilterQueries
): URLSearchParams => {
  const query = new URLSearchParams();

  if (page && page > 1) {
    query.append("page", page.toString());
  }
  if (limit) {
    query.append("limit", limit.toString());
  }

  if (!filters) return query;

  if (filters.category?.length) {
    query.append("category", filters.category.join(","));
  }

  if (filters.name) {
    query.append("name", filters.name);
  }

  if (filters.sort_by) {
    const apiSort = SORT_MAPPING[filters.sort_by] || filters.sort_by;
    query.append("sort", apiSort);
  }

  if (filters.price) {
    const [minPrice, maxPrice] = filters.price.split("-");
    if (minPrice) query.append("minPrice", minPrice);
    if (maxPrice) query.append("maxPrice", maxPrice);
  }

  return query;
};

const transformProduct = (product: any): ProductData => {
  const firstVariant = product?.variants?.[0];

  return {
    ...product,
    id: product._id,
    colors: product.variants?.map((v: any) => v.color) || [],
    selectedColor: firstVariant?._id || null,
    mainImage: product.images?.[0]?.url || product.mainImage || "",
    sizes: firstVariant?.sizes || [],
    variants:
      product.variants?.map((v: any) => ({
        ...v,
        id: v._id,
      })) || [],
  };
};

const mergeProducts = (
  existing: ProductData[],
  incoming: ProductData[],
  shouldReplace: boolean
): ProductData[] => {
  if (shouldReplace) return incoming;

  const existingIds = new Set(existing.map((p) => p._id));
  const newProducts = incoming.filter((p) => p._id && !existingIds.has(p._id));

  return [...existing, ...newProducts];
};

// ============================================
// Store Implementation
// ============================================

export const useCartStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  CartStore
> = (set, get) => ({
  // State
  cartItems: [],
  bookMarks: [],
  cartInView: false,
  products: [],
  cartProductState: "loading",
  productPaginationState: "idle",
  error: null,
  totalPages: 0,
  currentFilters: null,

  // ============================================
  // Cart - Stats & Queries
  // ============================================

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

  getCartItem: (productId, colorId, size) => {
    const id = createItemId(productId, colorId, size);
    return get().cartItems.find((item) => item.cartItemId === id);
  },

  isInCart: (productId, colorId, size) => {
    return !!get().getCartItem(productId, colorId, size);
  },

  // ============================================
  // Cart - Actions
  // ============================================

  setCartInView: (inView) =>
    set((state) => {
      state.cartInView = inView ?? !state.cartInView;
    }),

  addToCart: (product, quantity = 1) =>
    set((state) => {
      if (!isProductValid(product)) {
        console.error("Invalid product");
        return;
      }

      if (quantity <= 0) {
        console.error("Invalid quantity");
        return;
      }

      const variant = findVariant(product, product.selectedColor);
      if (!variant) {
        console.error("Variant not found");
        return;
      }

      if (
        product.selectedSize &&
        !variant.sizes.includes(product.selectedSize)
      ) {
        console.error("Size not available in this variant");
        return;
      }

      const cartItemId = createItemId(
        product._id,
        product.selectedColor,
        product.selectedSize
      );

      const existingItem = state.cartItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        existingItem.quantity = clampQuantity(newQuantity, variant.stock);

        if (newQuantity > variant.stock) {
          console.warn(`Only ${variant.stock} items available`);
        }
      } else {
        state.cartItems.push({
          ...product,
          quantity: clampQuantity(quantity, variant.stock),
          cartItemId,
          selectedVariant: variant,
        });
      }
    }),

  removeFromCart: (cartItemId) =>
    set((state) => {
      const index = state.cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (index !== -1) {
        state.cartItems.splice(index, 1);
      }
    }),

  clearCart: () =>
    set((state) => {
      state.cartItems = [];
    }),

  increaseQuantity: (cartItemId) =>
    set((state) => {
      const item = state.cartItems.find((i) => i.cartItemId === cartItemId);
      if (!item?.selectedVariant) return;

      if (item.quantity < item.selectedVariant.stock) {
        item.quantity += 1;
      } else {
        console.warn(`Max stock (${item.selectedVariant.stock}) reached`);
      }
    }),

  decreaseQuantity: (cartItemId) =>
    set((state) => {
      const index = state.cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (index === -1) return;

      const item = state.cartItems[index];
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cartItems.splice(index, 1);
      }
    }),

  updateQuantity: (cartItemId, quantity) =>
    set((state) => {
      const index = state.cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (index === -1) return;

      if (quantity <= 0) {
        state.cartItems.splice(index, 1);
        return;
      }

      const item = state.cartItems[index];
      if (item.selectedVariant) {
        item.quantity = clampQuantity(quantity, item.selectedVariant.stock);
      }
    }),

  updateColor: (identifier, newColorId) =>
    set((state) => {
      const cartItem = state.cartItems.find(
        (item) => item.cartItemId === identifier
      );

      if (cartItem) {
        const product = state.products.find((p) => p._id === cartItem._id);
        const newVariant = findVariant(product, newColorId);
        if (!newVariant) return;

        const newCartItemId = createItemId(
          cartItem._id,
          newColorId,
          cartItem.selectedSize
        );

        const existingItem = state.cartItems.find(
          (item) => item.cartItemId === newCartItemId
        );

        if (existingItem) {
          existingItem.quantity = clampQuantity(
            existingItem.quantity + cartItem.quantity,
            newVariant.stock
          );
          const index = state.cartItems.findIndex(
            (item) => item.cartItemId === identifier
          );
          state.cartItems.splice(index, 1);
        } else {
          cartItem.cartItemId = newCartItemId;
          cartItem.selectedColor = newColorId;
          cartItem.selectedVariant = newVariant;
          cartItem.quantity = clampQuantity(
            cartItem.quantity,
            newVariant.stock
          );

          if (
            cartItem.selectedSize &&
            !newVariant.sizes.includes(cartItem.selectedSize)
          ) {
            cartItem.selectedSize = newVariant.sizes[0];
          }
          cartItem.sizes = newVariant.sizes;
        }

        if (product) {
          product.selectedColor = newColorId;
          if (
            product.selectedSize &&
            !newVariant.sizes.includes(product.selectedSize)
          ) {
            product.selectedSize = newVariant.sizes[0];
          }
          product.sizes = newVariant.sizes;
        }
      } else {
        const product = state.products.find((p) => p._id === identifier);
        if (!product) return;

        const newVariant = findVariant(product, newColorId);
        if (!newVariant) return;

        product.selectedColor = newColorId;
        if (
          product.selectedSize &&
          !newVariant.sizes.includes(product.selectedSize)
        ) {
          product.selectedSize = newVariant.sizes[0];
        }
        product.sizes = newVariant.sizes;
      }
    }),

  updateSize: (identifier, newSize) =>
    set((state) => {
      const cartItem = state.cartItems.find(
        (item) => item.cartItemId === identifier
      );

      if (cartItem) {
        const product = state.products.find((p) => p._id === cartItem._id);
        const variant = findVariant(product, cartItem.selectedColor);

        if (!variant?.sizes.includes(newSize)) {
          console.error(`Size ${newSize} not available`);
          return;
        }

        const newCartItemId = createItemId(
          cartItem._id,
          cartItem.selectedColor,
          newSize
        );

        const existingItem = state.cartItems.find(
          (item) => item.cartItemId === newCartItemId
        );

        if (existingItem) {
          existingItem.quantity = clampQuantity(
            existingItem.quantity + cartItem.quantity,
            variant.stock
          );
          const index = state.cartItems.findIndex(
            (item) => item.cartItemId === identifier
          );
          state.cartItems.splice(index, 1);
        } else {
          cartItem.selectedSize = newSize;
          cartItem.cartItemId = newCartItemId;
        }

        if (product) {
          product.selectedSize = newSize;
        }
      } else {
        const product = state.products.find((p) => p._id === identifier);
        if (!product) return;

        const variant = findVariant(product, product.selectedColor);
        if (variant?.sizes.includes(newSize)) {
          product.selectedSize = newSize;
        }
      }
    }),

  // ============================================
  // Bookmarks - Stats & Queries
  // ============================================

  getBookmarkStats: () => {
    const { bookMarks } = get();
    const categories = new Set(bookMarks.map((b) => b.category));

    return {
      totalBookmarks: bookMarks.length,
      uniqueProducts: new Set(bookMarks.map((b) => b._id)).size,
      categoriesBookmarked: Array.from(categories),
    };
  },

  setProducts: (products: ProductData[], total) => {
  set((draft) => {
    draft.products = products;
    draft.error = null;
    console.log("setProducts called:", {
      productCount: products.length,
      cartProductState: draft.cartProductState,
    });
  });
},

  getBookmark: (productId, colorId, size) => {
    const id = createBookmarkId(productId, colorId, size);
    return get().bookMarks.find((b) => b.bookmarkId === id);
  },

  isBookmarked: (productId, colorId, size) => {
    return !!get().getBookmark(productId, colorId, size);
  },

  getBookmarkedProducts: () => get().bookMarks,

  // ============================================
  // Bookmarks - Actions
  // ============================================

  addBookmark: (product) =>
    set((state) => {
      const bookmarkId = createBookmarkId(
        product._id,
        product.selectedColor,
        product.selectedSize
      );

      const exists = state.bookMarks.some((b) => b.bookmarkId === bookmarkId);
      if (exists) return;

      const variant = findVariant(product, product.selectedColor);

      state.bookMarks.push({
        ...product,
        bookmarkId,
        bookmarkCreatedAt: new Date().toISOString(),
        selectedVariant: variant,
      });
    }),

  removeBookmark: (bookmarkId) =>
    set((state) => {
      const index = state.bookMarks.findIndex(
        (b) => b.bookmarkId === bookmarkId
      );
      if (index !== -1) {
        state.bookMarks.splice(index, 1);
      }
    }),

  toggleBookmark: (product) =>
    set((state) => {
      const bookmarkId = createBookmarkId(
        product._id,
        product.selectedColor,
        product.selectedSize
      );

      const index = state.bookMarks.findIndex(
        (b) => b.bookmarkId === bookmarkId
      );

      if (index !== -1) {
        state.bookMarks.splice(index, 1);
      } else {
        const variant = findVariant(product, product.selectedColor);
        state.bookMarks.push({
          ...product,
          bookmarkId,
          bookmarkCreatedAt: new Date().toISOString(),
          selectedVariant: variant,
        });
      }
    }),

  clearBookmarks: () =>
    set((state) => {
      state.bookMarks = [];
    }),

  addBookmarksToCart: (bookmarkIds, quantity = 1) =>
    set((state) => {
      bookmarkIds.forEach((bookmarkId) => {
        const bookmark = state.bookMarks.find(
          (b) => b.bookmarkId === bookmarkId
        );
        if (
          !bookmark ||
          !isProductValid(bookmark) ||
          !bookmark.selectedVariant
        ) {
          return;
        }

        const cartItemId = createItemId(
          bookmark._id,
          bookmark.selectedColor,
          bookmark.selectedSize
        );

        const existingItem = state.cartItems.find(
          (item) => item.cartItemId === cartItemId
        );

        if (existingItem) {
          existingItem.quantity = clampQuantity(
            existingItem.quantity + quantity,
            bookmark.selectedVariant.stock
          );
        } else {
          state.cartItems.push({
            ...bookmark,
            quantity: clampQuantity(quantity, bookmark.selectedVariant.stock),
            cartItemId,
          });
        }
      });

      state.bookMarks = state.bookMarks.filter(
        (b) => !bookmarkIds.includes(b.bookmarkId)
      );
    }),

  addAllBookmarksToCart: (quantity = 1) => {
    const allIds = get().bookMarks.map((b) => b.bookmarkId);
    get().addBookmarksToCart(allIds, quantity);
  },

  removeMultipleBookmarks: (bookmarkIds) =>
    set((state) => {
      state.bookMarks = state.bookMarks.filter(
        (b) => !bookmarkIds.includes(b.bookmarkId)
      );
    }),

  // ============================================
  // Products - Management
  // ============================================

  addProductToStore: (product) =>
    set((state) => {
      const exists = state.products.some((p) => p._id === product._id);
      if (exists) return;

      state.products.push({
        ...product,
        selectedColor: product.selectedColor || product.variants[0]?._id,
        selectedSize: product.selectedSize || product.variants[0]?.sizes[0],
      });
    }),

  getProductById: (productId) => {
    return get().products.find((p) => p._id === productId);
  },

  getVariantByColorId: (product, colorId) => {
    return findVariant(product, colorId);
  },

  getAvailableColorsForProduct: (productId) => {
    const product = get().products.find((p) => p._id === productId);
    if (!product) return [];

    return product.variants.map((v) => ({
      id: v._id,
      color: v.color,
      colorHex: v.colorHex,
    }));
  },

  getAvailableSizesForColor: (productId, colorId) => {
    const product = get().products.find((p) => p._id === productId);
    if (!product) return [];

    const variant = findVariant(product, colorId);
    return variant?.sizes || [];
  },

  getVariantStock: (product, colorId) => {
    return getVariantStock(product, colorId);
  },

  // ============================================
  // Products - Loading & Sync
  // ============================================

  loadProducts: async (force, page = 1, limit = 24, filters) => {
    const state = get();

    if (state.isServerInitialized) {
      console.log("Skipping refetch: server already initialized");
      set((draft) => {
        draft.isServerInitialized = false;
      });
      return;
    }

    const isPagination = !force && page > 1;
    const isFiltering = force || (!!filters && page === 1);

    // Prevent concurrent loads
    if (isFiltering && state.cartProductState === "loading") {
      console.log("Filter load already in progress, skipping");
      return;
    }

    if (isPagination && state.productPaginationState === "loading") {
      console.log("Pagination already in progress, skipping");
      return;
    }

    set((draft) => {
      if (isFiltering) {
        draft.cartProductState = "loading";
        draft.error = null;
      } else if (isPagination) {
        draft.productPaginationState = "loading";
      }
      draft.currentFilters = filters ?? null;
    });

    const safetyTimeout = setTimeout(() => {
      console.error("Load products timed out!");
      set((draft) => {
        draft.cartProductState = "error";
        draft.productPaginationState = "idle";
        draft.error = "Request timed out";
      });
    }, 30000);

    try {
      state.loadCategories();
      const query = buildQueryParams(page, limit, filters);

      if (process.env.NODE_ENV === "development") {
        console.log("Query:", query.toString());
        console.log("Filters:", filters);
      }

      const response = await fetch(`/api/products?${query.toString()}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      clearTimeout(safetyTimeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}\n${errorText}`
        );
      }

      const result = await response.json();

      if (!result?.data || !Array.isArray(result.data)) {
        throw new Error("Invalid API response format");
      }

      const transformedProducts = result.data.map(transformProduct);

      set(
        produce((state: Store) => {
          const shouldReplace = !isPagination;
          state.products = mergeProducts(
            state.products,
            transformedProducts,
            shouldReplace
          );

          if (result.total !== undefined) {
            state.totalPages = result.total;
          }

          if (isFiltering) {
            state.cartProductState = "success";
          } else if (isPagination) {
            state.productPaginationState = "success";
          }
        })
      );

      if (isPagination) {
        setTimeout(() => {
          set((draft) => {
            draft.productPaginationState = "idle";
          });
        }, RESET_DELAY_MS);
      }

      get().syncCartWithProducts();
      get().syncBookmarksWithProducts();
    } catch (error) {
      clearTimeout(safetyTimeout);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to load products";
      console.error("Product loading error:", error);

      set((draft) => {
        draft.error = errorMessage;
        if (isFiltering) {
          draft.cartProductState = "error";
        } else {
          draft.productPaginationState = "error";
        }
      });

      if (isPagination) {
        setTimeout(() => {
          set((draft) => {
            draft.productPaginationState = "idle";
          });
        }, RESET_DELAY_MS);
      }
    }
  },

  refreshProducts: async () => {
    await get().loadProducts(true, 1);
  },

  syncCartWithProducts: () =>
    set((state) => {
      if (state.products.length === 0 || state.cartItems.length === 0) return;

      state.cartItems = state.cartItems
        .map((cartItem) => {
          const product = state.products.find((p) => p._id === cartItem._id);
          if (!product) {
            console.warn(
              `Product ${cartItem._id} not found, removing from cart`
            );
            return null;
          }

          const variant = findVariant(product, cartItem.selectedColor);
          const isValidColor = !!variant;
          const isValidSize =
            !cartItem.selectedSize ||
            (variant && variant.sizes.includes(cartItem.selectedSize));

          if (!isValidColor || !isValidSize) {
            const firstVariant = product.variants[0];
            return {
              ...product,
              cartItemId: createItemId(
                product._id,
                firstVariant._id,
                firstVariant.sizes[0]
              ),
              quantity: clampQuantity(cartItem.quantity, firstVariant.stock),
              selectedColor: firstVariant._id,
              selectedSize: firstVariant.sizes[0],
              selectedVariant: firstVariant,
            };
          }

          return {
            ...product,
            cartItemId: cartItem.cartItemId,
            quantity: clampQuantity(cartItem.quantity, variant.stock),
            selectedColor: cartItem.selectedColor,
            selectedSize: cartItem.selectedSize,
            selectedVariant: variant,
          };
        })
        .filter(Boolean) as CartItemType[];
    }),

  syncBookmarksWithProducts: () =>
    set((state) => {
      if (state.products.length === 0 || state.bookMarks.length === 0) return;

      state.bookMarks = state.bookMarks
        .map((bookmark) => {
          const product = state.products.find((p) => p._id === bookmark._id);
          if (!product || product.status !== "active") {
            console.warn(`Product ${bookmark._id} not available`);
            return null;
          }

          const variant = findVariant(product, bookmark.selectedColor);
          const isValidColor = !!variant;
          const isValidSize =
            !bookmark.selectedSize ||
            (variant && variant.sizes.includes(bookmark.selectedSize));

          const firstVariant = product.variants[0];
          const finalVariant = variant || firstVariant;
          const finalColor = isValidColor
            ? bookmark.selectedColor
            : firstVariant._id;
          const finalSize = isValidSize
            ? bookmark.selectedSize
            : finalVariant.sizes[0];

          return {
            ...product,
            bookmarkId: createBookmarkId(product._id, finalColor, finalSize),
            bookmarkCreatedAt: bookmark.bookmarkCreatedAt,
            selectedColor: finalColor,
            selectedSize: finalSize,
            selectedVariant: finalVariant,
          };
        })
        .filter(Boolean) as BookmarkType[];
    }),
});

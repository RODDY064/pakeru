import { type StateCreator } from "zustand";
import { Store } from "../store";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";

// Enhanced variant structure with better typing
export type ProductVariant = {
  id: string;
  color: string;
  colorHex?: string;
  description: string;
  sizes: string[];
  images: string[];
  stock: number;
};

// Product structure
export type ProductData = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  date: string;
  time: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalNumber: number;
  category: string;
  tags?: string[];
  status: "out-of-stock" | "active" | "inactive" | "draft";
  selectedSize?: string;
  selectedColor?: string;
  rating: number;
  numReviews?: number;
  stock: number;
  isActive: boolean;
  price: number;
  comparePrice?: number;
  variants: ProductVariant[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  visibility?: "public" | "private" | "hidden";
  sizes: string[];
  mainImage: string;
  images: {
    _id: string;
    publicId: string;
    url: string;
  }[];
  colors: string[];
};

// Filters
export type Filters = {
  status: "active" | "inactive" | "all" | "out-of-stock" | "draft";
  category: string;
  subcategory?: string;
  priceRange?: [number, number];
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock" | "all";
  tags?: string[];
  search?: string;
};

// Sorting options
export type SortOption = {
  field: keyof ProductData | "stock" | "variants";
  direction: "asc" | "desc";
};

// Loading states for better UX
export type LoadingState = {
  products: boolean;
  product: boolean;
  updating: boolean;
  deleting: string[];
};

// Error handling
export type ErrorState = {
  products: string | null;
  product: string | null;
  general: string | null;
};

// Store interface
export type StoreProductStore = {
  // State
  selectedProduct: ProductData | null;
  storeProducts: ProductData[];
  filteredProducts: ProductData[];
  dashboardProductLoading: LoadingState;
  dashboardProductErrors: ErrorState;

  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;

  // CRUD operations with error handling
  addProduct: (product: Omit<ProductData, "id">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<ProductData>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  bulkUpdateProducts: (
    ids: string[],
    updates: Partial<ProductData>
  ) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;

  // Selection and navigation
  setSelectedProduct: (product: ProductData | null) => void;
  getProductById: (id: string) => ProductData | undefined;
  getProductBySlug: (slug: string) => ProductData | undefined;

  // Data management
  clearProducts: () => void;
  loadProducts: (force?: boolean,pagination?:number) => Promise<void>;
  loadProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;

  // Filtering and search
  productFilters: Filters;
  sortOption: SortOption;
  resetFilters: () => void;
  setProductFilters: (filters: Partial<Filters>) => void;
  setSortOption: (sort: SortOption) => void;
  searchProducts: (query: string) => void;
  applyFilters: () => void;

  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;

  // Batch operations
  setProducts: (products: ProductData[]) => void;
  addProducts: (products: ProductData[]) => void;

  // Computed getters
  getProductsByCategory: (category: string) => ProductData[];
  getProductsByStatus: (status: ProductData["status"]) => ProductData[];
  getLowStockProducts: (threshold?: number) => ProductData[];
  getProductStats: () => {
    total: number;
    active: number;
    inactive: number;
    outOfStock: number;
    draft: number;
    lowStock: number;
  };

  // Error management
  clearError: (type: keyof ErrorState) => void;
  clearAllErrors: () => void;

  // Variant management
  addVariant: (
    productId: string,
    variant: Omit<ProductVariant, "id">
  ) => Promise<void>;
  updateVariant: (
    productId: string,
    variantId: string,
    updates: Partial<ProductVariant>
  ) => Promise<void>;
  removeVariant: (productId: string, variantId: string) => Promise<void>;
};

// Utility functions
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const calculateTotalStock = (variants: ProductVariant[]): number => {
  return variants.reduce((total, variant) => total + variant.stock, 0);
};

const determineStockStatus = (
  stock: number
): "in-stock" | "low-stock" | "out-of-stock" => {
  if (stock === 0) return "out-of-stock";
  if (stock < 10) return "low-stock";
  return "in-stock";
};

// Helper function for random selection
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: AbortSignal.timeout(30000),
    ...options,
  });


  if (!response.ok) {
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}`
    );
  }

 

  console.log(response)

  return response.json();
};

// Transform API product to local format
const transformApiProduct = (apiProduct: any, cart: string): ProductData => {
  const now = new Date();

  return {
    id: apiProduct._id || apiProduct.id,
    name: apiProduct.name || "Untitled Product",
    slug: createSlug(apiProduct.name || "untitled-product"),
    description: apiProduct.description || "",
    date: apiProduct.createdAt
      ? new Date(apiProduct.createdAt).toISOString().split("T")[0]
      : now.toISOString().split("T")[0],
    time: apiProduct.createdAt
      ? new Date(apiProduct.createdAt).toTimeString().split(" ")[0]
      : now.toTimeString().split(" ")[0],
    createdAt: apiProduct.createdAt ? new Date(apiProduct.createdAt) : now,
    updatedAt: apiProduct.updatedAt ? new Date(apiProduct.updatedAt) : now,
    category: cart,
    totalNumber: apiProduct.stock || 0,
    status: apiProduct.status || "draft",
    selectedColor: apiProduct.colors?.[0] || undefined,
    rating: apiProduct.rating || 0,
    numReviews: apiProduct.numReviews || 0,
    stock: apiProduct.stock || 0,
    isActive: apiProduct.isActive !== false,
    price: apiProduct.price || 0,
    comparePrice: apiProduct.comparePrice || undefined,
    variants: apiProduct.variants || [],
    seo: {
      title: apiProduct.seo?.title || `${apiProduct.name} | Store`,
      description: apiProduct.seo?.description || apiProduct.description || "",
      keywords: apiProduct.seo?.keywords || [
        apiProduct.category?.toLowerCase() || "product",
      ],
    },
    visibility: apiProduct.visibility || "public",
    sizes: apiProduct.sizes || [],
    mainImage: apiProduct.images?.[0]?.url || apiProduct.mainImage || "",
    images: apiProduct.images || [],
    colors: apiProduct.colors || [],
  };
};

// Enhanced Zustand store creator
export const useStoreProductStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  StoreProductStore
> = (set, get) => ({
  // Initial state
  selectedProduct: null,
  storeProducts: [],
  filteredProducts: [],
  dashboardProductLoading: {
    products: false,
    product: false,
    updating: false,
    deleting: [],
  },
  dashboardProductErrors: {
    products: null,
    product: null,
    general: null,
  },
  currentPage: 1,
  itemsPerPage: 20,
  totalItems: 0,
  totalPages: 0,

  // CRUD Operations with API integration
  addProduct: async (productData) => {
    set(
      produce((state: Store) => {
        state.dashboardProductLoading.updating = true;
        state.dashboardProductErrors.general = null;
      })
    );

    try {
      // Transform local data for API
      const apiProductData = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        tags: productData.tags,
        price: productData.price,
        comparePrice: productData.comparePrice,
        stock: productData.stock || productData.totalNumber,
        status: productData.status,
        variants: productData.variants,
        seo: productData.seo,
        visibility: productData.visibility,
        sizes: productData.sizes,
        colors: productData.colors,
        images: productData.images,
        isActive: productData.isActive,
      };

      const result = await apiCall("/products", {
        method: "POST",
        body: JSON.stringify(apiProductData),
      });

      const category = get().getCategoryNameById(result.data.category);

      // Transform and add to state
      const newProduct = transformApiProduct(
        result.data || result,
        category as string
      );

      set(
        produce((state: Store) => {
          state.storeProducts.unshift(newProduct);
          state.totalItems = state.storeProducts.length;
          state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
        })
      );

      get().applyFilters();
    } catch (error) {
      console.error("Error adding product:", error);
      set(
        produce((state: Store) => {
          state.dashboardProductErrors.general =
            error instanceof Error ? error.message : "Failed to add product";
        })
      );
    } finally {
      set(
        produce((state: Store) => {
          state.dashboardProductLoading.updating = false;
        })
      );
    }
  },

  updateProduct: async (id, updates) => {
    set(
      produce((state: Store) => {
        state.dashboardProductLoading.updating = true;
        state.dashboardProductErrors.general = null;
      })
    );

    try {
      // Transform updates for API
      const apiUpdates = {
        ...updates,
        stock: updates.stock || updates.totalNumber,
      };

      const result = await apiCall(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(apiUpdates),
      });

      const category = get().getCategoryNameById(result.data.category);

      // Transform and update state
      const updatedProduct = transformApiProduct(
        result.data || result,
        category as string
      );

      set(
        produce((state: Store) => {
          const index = state.storeProducts.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.storeProducts[index] = updatedProduct;

            if (state.selectedProduct?.id === id) {
              state.selectedProduct = updatedProduct;
            }
          }
        })
      );

      get().applyFilters();
    } catch (error) {
      console.error("Error updating product:", error);
      set(
        produce((state: Store) => {
          state.dashboardProductErrors.general =
            error instanceof Error ? error.message : "Failed to update product";
        })
      );
    } finally {
      set(
        produce((state: Store) => {
          state.dashboardProductLoading.updating = false;
        })
      );
    }
  },

  removeProduct: async (id) => {
    set(
      produce((state: Store) => {
        state.dashboardProductLoading.deleting.push(id);
        state.dashboardProductErrors.general = null;
      })
    );

    try {
      await apiCall(`/products/${id}`, {
        method: "DELETE",
      });

      set(
        produce((state: Store) => {
          state.storeProducts = state.storeProducts.filter((p) => p.id !== id);
          if (state.selectedProduct?.id === id) {
            state.selectedProduct = null;
          }
          state.totalItems = state.storeProducts.length;
          state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
        })
      );

      get().applyFilters();
    } catch (error) {
      console.error("Error removing product:", error);
      set(
        produce((state: Store) => {
          state.dashboardProductErrors.general =
            error instanceof Error ? error.message : "Failed to remove product";
        })
      );
    } finally {
      set(
        produce((state: Store) => {
          state.dashboardProductLoading.deleting =
            state.dashboardProductLoading.deleting.filter(
              (deleteId) => deleteId !== id
            );
        })
      );
    }
  },

  duplicateProduct: async (id) => {
    const product = get().getProductById(id);
    if (product) {
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (Copy)`,
        status: "draft" as const,
      };

      const {
        id: _,
        createdAt,
        updatedAt,
        slug,
        ...productData
      } = duplicatedProduct;
      await get().addProduct(productData);
    }
  },

  bulkUpdateProducts: async (ids, updates) => {
    set(
      produce((state: Store) => {
        state.dashboardProductLoading.updating = true;
      })
    );

    try {
      await Promise.all(ids.map((id) => get().updateProduct(id, updates)));
    } finally {
      set(
        produce((state: Store) => {
          state.dashboardProductLoading.updating = false;
        })
      );
    }
  },

  bulkDeleteProducts: async (ids) => {
    try {
      await Promise.all(ids.map((id) => get().removeProduct(id)));
    } catch (error) {
      set(
        produce((state: Store) => {
          state.dashboardProductErrors.general =
            "Failed to delete some products";
        })
      );
    }
  },

  // Selection and navigation
  setSelectedProduct: (product) =>
    set(
      produce((state: Store) => {
        state.selectedProduct = product;
      })
    ),

  getProductById: (id) => {
    return get().storeProducts.find((p) => p.id === id);
  },

  getProductBySlug: (slug) => {
    return get().storeProducts.find((p) => p.slug === slug);
  },

  // Data management
  clearProducts: () =>
    set(
      produce((state: Store) => {
        state.storeProducts = [];
        state.filteredProducts = [];
        state.selectedProduct = null;
        state.totalItems = 0;
        state.totalPages = 0;
        state.currentPage = 1;
      })
    ),

  loadProducts: async (force = false, pagination = 1) => {
    const state = get();
    if (state.storeProducts.length > 0 && !force) return;

    set(
      produce((state: Store) => {
        state.dashboardProductLoading.products = true;
        state.dashboardProductErrors.products = null;
      })
    );

    try {
      // Load categories first
      await get().loadCategories();

      // Fetch products from API
      const result = await apiCall("/products");

      if (!result || !Array.isArray(result.data)) {
        throw new Error(
          "Invalid response format: expected { data: ProductData[] }"
        );
      }

      // Transform API products to local format
      const transformedProducts = result.data.map((product: any) => {
        const category = get().getCategoryNameById(product.category);
        return transformApiProduct(product, category as string);
      });


      get().setProducts(transformedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      set(
        produce((state: Store) => {
          state.dashboardProductErrors.products =
            error instanceof Error ? error.message : "Failed to load products";
        })
      );
    } finally {
      set(
        produce((state: Store) => {
          state.dashboardProductLoading.products = false;
        })
      );
    }
  },

  loadProduct: async (id) => {
    set(
      produce((state: Store) => {
        state.dashboardProductLoading.product = true;
        state.dashboardProductErrors.product = null;
      })
    );

    try {
      // Check if product exists in store first
      const existingProduct = get().getProductById(id);
      if (existingProduct) {
        get().setSelectedProduct(existingProduct);
        return;
      }

      // Fetch single product from API
      const result = await apiCall(`/products/${id}`);

      const category = get().getCategoryNameById(result.data.category);

      const product = transformApiProduct(
        result.data || result,
        category as string
      );

      get().setSelectedProduct(product);

      // Also add to products list if not already there
      set(
        produce((state: Store) => {
          const exists = state.storeProducts.some((p) => p.id === product.id);
          if (!exists) {
            state.storeProducts.push(product);
          }
        })
      );
    } catch (error) {
      console.error("Error loading product:", error);
      set(
        produce((state: Store) => {
          state.dashboardProductErrors.product =
            error instanceof Error ? error.message : "Failed to load product";
        })
      );
    } finally {
      set(
        produce((state: Store) => {
          state.dashboardProductLoading.product = false;
        })
      );
    }
  },

  refreshProducts: async () => {
    await get().loadProducts(true);
  },

  // Filtering and search
  productFilters: {
    status: "all",
    category: "",
    stockStatus: "all",
  },

  sortOption: {
    field: "updatedAt",
    direction: "desc",
  },

  setProductFilters: (filters) => {
    set(
      produce((state: Store) => {
        state.productFilters = { ...state.productFilters, ...filters };
        state.currentPage = 1;
      })
    );
    get().applyFilters();
  },

  setSortOption: (sort) => {
    set(
      produce((state: Store) => {
        state.sortOption = sort;
      })
    );
    get().applyFilters();
  },

  searchProducts: (query) => {
    get().setProductFilters({ search: query });
  },

  applyFilters: () => {
    const { storeProducts, productFilters, sortOption } = get();
    let filtered = [...storeProducts];

    // Apply status filter
    if (productFilters.status !== "all") {
      filtered = filtered.filter((p) => p.status === productFilters.status);
    }

    // Apply category filter
    if (productFilters.category) {
      filtered = filtered.filter((p) => p.category === productFilters.category);
    }

    // Apply stock status filter
    if (productFilters.stockStatus && productFilters.stockStatus !== "all") {
      filtered = filtered.filter((p) => {
        const stockStatus = determineStockStatus(p.totalNumber);
        return stockStatus === productFilters.stockStatus;
      });
    }

    // Apply search filter
    if (productFilters.search) {
      const query = productFilters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Apply price range filter
    if (productFilters.priceRange) {
      const [min, max] = productFilters.priceRange;
      filtered = filtered.filter((p) => p.price >= min && p.price <= max);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortOption;
      let aValue: any = a[field as keyof ProductData];
      let bValue: any = b[field as keyof ProductData];

      if (field === "stock") {
        aValue = a.totalNumber;
        bValue = b.totalNumber;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    set(
      produce((state: Store) => {
        state.filteredProducts = filtered;
        state.totalItems = filtered.length;
        state.totalPages = Math.ceil(filtered.length / state.itemsPerPage);
      })
    );
  },

  resetFilters: () => {
    set(
      produce((state: Store) => {
        state.productFilters = {
          status: "all",
          category: "",
          stockStatus: "all",
        };
        state.currentPage = 1;
      })
    );
    get().applyFilters();
  },

  // Pagination
  setPage: (page) => {
    set(
      produce((state: Store) => {
        state.currentPage = Math.max(1, Math.min(page, state.totalPages));
      })
    );
  },

  setItemsPerPage: (items) => {
    set(
      produce((state: Store) => {
        state.itemsPerPage = items;
        state.currentPage = 1;
        state.totalPages = Math.ceil(state.totalItems / items);
      })
    );
  },

  goToNextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      get().setPage(currentPage + 1);
    }
  },

  goToPreviousPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      get().setPage(currentPage - 1);
    }
  },

  // Batch operations
  setProducts: (products) => {
    set(
      produce((state: Store) => {
        state.storeProducts = products;
        state.totalItems = products.length;
        state.totalPages = Math.ceil(products.length / state.itemsPerPage);
      })
    );
    get().applyFilters();
  },

  addProducts: (products) => {
    set(
      produce((state: Store) => {
        state.storeProducts.push(...products);
        state.totalItems = state.storeProducts.length;
        state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
      })
    );
    get().applyFilters();
  },

  // Computed getters
  getProductsByCategory: (category) => {
    return get().storeProducts.filter((p) => p.category === category);
  },

  getProductsByStatus: (status) => {
    return get().storeProducts.filter((p) => p.status === status);
  },

  getLowStockProducts: (threshold = 10) => {
    return get().storeProducts.filter(
      (p) => p.totalNumber < threshold && p.totalNumber > 0
    );
  },

  getProductStats: () => {
    const products = get().storeProducts;
    return {
      total: products.length,
      active: products.filter((p) => p.status === "active").length,
      inactive: products.filter((p) => p.status === "inactive").length,
      outOfStock: products.filter((p) => p.status === "out-of-stock").length,
      draft: products.filter((p) => p.status === "draft").length,
      lowStock: products.filter((p) => p.totalNumber < 10 && p.totalNumber > 0)
        .length,
    };
  },

  // Error management
  clearError: (type) => {
    set(
      produce((state: Store) => {
        state.dashboardProductErrors[type] = null;
      })
    );
  },

  clearAllErrors: () => {
    set(
      produce((state: Store) => {
        state.dashboardProductErrors = {
          products: null,
          product: null,
          general: null,
        };
      })
    );
  },

  // Variant management
  addVariant: async (productId, variantData) => {
    const newVariant: ProductVariant = {
      ...variantData,
      id: uuidv4(),
    };

    const product = get().getProductById(productId);
    if (product) {
      await get().updateProduct(productId, {
        variants: [...product.variants, newVariant],
      });
    }
  },

  updateVariant: async (productId, variantId, updates) => {
    const product = get().getProductById(productId);
    if (product) {
      const updatedVariants = product.variants.map((variant) =>
        variant.id === variantId ? { ...variant, ...updates } : variant
      );
      await get().updateProduct(productId, { variants: updatedVariants });
    }
  },

  removeVariant: async (productId, variantId) => {
    const product = get().getProductById(productId);
    if (product) {
      const updatedVariants = product.variants.filter(
        (variant) => variant.id !== variantId
      );
      await get().updateProduct(productId, { variants: updatedVariants });
    }
  },
});

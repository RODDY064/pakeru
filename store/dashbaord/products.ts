import { type StateCreator } from "zustand";
import { Store } from "../store";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";
import { ProductAPIService } from "@/app/(dashboard)/store-products/product-actions/helpers";

//variant structure
export type ProductVariant = {
  _id: string,
  color: string;
  colorHex?: string;
  description: string;
  sizes: string[];
  images: Array<{ _id: string; url: string; productId: string }>;
  stock: number;
};

// Product structure
export type ProductData = {
  _id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalNumber: number;
  category: string;
  subCategory?: string;
  tags?: string[];
  status: "out-of-stock" | "active" | "inactive" | "draft";
  selectedSize?: string;
  selectedColor?: string;
  rating: number;
  numReviews?: number;
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
  mainImage: {
    _id: string;
    publicId: string;
    url: string;
  };
  images: {
    _id: string;
    publicId: string;
    url: string;
  }[];
  colors?: string[];
  sizes?: string[];
};

// Filters
export type Filters = {
  status: "active" | "inactive" | "all" | "out-of-stock" | "draft";
  category: string;
  subcategory?: string;
  priceRange?: [number, number];
  tags?: string[];
  search?: string;
};

// Sorting options
export type SortStoreProductOption = {
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
  filteredStoreProducts: ProductData[];
  dashboardProductLoading: LoadingState;
  dashboardProductErrors: ErrorState;

  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;

  bulkDeleteProducts: (ids: string[]) => Promise<void>;

  // Selection and navigation
  setSelectedProduct: (product: ProductData | null) => void;
  getProductById: (id: string) => ProductData | undefined;
  getOrderProduct: (
    id: string,
    colorID: string,
    size: string,
    quality: number
  ) => Promise<ProductData | undefined>;

  // Data management
  clearProducts: () => void;
  loadStoreProducts: (force?: boolean, pagination?: number) => Promise<void>;
  loadStoreProduct: (id: string) => Promise<void>;

  // Filtering and search
  storeProductFilters: Filters;
  sortstoreProductOption: SortStoreProductOption;
  resetFilters: () => void;
  setStoreProductFilters: (filters: Partial<Filters>) => void;
  setSortStoreProductOption: (sort: SortStoreProductOption) => void;
  searchStoreProducts: (query: string) => void;
  applyFilters: () => void;

  // Batch operations
  setStoreProducts: (products: ProductData[]) => void;

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
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    
    headers: {
      "Content-Type": "application/json",
      //  "ngrok-skip-browser-warning": "true",
      ...options.headers,
    },
    credentials: "include",
    signal: AbortSignal.timeout(30000),
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}`
    );
  }

  console.log(response);

  return response.json();
};

// Transform API product to local format
const transformApiProduct = (apiProduct: any): ProductData => {
  const now = new Date();

  return {
    _id: apiProduct._id,
    name: apiProduct.name || "Untitled Product",
    description: apiProduct.description || "",
    createdAt: apiProduct.createdAt ? new Date(apiProduct.createdAt) : now,
    updatedAt: apiProduct.updatedAt ? new Date(apiProduct.updatedAt) : now,
    category: apiProduct.category,
    totalNumber: apiProduct.totalNumber || 0,
    status: apiProduct.status || "draft",
    selectedColor: apiProduct.colors?.[0] || undefined,
    rating: apiProduct.rating || 0,
    numReviews: apiProduct.numReviews || 0,
    isActive: apiProduct.isActive !== false,
    price: apiProduct.price || 0,
    tags: apiProduct.tags || [],
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
    mainImage: apiProduct.mainImage || apiProduct.images?.[0]?.url || "",
    images: apiProduct.images || [],
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
  filteredStoreProducts: [],
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

  bulkDeleteProducts: async (ids) => {
    try {
      await Promise.all(ids.map((id) => ProductAPIService.deleteProduct(id)));
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
    return get().storeProducts.find((p) => p._id === id);
  },

  getOrderProduct: async (
    id: string,
    colorID: string,
    size: string,
    quality:number
  ): Promise<ProductData | undefined> => {
  

    const product = get().storeProducts.find((p) => p._id === id);

    if (!product) {
      console.log(`Product with id ${id} not found`);
      return undefined;
    }

    const selectedVariant = product.variants?.find(
      (variant) => variant._id === colorID
    );

    if (!selectedVariant) {
      console.log(`Variant with id ${colorID} not found for product ${id}`);
      return undefined
    }

    const hasSize = selectedVariant.sizes?.includes(size);

    if (!hasSize) {
      console.log(`Variant with id ${colorID} has no size ${hasSize}`);
      return undefined;
    }

    let updatedMainImage = product.mainImage;

    return {
      ...product,
      selectedColor: selectedVariant.color,
      selectedSize: size,
      totalNumber: product.totalNumber,
      mainImage: updatedMainImage,
    };
  },

  // Data management
  clearProducts: () =>
    set(
      produce((state: Store) => {
        state.storeProducts = [];
        state.filteredStoreProducts = [];
        state.selectedProduct = null;
        state.totalItems = 0;
        state.totalPages = 0;
      })
    ),

  loadStoreProducts: async (force = false, pagination = 1) => {
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

      console.log(result, "respone from api");

      if (!result || !Array.isArray(result.data)) {
        throw new Error(
          "Invalid response format: expected { data: ProductData[] }"
        );
      }

      // Transform API products to local format
      const transformedProducts = result.data.map((product: any) =>
        transformApiProduct(product)
      );

      get().setStoreProducts(transformedProducts);
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

  loadStoreProduct: async (id) => {
    try {
      // Check if product exists in store first
      const existingProduct = get().getProductById(id);
      if (existingProduct) {
        get().setSelectedProduct(existingProduct);
        return;
      }

      // Fetch single product from API
      const result = await apiCall(`/products/${id}`);

      const product = transformApiProduct(result.data || result);

      get().setSelectedProduct(product);

      // Also add to products list if not already there
    } catch (error) {
      console.error("Error loading product:", error);
    }
  },

  // Filtering and search
  storeProductFilters: {
    status: "all",
    category: "all",
    stockStatus: "all",
  },

  sortstoreProductOption: {
    field: "updatedAt",
    direction: "desc",
  },

  setStoreProductFilters: (filters) => {
    set(
      produce((state: Store) => {
        state.storeProductFilters = {
          ...state.storeProductFilters,
          ...filters,
        };
      })
    );
    get().applyFilters();
  },

  setSortStoreProductOption: (sort) => {
    set(
      produce((state: Store) => {
        state.sortstoreProductOption = sort;
      })
    );
    get().applyFilters();
  },

  searchStoreProducts: (query) => {
    get().setStoreProductFilters({ search: query });
  },

  applyFilters: () => {
    const { storeProducts, storeProductFilters, sortstoreProductOption } =
      get();
    let filtered = [...storeProducts];

    // Apply status filter
    if (storeProductFilters.status !== "all") {
      filtered = filtered.filter(
        (p) => p.status === storeProductFilters.status
      );
    }

    // Apply category filter
    if (storeProductFilters.category !== "all") {
      filtered = filtered.filter(
        (p) => p.category === storeProductFilters.category
      );
    }

    // Apply search filter
    if (storeProductFilters.search) {
      const query = storeProductFilters.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortstoreProductOption;
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
        state.filteredStoreProducts = filtered;
        state.totalItems = filtered.length;
        state.totalPages = Math.ceil(filtered.length / state.itemsPerPage);
      })
    );
  },

  resetFilters: () => {
    set(
      produce((state: Store) => {
        state.storeProductFilters = {
          status: "all",
          category: "",
        };
        state.currentPage = 1;
      })
    );
    get().applyFilters();
  },

  // Batch operations
  setStoreProducts: (products) => {
    set(
      produce((state: Store) => {
        state.storeProducts = products;
        state.totalItems = products.length;
        state.totalPages = Math.ceil(products.length / state.itemsPerPage);
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
});

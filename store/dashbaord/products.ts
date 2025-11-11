import { type StateCreator } from "zustand";
import { Store } from "../store";
import { produce } from "immer";
import { apiCall } from "@/libs/functions";
import { useApiClient } from "@/libs/useApiClient";
import { ClothType } from "../general";

//variant structure
export type ProductVariant = {
  _id: string;
  color: string;
  colorHex?: string;
  description: string;
  sizes: string[];
  images: Array<{ _id: string; url: string; publicId: string }>;
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
  washInstructions: string[];
  productCare?: string;
  variants: ProductVariant[];
  totalSize: number;
  isSpecial?:boolean,
  sizeType?: {
    gender?: "male" | "female" | "unisex";
    clothType?: ClothType;
  };
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

 dashboardProductStats: {
  total: number;
  activeTotal: number;
  inactiveTotal: number;
  outOfStock: number;
};



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
  setDashProducts: (products: ProductData[], total?: number) => void;
  clearProducts: () => void;
  loadStoreProducts: (
    force?: boolean,
    get?: ReturnType<typeof useApiClient>["get"],
    limit?: number,
  ) => Promise<void>;
  loadStoreProduct: (id: string) => Promise<void>;

  // Filtering and search
  storeProductFilters: Filters;
  sortstoreProductOption: SortStoreProductOption;
  resetFilters: () => void;
  setStoreProductFilters: (filters: Partial<Filters>) => void;
  setSortStoreProductOption: (sort: SortStoreProductOption) => void;
  searchStoreProducts: (query: string) => void;
  applyStoreProductFilters: () => void;

  // Batch operations
  setStoreProducts: (products: ProductData[], stats: { activeProducts: 28, inactiveProducts: 0, outOfStockProducts: 0 }) => void;

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
    washInstructions: apiProduct.washInstructions || [],
    productCare: apiProduct.productCare || "",
    sizeType: apiProduct.sizeType || undefined,
    isSpecial: apiProduct.isSpecial || undefined, 
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
    totalSize: apiProduct.total,
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
  
  dashboardProductStats: {
    total:0,
    activeTotal:0,
    inactiveTotal:0,
    outOfStock:0
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
    quality: number
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
      return undefined;
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

  setDashProducts: (products: ProductData[], total) => {
    set((draft) => {
      draft.storeProducts = products;

    });
  },
  // Data management
  clearProducts: () =>
    set(
      produce((state: Store) => {
        state.storeProducts = [];
        state.filteredStoreProducts = [];
        state.selectedProduct = null;

        state.totalPages = 0;
      })
    ),

  loadStoreProducts: async (force = false, apiGet, limit) => {
    const state = get();
    if (!apiGet) {
      throw new Error("API get function is required");
    }

    set(
      produce((state: Store) => {
        state.dashboardProductLoading.products = true;
        state.dashboardProductErrors.products = null;
      })
    );

    try {
      await get().loadCategories();

      const urlParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );

      const page = state.pagination.page
      const createdAt = urlParams.get("createdAt");

      const query = new URLSearchParams();

      if (page && page > 1) {
        query.append("page", page.toString());
      }

      if (limit) {
        query.append("limit", limit.toString());
      }

      if (createdAt) {
        query.append("createdAt", createdAt);
      }

  

      const result = await apiGet<{
        data: ProductData[];
        total?: number;
        page?: number;
        stats:any
      }>(`/products?${query.toString()}`, {
        cache: "no-store",
        next: { revalidate: 0 },
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!result || !Array.isArray(result.data)) {
        throw new Error(
          "Invalid response format: expected { data: ProductData[] }"
        );
      }

      const transformedProducts = result.data.map((product: any) =>
        transformApiProduct(product)
      );

    

      set(
        produce((state: Store) => {
          if (force) {
            state.storeProducts = transformedProducts;
            state.dashboardProductStats.total = result.total ?? 0;
            state.dashboardProductStats.activeTotal = result.stats.activeProducts ?? 0;
            state.dashboardProductStats.inactiveTotal = result.stats.inactiveProducts ?? 0;
            state.dashboardProductStats.outOfStock = result.stats.outOfStockProducts ?? 0;

          } else {
            const mergedMap = new Map<string, ProductData>();
            transformedProducts.forEach((p) => mergedMap.set(p._id, p));
            state.storeProducts = Array.from(mergedMap.values());
             state.dashboardProductStats.activeTotal = result.stats.activeProducts ?? 0;
            state.dashboardProductStats.inactiveTotal = result.stats.inactiveProducts ?? 0;
            state.dashboardProductStats.outOfStock = result.stats.outOfStockProducts ?? 0;
          }

          state.filteredStoreProducts = [...state.storeProducts];
          if (result.total !== undefined) {
        
          }
          if (force && state.pagination) {
            state.pagination.page = result.page ?? 1;
          }
        })
      );

      setTimeout(() => get().applyStoreProductFilters(), 0);
    } catch (error) {
      console.error("Error loading products:", error);
      set(
        produce((state: Store) => {
          state.dashboardProductErrors.products =  error instanceof Error ? error.message : "Failed to load products";
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
      const existingProduct = get().getProductById(id);
      if (existingProduct) {
        get().setSelectedProduct(existingProduct);
        return;
      }

      const result = await apiCall(`/products/${id}?_t=${Date.now()}`, {
        cache: "no-store",
        next: { revalidate: 0 },
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      });

      const product = transformApiProduct(result.data || result);
      get().setSelectedProduct(product);
      set(
        produce((state: Store) => {
          const exists = state.storeProducts.some((p) => p._id === product._id);
          if (!exists) {
            state.storeProducts.push(product);
          }
        })
      );
    } catch (error) {
      console.error("Error loading product:", error);
      throw error;
    }
  },

  // Filtering and searcharyt
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

    setTimeout(() => get().applyStoreProductFilters(), 0);
  },

  setSortStoreProductOption: (sort) => {
    set(
      produce((state: Store) => {
        state.sortstoreProductOption = sort;
      })
    );
    get().applyStoreProductFilters();
  },

  searchStoreProducts: (query) => {
    get().setStoreProductFilters({ search: query });
  },

  applyStoreProductFilters: () => {
    const { storeProducts, storeProductFilters, sortstoreProductOption } =
      get();

    // console.log("=== FILTER DEBUG START ===");
    // console.log("Store filters:", storeProductFilters);
    // console.log("Total products:", storeProducts.length);

    // Start with all products
    let filtered = [...storeProducts];

    // Apply status filter
    if (storeProductFilters.status && storeProductFilters.status !== "all") {
      const beforeCount = filtered.length;
      filtered = filtered.filter((p) => {
        const matches = p.status === storeProductFilters.status;
        if (!matches && beforeCount <= 5) {
          // Debug first few mismatches
          console.log(
            `Product ${p.name} status "${p.status}" doesn't match filter "${storeProductFilters.status}"`
          );
        }
        return matches;
      });
      console.log(
        `After status filter (${storeProductFilters.status}): ${beforeCount} → ${filtered.length}`
      );
    }

    // Apply category filter - FIXED VERSION
    if (
      storeProductFilters.category &&
      storeProductFilters.category !== "all" &&
      storeProductFilters.category !== ""
    ) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((p) => {
        // Case-insensitive comparison and handle potential undefined
        const productCategory =
          get().getCategoryById(p.category)?.name?.toLowerCase() || "";
        const filterCategory = storeProductFilters.category.toLowerCase();
        const matches = productCategory === filterCategory;

        if (!matches && beforeCount <= 5) {
          // Debug first few mismatches
          // console.log(
          //   `Product ${p.name} category "${p.category}" doesn't match filter "${storeProductFilters.category}"`
          // );
        }
        return matches;
      });
      // console.log(
      //   `After category filter (${storeProductFilters.category}): ${beforeCount} → ${filtered.length}`
      // );
    }

    // Apply stock status filter - NEW LOGIC
    if (storeProductFilters.status && storeProductFilters.status !== "all") {
      const beforeCount = filtered.length;
      filtered = filtered.filter((p) => {
        const stock = p.totalNumber || 0;
        let matches = false;

        switch (storeProductFilters.status) {
          case "active":
            matches = stock === 0 || p.status === "active";
            break;
          case "inactive":
            matches = stock === 0 || p.status === "inactive";
            break;

          case "out-of-stock":
            matches = stock === 0 || p.status === "out-of-stock";
            break;
          case "draft":
            matches = stock === 0 || p.status === "draft";
            break;
          default:
            matches = true;
        }

        return matches;
      });
      // console.log(
      //   `After stock status filter (${storeProductFilters.status}): ${beforeCount} → ${filtered.length}`
      // );
    }

    // Apply price range filter
    // if (
    //   storeProductFilters.priceRange &&
    //   storeProductFilters.priceRange.length === 2
    // ) {
    //   const beforeCount = filtered.length;
    //   const [minPrice, maxPrice] = storeProductFilters.priceRange;
    //   filtered = filtered.filter((p) => {
    //     const price = p.price || 0;
    //     return price >= minPrice && price <= maxPrice;
    //   });
    //   // console.log(
    //   //   `After price filter (${minPrice}-${maxPrice}): ${beforeCount} → ${filtered.length}`
    //   // );
    // }

    // Apply tags filter
    if (storeProductFilters.tags && storeProductFilters.tags.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((p) =>
        storeProductFilters.tags!.some((tag) =>
          p.tags?.some((productTag) =>
            productTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
      console.log(`After tags filter: ${beforeCount} → ${filtered.length}`);
    }

    // Apply search filter - IMPROVED VERSION
    if (
      storeProductFilters.search &&
      storeProductFilters.search.trim() !== ""
    ) {
      const beforeCount = filtered.length;
      const query = storeProductFilters.search.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const searchableText = [
          p.name || "",
          // p.description || "",
          // p.category || "",
          // p.subCategory || "",
          // ...(p.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        const matches = searchableText.includes(query);
        return matches;
      });
      console.log(
        `After search filter (${query}): ${beforeCount} → ${filtered.length}`
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortstoreProductOption;
      let aValue: any = a[field as keyof ProductData];
      let bValue: any = b[field as keyof ProductData];

      if (field === "stock") {
        aValue = a.totalNumber || 0;
        bValue = b.totalNumber || 0;
      }

      // Handle date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle undefined/null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === "asc" ? -1 : 1;
      if (bValue == null) return direction === "asc" ? 1 : -1;

      if (direction === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // console.log("=== FINAL RESULT ===");
    // console.log(`Final filtered products: ${filtered.length}`);
    // console.log(
    //   "Sample filtered product:",
    //   filtered[0]
    //     ? {
    //         name: filtered[0].name,
    //         category: filtered[0].category,
    //         status: filtered[0].status,
    //       }
    //     : "None"
    // );
    // console.log("=== FILTER DEBUG END ===");

    set(
      produce((state: Store) => {
        state.filteredStoreProducts = filtered;
        // state.totalPages = Math.ceil(filtered.length / state.itemsPerPage);
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
      })
    );
    get().applyStoreProductFilters();
  },

  // Batch operations
  setStoreProducts: (products, stats) => {
    set(
      produce((state: Store) => {
        state.storeProducts = products;

      })
    );
    get().applyStoreProductFilters();
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
      total: 0,
      active: products.filter((p) => p.status === "active").length,
      inactive: products.filter((p) => p.status === "inactive").length,
      outOfStock: products.filter((p) => p.status === "out-of-stock").length,
      draft: products.filter((p) => p.status === "draft").length,
      lowStock: products.filter((p) => p.totalNumber < 10 && p.totalNumber > 0)
        .length,
    };
  },
});

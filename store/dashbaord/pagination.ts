import { type StateCreator } from "zustand";
import { Store } from "../store";
import { produce } from "immer";

// Enhanced pagination type with smart caching support
type PaginationType = {
  // User-facing pagination (what user sees)
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loadFunction: string;
  dataKey: string;

  // Backend pagination (actual API calls)
  backendCurrentPage: number;
  backendTotalPages: number;
  backendItemsPerPage: number;
  backendOffset: number;
  backendLimit: number;

  // Smart pagination tracking
  cachedItemsStartIndex: number;
  cachedItemsEndIndex: number;
  needsBackendFetch: boolean;
  
  // Loading state management
  isPagLoading: boolean;
  lastFetchedPage: number;
};

// Pagination store interface
export type PaginationStore = {
  pagination: PaginationType;

  // Core pagination actions
  setCurrentPage: (page: number, options?: { dataKey?: string; loadFunction?: string }) => Promise<void>;
  setItemsPerPage: (itemsPerPage: number) => void;
  setTotalItems: (totalItems: number) => void;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  goToFirstPage: () => Promise<void>;
  goToLastPage: () => Promise<void>;

  // Backend pagination actions
  setBackendItemsPerPage: (itemsPerPage: number) => void;
  updatePaginationFromAPI: (apiResponse: {
    totalItems: number;
    currentBackendPage?: number;
    totalBackendPages?: number;
  }) => void;

  // Dynamic configuration
  setPaginationConfig: (config: {
    dataKey: string;
    loadFunction: string;
    itemsPerPage?: number;
    backendItemsPerPage?: number;
  }) => void;

  // Pagination helpers
  checkIfNeedsBackendFetch: (targetPage: number, dataKey?: string) => boolean;
  getBackendPageForUserPage: (userPage: number) => number;
  updateCachedRange: (backendPage: number, dataLength: number) => void;

  // Utility actions
  updatePaginationMeta: (meta: Partial<PaginationType>) => void;
  resetPagination: () => void;
  getPaginatedSlice: <T>(data?: T[], dataKey?: string) => T[];
  
  // Loading state
  setPagLoading: (loading: boolean) => void;

  // Debug helpers
  getPaginationDebugInfo: (dataKey?: string) => {
    userPageRange: { start: number; end: number };
    cachedRange: { start: number; end: number };
    needsFetch: boolean;
    backendPage: number;
    dataInfo: {
      key: string;
      length: number;
      hasEnoughData: boolean;
    };
  };
};

// Default pagination state
const defaultPagination: PaginationType = {
  // User-facing pagination
  currentPage: 1,
  totalPages: 0,
  itemsPerPage: 10,
  totalItems: 0,
  hasNextPage: false,
  hasPrevPage: false,
  loadFunction: "loadProducts",
  dataKey: "storeProducts",

  // Backend pagination
  backendCurrentPage: 1,
  backendTotalPages: 0,
  backendItemsPerPage: 250,
  backendOffset: 0,
  backendLimit: 250,

  // Smart pagination tracking
  cachedItemsStartIndex: 0,
  cachedItemsEndIndex: -1, // -1 indicates no cached data
  needsBackendFetch: true,
  
  // Loading state
  isPagLoading: false,
  lastFetchedPage: 0,
};

// Helper function to calculate user pagination meta
const calculateUserPaginationMeta = (
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
): Partial<PaginationType> => {
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    hasNextPage: currentPage < totalPages && totalPages > 0,
    hasPrevPage: currentPage > 1,
  };
};

// Helper function to calculate backend pagination meta
const calculateBackendPaginationMeta = (
  backendPage: number,
  backendItemsPerPage: number,
  totalItems: number
): Partial<PaginationType> => {
  const backendTotalPages = totalItems > 0 ? Math.ceil(totalItems / backendItemsPerPage) : 0;
  const backendOffset = Math.max(0, (backendPage - 1) * backendItemsPerPage);

  return {
    backendCurrentPage: backendPage,
    backendTotalPages,
    backendItemsPerPage,
    backendOffset,
    backendLimit: backendItemsPerPage,
  };
};

// Helper function to safely get data from state
const getDataFromState = (state: Store, dataKey: string): any[] => {
  try {
    const data = (state as any)[dataKey];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`Failed to get data from state with key '${dataKey}':`, error);
    return [];
  }
};

// Helper function to safely call load function
const callLoadFunction = async (store: any, loadFunction: string, forceReload: boolean = false): Promise<void> => {
  try {
    if (typeof store[loadFunction] === 'function') {
      await store[loadFunction](forceReload);
    } else {
      console.warn(`Load function '${loadFunction}' not found in store`);
    }
  } catch (error) {
    console.error(`Error calling load function '${loadFunction}':`, error);
  }
};

export const usePaginationStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  PaginationStore
> = (set, get) => ({
  // Initial state
  pagination: defaultPagination,

  // Set loading state
  setPagLoading: (loading: boolean) => {
    set(produce((state: Store) => {
      state.pagination.isPagLoading = loading;
    }));
  },

  // Set pagination configuration
  setPaginationConfig: (config) => {
    set(produce((state: Store) => {
      state.pagination.dataKey = config.dataKey;
      state.pagination.loadFunction = config.loadFunction;
      
      if (config.itemsPerPage && config.itemsPerPage > 0) {
        state.pagination.itemsPerPage = config.itemsPerPage;
      }
      
      if (config.backendItemsPerPage && config.backendItemsPerPage > 0) {
        state.pagination.backendItemsPerPage = config.backendItemsPerPage;
        state.pagination.backendLimit = config.backendItemsPerPage;
      }
      
      // Reset pagination state when changing configuration
      state.pagination.currentPage = 1;
      state.pagination.needsBackendFetch = true;
      state.pagination.cachedItemsStartIndex = 0;
      state.pagination.cachedItemsEndIndex = -1;
      state.pagination.lastFetchedPage = 0;
    }));
  },

  // Set current page with smart backend fetching
  setCurrentPage: async (page: number, options = {}) => {
    const { pagination } = get();
    
    // Input validation
    if (!page || page < 1 || !Number.isInteger(page)) {
      console.warn(`Invalid page number: ${page}`);
      return;
    }
    
    // Prevent concurrent page changes
    if (pagination.isPagLoading) {
      console.log('Page change blocked - already loading');
      return;
    }
    
    const dataKey = options.dataKey || pagination.dataKey;
    const loadFunction = options.loadFunction || pagination.loadFunction;
    
    // Don't exceed total pages if we know them
    const targetPage = pagination.totalPages > 0 
      ? Math.min(page, pagination.totalPages) 
      : page;

    // Check if we need to fetch from backend
    const needsFetch = get().checkIfNeedsBackendFetch(targetPage, dataKey);
    
    // Update state first
    set(produce((state: Store) => {
      const userMeta = calculateUserPaginationMeta(
        targetPage,
        pagination.itemsPerPage,
        pagination.totalItems
      );
      Object.assign(state.pagination, userMeta);

      if (options.dataKey) state.pagination.dataKey = options.dataKey;
      if (options.loadFunction) state.pagination.loadFunction = options.loadFunction;

      state.pagination.needsBackendFetch = needsFetch;
    }));

    // Handle backend fetch if needed
    if (needsFetch) {
      const state = get();
      const data = getDataFromState(state, dataKey);
      const globalStartIndex = (targetPage - 1) * pagination.itemsPerPage;
      const globalEndIndex = globalStartIndex + pagination.itemsPerPage - 1;

      // Check if we have sufficient data in memory
      const hasRequiredData = data.length > globalEndIndex && 
                            globalStartIndex >= pagination.cachedItemsStartIndex &&
                            globalEndIndex <= pagination.cachedItemsEndIndex;

      if (!hasRequiredData) {
        const backendPage = get().getBackendPageForUserPage(targetPage);
        
        // Prevent duplicate fetches
        if (pagination.lastFetchedPage !== backendPage) {
          get().setPagLoading(true);
          
          try {
            // Update backend pagination info
            set(produce((state: Store) => {
              const backendMeta = calculateBackendPaginationMeta(
                backendPage,
                pagination.backendItemsPerPage,
                pagination.totalItems
              );
              Object.assign(state.pagination, backendMeta);
              state.pagination.lastFetchedPage = backendPage;
            }));
            
            await callLoadFunction(get(), loadFunction, true);
          } catch (error) {
            console.error('Failed to load data:', error);
          } finally {
            get().setPagLoading(false);
          }
        }
      } else {
        // We have the data, update cached range
        set(produce((state: Store) => {
          state.pagination.needsBackendFetch = false;
          state.pagination.cachedItemsStartIndex = 0;
          state.pagination.cachedItemsEndIndex = Math.max(0, data.length - 1);
        }));
      }
    }
  },

  // Set user items per page
  setItemsPerPage: (itemsPerPage: number) => {
    if (!itemsPerPage || itemsPerPage < 1) {
      console.warn(`Invalid itemsPerPage: ${itemsPerPage}`);
      return;
    }
    
    const { pagination } = get();

    set(produce((state: Store) => {
      const userMeta = calculateUserPaginationMeta(
        1, // Reset to first page
        itemsPerPage,
        pagination.totalItems
      );
      Object.assign(state.pagination, userMeta);
      state.pagination.needsBackendFetch = true;
      state.pagination.lastFetchedPage = 0;
    }));

    callLoadFunction(get(), pagination.loadFunction, true);
  },

  // Set backend items per page
  setBackendItemsPerPage: (itemsPerPage: number) => {
    if (!itemsPerPage || itemsPerPage < 1) {
      console.warn(`Invalid backend itemsPerPage: ${itemsPerPage}`);
      return;
    }
    
    const { pagination } = get();

    set(produce((state: Store) => {
      state.pagination.backendItemsPerPage = itemsPerPage;
      state.pagination.backendLimit = itemsPerPage;
      state.pagination.needsBackendFetch = true;
      state.pagination.lastFetchedPage = 0;

      const backendMeta = calculateBackendPaginationMeta(
        1,
        itemsPerPage,
        pagination.totalItems
      );
      Object.assign(state.pagination, backendMeta);

      state.pagination.cachedItemsStartIndex = 0;
      state.pagination.cachedItemsEndIndex = -1;
    }));

    callLoadFunction(get(), pagination.loadFunction, true);
  },

  // Update total items and recalculate pagination
  setTotalItems: (totalItems: number) => {
    if (totalItems < 0) {
      console.warn(`Invalid totalItems: ${totalItems}`);
      return;
    }
    
    const { pagination } = get();

    set(produce((state: Store) => {
      const userMeta = calculateUserPaginationMeta(
        pagination.currentPage,
        pagination.itemsPerPage,
        totalItems
      );
      Object.assign(state.pagination, userMeta);

      const backendMeta = calculateBackendPaginationMeta(
        pagination.backendCurrentPage,
        pagination.backendItemsPerPage,
        totalItems
      );
      Object.assign(state.pagination, backendMeta);
    }));
  },

  // Update pagination from API response
  updatePaginationFromAPI: (apiResponse) => {
    if (!apiResponse || typeof apiResponse.totalItems !== 'number') {
      console.warn('Invalid API response for pagination update');
      return;
    }
    
    set(produce((state: Store) => {
      const { pagination } = get();

      state.pagination.totalItems = Math.max(0, apiResponse.totalItems);

      if (apiResponse.currentBackendPage && apiResponse.currentBackendPage > 0) {
        state.pagination.backendCurrentPage = apiResponse.currentBackendPage;
      }

      if (apiResponse.totalBackendPages && apiResponse.totalBackendPages > 0) {
        state.pagination.backendTotalPages = apiResponse.totalBackendPages;
      } else {
        state.pagination.backendTotalPages = Math.ceil(
          apiResponse.totalItems / pagination.backendItemsPerPage
        );
      }

      const userMeta = calculateUserPaginationMeta(
        pagination.currentPage,
        pagination.itemsPerPage,
        apiResponse.totalItems
      );
      Object.assign(state.pagination, userMeta);

      // Update cached range based on fetched data
      const data = getDataFromState(state, pagination.dataKey);
      const backendPage = state.pagination.backendCurrentPage;
      const startIndex = (backendPage - 1) * pagination.backendItemsPerPage;

      state.pagination.cachedItemsStartIndex = startIndex;
      state.pagination.cachedItemsEndIndex = data.length > 0 
        ? Math.min(startIndex + data.length - 1, apiResponse.totalItems - 1)
        : -1;

      state.pagination.needsBackendFetch = false;
    }));
  },

  // Update the cached range after fetching from backend
  updateCachedRange: (backendPage: number, dataLength: number) => {
    if (backendPage < 1 || dataLength < 0) {
      console.warn(`Invalid cached range parameters: backendPage=${backendPage}, dataLength=${dataLength}`);
      return;
    }
    
    const { pagination } = get();

    set(produce((state: Store) => {
      const startIndex = (backendPage - 1) * pagination.backendItemsPerPage;
      state.pagination.cachedItemsStartIndex = startIndex;
      state.pagination.cachedItemsEndIndex = dataLength > 0
        ? Math.min(startIndex + dataLength - 1, pagination.totalItems - 1)
        : -1;
      state.pagination.needsBackendFetch = false;
    }));
  },

  // Check if we need to fetch from backend for a given user page
  checkIfNeedsBackendFetch: (targetPage: number, dataKey?: string) => {
    const { pagination } = get();
    
    if (targetPage < 1) return false;
    
    const state = get();
    const key = dataKey || pagination.dataKey;
    const data = getDataFromState(state, key);

    const startIndex = (targetPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage - 1;

    // Check various conditions that would require a fetch
    const hasNoCachedData = pagination.cachedItemsEndIndex < 0;
    const hasInsufficientData = data.length <= endIndex;
    const isOutsideCachedRange = startIndex < pagination.cachedItemsStartIndex || 
                                endIndex > pagination.cachedItemsEndIndex;
    const isForcedFetch = pagination.needsBackendFetch;

    return hasNoCachedData || hasInsufficientData || isOutsideCachedRange || isForcedFetch;
  },

  // Get which backend page we need for a given user page
  getBackendPageForUserPage: (userPage: number) => {
    const { pagination } = get();
    
    if (userPage < 1) return 1;
    
    const startIndex = (userPage - 1) * pagination.itemsPerPage;
    return Math.floor(startIndex / pagination.backendItemsPerPage) + 1;
  },

  // Navigation methods
  goToNextPage: async () => {
    const { pagination } = get();
    if (pagination.hasNextPage && !pagination.isPagLoading) {
      await get().setCurrentPage(pagination.currentPage + 1);
    }
  },

  goToPrevPage: async () => {
    const { pagination } = get();
    if (pagination.hasPrevPage && !pagination.isPagLoading) {
      await get().setCurrentPage(pagination.currentPage - 1);
    }
  },

  goToFirstPage: async () => {
    if (!get().pagination.isPagLoading) {
      await get().setCurrentPage(1);
    }
  },

  goToLastPage: async () => {
    const { pagination } = get();
    if (pagination.totalPages > 0 && !pagination.isPagLoading) {
      await get().setCurrentPage(pagination.totalPages);
    }
  },

  // Update pagination metadata
  updatePaginationMeta: (meta: Partial<PaginationType>) => {
    set(produce((state: Store) => {
      state.pagination = { ...state.pagination, ...meta };
    }));
  },

  // Reset pagination to defaults
  resetPagination: () => {
    set(produce((state: Store) => {
      state.pagination = { ...defaultPagination };
    }));
  },

  // Get paginated slice for current page from data in state
  getPaginatedSlice: <T>(data?: T[], dataKey?: string): T[] => {
    const { pagination } = get();
    const state = get();

    let sourceData: T[];
    if (data && data.length > 0) {
      sourceData = data;
    } else {
      const key = dataKey || pagination.dataKey;
      sourceData = getDataFromState(state, key) as T[];
    }

    // Simple slicing for current page
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    
    return sourceData.slice(startIndex, endIndex);
  },

  // Debug information
  getPaginationDebugInfo: (dataKey?: string) => {
    const { pagination } = get();
    const state = get();
    const key = dataKey || pagination.dataKey;
    const data = getDataFromState(state, key);
    const globalStartIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const globalEndIndex = globalStartIndex + pagination.itemsPerPage - 1;

    return {
      userPageRange: {
        start: globalStartIndex,
        end: globalEndIndex,
      },
      cachedRange: {
        start: pagination.cachedItemsStartIndex,
        end: pagination.cachedItemsEndIndex,
      },
      needsFetch: get().checkIfNeedsBackendFetch(pagination.currentPage, key),
      backendPage: get().getBackendPageForUserPage(pagination.currentPage),
      dataInfo: {
        key,
        length: data.length,
        hasEnoughData: data.length > globalEndIndex,
      },
    };
  },
});
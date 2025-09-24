import { type StateCreator } from "zustand";
import { Store } from "../store";
import { produce } from "immer";
import { useApiClient } from "@/libs/useApiClient";

// Clean, focused types
type PaginationState = {
  // User pagination
  page: number;
  size: number;
  total: number;
  
  // Backend pagination
  backendPage: number;
  backendSize: number;
  
  // Cache management
  cacheStart: number;
  cacheEnd: number;
  
  // Configuration
  dataKey: string;
  loadFunction: string;
  apiClient?: ReturnType<typeof useApiClient>["get"];
  
  isLoading: boolean;
  lastFetchedPage: number;
};

// Computed properties (no storage needed)
type PaginationComputed = {
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  needsFetch: boolean;
  backendTotalPages: number;
};

export type PaginationStore = {
  pagination: PaginationState;
  
  // Core actions - simple, focused
  setPage: (page: number) => Promise<void>;
  setSize: (size: number) => Promise<void>;
  configure: (config: PaginationConfig) => void;
  
  // Navigation
  next: () => Promise<void>;
  prev: () => Promise<void>;
  first: () => Promise<void>;
  last: () => Promise<void>;
  
  // Data management
  updateFromAPI: (response: APIResponse) => void;
  slice: <T>(data?: T[]) => T[];
  reset: () => void;
  
  // Computed getters
  computed: () => PaginationComputed;
};

// Configuration interface
type PaginationConfig = {
  dataKey: string;
  loadFunction: string;
  size?: number;
  backendSize?: number;
  apiClient?: ReturnType<typeof useApiClient>["get"];
};

// API response interface
type APIResponse = {
  total: number;
  page?: number;
  totalPages?: number;
};

// Default state - minimal and clear
const initialState: PaginationState = {
  page: 1,
  size: 10,
  total: 0,
  backendPage: 1,
  backendSize: 250,
  cacheStart: 0,
  cacheEnd: -1,
  dataKey: "data",
  loadFunction: "loadData",
  isLoading: false,
  lastFetchedPage: 0,
};


const computePagination = (state: PaginationState): PaginationComputed => ({
  totalPages: Math.max(0, Math.ceil(state.total / state.size)),
  hasNext: state.page * state.size < state.total,
  hasPrev: state.page > 1,
  needsFetch: shouldFetch(state),
  backendTotalPages: Math.max(0, Math.ceil(state.total / state.backendSize)),
});

const shouldFetch = (state: PaginationState): boolean => {
  const start = (state.page - 1) * state.size;
  const end = start + state.size - 1;
  
  return (
    state.cacheEnd < 0 || // No cache
    start < state.cacheStart || // Outside cache range
    end > state.cacheEnd || // Outside cache range
    state.lastFetchedPage === 0 // Never fetched
  );
};

const getBackendPage = (userPage: number, userSize: number, backendSize: number): number => {
  const startIndex = (userPage - 1) * userSize;
  return Math.floor(startIndex / backendSize) + 1;
};

const getDataFromStore = (store: Store, key: string): any[] => {
  const data = (store as any)[key];
  return Array.isArray(data) ? data : [];
};

const executeLoadFunction = async (
  store: any,
  functionName: string,
  apiClient?: ReturnType<typeof useApiClient>["get"]
): Promise<void> => {
  const loadFn = store[functionName];
  if (typeof loadFn !== 'function') {
    console.warn(`Load function '${functionName}' not found`);
    return;
  }
  
  try {
    await loadFn(true, apiClient);
  } catch (error) {
    console.error(`Load function '${functionName}' failed:`, error);
    throw error;
  }
};

// Store implementation - clean and focused
export const usePaginationStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  PaginationStore
> = (set, get) => ({
  pagination: initialState,

  // Configure pagination - one method, clear intent
  configure: (config: PaginationConfig) => {
    set(produce((state: Store) => {
      state.pagination.dataKey = config.dataKey;
      state.pagination.loadFunction = config.loadFunction;
      state.pagination.apiClient = config.apiClient;
      
      if (config.size && config.size > 0) {
        state.pagination.size = config.size;
      }
      
      if (config.backendSize && config.backendSize > 0) {
        state.pagination.backendSize = config.backendSize;
      }
      
      // Reset state on configuration change
      state.pagination.page = 1;
      state.pagination.cacheStart = 0;
      state.pagination.cacheEnd = -1;
      state.pagination.lastFetchedPage = 0;
    }));
  },

  // Set page - the core action
  setPage: async (page: number) => {
    if (page < 1 || !Number.isInteger(page)) return;
    
    const state = get();
    if (state.pagination.isLoading) return;
    
    const computed = get().computed();
    const targetPage = computed.totalPages > 0 
      ? Math.min(page, computed.totalPages) 
      : page;

    // Update page first
    set(produce((draft: Store) => {
      draft.pagination.page = targetPage;
    }));

    // Handle data loading if needed
    const needsFetch = shouldFetch({ ...state.pagination, page: targetPage });
    if (needsFetch) {
      await handleDataFetch(get, set, targetPage);
    }
  },

  // Set page size
  setSize: async (size: number) => {
    if (size < 1) return;
    
    set(produce((state: Store) => {
      state.pagination.size = size;
      state.pagination.page = 1; // Reset to first page
      state.pagination.cacheStart = 0;
      state.pagination.cacheEnd = -1;
      state.pagination.lastFetchedPage = 0;
    }));

    // Reload data with new size
    const state = get();
    await executeLoadFunction(
      get(), 
      state.pagination.loadFunction, 
      state.pagination.apiClient
    );
  },

  // Navigation methods - simple and consistent
  next: async () => {
    const computed = get().computed();
    if (computed.hasNext) {
      await get().setPage(get().pagination.page + 1);
    }
  },

  prev: async () => {
    const computed = get().computed();
    if (computed.hasPrev) {
      await get().setPage(get().pagination.page - 1);
    }
  },

  first: async () => {
    await get().setPage(1);
  },

  last: async () => {
    const computed = get().computed();
    if (computed.totalPages > 0) {
      await get().setPage(computed.totalPages);
    }
  },

  // Update from API response
  updateFromAPI: (response: APIResponse) => {
    if (typeof response.total !== 'number') return;

    set(produce((state: Store) => {
      const { pagination } = state;
      
      pagination.total = Math.max(0, response.total);
      
      if (response.page && response.page > 0) {
        pagination.backendPage = response.page;
      }

      // Update cache range
      const data = getDataFromStore(state, pagination.dataKey);
      const startIndex = (pagination.backendPage - 1) * pagination.backendSize;
      
      pagination.cacheStart = startIndex;
      pagination.cacheEnd = data.length > 0 
        ? Math.min(startIndex + data.length - 1, pagination.total - 1)
        : -1;
    }));
  },

  // Get current page slice
  slice: <T>(data?: T[]): T[] => {
    const { pagination } = get();
    const sourceData = data || getDataFromStore(get(), pagination.dataKey);
    
    const start = (pagination.page - 1) * pagination.size;
    const end = start + pagination.size;

    console.log(sourceData,'source data')
    
    return sourceData.slice(start, end);
  },

  // Reset to initial state
  reset: () => {
    set(produce((state: Store) => {
      state.pagination = { ...initialState };
    }));
  },

  // Computed properties getter
  computed: () => computePagination(get().pagination),
});


import { WritableDraft } from "immer";

const handleDataFetch = async (
  get: () => Store,
  set: (fn: (state: WritableDraft<Store>) => void) => void,
  targetPage: number
) => {
  const state = get();
  const { pagination } = state;
  
  const requiredBackendPage = getBackendPage(
    targetPage, 
    pagination.size, 
    pagination.backendSize
  );

  // Avoid duplicate fetches
  if (pagination.lastFetchedPage === requiredBackendPage) return;

  // Set loading state
  set(produce((draft: Store) => {
    draft.pagination.isLoading = true;
    draft.pagination.backendPage = requiredBackendPage;
    draft.pagination.lastFetchedPage = requiredBackendPage;
  }));

  try {
    await executeLoadFunction(
      get(), 
      pagination.loadFunction, 
      pagination.apiClient
    );
  } finally {
    set(produce((draft: Store) => {
      draft.pagination.isLoading = false;
    }));
  }
};


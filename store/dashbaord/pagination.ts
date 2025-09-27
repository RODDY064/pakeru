import { type StateCreator } from "zustand";
import { Store } from "../store";
import { produce } from "immer";

// Simplified pagination state
type PaginationState = {
  page: number;
  size: number;
  total: number;
  
  // Configuration
  dataKey: string;
  loadFunction?: (page: number) => Promise<void>;
  
  isLoading: boolean;
};

// Computed properties
type PaginationComputed = {
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
};

export type PaginationStore = {
  pagination: PaginationState;
  
  // Core actions
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
  loadFunction: (page: number) => Promise<void>;
  size?: number;
};

// API response interface
type APIResponse = {
  total: number;
  page?: number;
  totalPages?: number;
};

// Default state
const initialState: PaginationState = {
  page: 1,
  size: 10,
  total: 0,
  dataKey: "data",
  loadFunction: undefined,
  isLoading: false,
};

const computePagination = (state: PaginationState): PaginationComputed => {
  const totalPages = Math.max(0, Math.ceil(state.total / state.size));
  const startIndex = (state.page - 1) * state.size;
  const endIndex = Math.min(startIndex + state.size, state.total);
  
  return {
    totalPages,
    hasNext: state.page < totalPages,
    hasPrev: state.page > 1,
    startIndex,
    endIndex,
  };
};

const getDataFromStore = (store: Store, key: string): any[] => {
  const data = (store as any)[key];
  return Array.isArray(data) ? data : [];
};

// Store implementation
export const usePaginationStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  PaginationStore
> = (set, get) => ({
  pagination: initialState,

  // Configure pagination
  configure: (config: PaginationConfig) => {
    set(produce((state: Store) => {
      state.pagination.dataKey = config.dataKey;
      state.pagination.loadFunction = config.loadFunction;
      
      if (config.size && config.size > 0) {
        state.pagination.size = config.size;
      }
      
      // Reset to first page on configuration change
      state.pagination.page = 1;
      state.pagination.total = 0;
    }));
  },

  // Set page - loads data for that specific page
  setPage: async (page: number) => {
    if (page < 1 || !Number.isInteger(page)) return;
    
    const state = get();
    if (state.pagination.isLoading) return;
    
    if (!state.pagination.loadFunction) {
      console.warn('No load function configured');
      return;
    }
    
    const computed = get().computed();
    const targetPage = computed.totalPages > 0 
      ? Math.min(page, computed.totalPages) 
      : page;

    // Set loading state
    set(produce((draft: Store) => {
      draft.pagination.isLoading = true;
      draft.pagination.page = targetPage;
    }));

    try {
      await state.pagination.loadFunction(targetPage);
    } catch (error) {
      console.error(`Load function failed:`, error);
      throw error;
    } finally {
      set(produce((draft: Store) => {
        draft.pagination.isLoading = false;
      }));
    }
  },

  // Set page size
  setSize: async (size: number) => {
    if (size < 1) return;
    
    set(produce((state: Store) => {
      state.pagination.size = size;
      state.pagination.page = 1; // Reset to first page
    }));

    // Reload data with new size
    await get().setPage(1);
  },

  // Navigation methods
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
      state.pagination.total = Math.max(0, response.total);
      
      if (response.page && response.page > 0) {
        state.pagination.page = response.page;
      }
    }));
  },

  // Get current page slice from local data
  slice: <T>(data?: T[]): T[] => {
    const { pagination } = get();
    const sourceData = data || getDataFromStore(get(), pagination.dataKey);
    
    const computed = get().computed();
    
    return sourceData.slice(computed.startIndex, computed.endIndex);
  },

  reset: () => {
    set(produce((state: Store) => {
      state.pagination = { ...initialState };
    }));
  },

  computed: () => computePagination(get().pagination),
});
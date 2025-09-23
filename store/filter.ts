import { type StateCreator } from "zustand";
import { Store } from "./store";

// Enhanced types for better type safety
type PriceRange = {
  min?: number;
  max?: number;
};

type FilterItem = {
  name: string;
  content: string[] | string | PriceRange;
  view: boolean;
  selected: (string | number | PriceRange)[];
  multiSelect: boolean;
  type?: 'category' | 'sort' | 'price' | 'text'; 
};

// Filter queries interface for API calls
export interface FilterQueries {
  category?: string[];
  sort_by?: string;
  price?: string;
  [key: string]: any;
}

export type FilterStore = {
  filter: boolean;
  filterState: (filt: boolean) => void;
  filteritems: FilterItem[];
  currentFilters: FilterQueries | null; 
  
  // Selection functions
  toggleSelection: (name: string, value: string | number) => void;
  setSelection: (name: string, value: string | number | PriceRange) => void;
  clearSelection: (name: string) => void;
  clearAllSelections: () => void;
  
  // View functions
  setFilterView: (name: string) => void;
  closeAllFilterViews: () => void;
  
  // Price functions
  setPriceRange: (min?: number, max?: number) => void;
  
  // Query functions
  getFilterQueries: () => FilterQueries;
  applyFiltersToURL: (searchParams: URLSearchParams, pathname: string, router: any) => void;
  loadFiltersFromURL: (searchParams: URLSearchParams) => void;
  
  // Utility functions
  hasActiveFilters: () => boolean;
  getActiveFilterCount: () => number;
  resetFilters: () => void;
  
  // Category management
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  updateCategories: (categories: string[]) => void;
  setFilterCategories: () => Promise<void>;
};

// Sort mapping for API conversion
const sortMapping: { [key: string]: string } = {
  "price: low to high": "price",
  "price: high to low": "-price",
  "newest": "-createdAt,price",
  "rating": "-averageRating,numReviews,stock,-createdAt,price",
  "oldest": "createdAt,price",
  "name: a to z": "name,price",
  "name: z to a": "-name,price",
  "most popular": "-numReviews,averageRating,price",
  "least popular": "numReviews,averageRating,price",
};

export const useFilterStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  FilterStore
> = (set, get) => ({
  filter: false,
  currentFilters: null,
  
  filterState: (filt) => set({ filter: filt }),
  
  filteritems: [
    {
      name: "Category",
      content: [],
      view: false,
      selected: [],
      multiSelect: true,
      type: 'category',
    },
    {
      name: "sort by",
      content: [
        "price: low to high",
        "price: high to low",
        "newest",
        "rating",
      ],
      view: false,
      selected: [],
      multiSelect: false,
      type: 'sort',
    },
    // {
    //   name: "price",
    //   content: { min: 0, max: 10000 }, // Default price range
    //   view: false,
    //   selected: [],
    //   multiSelect: false,
    //   type: 'price',
    // },
  ],

  toggleSelection: (name, value) =>
    set((state) => {
      const item = state.filteritems.find((item) => item.name === name);
      if (!item) return state;

      let newSelected: (string | number | PriceRange)[];
      
      if (item.multiSelect) {
        // For categories, value is the name, but we store the ID
        if (name.toLowerCase() === "category") {
          const category = state.categories.find(
            (cat) => cat.name.toLowerCase() === (value as string).toLowerCase()
          );
          if (!category) return state;
          const id = category._id;
          newSelected = item.selected.includes(id)
            ? item.selected.filter((s) => s !== id)
            : [...item.selected, id];
        } else {
          newSelected = item.selected.includes(value)
            ? item.selected.filter((s) => s !== value)
            : [...item.selected, value];
        }
      } else {
        newSelected = item.selected.includes(value) ? [] : [value];
      }

      return {
        filteritems: state.filteritems.map((i) =>
          i.name === name ? { ...i, selected: newSelected } : i
        ),
      };
    }),

  setSelection: (name, value) =>
    set((state) => {
      const item = state.filteritems.find((item) => item.name === name);
      if (!item) return state;

      let newSelected: (string | number | PriceRange)[];
      
      if (item.multiSelect) {
        if (name.toLowerCase() === "category") {
          const category = state.categories.find(
            (cat) => cat.name.toLowerCase() === (value as string).toLowerCase()
          );
          if (!category) return state;
          newSelected = [...item.selected, category._id];
        } else {
          newSelected = [...item.selected, value];
        }
      } else {
        newSelected = [value];
      }

      return {
        filteritems: state.filteritems.map((i) =>
          i.name === name ? { ...i, selected: newSelected } : i
        ),
      };
    }),

  clearSelection: (name) =>
    set((state) => ({
      filteritems: state.filteritems.map((item) =>
        item.name === name ? { ...item, selected: [] } : item
      ),
    })),

  clearAllSelections: () =>
    set((state) => ({
      filteritems: state.filteritems.map((item) => ({
        ...item,
        selected: [],
      })),
      currentFilters: null,
    })),

  setFilterView: (name: string) =>
    set((state) => ({
      filteritems: state.filteritems.map((item) => ({
        ...item,
        view: item.name === name ? !item.view : false,
      })),
    })),

  closeAllFilterViews: () =>
    set((state) => ({
      filteritems: state.filteritems.map((item) => ({
        ...item,
        view: false,
      })),
    })),

  setPriceRange: (min, max) =>
    set((state) => {
      const priceRange: PriceRange = {};
      if (min !== undefined) priceRange.min = min;
      if (max !== undefined) priceRange.max = max;

      return {
        filteritems: state.filteritems.map((item) =>
          item.name === "price" 
            ? { ...item, selected: [priceRange], content: priceRange }
            : item
        ),
      };
    }),

  getFilterQueries: () => {
    const state = get();
    const queries: FilterQueries = {};

    state.filteritems.forEach((item) => {
      if (item.selected.length === 0) return;

      switch (item.name.toLowerCase()) {
        case 'category':
          queries.category = item.selected as string[]; // Store category IDs
          break;
          
        case 'sort by':
          const sortValue = item.selected[0] as string;
          const apiSortFormat = sortMapping[sortValue.toLowerCase()] || sortValue;
          queries.sort_by = apiSortFormat;
          break;
          
        case 'price':
          const priceRange = item.selected[0] as PriceRange;
          if (priceRange && (priceRange.min !== undefined || priceRange.max !== undefined)) {
            queries.price = `${priceRange.min ?? 0}-${priceRange.max ?? ''}`;
          }
          break;
          
        default:
          queries[item.name.toLowerCase().replace(/\s+/g, '_')] = item.selected;
      }
    });

    return queries;
  },

  applyFiltersToURL: (searchParams, pathname, router) => {
    const state = get();
    const params = new URLSearchParams(searchParams.toString());
    const queries = state.getFilterQueries();

    // Clear existing filter params
    params.delete('category');
    params.delete('sort');
    params.delete('price');

    // Add new filter params
    Object.entries(queries).forEach(([key, value]) => {
      if (key === 'category' && Array.isArray(value) && value.length > 0) {
        // Map category IDs to names for URL
        const categoryNames = value
          .map((id) => {
            const category = state.categories.find((cat) => cat._id === id);
            return category ? category.name : null;
          })
          .filter((name): name is string => name !== null);
        if (categoryNames.length > 0) {
          params.set('category', categoryNames.join(','));
        }
      } else if (value && typeof value === 'string') {
        params.set(key === 'sort_by' ? 'sort' : key, value);
      }
    });

    // Update current filters
    set((state) => ({ currentFilters: queries }));

    // Navigate with new params
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  },

  loadFiltersFromURL: (searchParams) => {
    const state = get();
    const params = new URLSearchParams(searchParams.toString());
    
    set((state) => {
      const updatedItems = state.filteritems.map((item) => {
        const itemCopy: FilterItem = { ...item, selected: [] };

        switch (item.name.toLowerCase()) {
          case 'category':
            const categoryParam = params.get('category');
            if (categoryParam) {
              // Map category names from URL to IDs
              const categoryIds = categoryParam
                .split(',')
                .map((name) => {
                  const category = state.categories.find(
                    (cat) => cat.name.toLowerCase() === name.toLowerCase()
                  );
                  return category ? category._id : null;
                })
                .filter((id): id is string => id !== null);
              itemCopy.selected = categoryIds;
            }
            break;
            
          case 'sort by':
            const sortParam = params.get('sort');
            if (sortParam) {
              const userFriendlySort = Object.keys(sortMapping).find(
                key => sortMapping[key] === sortParam
              );
              if (userFriendlySort) {
                itemCopy.selected = [userFriendlySort];
              }
            }
            break;
            
          case 'price':
            const priceParam = params.get('price');
            if (priceParam) {
              const [min, max] = priceParam.split('-').map(p => p ? parseInt(p) : undefined);
              const priceRange: PriceRange = {};
              if (min !== undefined) priceRange.min = min;
              if (max !== undefined) priceRange.max = max;
              itemCopy.selected = [priceRange];
              itemCopy.content = priceRange;
            }
            break;
        }

        return itemCopy;
      });

      return { filteritems: updatedItems };
    });
  },

  hasActiveFilters: () => {
    const state = get();
    return state.filteritems.some((item) => item.selected.length > 0);
  },

  getActiveFilterCount: () => {
    const state = get();
    return state.filteritems.reduce((count, item) => {
      return count + (item.selected.length > 0 ? 1 : 0);
    }, 0);
  },

  resetFilters: () => {
    set((state) => ({
      filteritems: state.filteritems.map((item) => ({
        ...item,
        selected: [],
        view: false,
        content: item.type === 'price' ? { min: 0, max: 10000 } : item.content,
      })),
      currentFilters: null,
    }));
  },

  addCategory: (category) =>
    set((state) => ({
      filteritems: state.filteritems.map((item) =>
        item.name === "Category" && Array.isArray(item.content)
          ? { ...item, content: [...item.content, category] }
          : item
      ),
    })),

  removeCategory: (category) =>
    set((state) => ({
      filteritems: state.filteritems.map((item) =>
        item.name === "Category" && Array.isArray(item.content)
          ? { 
              ...item, 
              content: item.content.filter((c) => c !== category),
              selected: item.selected.filter((s) => s !== category)
            }
          : item
      ),
    })),

  updateCategories: (categories) =>
    set((state) => ({
      filteritems: state.filteritems.map((item) =>
        item.name === "Category"
          ? { ...item, content: categories, selected: [] }
          : item
      ),
    })),

  setFilterCategories: async () => {
    const state = get();
    try {
      await state.loadCategories(); 
      set((state) => ({
        filteritems: state.filteritems.map((item) =>
          item.name === "Category" && Array.isArray(item.content)
            ? { ...item, content: state.categories.map((cat) => cat.name) }
            : item
        ),
      }));
    } catch (error) {
      console.error("Failed to load filter categories:", error);
    }
  }
});
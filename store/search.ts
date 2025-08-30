import { type StateCreator } from "zustand";
import { Store } from "./store";
import { ProductData } from "./dashbaord/products"; 

export type SearchStore = {
  search: string;
  isSearching: boolean;
  setNavSearch: (word: string) => void;
  toggleSearch: () => void;
  searchProduct: ProductData[];
};

export const useSearch: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  SearchStore
> = (set, get) => ({
  search: "",
  isSearching: false,
  searchProduct: [],
  setNavSearch: (word) =>
    set((state) => {
      state.search = word;
      
      // Filter products based on search term
      if (word.trim() === "") {
        state.searchProduct = [];
      } else {
        const allProducts = get().products || [];
        state.searchProduct = allProducts.filter((product) => {
          const searchTerm = word.toLowerCase();
          return (
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
          );
        });
      }
    }),
  toggleSearch: () =>
    set((state) => {
      state.isSearching = !state.isSearching;
      
      // Clear search results when closing search
      if (state.isSearching === false) {
        state.search = "";
        state.searchProduct = [];
      }
    }),
});
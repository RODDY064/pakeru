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
      
      if (word.trim() === "") {
        state.searchProduct = [];
      } else {
        
        get().loadProducts(true,1,25,{ name:word })
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

      if (state.isSearching === false) {
        state.search = "";
        state.searchProduct = [];
      }
    }),
});
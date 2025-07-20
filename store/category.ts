import { type StateCreator } from "zustand";
import { Store } from "./store";

export type CategoryType = {
  id: string;
  name: string;
  description: string;
  parentCategory: string | null;
};

export type CategoryStore = {
  categories: CategoryType[];
  loadCategories: () => Promise<void>;
  getProductsWithID: (categoryId: string) => void;
};

export const useCategory: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  CategoryStore
> = (set) => ({
  categories: [],

  loadCategories: async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      const response = await fetch(`${baseUrl}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();

      console.log(res);

      // Normalize _id to id
      const categories: CategoryType[] = res.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        parentCategory: item.parentCategory,
      }));

      set((state) => {
        state.categories = categories;
      });
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  },

  getProductsWithID: (categoryId: string) => {
    console.log("getProductsWithID called for category:", categoryId);
    // implement filtering logic if you have products in store
  },
});

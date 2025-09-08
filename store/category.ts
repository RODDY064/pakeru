import { type StateCreator } from "zustand";
import { Store } from "./store";

export type CategoryType = {
  id: string;
  name: string;
  description: string;
  parentCategory: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CategoryStore = {
  categories: CategoryType[];
  isCategoriesLoading: boolean;
  loadCategories: () => Promise<void>;
  createCategory: (category: Omit<CategoryType, 'id'>) => Promise<CategoryType>;
  updateCategory: (categoryId: string, updates: Partial<CategoryType>) => Promise<CategoryType>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getProductsWithID: (categoryId: string) => void;
  findCategories: () => void;
  getCategoryNameById: (categoryId: string) => string | null;
  getCategoryById: (categoryId: string) => CategoryType | null;
  getChildCategories: (parentId: string) => CategoryType[];

};

export const useCategory: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  CategoryStore
> = (set, get) => ({
  categories: [],
  isCategoriesLoading: false,

  loadCategories: async () => {
    set((state) => {
      state.isCategoriesLoading = true;
      state.error = null;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      const response = await fetch(`${baseUrl}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
           "ngrok-skip-browser-warning": "true",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();
      console.log('Categories loaded:', res);

      const categories: CategoryType[] = res.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        parentCategory: item.parentCategory,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      }));

      set((state) => {
        state.categories = categories;
        state.isCategoriesLoading = false;
        state.error = null;
      });
    } catch (error) {
      console.error("Failed to load categories:", error);
      set((state) => {
        state.isCategoriesLoading = false;
        state.error = error instanceof Error ? error.message : "Failed to load categories";
      });
      throw error; // Re-throw to handle in component
    }
  },

  createCategory: async (categoryData: Omit<CategoryType, 'id'>) => {
    set((state) => {
      state.isCategoriesLoading = true;
      state.error = null;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      const response = await fetch(`${baseUrl}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryData.name,
          description: categoryData.description,
          parentCategory: categoryData.parentCategory,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const res = await response.json();
      console.log('Category created:', res);

      const newCategory: CategoryType = {
        id: res.data._id,
        name: res.data.name,
        description: res.data.description,
        parentCategory: res.data.parentCategory,
        createdAt: new Date(res.data.createdAt),
        updatedAt: new Date(res.data.updatedAt),
      };

      set((state) => {
        state.categories.push(newCategory);
        state.isCategoriesLoading = false;
        state.error = null;
      });

      return newCategory;
    } catch (error) {
      console.error("Failed to create category:", error);
      set((state) => {
        state.isCategoriesLoading = false;
        state.error = error instanceof Error ? error.message : "Failed to create category";
      });
      throw error;
    }
  },

  updateCategory: async (categoryId: string, updates: Partial<CategoryType>) => {
    set((state) => {
      state.isCategoriesLoading = true;
      state.error = null;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      const response = await fetch(`${baseUrl}/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const res = await response.json();
      console.log('Category updated:', res);

      const updatedCategory: CategoryType = {
        id: res.data._id,
        name: res.data.name,
        description: res.data.description,
        parentCategory: res.data.parentCategory,
        createdAt: new Date(res.data.createdAt),
        updatedAt: new Date(res.data.updatedAt),
      };

      set((state) => {
        const index = state.categories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
        state.isCategoriesLoading = false;
        state.error = null;
      });

      return updatedCategory;
    } catch (error) {
      console.error("Failed to update category:", error);
      set((state) => {
        state.isCategoriesLoading = false;
        state.error = error instanceof Error ? error.message : "Failed to update category";
      });
      throw error;
    }
  },

  deleteCategory: async (categoryId: string) => {
    set((state) => {
      state.isCategoriesLoading = true;
      state.error = null;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      // Check if category has children
      const childCategories = get().getChildCategories(categoryId);
      if (childCategories.length > 0) {
        throw new Error("Cannot delete category with child categories. Please delete child categories first.");
      }

      const response = await fetch(`${baseUrl}/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      console.log('Category deleted:', categoryId);

      set((state) => {
        state.categories = state.categories.filter(cat => cat.id !== categoryId);
        state.isCategoriesLoading = false;
        state.error = null;
      });
    } catch (error) {
      console.error("Failed to delete category:", error);
      set((state) => {
        state.isCategoriesLoading = false;
        state.error = error instanceof Error ? error.message : "Failed to delete category";
      });
      throw error;
    }
  },

  getProductsWithID: (categoryId: string) => {
    console.log("getProductsWithID called for category:", categoryId);
    // implement filtering logic if you have products in store
  },

  findCategories: () => {
    console.log("findCategories called");
    // stub for now - could implement search/filter functionality
  },

  getCategoryNameById: (categoryId: string) => {
    const category = get().categories.find((c) => c.id === categoryId);
    return category ? category.name : null;
  },

  getCategoryById: (categoryId: string) => {
    return get().categories.find((c) => c.id === categoryId) || null;
  },

  getChildCategories: (parentId: string) => {
    const parentCategory = get().getCategoryById(parentId);
    if (!parentCategory) return [];
    
    return get().categories.filter((c) => c.parentCategory === parentCategory.name);
  },
});






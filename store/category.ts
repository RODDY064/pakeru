import { type StateCreator } from "zustand";
import { Store } from "./store";
import { apiCall } from "@/libs/functions";
import { toast } from "@/app/ui/toaster";

export type CategoryType = {
  _id: string;
  name: string;
  description: string;
  parentCategory: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CategoryStore = {
  categories: CategoryType[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;

  loadCategories: () => Promise<void>;
  setCategories: (categories: CategoryType[]) => void;
  clearCategoriesError: () => void;
  createCategory: (
    category: Omit<CategoryType, "_id">
  ) => Promise<CategoryType>;
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
  categoriesError: null,

  setCategories: (categories: CategoryType[]) => {
    set((state) => {
      state.categories = categories;
      state.isCategoriesLoading = false;
      state.categoriesError = null;
    });

    console.log(`Set ${categories.length} categories from server data`);
  },

  // Clear any category loading errors
  clearCategoriesError: () => {
    set((state) => {
      state.categoriesError = null;
    });
  },

  // Your existing loadCategories method (now mainly for client-side refresh)
  loadCategories: async () => {
    set((state) => {
      state.isCategoriesLoading = true;
      state.categoriesError = null;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      const response = await apiCall("/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response;

      if (!result || !Array.isArray(result.data)) {
        throw new Error("Invalid categories response format");
      }

      const categories: CategoryType[] = result.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        parentCategory: item.parentCategory,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      }));

      // Use the setter method
      get().setCategories(categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      set((state) => {
        state.isCategoriesLoading = false;
        state.categoriesError =
          error instanceof Error ? error.message : "Failed to load categories";
      });
      throw error;
    }
  },
  // Updated createCategory with toast
  createCategory: async (categoryData: Omit<CategoryType, "_id">) => {
    const createPromise = (async () => {
      set((state) => {
        state.isCategoriesLoading = true;
        state.error = null;
      });

      try {
        const response = await apiCall("/categories", {
          method: "POST",
          body: JSON.stringify({
            name: categoryData.name,
            description: categoryData.description,
          }),
          signal: AbortSignal.timeout(10000),
        });

        const newCategory: CategoryType = {
          _id: response.data._id,
          name: response.data.name,
          description: response.data.description,
          parentCategory: response.data.parentCategory,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
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
          state.error =
            error instanceof Error
              ? error.message
              : "Failed to create category";
        });
        throw error;
      }
    })();

    return toast.promise(createPromise, {
      loading: "Creating category...",
      success: (newCategory) => ({
        title: `Category "${newCategory.name}" created successfully`,
      }),
      error: "Failed to create category. Please try again.",
    });
  },

  // Updated deleteCategory with toast
  deleteCategory: async (categoryId: string) => {
    const categoryToDelete = get().getCategoryById(categoryId);

    const deletePromise = (async () => {
      set((state) => {
        state.isCategoriesLoading = true;
        state.error = null;
      });

      try {
        // Check if category has children
        const childCategories = get().getChildCategories(categoryId);
        if (childCategories.length > 0) {
          throw new Error(
            "Cannot delete category with child categories. Please delete child categories first."
          );
        }

        const response = await apiCall(`/categories/${categoryId}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });

        console.log("Category deleted:", categoryId);

        set((state) => {
          state.categories = state.categories.filter(
            (cat) => cat._id !== categoryId
          );
          state.isCategoriesLoading = false;
          state.error = null;
        });

        return;
      } catch (error) {
        console.error("Failed to delete category:", error);
        set((state) => {
          state.isCategoriesLoading = false;
          state.error =
            error instanceof Error
              ? error.message
              : "Failed to delete category";
        });
        throw error;
      }
    })();

    await toast.promise(deletePromise, {
      loading: "Deleting category...",
      success: () => ({
        title: `Category "${
          categoryToDelete?.name || "Unknown"
        }" deleted successfully`,
      }),
      error: "Failed to delete category. Please try again.",
    });
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
    const category = get().categories.find((c) => c._id === categoryId);
    return category ? category.name : null;
  },

  getCategoryById: (categoryId: string) => {
    return get().categories.find((c) => c._id === categoryId) || null;
  },

  getChildCategories: (parentId: string) => {
    const parentCategory = get().getCategoryById(parentId);
    if (!parentCategory) return [];

    return get().categories.filter(
      (c) => c.parentCategory === parentCategory.name
    );
  },
});

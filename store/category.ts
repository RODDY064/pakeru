import { type StateCreator } from "zustand";
import { Store } from "./store";
import { apiCall } from "@/libs/functions";
import { toast } from "@/app/ui/toaster";
import { useApiClient } from "@/libs/useApiClient";

export type CategoryType = {
  _id: string;
  name: string;
  description: string;
  parentCategory: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  willShow?: boolean;
  image: {
    _id: string;
    publicId: string;
    url: string;
  };
};

export type CategoryStore = {
  categories: CategoryType[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  visibleCategoryMap: Record<string, string | null>;
  loadCategories: () => Promise<void>;
  setCategories: (categories: CategoryType[]) => void;
  clearCategoriesError: () => void;
  createCategory: (
    category: any,
    post: ReturnType<typeof useApiClient>["post"]
  ) => Promise<CategoryType>;
  updateCategory: (
    categoryId: string,
    formData: FormData,
    patch: ReturnType<typeof useApiClient>["patch"]
  ) => Promise<void>;
  getProductsWithID: (categoryId: string) => void;
  findCategories: () => void;
  initializeVisibleCategoryMap: () => void;

  setVisibleCategory: (parentId: string, childId: string | null) => void;
  updateVisibleCategory: (
    parentId: string,
    childId: string,
    patch: ReturnType<typeof useApiClient>["patch"]
  ) => Promise<void>;

  getCategoryNameById: (categoryId: string) => string | null;
  getCartIdByName: (name: string) => string | null;
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
  visibleCategoryMap: {},

  setVisibleCategory: (parentId, childId) => {
    set((state) => {
      state.visibleCategoryMap[parentId] = childId;
    });
  },

  initializeVisibleCategoryMap: () => {
    const categories = get().categories;
    const map: Record<string, string | null> = {};

    categories.forEach((cat) => {
      // Only record those that are visible
      if (cat.willShow) {
        const parent = cat.parentCategory || "root";
        map[parent] = cat._id;
      }
    });

    set((state) => {
      state.visibleCategoryMap = map;
    });

    // console.log("Initialized visibleCategoryMap:", map);
  },

  updateVisibleCategory: async (
    parentId,
    childId,
    patch: ReturnType<typeof useApiClient>["patch"]
  ) => {
    console.log("Updating visible category:", { parentId, childId });

    const category = get().getCategoryById(childId);
    if (!category) throw new Error("Invalid category ID");

    const updatePromise = (async () => {
      try {
        // Call backend API to set visible category
        const response = await patch<{ data: CategoryType }>(
          `/categories/${childId}`,
          { willShow: true },
          {
            requiresAuth: true,
            headers: {
              "Content-type": "application/json",
            },
          }
        );

        set((state) => {
          // Update visibility map
          state.visibleCategoryMap[parentId] = childId;

          // Update all categories in this group
          state.categories = state.categories.map((cat) =>
            cat._id === childId
              ? { ...cat, willShow: true }
              : cat.parentCategory === parentId
              ? { ...cat, willShow: false }
              : cat
          );
        });

        return response.data;
      } catch (error) {
        console.error("Failed to update visible category:", error);
        throw error;
      }
    })();

    await toast.promise(updatePromise, {
      loading: {
        title: "Updating visible category...",
        duration: Infinity,
      },
      success: () => ({
        title: `Category "${category.name}" set as visible`,
      }),
      error: "Failed to update visible category.",
    });
  },

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

  loadCategories: async () => {
    const state = get();

    if (state.categories && state.categories.length > 0) {
      console.log("Categories already loaded — skipping fetch.");
      return;
    }

    set((draft) => {
      draft.isCategoriesLoading = true;
      draft.categoriesError = null;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
      }

      const response = await apiCall("/categories", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const result = response;

      if (!result || !Array.isArray(result.data)) {
        throw new Error("Invalid categories response format");
      }

      const categories: CategoryType[] = result.data.map((item: any) => ({
        _id: item._id,
        name: item.name,
        description: item.description ?? "",
        parentCategory: item.parentCategory ?? "",
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        willShow: item.willShow ?? undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        image: item.image ?? "",
      }));

      // Use setter to store categories
      get().setCategories(categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      set((draft) => {
        draft.isCategoriesLoading = false;
        draft.categoriesError =
          error instanceof Error ? error.message : "Failed to load categories";
      });
      throw error;
    } finally {
      set((draft) => {
        draft.isCategoriesLoading = false;
      });
    }
  },
  // Updated createCategory with toast
  createCategory: async (categoryData: any, post) => {
    const createPromise = (async () => {
      set((state) => {
        state.isCategoriesLoading = true;
        state.error = null;
      });

      try {
        const response = await post<CategoryType>("/categories", categoryData, {
          requiresAuth: true,
        });

        const newCategory: CategoryType = {
          _id: response?._id,
          name: response?.name,
          description: response?.description,
          parentCategory: response?.parentCategory,
          createdAt: response?.createdAt
            ? new Date(response.createdAt)
            : undefined,
          updatedAt: response?.updatedAt
            ? new Date(response?.updatedAt)
            : undefined,
          willShow: response?.willShow ?? undefined,
          image: response.image ?? "",
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
      loading: {
        title: "Creating category...",
        duration: Infinity,
      },
      success: (newCategory) => ({
        title: `Category "${newCategory.name}" created successfully`,
      }),
      error: "Failed to create category. Please try again.",
    });
  },

  // Updated deleteCategory with toast
  updateCategory: async (categoryId: string, body, patch) => {
    console.log("Updating category:", categoryId);

    if (!patch) {
      throw new Error("Api patch is required");
    }

    const updatePromise = (async () => {
      set((state) => {
        state.isCategoriesLoading = true;
        state.error = null;
      });

      try {
        // Call your PATCH endpoint
        const response = await patch<{ data: CategoryType }>(
          `/categories/${categoryId}`,
          body,
          {
            requiresAuth: true,
            cache: "no-store",
          }
        );

        console.log("Category updated:", response);

        // Update state with the new category data
        set((state) => {
          state.categories = state.categories.map((cat) =>
            cat._id === categoryId ? { ...cat, ...response.data } : cat
          );
          state.isCategoriesLoading = false;
          state.error = null;
        });
      } catch (error) {
        console.error("Failed to update category:", error);
        set((state) => {
          state.isCategoriesLoading = false;
          state.error =
            error instanceof Error
              ? error.message
              : "Failed to update category";
        });
        throw error;
      }
    })();

    const categoryToUpdate = get().getCategoryById(categoryId);

    await toast.promise(updatePromise, {
      loading: {
        title: "Updating category...",
        duration: Infinity,
      },
      success: () => ({
        title: `Category "${
          categoryToUpdate?.name || "Unknown"
        }" updated successfully`,
      }),
      error: "Failed to update category. Please try again.",
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
  getCartIdByName: (name) => {
    const category = get().categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    return category ? category._id : null;
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

import { StateCreator } from "zustand";
import { Store } from "./store";
import { useApiClient } from "@/libs/useApiClient";

export interface ClothType {
  _id: string;
  name: string;
  sizeGuideType:
    | "men-shirts"
    | "men-tops"
    | "men-pants"
    | "women-tops"
    | "women-skirts-pants";
}

export type GeneralStore = {
  isMobile: boolean;
  sizeGuild: boolean;
  setSizeGuild: () => void;
  setIsMobile: (stat: boolean) => void;
  routeChange: boolean;
  setRouteChange: () => void;
  clothTypes: ClothType[];
  isLoadingClothTypes: boolean;
  loadClothTypes: (
    get?: ReturnType<typeof useApiClient>["get"]
  ) => Promise<void>;
  createClothTypes: (
    body: { name: string; sizeGuideType: string },
    post?: ReturnType<typeof useApiClient>["post"]
  ) => Promise<boolean>;
  updateClothTypes: (
    clothID: string,
    body: { name: string; sizeGuideType: string },
    patch?: ReturnType<typeof useApiClient>["patch"]
  ) => Promise<boolean>;
};

export const useGeneralStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  GeneralStore
> = (set, get) => ({
  isMobile: false,
  routeChange: false,
  sizeGuild: false,
  clothTypes: [],
  isLoadingClothTypes: false,

  setSizeGuild: () =>
    set((state) => {
      state.sizeGuild = !state.sizeGuild;
    }),

  setIsMobile: (stat) =>
    set({
      isMobile: stat,
    }),

  setRouteChange: () =>
    set((state) => {
      state.routeChange = !state.routeChange;
    }),

  loadClothTypes: async (apiGet) => {
    if (!apiGet) {
      throw new Error("API get function is required");
    }

    const state = get();
    
    // Don't load if already loading
    if (state.isLoadingClothTypes) return;
    
    // Allow reload even if data exists (for refresh after create/update)
    
    try {
      set((state) => {
        state.isLoadingClothTypes = true;
      });

      const response = await apiGet<{ data: ClothType[] }>("/cloth-type");
      
      if (response?.data) {
        set((state) => {
          state.clothTypes = response.data;
          state.isLoadingClothTypes = false;
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error loading cloth types:", error);
      set((state) => {
        state.isLoadingClothTypes = false;
      });
      throw error;
    }
  },

  createClothTypes: async (body, apiPost) => {
    if (!apiPost) {
      throw new Error("API post function is required");
    }

    try {
      const response = await apiPost<{ data: ClothType }>("/cloth-type", body, {
        requiresAuth: true,
      });

      if (response?.data) {
        set((state) => {
          // Check if already exists (by ID)
          const exists = state.clothTypes.some(
            (ct) => ct._id === response.data._id
          );
          
          if (!exists) {
            state.clothTypes.push(response.data);
          }
        });
        return true;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error creating cloth type:", error);
      throw new Error(error.message || "Failed to create cloth type");
    }
  },

  updateClothTypes: async (clothID, body, apiPatch) => {
    if (!apiPatch) {
      throw new Error("API patch function is required");
    }

    if (!clothID) {
      throw new Error("Cloth type ID is required");
    }

    try {
      const response = await apiPatch<{ data: ClothType }>(`/cloth-type/${clothID}`,
        body,
        {
          requiresAuth: true,
        }
      );

      if (response?.data) {
        set((state) => {
          const index = state.clothTypes.findIndex((ct) => ct._id === clothID);
          
          if (index !== -1) {
            // Update the existing item
            state.clothTypes[index] = response.data;
          } else {
            // If not found, add it (shouldn't happen, but defensive)
            state.clothTypes.push(response.data);
          }
        });
        return true;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error updating cloth type:", error);
      throw new Error(error.message || "Failed to update cloth type");
    }
  }
});
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
  loadClothTypes: (
    get?: ReturnType<typeof useApiClient>["get"]
  ) => Promise<void>;
  createClothTypes: (
    body: FormData,
    post?: ReturnType<typeof useApiClient>["post"]
  ) => Promise<void>;
  updateClothTypes: (
    clothID: string,
    body: any,
    patch?: ReturnType<typeof useApiClient>["patch"]
  ) => Promise<void>;
};

export const useGenralStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  GeneralStore
> = (set, get) => ({
  isMobile: false,
  routeChange: false,
  sizeGuild: false,
  clothTypes: [],

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
    if (state.clothTypes.length > 0) return;

    try {
      const response = await apiGet<{ data: ClothType[] }>("/cloth-type");

      if (response.data) {
        set((state) => {
          state.clothTypes = response.data;
        });
      }
    } catch (error) {
      console.error("Error loading cloth types:", error);
      throw error;
    }
  },
  createClothTypes: async (body, apiPost) => {
    if (!apiPost) {
      throw new Error("API post function is required");
    }

    try {
      const response = await apiPost<{ data: ClothType }>("/cloth-type", body);

      if (response.data) {
        set((state) => {
          const exists = state.clothTypes.some(
            (ct) => ct._id === response.data._id
          );
          if (!exists) {
            state.clothTypes.push(response.data);
          }
        });
      }
    } catch (error) {
      console.error("Error creating cloth type:", error);
      throw error;
    }
  },
  updateClothTypes: async (clothID, body, apiPatch) => {
    if (!apiPatch) {
      throw new Error("API patch function is required");
    }

    try {
      const response = await apiPatch<{ data: ClothType }>(
        `/cloth-type/${clothID}`,
        body
      );

      if (response.data) {
        set((state) => {
          const index = state.clothTypes.findIndex((ct) => ct._id === clothID);
          if (index !== -1) {
            state.clothTypes[index] = response.data;
          }
        });
      }
    } catch (error) {
      console.error("Error updating cloth type:", error);
      throw error;
    }
  },
});

import { type StateCreator } from "zustand";
import { Store } from "@/store/store";
import { useApiClient } from "@/libs/useApiClient";
import { toast } from "@/app/ui/toaster";
import { v4 as uuidv4 } from "uuid";

// ----- Types -----
type ImageData = {
  _id?: string;
  publicId?: string;
  url?: string;
};

export type HeroDevice = {
  name: "desktop" | "tablet" | "mobile";
  image: ImageData;
};

export type HeroContent = {
  type: "hero";
  _id?: string;
  title: string;
  description: string;
  hero: HeroDevice[];
};

export type GalleryItem = {
  _id?: string;
  name: string;
  image: ImageData;
  products: string[];
};

export type GalleryContent = {
  type: "gallery";
  items: GalleryItem[];
};

export type Content = HeroContent | GalleryContent;

export type ContentStore = {
  // Modal state
  isContentModalOpen: boolean;
  contentModalType: Content["type"] | null;
  content: Content | null;

  // Backend state
  hero: HeroContent | null;
  galleries: GalleryItem[];

  // Loading states
  isLoading: boolean;

  // Actions
  setContent: (content: Content | null) => void;
  setHero: (heroItems: HeroContent) => void;
  setGalleries: (galleries: GalleryItem[]) => void;

  toggleContentModal: (
    open?: boolean,
    type?: Content["type"],
    id?: string
  ) => void;

  // CRUD operations
  createHero: () => void;
  createGallery: () => void;
  removeGallery: (id: string) => void;

  // API operations
  fetchContent: () => Promise<void>;
  uploadContent: (
    payload: Content,
    options: {
      get?: ReturnType<typeof useApiClient>["get"];
      patch?: ReturnType<typeof useApiClient>["patch"];
    }
  ) => Promise<void>;
};

// ----- Helpers -----
const createEmptyHero = (): HeroContent => ({
  type: "hero",
  _id: uuidv4(),
  title: "",
  description: "",
  hero: [
    { name: "desktop", image: createEmptyImage() },
    { name: "tablet", image: createEmptyImage() },
    { name: "mobile", image: createEmptyImage() },
  ],
});

const createEmptyImage = (): ImageData => ({
  _id: undefined,
  publicId: undefined,
  url: undefined,
});

const createEmptyGalleryItem = (): GalleryItem => ({
  _id: uuidv4(),
  name: "",
  image: createEmptyImage(),
  products: [],
});

// const createEmptySliderItem = (): SliderItem => ({
//   _id: uuidv4(),
//   title: "",
//   category: "",
//   image: createEmptyImage(),
// });

// ----- Store -----
export const useContentStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  ContentStore
> = (set, get) => ({
  // Initial state
  isContentModalOpen: false,
  content: null,
  contentModalType: null,
  hero: null,
  galleries: Array.from({ length: 13 }, () => createEmptyGalleryItem()),
  isLoading: false,

  // Actions
  setContent: (content) => set({ content }),
  setHero: (heroItems) => set({ hero: heroItems }),
  setGalleries: (galleries) => set({ galleries }),

  toggleContentModal: (open, type, id) => {
    const { hero, galleries } = get();
    const shouldOpen = open ?? !get().isContentModalOpen;

    let contentToLoad: Content | null = null;

    // Load existing content when opening modal for editing
    if (shouldOpen && type && id) {
      switch (type) {
        case "hero":
          contentToLoad = hero && hero._id === id ? hero : null;
          break;
        case "gallery":
          const galleryItem = galleries.find((item) => item._id === id);
          if (galleryItem) {
            contentToLoad = {
              type: "gallery",
              items: [galleryItem],
            };
          }
          break;
      }
    }

    set({
      isContentModalOpen: shouldOpen,
      contentModalType: type ?? get().contentModalType,
      content: shouldOpen ? contentToLoad : null,
    });
  },

  // CRUD operations
  createHero: () => {
    const newHero = createEmptyHero();
    set({
      content: newHero,
      contentModalType: "hero",
      isContentModalOpen: true,
    });
  },

  createGallery: () => {
    const newGalleryItem = createEmptyGalleryItem();
    const newGallery: GalleryContent = {
      type: "gallery",
      items: [newGalleryItem],
    };
    set({
      content: newGallery,
      contentModalType: "gallery",
      isContentModalOpen: true,
    });
  },

  removeGallery: (id) =>
    set((state) => ({
      galleries: state.galleries.filter((item) => item._id !== id),
    })),

  // API operations
  fetchContent: async () => {
    set({ isLoading: true });

    try {
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch content";
      toast.message.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadContent: async (payload, { get, patch }) => {
    set({ isLoading: true });

    if (!get || !patch) {
      throw new Error("Api functions are required");
    }

    try {
      const apiClient = useApiClient();
      let isUpdate = false;
      if (payload.type === "hero") {
        isUpdate =
          !!(payload as HeroContent)._id && (payload as HeroContent)._id !== "";
      } else if (payload.type === "gallery") {
        isUpdate =
          !!(payload as GalleryContent).items?.[0]?._id &&
          (payload as GalleryContent).items[0]._id !== "";
      }
      let contentId: string | undefined;
      if (payload.type === "hero") {
        contentId = (payload as HeroContent)._id;
      } else if (payload.type === "gallery") {
        contentId = (payload as GalleryContent).items?.[0]?._id;
      }
      const endpoint = isUpdate ? `/content/${payload.type}/${contentId}` : `/content/${payload.type}`;

      const response = isUpdate
        ? await patch<{ data: HeroContent }>(endpoint, payload)
        : await get<{ data: HeroContent }>(endpoint);

      if (!response) {
        throw new Error("");
      }

      // Update local state based on content type
      switch (payload.type) {
        case "hero":
          set({ hero: response.data });
          break;
        case "gallery":
          // Gallery items are always updated by ID
          const galleryItem = response.data;
          if (isUpdate) {
            set((state) => ({
              galleries: state.galleries.map((item) =>
                item._id === payload.items[0]._id ? galleryItem : item
              ),
            }));
          } else {
            set((state) => ({
              galleries: [...state.galleries, galleryItem],
            }));
          }
          break;
      }

      set({ content: null, isContentModalOpen: false });
      toast.message.success(
        `${payload.type} ${isUpdate ? "updated" : "created"} successfully`
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload content";
      toast.message.error(message);
    } finally {
      set({ isLoading: false });
    }
  },
});

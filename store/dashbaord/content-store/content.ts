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

type HeroContent = {
  type: "hero";
  _id?: string;
  title: string;
  description: string;
  image: ImageData;
};

type GalleryItem = {
  _id?: string;
  title: string;
  image: ImageData;
  products: string[];
};

type GalleryContent = {
  type: "gallery";
  items: GalleryItem[];
};

type SliderItem = {
  _id?: string;
  title: string;
  category: string;
  image: ImageData;
};

type SliderContent = {
  type: "slider";
  _id?: string;
  title: string;
  category: string;
  image: ImageData;
};

export type Content = HeroContent | GalleryContent | SliderContent;

export type ContentStore = {
  // Modal state
  isContentModalOpen: boolean;
  contentModalType: Content["type"] | null;
  content: Content | null;
  
  // Backend state
  hero: HeroContent | null;
  galleries: GalleryItem[];
  sliders: SliderItem[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setContent: (content: Content | null) => void;
  toggleContentModal: (open?: boolean, type?: Content["type"], id?: string) => void;
  
  // CRUD operations
  createHero: () => void;
  createGallery: () => void;
  createSlider: () => void;
  removeGallery: (id: string) => void;
  removeSlider: (id: string) => void;
  
  // API operations
  fetchContent: (type: Content["type"]) => Promise<void>;
  uploadContent: (payload: Content) => Promise<void>;
  deleteContent: (id: string, type: Content["type"]) => Promise<void>;
};

// ----- Helpers -----
const createEmptyImage = (): ImageData => ({
  _id: undefined,
  publicId: undefined,
  url: undefined,
});

const createEmptyHero = (): HeroContent => ({
  type: "hero",
  _id: uuidv4(),
  title: "",
  description: "",
  image: createEmptyImage(),
});

const createEmptyGalleryItem = (): GalleryItem => ({
  _id: uuidv4(),
  title: "",
  image: createEmptyImage(),
  products: [],
});

const createEmptySliderItem = (): SliderItem => ({
  _id: uuidv4(),
  title: "",
  category: "",
  image: createEmptyImage(),
});

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
  sliders: Array.from({ length: 2 }, () => createEmptySliderItem()),
  isLoading: false,

  // Actions
  setContent: (content) => set({ content }),

  toggleContentModal: (open, type, id) => {
    const { hero, galleries, sliders } = get();
    const shouldOpen = open ?? !get().isContentModalOpen;
    
    let contentToLoad: Content | null = null;
    
    // Load existing content when opening modal for editing
    if (shouldOpen && type && id) {
      switch (type) {
        case "hero":
          contentToLoad = hero && hero._id === id ? hero : null;
          break;
        case "gallery":
          const galleryItem = galleries.find(item => item._id === id);
          if (galleryItem) {
            contentToLoad = {
              type: "gallery",
              items: [galleryItem]
            };
          }
          break;
        case "slider":
          const sliderItem = sliders.find(item => item._id === id);
          if (sliderItem) {
            contentToLoad = {
              type: "slider",
              _id: sliderItem._id,
              title: sliderItem.title,
              category: sliderItem.category,
              image: sliderItem.image,
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
    set({ content: newHero, contentModalType: "hero", isContentModalOpen: true });
  },

  createGallery: () => {
    const newGalleryItem = createEmptyGalleryItem();
    const newGallery: GalleryContent = {
      type: "gallery",
      items: [newGalleryItem],
    };
    set({ content: newGallery, contentModalType: "gallery", isContentModalOpen: true });
  },

  createSlider: () => {
    const newSliderItem = createEmptySliderItem();
    const sliderContent: SliderContent = {
      type: "slider",
      _id: newSliderItem._id,
      title: newSliderItem.title,
      category: newSliderItem.category,
      image: newSliderItem.image,
    };
    set({ content: sliderContent, contentModalType: "slider", isContentModalOpen: true });
  },

  removeGallery: (id) =>
    set((state) => ({
      galleries: state.galleries.filter((item) => item._id !== id),
    })),

  removeSlider: (id) =>
    set((state) => ({
      sliders: state.sliders.filter((item) => item._id !== id),
    })),

  // API operations
  fetchContent: async (type) => {
    set({ isLoading: true });
    
    try {
      const apiClient = useApiClient();
      const response = await apiClient.get(`/content/${type}`);
      const typedResponse = response as { data: any };
      
      switch (type) {
        case "hero":
          set({ hero: typedResponse.data });
          break;
        case "gallery":
          set({ galleries: typedResponse.data.items || [] });
          break;
        case "slider":
          set({ sliders: typedResponse.data || [] });
          break;
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch content";
      toast.message.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadContent: async (payload) => {
    set({ isLoading: true });
    
    try {
      const apiClient = useApiClient();
      let isUpdate = false;
      if (payload.type === "hero" || payload.type === "slider") {
        isUpdate = !!(payload as HeroContent | SliderContent)._id && (payload as HeroContent | SliderContent)._id !== "";
      } else if (payload.type === "gallery") {
        isUpdate = !!((payload as GalleryContent).items?.[0]?._id) && (payload as GalleryContent).items[0]._id !== "";
      }
      let contentId: string | undefined;
      if (payload.type === "hero" || payload.type === "slider") {
        contentId = (payload as HeroContent | SliderContent)._id;
      } else if (payload.type === "gallery") {
        contentId = (payload as GalleryContent).items?.[0]?._id;
      }
      const endpoint = isUpdate  ? `/content/${payload.type}/${contentId}` : `/content/${payload.type}`;
      
      const method = isUpdate ? "patch" : "post";
      const response = await apiClient[method](endpoint, payload) as { data: any };
      
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
        case "slider":
          if (isUpdate) {
            set((state) => ({
              sliders: state.sliders.map((item) =>
                item._id === payload._id ? response.data : item
              ),
            }));
          } else {
            set((state) => ({
              sliders: [...state.sliders, response.data],
            }));
          }
          break;
      }
      
      set({ content: null, isContentModalOpen: false });
      toast.message.success(`${payload.type} ${isUpdate ? "updated" : "created"} successfully`);
      
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to upload content";
      toast.message.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteContent: async (id, type) => {
    set({ isLoading: true });
    
    try {
      const apiClient = useApiClient();
      await apiClient.del(`/content/${type}/${id}`);
      
      switch (type) {
        case "hero":
          set({ hero: null });
          break;
        case "gallery":
          set((state) => ({
            galleries: state.galleries.filter((item) => item._id !== id),
          }));
          break;
        case "slider":
          set((state) => ({
            sliders: state.sliders.filter((item) => item._id !== id),
          }));
          break;
      }
      
      set({ content: null });
      toast.message.success(`${type} deleted successfully`);
      
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete content";
      toast.message.error(message);
    } finally {
      set({ isLoading: false });
    }
  },
});
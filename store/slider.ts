import { type StateCreator } from "zustand";
import { Store } from "./store";
import { ProductData } from "./dashbaord/products";
import { CategoryType } from "./category";

export type ImgSlide = {
  _id: string;
  title: string;
  mainImage: string;
  images: string[];
  description: string;
  link: string;
  products: ProductData[];
  inView: boolean;
  categoryId: string;
};

export type ImgSlideStore = {
  slider: ImgSlide[];
  lookAt: boolean;
  SlideInview: ImgSlide | null;
  isSliderLoading: boolean;
  setLookAt: (_id: string) => void;
  loadSliderWithCategory: () => Promise<void>;
  getSlideByCategory: (categoryId: string) => ImgSlide | null;
};

export const useSliderStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  ImgSlideStore
> = (set, get) => ({
  slider: [],
  lookAt: false,
  SlideInview: null,
  isSliderLoading: false,

  loadSliderWithCategory: async () => {
    const state = get();

    // Check if slider already populated
    if (state.slider.length > 0) {
      console.log("Slider already loaded");
      return;
    }

    set((draft) => {
      draft.isSliderLoading = true;
    });

    try {
      // Ensure categories are loaded first
      if (state.categories.length === 0) {
        await state.loadCategories();
      }

      const categories = get().categories;

      // Group categories by their parent
      const categoryGroups = new Map<string, CategoryType[]>();
      const topLevelCategories: CategoryType[] = [];

      categories.forEach((cat) => {
        if (!cat.parentCategory || cat.parentCategory === "") {
          // This is a top-level category
          topLevelCategories.push(cat);
        } else {
          // This is a child category - group by parent name
          if (!categoryGroups.has(cat.parentCategory)) {
            categoryGroups.set(cat.parentCategory, []);
          }
          categoryGroups.get(cat.parentCategory)?.push(cat);
        }
      });

      // Determine which categories to show in slider
      let slideCandidates: CategoryType[];

      if (topLevelCategories.length > 0) {
        // Use top-level categories if they exist
        slideCandidates = topLevelCategories;
        console.log("Using top-level categories for slider:", topLevelCategories.map(c => c.name));
      } else {
        // If all categories have parents, use unique parent names
        const parentNames = Array.from(new Set(
          categories
            .map(c => c.parentCategory)
            .filter(Boolean)
        ));

        // Find one category per parent group to represent it
        slideCandidates = parentNames
          .map(parentName => {
            // Get first category in this parent group
            return categories.find(c => c.parentCategory === parentName);
          })
          .filter((cat): cat is CategoryType => cat !== undefined);
      }

      // Transform into slider format
      const slides: ImgSlide[] = slideCandidates.map((category) => ({
        _id: category._id,
        categoryId: category._id,
        title:  category.name,
        description: category.description || "",
        mainImage: category.image?.url || "/images/image-fallback.png",
        images: [
          category.image?.url || "/images/image-fallback.png",
        ],
        link: `/shop?category=${(category.parentCategory || category.name).toLowerCase()}`,
        products: [],
        inView: false,
      }));

      set((draft) => {
        draft.slider = slides;
        draft.isSliderLoading = false;
      });

      console.log(`Loaded ${slides.length} slides from categories`);
    } catch (error) {
      console.error("Failed to load slider with categories:", error);
      set((draft) => {
        draft.isSliderLoading = false;
      });
    }
  },
  // Toggle slide view state
  setLookAt: (id: string) =>
    set((state) => {
      state.lookAt = !state.lookAt;
      const slide = state.slider.find((s) => s._id === id);
      
      if (slide) {
        slide.inView = !slide.inView;
        state.SlideInview = slide.inView ? slide : null;
      } else {
        state.SlideInview = null;
      }
    }),

  // Get slide by category ID
  getSlideByCategory: (categoryId: string) => {
    return get().slider.find((s) => s.categoryId === categoryId) || null;
  },
});
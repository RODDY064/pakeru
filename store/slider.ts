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

    // Avoid reloading if already set
    if (state.slider.length > 0) {
      console.log("Slider already loaded");
      return;
    }

    set((draft) => {
      draft.isSliderLoading = true;
    });

    try {
      // Ensure categories are loaded
      if (state.categories.length === 0) {
        await state.loadCategories();
      }

      const categories = get().categories;

      // Group categories by parent
      const grouped: Record<string, CategoryType[]> = {};
      const topLevel: CategoryType[] = [];

      console.log(categories)

      categories.forEach((cat) => {
        if (!cat.parentCategory) {
          topLevel.push(cat);
        } else {
          if (!grouped[cat.parentCategory]) grouped[cat.parentCategory] = [];
          grouped[cat.parentCategory].push(cat);
        }
      });

      // Pick only those marked as willShow
      const visibleFromGroups: CategoryType[] = [];

      Object.entries(grouped).forEach(([parent, items]) => {
        const visible = items.find((c) => c.willShow === true);
        if (visible) {
          visibleFromGroups.push(visible);
        }
      });

      // Include top-level categories that have willShow = true
      const visibleTopLevel = topLevel.filter((cat) => cat.willShow === true);

      // Merge both sets
      const finalVisible: CategoryType[] = [
        ...visibleTopLevel,
        ...visibleFromGroups,
      ];

      if (finalVisible.length === 0) {
        console.warn("No visible categories found (willShow = true)");
      }

      // Transform to slider format
      const slides: ImgSlide[] = finalVisible.map((category) => ({
        _id: category._id,
        categoryId: category._id,
        title: category.name,
        description: category.description || "",
        mainImage: category.image?.url || "/images/image-fallback.png",
        images: [category.image?.url || "/images/image-fallback.png"],
        link: `/shop?category=${(
          category.parentCategory || category.name
        ).toLowerCase()}`,
        products: [],
        inView: false,
      }));

      // Update store
      set((draft) => {
        draft.slider = slides;
        draft.isSliderLoading = false;
      });

      console.log(`Loaded ${slides.length} visible slides`);
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

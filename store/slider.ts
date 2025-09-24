import { type StateCreator } from "zustand";
import { Store } from "./store";
import { ProductData } from "./dashbaord/products";





export type ImgSlide = {
  _id: number;
  title: string;
  mainImage: string;
  images: string[];
  description: string;
  link: string;
  products: ProductData[];
  inView: boolean;
};

export type ImgSlideStore = {
  slider: ImgSlide[];
  lookAt: boolean;
  SlideInview: ImgSlide | null;
  setLookAt: (_id: number) => void;
};

export const useSliderStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  ImgSlideStore
> = (set) => ({
  slider: [
    {
      _id: 0,
      title: "BEST SELLING",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/categories/couple.webp",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
       link: "/shop?t-shirts",
      inView: false,
      products: [],
    },
    {
      _id: 1,
      title: "SHIRTS",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/categories/tote bag 5.webp",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
      link: "/shop?t-shirts",
      inView: false,
      products: [],
    },
     {
      _id: 2,
      title: "SHORTS",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/categories/fullset.webp",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
       link: "/shop?t-shirts",
      inView: false,
      products: [],
    },
    {
      _id: 3,
      title: "MARSHING SETS",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/categories/marching.webp",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
      link: "/shop?t-shirts",
      inView: false,
      products: [],
    },
  ],
  lookAt: false,
  SlideInview: null,
  setLookAt: (id) =>
    set((state) => {
      state.lookAt = !state.lookAt;
      const slide = state.slider.find((s) => s._id === id);
      if (slide) {
        slide.inView = !slide.inView;
        state.SlideInview = slide.inView ? slide : null;
      } else {
        state.SlideInview = null;
      }
    })
});

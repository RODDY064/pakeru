import { type StateCreator } from "zustand";
import { Store } from "./store";
import { ProductType } from "./cart";
import produce from "immer";

export type ImgSlide = {
  id: number;
  title: string;
  mainImage: string;
  images: string[];
  description: string;
  link: string;
  products: ProductType[];
  inView: boolean;
};

export type ImgSlideStore = {
  slider: ImgSlide[];
  lookAt: boolean;
  SlideInview: ImgSlide | null;
  setLookAt: (id: number) => void;
};

export const useSliderStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  ImgSlideStore
> = (set) => ({
  slider: [
    {
      id: 0,
      title: "SHIRTS",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/images/nm2.png",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
      link: "/product?t-shirts",
      inView: false,
      products: [],
    },
     {
      id: 1,
      title: "SHORTS",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/images/img6.png",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
       link: "/product?t-shirts",
      inView: false,
      products: [],
    },
    {
      id: 2,
      title: "PAIRS",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/images/img7.png",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
       link: "/product?t-shirts",
      inView: false,
      products: [],
    },
    {
      id: 3,
      title: "BEST SELLING",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/images/s2.jpg",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
       link: "/product?t-shirts",
      inView: false,
      products: [],
    },
    {
      id: 4,
      title: "MARSHING SETS",
      description:
        "The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate. The preparation for becoming a great copywriter is a lifestyle. It’s a hunger for knowledge, a curiosity and a desire to participate in life that is broad-based and passionate.",
      mainImage: "/images/s1.jpg",
      images: ["/images/img4.png", "/images/img7.png", "/images/im3.png", "/images/nm2.png"],
      link: "/product?t-shirts",
      inView: false,
      products: [],
    },
  ],
  lookAt: false,
  SlideInview: null,
  setLookAt: (id) =>
    set((state) => {
      state.lookAt = !state.lookAt;
      const slide = state.slider.find((s) => s.id === id);
      if (slide) {
        slide.inView = !slide.inView;
        state.SlideInview = slide.inView ? slide : null;
      } else {
        state.SlideInview = null;
      }
    })
});

import { type StateCreator } from "zustand";
import { Store } from "../store";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";

// Variant structure
export type ProductVariant = {
  color: string;
  description: string;
  sizes: string[];
  images: string[];
  stock: number;
};

// Main product structure
export type ProductData = {
  id: string;
  name: string;
  date: string;
  time: string;
  totalNumber: number;
  category:string,
  status: "out-of-stock" | "active" | "inactive";
  price: number;
  variants: ProductVariant[];
  features: {
    label: string;
    value: string;
  }[];
};

// Filters structure
export type Filters = {
  status: "active" | "inactive" | "all" | "out-of-stock";
  category: string;
};

// Store interface
export type StoreProductStore = {
  selectedProduct: ProductData | null;
  storeProducts: ProductData[];

  addProduct: (product: ProductData) => void;
  updateProduct: (id: string, updates: Partial<ProductData>) => void;
  removeProduct: (id: string) => void;
  setSelectedProduct: (product: ProductData | null) => void;
  clearProducts: () => void;

  // Filters
  productFilters: Filters;
  resetFilters: () => void;
  setProductFilters: (filters: Partial<Filters>) => void;

  setProducts: (product: ProductData[]) => void;
};

// Zustand store creator
export const useStoreProductStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  StoreProductStore
> = (set, get) => ({
  selectedProduct: null,
  storeProducts: [],

  addProduct: (product) =>
    set(
      produce((state: Store) => {
        state.storeProducts.push(product);
      })
    ),

  updateProduct: (id, updates) =>
    set(
      produce((state: Store) => {
        const index = state.storeProducts.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.storeProducts[index] = {
            ...state.storeProducts[index],
            ...updates,
          };
        }
      })
    ),

  removeProduct: (id) =>
    set(
      produce((state: Store) => {
        state.storeProducts = state.storeProducts.filter((p) => p.id !== id);
      })
    ),

  setSelectedProduct: (product) =>
    set(
      produce((state: Store) => {
        state.selectedProduct = product;
      })
    ),

  clearProducts: () =>
    set(
      produce((state: Store) => {
        state.storeProducts = [];
        state.selectedProduct = null;
      })
    ),

  productFilters: {
    status: "all",
    category: "",
  },

  setProductFilters: (filters) =>
    set(
      produce((state: Store) => {
        state.productFilters = {
          ...state.productFilters,
          ...filters,
        };
      })
    ),

  resetFilters: () =>
    set(
      produce((state: Store) => {
        state.productFilters = {
          status: "all",
          category: "",
        };
      })
    ),

  setProducts: (products) =>
    set(
      produce((state: Store) => {
        state.storeProducts = products;
      })
    ),
});

const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const luxuryAdjectives = [
  "Elegant",
  "Chic",
  "Sleek",
  "Classic",
  "Signature",
  "Modern",
  "Vintage",
  "Refined",
  "Iconic",
  "Essential",
];

const luxuryItems = [
  "Tote",
  "Sneakers",
  "Jacket",
  "Blazer",
  "Loafers",
  "Clutch",
  "Backpack",
  "Dress",
  "Trench Coat",
  "Hoodie",
];

const luxuryCollections = [
  "Monogram",
  "Heritage",
  "Urban Series",
  "Luxe Line",
  "Artisan Edition",
  "Paris Drop",
  "Runway Edition",
  "Studio Fit",
];

const generateLuxuryName = (): string => {
  return `${getRandomElement(luxuryAdjectives)} ${getRandomElement(
    luxuryCollections
  )} ${getRandomElement(luxuryItems)}`;
};

export const generateProduct = (count: number = 7): ProductData[] => {
  const colors = ["Black", "White", "Red", "Blue", "Green", "Gray"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const statuses: ProductData["status"][] = ["active", "inactive", "out-of-stock"];
  const brands = ["Metace", "Threadz", "BoldWear", "PeakFit"];
  const origins = ["Ghana", "USA", "Italy", "UK", "Turkey"];
  const categories = ["Apparel", "Footwear", "Accessories", "Outerwear", "Athleisure"];

  return Array.from({ length: count }, () => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];
    const variantCount = Math.floor(Math.random() * 3) + 1;
    const usedColors = new Set<string>();

    const variants: ProductVariant[] = Array.from({ length: variantCount }, () => {
      let color = getRandomElement(colors);
      while (usedColors.has(color)) color = getRandomElement(colors);
      usedColors.add(color);

      return {
        color,
        description: `${generateLuxuryName()} - ${color} variant with premium finish and ergonomic fit.`,
        sizes: sizes.slice(0, Math.floor(Math.random() * sizes.length) + 1),
        images: [
          `/images/product.png`,
          `/images/product2.png`,
          `/images/product1.png`,
        ],
        stock: Math.floor(Math.random() * 50),
      };
    });

    return {
      id: uuidv4(),
      name: generateLuxuryName(),
      date,
      time,
      category: getRandomElement(categories), // ✅ added here
      totalNumber: variants.reduce((acc, v) => acc + v.stock, 0),
      status: getRandomElement(statuses),
      price: parseFloat((Math.random() * 200 + 20).toFixed(2)),
      variants,
      features: [
        { label: "Material", value: "Cotton" },
        { label: "Brand", value: getRandomElement(brands) },
        { label: "Origin", value: getRandomElement(origins) },
      ],
    };
  });
};

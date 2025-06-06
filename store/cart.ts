import { type StateCreator } from "zustand";
import { Store } from "./store";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

// 🧩 Product Type
export type ProductType = {
  id: string;
  name: string;
  description?: string;
  sizes: string[];
  mainImage: string;
  images: string[];
  colors: string[];
  price: number;
  category: string;
  selectedSize?: string;
  selectedColor?: string;
  rating: number;
};

// 🛒 Cart Item
export type CartItemType = ProductType & { quantity: number };

// 🏬 Cart Store
export type CartStore = {
  cartItems: CartItemType[];
  cartInView: boolean;
  products: ProductType[];
  cartState: "loading" | "success" | "error";
  setCartInView: () => void;
  addToCart: (product: ProductType) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  updateSize: (productId: string, newSize: string) => void;
  updateColor: (productId: string, color: string) => void;
};

// 🎨 Diverse Product Names & Categories
const productNames = [
  "MAVREK Polo Shirt",
  "Vintage Denim Jacket",
  "Urban Cargo Pants",
  "Silk Floral Shirt",
  "Retro Hoodie",
  "Slim Fit Jeans",
  "Linen Blazer",
  "Basic Tee",
  "Graphic Sweatshirt",
  "Tech Running Shoes",
];

const categories = ["Shirts", "Jackets", "Pants", "Hoodies", "Jeans", "Shoes"];

// 🎨 Hex Color Palette
const hexColors = [
  "#000000",
  "#FF5733",
  "#FFC300",
  "#28B463",
  "#3498DB",
  "#8E44AD",
  "#E67E22",
];

// 🏬 Zustand Store Creator
export const useCartStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  CartStore
> = (set, get) => ({
  cartItems: [],
  cartInView: false,
  cartState: "loading",
  products: Array.from({ length: 20 }, (_, index) => {
    const id = uuidv4(); // unique uuid
    const name = productNames[index % productNames.length];
    const category = categories[index % categories.length];
    const price = Math.floor(Math.random() * 200) + 50; // 50-250
    const rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); // 3.0-5.0
    const colors = getRandomColors(); // Array of colors
    const selectedColor = colors[Math.floor(Math.random() * colors.length)];

    return {
      id,
      name: `${name} ${index + 1}`,
      price,
      images: [
        index % 2 === 0
          ? "/images/hero-2.png"
          : isPrime(index + 1)
          ? "/images/im2.jpeg"
          : "/images/im.jpeg",
      ],
      mainImage:
        index % 2 === 0
          ? "/images/hero-2.png"
          : isPrime(index + 1)
          ? "/images/product.png"
          : "/images/product2.png",
      colors,
      sizes: ["S", "M", "L", "XL"],
      category,
      rating,
      selectedColor,
    } as ProductType;
  }),

  setCartInView: () =>
    set((state) => ({
      cartInView: !state.cartInView,
    })),

  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cartItems.find(
        (item) =>
          item.id === product.id && item.selectedColor === product.selectedColor
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({
          ...product,
          quantity: 1,
        });
      }
    }),

  // Remove from cart
  removeFromCart: (productId) =>
    set((state) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== productId);
    }),

  // Increase quantity
  increaseQuantity: (productId) =>
    set((state) => {
      const item = state.cartItems.find((item) => item.id === productId);
      if (item) item.quantity += 1;
    }),

  // Decrease quantity
  decreaseQuantity: (productId) =>
    set((state) => {
      const item = state.cartItems.find((item) => item.id === productId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.cartItems = state.cartItems.filter(
            (item) => item.id !== productId
          );
        }
      }
    }),

  // Update size for a cart item
  updateSize: (productId, newSize) =>
    set((state) => {
      const item = state.cartItems.find((item) => item.id === productId);
      if (item) item.selectedSize = newSize;
    }),

  updateColor: (productId: string, color: string) =>
    set((state) => {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        product.selectedColor = color;
      }

      const cartItem = state.cartItems.find((p) => p.id === productId);
      if (cartItem) {
        cartItem.selectedColor = color;
      }
    }),
});

// 🔎 Prime Number Helper
function isPrime(n: number) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// 🎨 Get Random Hex Colors
function getRandomColors() {
  const shuffled = hexColors.sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 colors
  return shuffled.slice(0, count);
}

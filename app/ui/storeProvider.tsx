"use client";

import React, { useState } from "react";
import { useBoundStore, initializeStore } from "@/store/store";
import { ProductData } from "@/store/dashbaord/products";
import { CategoryType } from "@/store/category";
import {
  GalleryContent,
  HeroContent,
} from "@/store/dashbaord/content-store/content";

interface StoreProviderProps {
  children: React.ReactNode;
  initialProducts: ProductData[];
  initialCategories: CategoryType[];
  Content?: { hero: HeroContent; galleries: GalleryContent } 
}

export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  initialProducts,
  initialCategories,
  Content
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  React.useEffect(() => {
    if (!isInitialized) {
      // Initialize store with server data
      initializeStore(initialProducts, initialCategories, Content);
      setIsInitialized(true);
    }
  }, [initialProducts, initialCategories, isInitialized]);

  return <>{children}</>;
};

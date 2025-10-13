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
  initialProductTotal?:number,
  Content?: { hero: HeroContent; galleries: GalleryContent } 
}

export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  initialProducts,
  initialCategories,
  initialProductTotal,
  Content
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  React.useEffect(() => {
    if (!isInitialized) {

      console.log('intial total', initialProductTotal)
      // Initialize store with server data
      initializeStore(initialProducts,initialCategories,initialProductTotal,Content);
      setIsInitialized(true);
    }
  }, [initialProducts, initialCategories,initialProductTotal,isInitialized]);

  return <>{children}</>;
};

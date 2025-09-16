"use client";

import React from 'react';
import { useBoundStore, initializeStore } from '@/store/store'
import { ProductData } from '@/store/dashbaord/products';
import { CategoryType } from '@/store/category';


interface StoreProviderProps {
  children: React.ReactNode;
  initialProducts: ProductData[];
  initialCategories: CategoryType[];
}

export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  initialProducts,
  initialCategories,
}) => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialized) {
      // Initialize store with server data
      initializeStore(initialProducts, initialCategories);
      setIsInitialized(true);
    }
  }, [initialProducts, initialCategories, isInitialized]);

  return <>{children}</>;
}
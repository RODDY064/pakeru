"use client"

import { initializeStore, useBoundStore } from "@/store/store";
import { useEffect, useState } from "react";


export const useStoreInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const cartState = useBoundStore(state => state.cartProductState);
  
  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) {
        await initializeStore();
        setIsInitialized(true);
      }
    };
    
    initialize();
  }, [isInitialized]);
  
  return {
    isInitialized: isInitialized && cartState !== 'loading',
    isLoading: cartState === 'loading',
    error: useBoundStore(state => state.error)
  };
};


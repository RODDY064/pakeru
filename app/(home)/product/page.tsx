"use client";

import Button from "@/app/ui/button";
import Filter from "@/app/ui/filter";
import ProductCon from "@/app/ui/productCon";
import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Product() {
  const { cartState, loadProducts, products } = useBoundStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { get } = useApiClient()

  const [containerHeight, setContainerHeight] = useState("100vh");

  useEffect(() => {
    const calculateHeight = () => {
      const actualVH = window.innerHeight;
      setContainerHeight(`${actualVH}px`);
      document.documentElement.style.setProperty(
        "--actual-vh",
        `${actualVH * 0.01}px`
      );
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    window.addEventListener("orientationchange", calculateHeight);

    return () => {
      window.removeEventListener("resize", calculateHeight);
      window.removeEventListener("orientationchange", calculateHeight);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadProducts(true);
      await new Promise((res) => setTimeout(res, 500));
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  };



  return (
    <>
      <div 
       style={{ minHeight: containerHeight }}
      className="w-full min-h-screen  flex flex-col items-center text-black  home-main  transition-all">
        <div className="w-full h-full  bg-white flex overflow-hidden gap-4 pt-30">
          {cartState === "loading" ||
          cartState === "error" ||
          cartState === "idle" ? (
            <div className="w-full h-dvh flex items-center flex-col pt-12 md:pt-24">
              <Image
                src="/icons/cloth.svg"
                width={400}
                height={64}
                alt="cart"
                className="opacity-70 hidden md:flex"
              />
              <Image
                src="/icons/cloth.svg"
                width={320}
                height={64}
                alt="cart"
                className="opacity-70 md:hidden"
              />
              <div className="mt-10">
                {isRefreshing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Image
                      src="/icons/loader.svg"
                      width={26}
                      height={26}
                      alt="loader"
                    />
                    <p className="text-black/70 font-avenir font-[400] text-sm">
                      REFRESHING....
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={handleRefresh}
                    className="py-3 px-4 rounded bg-black cursor-pointer"
                  >
                    <p className="text-white font-avenir font-[400] text-sm">
                      REFRESH TO LOAD PRODUCTS
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <ProductCon />
            </>
          )}
        </div>
      </div>
      <Filter />
    </>
  );
}

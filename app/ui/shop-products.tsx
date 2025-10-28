"use client";
import Button from "@/app/ui/button";
import Filter from "@/app/ui/filter";
import ProductSkeleton from "@/app/ui/product-skeleton";
import ProductCon from "@/app/ui/productCon";
import { useFilterPagination } from "@/app/ui/useFilterPage";
import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

export default function ShopProduct() {
  const { cartProductState, products, loadProducts, isServerInitialized } =
    useBoundStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [containerHeight, setContainerHeight] = useState("100vh");

  const { applyFilters, pagination, productPaginationState, handlePageChange } =
    useFilterPagination();

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

  // Memoize the refresh handler to prevent recreation on every render
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadProducts(true, 1, 25);
      await new Promise((res) => setTimeout(res, 500));
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadProducts, router]);

  const skeletonItems = useMemo(() => [1, 2, 3, 4], []);

  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-300 fixed top-0 left-0 flex flex-col items-center justify-center">
          <Image src="/icons/loader.svg" width={34} height={34} alt="loader" />
        </div>
      }
    >
      <div
        style={{ minHeight: containerHeight }}
        className="w-full min-h-screen flex flex-col items-center text-black home-main transition-all">
        <div className="w-full h-full bg-white flex overflow-hidden gap-4 pt-30">
          {(cartProductState === "loading" || cartProductState === "idle") && (
            <motion.div
              className="w-full grid px-8 md:px-0 md:grid-cols-3 xl:grid-cols-4 items-stretch gap-6 transition-all duration-500 ease-in-out"
              layout
            >
              {skeletonItems.map((item) => (
                <ProductSkeleton type="large" key={item} />
              ))}
            </motion.div>
          )}

          {cartProductState === "error" && (
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
          )}

          {cartProductState === "success" && products.length === 0 && (
            <div className="w-full flex flex-col items-center md:col-span-3 xl:col-span-4">
              <div className="w-full flex flex-col items-center ">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
                  <div className=" mb-4">
                    <Image
                      src="/icons/search.svg"
                      width={32}
                      height={32}
                      alt="search"
                      className="opacity-30"
                    />
                  </div>
                  <p className="font-avenir font-normal text-lg">
                    No products found
                  </p>
                  <p className="mt-1 font-avenir text-sm text-black/30">
                    Try a different filtering term
                  </p>
                </div>
              </div>
            </div>
          )}

          {products.length > 0 && cartProductState === "success" && (
            <ProductCon
              pagination={pagination}
              productPaginationState={productPaginationState}
              handlePageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      <Filter applyFilters={applyFilters} />
    </Suspense>
  );
}

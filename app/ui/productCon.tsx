"use client";

import React, { Suspense, useEffect, useState } from "react";
import ProductCard from "./product-card";
import { motion } from "motion/react";
import { useBoundStore } from "@/store/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApiClient } from "@/libs/useApiClient";
import Image from "next/image";

export default function ProductCon() {
  const { products, loadProducts, productPaginationState } = useBoundStore();
  const [pagination, setPagination] = useState(1);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (products.length !== 0 && pagination > 1) {
      const params = new URLSearchParams(searchParams.toString());

      if (pagination > 1) {
        params.set("page", pagination.toString());
      } else {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      loadProducts(false, pagination);
    }
  }, [pagination]);

  const handlePage = (newPage: number) => {
    setPagination(newPage);
  };

  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-300 fixed top-0 left-0 flex flex-col items-center justify-center">
          <Image src="/icons/loader.svg" width={34} height={34} alt="loader" />
        </div>
      }>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex opacity-0 flex-col flex-none items-center justify-center pt-6 md:px-2 lg:px-8 lg:p-6"
      >
        <motion.div
          className="w-full grid px-8 md:px-0 md:grid-cols-3 xl:grid-cols-4 items-stretch gap-6 transition-all duration-500 ease-in-out"
          layout
        >
          {products?.map((product) => (
            <ProductCard key={product._id} type="large" productData={product} />
          ))}
        </motion.div>
        <div
          onClick={() => handlePage(pagination + 1)}
          className="my-4 flex items-center justify-center"
        >
          <div className="px-6 py-3 bg-black rounded-full text-white cursor-pointer gap-4 flex items-center justify-center">
            <p className="font-avenir">Load More</p>
            {productPaginationState === "loading" && (
              <Image
                src="/icons/loader-w.svg"
                width={20}
                height={20}
                alt="loading icon"
              />
            )}
            {productPaginationState === "success" && (
              <Image
                src="/icons/tick-circle.svg"
                width={22}
                height={22}
                alt="loading icon"
              />
            )}
            {productPaginationState === "error" && (
              <div className="flex relative size-4.5 bg-red-600 rounded-full items-center justify-center ">
                <div className="w-[60%] h-[1.2px] bg-black rotate-45"></div>

                <div className="w-[1.2px] h-[60%] bg-black rotate-45 absolute"></div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Suspense>
  );
}

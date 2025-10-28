"use client";
import Button from "@/app/ui/button";
import Filter from "@/app/ui/filter";
import ProductSkeleton from "@/app/ui/product-skeleton";
import ProductCon from "@/app/ui/productCon";
import ShopProduct from "@/app/ui/shop-products";
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

export default function Shop() {

  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-300 fixed top-0 left-0 flex flex-col items-center justify-center">
          <Image src="/icons/loader.svg" width={34} height={34} alt="loader" />
        </div>
      }>
      <ShopProduct/>
    </Suspense>
  );
}

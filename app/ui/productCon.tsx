
"use client"

import React from "react";
import ProductCard from "./product-card";
import { motion } from "motion/react";
import { useBoundStore } from "@/store/store";

export default function ProductCon() {

  const { products } = useBoundStore()


  return (
    <motion.div 
    animate={{ opacity:1}}
    initial={{ opacity:0}}
    transition={{ duration: 0.5}}
    className="w-full h-full flex opacity-0 flex-col flex-none items-center justify-center pt-6 md:px-2 lg:px-8 lg:p-6  ">
        <motion.div
      className="w-full grid px-8 md:px-0 md:grid-cols-3 xl:grid-cols-4 items-stretch gap-[2px] transition-all duration-500 ease-in-out"
      layout >
      {products?.map((product) => (
        <ProductCard key={product._id} type="large" productData={product}  />
      ))}
    </motion.div>
    </motion.div>
  );
}

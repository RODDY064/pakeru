
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
    className="w-full h-full flex opacity-0 flex-col flex-none items-center justify-center pt-6 md:px-1 lg:p-6 ">
        <motion.div
      className="flex flex-wrap  justify-center gap-[2px] transition-all duration-500 ease-in-out"
      layout >
      {products.map((product) => (
        <ProductCard key={product.id} type="large" productData={product}  />
      ))}
    </motion.div>
    </motion.div>
  );
}

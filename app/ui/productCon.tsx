
"use client"

import React from "react";
import ProductCard from "./product-card";
import { motion } from "motion/react";

export default function ProductCon() {
  return (
    <div className="w-full h-full flex flex-col flex-none items-center justify-center pt-6 md:px-1 lg:p-6 ">
        <motion.div
      className="flex flex-wrap  justify-center gap-[2px] transition-all duration-500 ease-in-out"
      layout >
      {[1, 2, 3,4, 5, 6,7, 8, 9, 10,11,12].map((item) => (
        <ProductCard key={item} type="large" id={item} />
      ))}
    </motion.div>
    </div>
  );
}

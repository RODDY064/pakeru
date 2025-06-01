"use client";
import { cn } from "@/libs/cn";
import { ProductType } from "@/store/cart";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import React from "react";

export default function ProductCard({
  type,
  cardRef,
  cardStyle,
  productData,
}: {
  type: "small" | "medium" | "large";
  id?: number;
  cardRef?: any;
  cardStyle?: string;
  productData: ProductType;
}) {
  function isPrime(n: number) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  const colorMap: { [key: number]: string } = {
    1: "bg-black",
    2: "bg-amber-600",
    4: "bg-stone-500",
    5: "bg-green-500",
  };

  const { setModal, updateColor , addToCart } = useBoundStore();

  function handleAddToCart(product: ProductType) {
  addToCart(product);
  setModal('cart');
}

  return (
    <div
      ref={cardRef}
      className={cn(
        "",
        {
          "mb-8 md:mb-24": type === "large",
        },
        cardStyle
      )}
    >
      <motion.div
        variants={BoxAnimate}
        whileHover="show"
        initial="hide"
        className={cn(
          "w-[180px] h-[180px] md:w-[200px] md:h-[250px] lg:w-[300px] lg:h-[430px] flex border borde-[1px] border-black/5 flex-shrink-0 rounded-[2px] relative cursor-pointer overflow-hidden transition-all duration-500 ease-in-out",
          {
            "[width:calc(25%-1rem)] min-w-[310px] h-[400px]": type === "large",
            "md:[width:calc(25%-2rem)] md:min-w-[270px] md:h-[450px]":
              type === "large",
            "lg:[width:calc(25%-3.5rem)] lg:min-w-[270px] lg:h-[520px]":
              type === "large",
            "xl:[width:calc(20%-4.5rem)] xl:min-w-[400px] xl:h-[600px]":
              type === "large",
          }
        )}
      >
        <div className="w-full h-full absolute">
          <Image
            src={productData.mainImage}
            fill
            alt="shop"
            className="object-cover"
          />
        </div>
        <div className="absolute w-full h-full flex flex-col justify-end z-20 ">
          <div className="absolute top-2 left-2 p-1 px-2 flex items-center gap-1 bg-black">
            <div className="size-[6px] rounded-full bg-white" />
            <p className="text-white text-[11px]">NEW</p>
          </div>
          <motion.div
            onClick={()=>handleAddToCart(productData)}
            variants={CartAnimate}
            className="w-full bg-black h-24 flex-none overflow-hidden  flex  gap-2 items-center justify-center text-white"
          >
            <p className="text-sm md:text-md font-manrop mt-0.5">ADD TO BAG</p>
            <Image
              src="/icons/bag-b-w.svg"
              width={20}
              height={20}
              className="hidden md:block"
              alt="bag"
            />
            <Image
              src="/icons/bag-b-w.svg"
              width={18}
              height={18}
              className="md:hidden flex"
              alt="bag"
            />
          </motion.div>
        </div>
      </motion.div>
      <div
        className={cn("pb-4 pt-3 w-full   px-3 ", {
          "w-[150px] md:w-[200px]  lg:w-[300px] ": type === "small",
        })}
      >
        <div className="w-full flex items-start justify-between">
          <div className="w-[60%] text-[16px] md:text-md font-bold text-black/70">
            {productData.name.toLocaleUpperCase()}
          </div>
          <div className="w-[30%] flex items-start  justify-end ">
            <p className="font-manrop font-black text-[16px] md:text-md text-black/50">
              GHS {productData.price}
            </p>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="flex gap-1">
            {productData.colors.map((item, index) => (
              <div
                onClick={()=> updateColor(productData.id,item)}
                key={item}
                className={cn(
                  "size-[15px] hover:border border-black/70 rounded-full p-[1.5px] cursor-pointer flex items-center justify-center",
                  {
                    "border-2 border-black": item === productData.selectedColor, 
                  }
                )}>
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: item }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1">
            <p className="font-manrop text-sm font-bold">{productData.rating}</p>
            <Image src="/icons/star.svg" width={12} height={12} alt="star" />
          </div>
        </div>
      </div>
    </div>
  );
}

const BoxAnimate = {
  show: {},
  hide: {},
};

const OverlayAnimate = {
  show: {
    opacity: 0,
  },
  hide: {
    opacit: 1,
  },
};

const CartAnimate = {
  show: {
    height: 50,
  },
  hide: {
    height: 0,
  },
};

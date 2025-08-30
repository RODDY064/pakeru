"use client";
import { cn } from "@/libs/cn";
import { handleNavigation } from "@/libs/navigate";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function ProductCard({
  type,
  cardRef,
  cardStyle,
  productData,
  showDetails,
}: {
  type: "small" | "medium" | "large";
  cardRef?: any;
  cardStyle?: string;
  productData: ProductData;
  showDetails?: boolean;
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

  const { setModal, updateColor, addToCart, closeModal, setRouteChange } =
    useBoundStore();
  const router = useRouter();

  const handleLink = (e: any, link: string) => {
    closeModal();
    console.log(link);
    handleNavigation(e, link, router, setRouteChange, 300);
  };

  return (
    <div
      ref={cardRef}
      className={cn("", { "mb-8 md:mb-12": type === "large" }, cardStyle)}
    >
      <motion.div
        variants={BoxAnimate}
        whileHover="show"
        initial="hide"
        className={cn(
          "flex  border-[1px] border-black/5 flex-shrink-0 rounded-[2px] relative cursor-pointer overflow-hidden transition-all duration-500 ease-in-out w-full h-[400px] md:h-[450px] lg:h-[460px] xl:h-[550px]",
          {
            "xl:h-[300px]": type === "small",
          }
        )}
      >
        <div className="w-full h-full absolute">
          <Image
            src={productData?.images[0]?.url}
            fill
            alt="shop"
            className="object-cover"
          />
        </div>
        <div className="absolute w-full h-full flex flex-col justify-end z-20 ">
          <Link
            onClick={(e) => handleLink(e, `/product/${productData?.id}`)}
            href={`/product/${productData?.id}`}
            className={cn("w-full h-full top-0  absolute")}
          ></Link>
          <div className="absolute top-2 left-2 p-1 px-2 flex items-center gap-1 bg-black">
            <div className="size-[6px] rounded-full bg-white" />
            <p className="text-white text-[11px]">NEW</p>
          </div>
        </div>
      </motion.div>
      {!showDetails && (
        <div
          className={cn("pb-4 pt-3 w-full   px-3 ", {
            "w-[200px] md:w-[250px]  lg:w-[270px] ": type === "small",
          })}>
          <div className="w-full flex items-start justify-between">
            <div
              className={cn(
                "w-[60%] text-[16px] md:text-md font-[400]  text-black/70",
                {
                  "text-[14px]": type === "small",
                }
              )}
            >
              {productData?.name.toLocaleUpperCase()}
            </div>
            <div className="w-[30%] flex items-start  justify-end ">
              <p
                className={`font-avenir font-[400] text-[16px] md:text-md text-black/50 `}
              >
                GHS {productData?.price}
              </p>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="flex gap-1">
              {productData?.variants?.map((item, index) => (
                <div
                  onClick={() => updateColor(productData?.id, item.color)}
                  key={item.color}
                  className={cn(
                    "size-[15px] md:size-[13px] hover:border border-black/70 rounded-full p-[1.5px] cursor-pointer flex items-center justify-center",
                    {
                      "border-2 md:border-1 border-black":
                        item.color === productData?.selectedColor,
                    }
                  )}>
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: item.colorHex }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <p className="font-avenir text-sm font-[300] mt-1">
                {productData?.numReviews}
              </p>
              <Image src="/icons/star.svg" width={11} height={11} alt="star" />
            </div>
          </div>
        </div>
      )}
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

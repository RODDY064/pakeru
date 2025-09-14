"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/libs/cn";
import { gsap } from "gsap";
import { BookmarkType, CartItemType } from "@/store/cart";
import { useBoundStore } from "@/store/store";

const colorMap: { [key: number]: string } = {
  1: "bg-black",
  2: "bg-amber-600",
  4: "bg-stone-500",
  5: "bg-green-500",
};

export default function BagCard({
  cartData,
}: {
  cartData: CartItemType | BookmarkType;
}) {
  const { modalDisplay, addBookmarksToCart, removeBookmark } = useBoundStore();
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [colorName,setColorName] = useState("")

  const updateImageHeight = () => {
    if (imageRef.current && contentRef.current) {
      const contentHeight = contentRef.current.offsetHeight;
      gsap.to(imageRef.current, {
        height: contentHeight,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  useEffect(() => {
    updateImageHeight();
    window.addEventListener("resize", updateImageHeight);
    return () => {
      window.removeEventListener("resize", updateImageHeight);
    };
  }, []);

    useEffect(() => {
      if (cartData) {
        const activeVariant = cartData.variants?.find(
          (variant) => variant._id === cartData.selectedColor
        );
  
        if (activeVariant) {
          setColorName(activeVariant.color);
        }
      }
    }, [cartData]);

  return (
    <div className="border-b-2 pb-6 border-black/4">
      <div className="flex gap-3 items-start">
        <div className="w-[120px] flex-none md:w-[200px] h-[120px] md:h-[220px] rounded-[1px] overflow-hidden mt-[4px] relative border-[0.5px] border-black/10">
          <Image
            src={cartData.variants[0].images[0].url}
            fill
            className="object-cover"
            alt="image"
          />
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col justify-end h-[120px] md:h-[220px]"
          )}
        >
          <p className="font-avenir text-md font-[400px] text-black/70">
            {cartData.name.toLocaleUpperCase()}
          </p>
          <p className="font-avenir text-md font-[400] text-[16px] md:text-md text-black/50   mt-1">
            GHS {cartData.price} | {colorName}
          </p>
          {modalDisplay === "wardrobe" && (
            <div className="mt-6 hidden md:block ">
              <div className="px-2 h-10 border flex border-black/20 rounded-md cursor-pointer">
                <div
                 onClick={() => {
                    if ("bookmarkId" in cartData &&
                      cartData.bookmarkId !== undefined){
                      addBookmarksToCart([cartData.bookmarkId])
                    }
                  }}
                 className="w-1/2 border-r  h-full flex items-center justify-center border-black/20 gap-2">
                  <div className="mt-[3.2px]">
                    <p className="text-xs font-[400] font-avenir ">
                      ADD TO CART
                    </p>
                  </div>
                  <Image
                    src="/icons/bag.svg"
                    width={16}
                    height={16}
                    alt="boomark"
                  />
                </div>
                <div
                  onClick={() => {
                    if ("bookmarkId" in cartData &&
                      cartData.bookmarkId !== undefined){
                      removeBookmark(cartData.bookmarkId);
                    }
                  }}
                  className="w-1/2 h-full flex items-center justify-center gap-2"
                >
                  <div className="mt-[3.2px]">
                    <p className="text-xs font-[400] font-avenir">REMOVE</p>
                  </div>
                  <Image
                    src="/icons/cancel.svg"
                    width={12}
                    height={12}
                    alt="boomark"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        {modalDisplay === "wardrobe" && (
            <div className="mt-4 md:hidden">
              <div className="px-2 h-10 border flex border-black/20 rounded-md cursor-pointer">
                <div
                 onClick={() => {
                    if ("bookmarkId" in cartData &&
                      cartData.bookmarkId !== undefined){
                      addBookmarksToCart([cartData.bookmarkId])
                    }
                  }}
                 className="w-1/2 border-r  h-full flex items-center justify-center border-black/20 gap-2">
                  <div className="mt-[3.2px]">
                    <p className="text-xs font-[400] font-avenir">
                      ADD TO CART
                    </p>
                  </div>
                  <Image
                    src="/icons/bag.svg"
                    width={16}
                    height={16}
                    alt="boomark"
                  />
                </div>
                <div
                  onClick={() => {
                    if ("bookmarkId" in cartData &&
                      cartData.bookmarkId !== undefined){
                      removeBookmark(cartData.bookmarkId);
                    }
                  }}
                  className="w-1/2 h-full flex items-center justify-center gap-2"
                >
                  <div className="mt-[3.2px]">
                    <p className="text-xs font-[400] font-avenir">REMOVE</p>
                  </div>
                  <Image
                    src="/icons/cancel.svg"
                    width={12}
                    height={12}
                    alt="boomark"
                  />
                </div>
              </div>
            </div>
          )}
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/libs/cn";
import { gsap } from "gsap";
import { CartItemType } from "@/store/cart";
import { useBoundStore } from "@/store/store";

const colorMap: { [key: number]: string } = {
  1: "bg-black",
  2: "bg-amber-600",
  4: "bg-stone-500",
  5: "bg-green-500",
};

export default function CartCard({ cartData }: { cartData: CartItemType }) {
  const { updateColor , updateSize, increaseQuantity, decreaseQuantity } = useBoundStore()
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="border-b-2 pb-6 border-black/4">
      <div className="flex gap-3 items-start h-fit">
        <div
          ref={imageRef}
          className="w-[120px] flex-none md:w-[200px] rounded-[1px] overflow-hidden mt-[4px] relative border-[0.5px] border-black/10"
        >
          <Image
            src={cartData.mainImage}
            fill
            className="object-cover"
            alt="image"
          />
        </div>

        <div ref={contentRef} className="flex-1">
          <p className="font-manrop text-lg font-bold">{cartData.name.toLocaleUpperCase()}</p>
          <p className="font-manrop text-lg md:text-xl font-black text-black/50 mt-1">
            GHS {cartData.price}
          </p>

          <div className="flex gap-1 mt-2">
            {cartData.colors.map((item, index) => (
              <div
                onClick={() => updateColor(cartData.id, item)}
                key={item}
                className={cn(
                  "size-[15px] hover:border border-black/70 rounded-full p-[1.5px] cursor-pointer flex items-center justify-center",
                  {
                    "border-2 border-black": item === cartData.selectedColor,
                  }
                )}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: item }}
                ></div>
              </div>
            ))}
          </div>

          <div className="grid-cols-4 mt-3 gap-1 w-[190px] hidden md:grid">
            {["xs", "sm", "m", "l", "xl", "2xl"].map((item) => (
              <div
                onClick={()=>updateSize(cartData.id,item)}
                key={item}
                className={cn("w-11 h-7 flex items-center justify-center rounded-[3px] hover:bg-black hover:text-white border-[0.5px] border-black/10 cursor-pointer bg-gray-100",{
                  "bg-black text-white": item === cartData.selectedSize
                })}>
                <p className="font-manrop text-xs">{item.toUpperCase()}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="max-sm:w-[120px] md:w-[150px] h-8 border-[0.5px] rounded-[4px] border-gray-400 grid grid-cols-3 overflow-hidden">
              <div 
              onClick={()=>decreaseQuantity(cartData.id)}
              className="w-full h-full flex items-center justify-center border-r-[0.5px] cursor-pointer">
                <Image
                  src="/icons/minus.svg"
                  width={18}
                  height={18}
                  alt="minus"
                />
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <p className="font-manrop font-black text-md">{cartData.quantity}</p>
              </div>
              <div 
               onClick={()=>increaseQuantity(cartData.id)}
              className="w-full h-full flex items-center justify-center border-l-[0.5px] cursor-pointer">
                <Image
                  src="/icons/plus.svg"
                  width={18}
                  height={18}
                  alt="plus"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

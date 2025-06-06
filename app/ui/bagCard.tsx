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

export default function BagCard({ cartData }: { cartData: CartItemType }) {
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
      <div className="flex gap-3 items-start">
        <div className="w-[120px] flex-none md:w-[200px] h-[220px] rounded-[1px] overflow-hidden mt-[4px] relative border-[0.5px] border-black/10">
          <Image
            src={cartData.mainImage}
            fill
            className="object-cover"
            alt="image"
          />
        </div>

        <div className="flex-1 flex flex-col justify-end h-[220px] ">
          <p className="font-avenir text-md font-[400px] text-black/70">{cartData.name.toLocaleUpperCase()}</p>
          <p className="font-avenir text-md font-[400] text-[16px] md:text-md text-black/50   mt-1">
            GHS {cartData.price}
          </p>
        </div>
      </div>
    </div>
  );
}

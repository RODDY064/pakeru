"use client";

import { CartItemType } from "@/store/cart";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Cedis from "./cedis";

export default function CartCard({ cartData }: { cartData: CartItemType }) {
  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    addBookmark,
    isBookmarked,
  } = useBoundStore();
  const [colorName, setColorName] = useState<{
    color: string;
    colorHex: string;
  }>({
    color: "",
    colorHex: "",
  });
  const [variantImage, setVariantImage] = useState(cartData?.mainImage.url);

  useEffect(() => {
    if (cartData) {
      const activeVariant = cartData.variants?.find(
        (variant) => variant._id === cartData.selectedColor
      );
      if (activeVariant) {
        setColorName({
          color: activeVariant.color || "",
          colorHex: activeVariant.colorHex || "",
        });
        setVariantImage(
          activeVariant.images?.[0]?.url || cartData?.mainImage.url
        );
      }
    }
  }, [cartData]);

  return (
    <div className="my-4 w-full flex flex-col md:flex-row h-fit md:h-[450px] lg:h-[500px] bg-white border border-black/10 rounded-sm ">
      <div className="w-full md:w-[50%] h-[150px] max-sm:gap-3 md:h-auto  flex flex-none p-2">
        <div className="w-[50%] md:w-full h-full bg-[#f2f2f2] relative">
          <Image
            src={cartData?.mainImage.url ?? "/images/image-fallback.png"}
            fill
            className="object-cover"
            alt="hero"
          />
        </div>
        <div className="md:hidden mt-1">
          <p className="text-xs md:text-sm font-avenir text-black/50 font-[300] ">
            NEW
          </p>
          <p className="mt-2 mb-1 font-avenir font-[400] text-sm md:text-md">
            {cartData?.name.toLocaleUpperCase()}
          </p>
          {/* <p className="font-avenir text-md font-[400] text-[16px] md:text-md text-black/50  ">
            GHS {cartData?.price}
          </p> */}
          <div className="flex gap-0.5 items-center text-black/50">
            <Cedis cedisStyle="pt-[4px] opacity-50" className="text-[16px] md:text-md  " />
            <p className=" font-avenir font-[400] text-[16px] md:text-md text-black/50  pt-[7px]">
              {cartData?.price}
            </p>
          </div>
       
        </div>
      </div>
      <div className="w-[1px] h-full bg-black/10 ml-1 hidden md:flex"></div>
      <div className="w-full md:w-[49%] flex flex-col md:justify-between flex-none h-full ">
        <div className=" pb-2  px-4 md:pt-4">
          <div className="hidden md:block">
            <p className="text-sm font-avenir text-black/50 font-[300] ">NEW</p>
            <p className="mt-2 mb-1 font-avenir font-[400] text-md">
              {cartData?.name.toLocaleUpperCase()}
            </p>
            <div className="flex gap-0.5 items-center text-black/50">
            <Cedis cedisStyle="pt-[4px] opacity-50" className="text-[16px] md:text-md  " />
            <p className=" font-avenir font-[400] text-[16px] md:text-md text-black/50  pt-[7px]">
              {cartData?.price}
            </p>
          </div>
          </div>
          <div className="w-full flex flex-col lg:flex-row gap-1  mt-2 lg:items-end ">
            <p
              dangerouslySetInnerHTML={{
                __html: cartData?.description || "",
              }}
              className="w-full xl:w-[80%]font-avenir text-lg responsive-description  line-clamp-2  text-black/60 "
            ></p>
          </div>
          <div className="w-full my-2 border-y  mt-2 lg:mt-6 py-2 lg:py-4 pr-2 border-black/5">
            <div className="w-full flex gap-3 md:gap-2 xl:flex-row flex-col xl:items-end justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex  gap-4 items-center">
                  <div className="w-full md:w-auto h-full flex md:flex-col items-start max-sm:justify-between ">
                    <p className="text-sm font-avenir font-[400]">COLOR</p>
                    <p className="text-sm font-avenir font-[400] text-black/50">
                      {colorName.color}
                    </p>
                  </div>
                  <div className="w-12 h-[1px] bg-black/20 hidden md:flex" />
                  <div className="size-10 lg:size-14 flex-none hidden md:flex  border border-black/30 rounded-[10px] cursor-pointer relative overflow-hidden p-0.5">
                    <div
                      style={{ backgroundColor: colorName.colorHex }}
                      className="w-full h-full relative overflow-hidden rounded-[8px] "
                    />
                  </div>
                </div>
                <div className="w-full md:w-fit  items-center  justify-between flex gap-5">
                  <p className="text-sm font-avenir font-[400]">SIZE</p>
                  <p className="text-sm font-avenir font-[400] md:hidden">SM</p>
                  <div className="w-10 md:w-14 h-[1px] bg-black/20 hidden md:flex" />
                  <div className="size-10 lg:w-14 lg:h-10 md:flex hidden items-center justify-center rounded-[8px] border-[0.5px] border-black/10 cursor-pointer bg-gray-100">
                    <p className="font-avenir text-sm">
                      {cartData?.selectedSize}
                    </p>
                  </div>
                </div>
              </div>
              {/* <div className="text-sm font-avenir font-[400] text-black/30 underline underline-offset-4 decoration-black/20 cursor-pointer">
                SIZE GUILD
              </div> */}
            </div>
          </div>
          <div className="mt-4 my-3 lg:mt-6 flex gap-2">
            <div className="w-[60%] lg:w-[50%] h-8 md:h-8 lg:h-10 border-[0.5px] rounded-md border-gray-400 grid grid-cols-3 overflow-hidden">
              <div
                onClick={() => decreaseQuantity(cartData?.cartItemId)}
                className="w-full h-full flex items-center justify-center border-r-[0.5px] cursor-pointer"
              >
                <Image
                  src="/icons/minus.svg"
                  width={18}
                  height={18}
                  alt="minus"
                />
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <p className="font-avenir font-[400] text-md">
                  {cartData?.quantity}
                </p>
              </div>
              <div
                onClick={() => increaseQuantity(cartData?.cartItemId)}
                className="w-full h-full flex items-center justify-center border-l-[0.5px] cursor-pointer"
              >
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
        <div className="w-full flex border-t border-black/10">
          <div onClick={() => addBookmark(cartData)} className="w-full h-12 flex items-center justify-center border-r border-black/10 cursor-pointer gap-1.5">
            <div  className="mt-[3.2px]">
              <p className="text-sm font-[400] font-avenir">BOOKMARK</p>
            </div>
            <Image
              src={
                isBookmarked(
                  cartData?._id as string,
                  cartData?.selectedColor,
                  cartData?.selectedSize
                )
                  ? "/icons/bookmark2.svg"
                  : "/icons/bookmark.svg"
              }
              width={24}
              height={24}
              alt="bookmark"
              className="cursor-pointer"
            />
          </div>
          <div
            onClick={() => removeFromCart(cartData.cartItemId)}
            className="w-full h-12  flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <div className="mt-[3.2px]">
              <p className="text-sm font-[400] font-avenir">REMOVE</p>
            </div>
            <Image
              src="/icons/cancel.svg"
              width={16}
              height={16}
              alt="cancel"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

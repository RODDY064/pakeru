"use client";

import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "./product-card";

// Utility to debounce functions
interface DebounceFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
}

interface Debounce {
  <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): DebounceFunction<T>;
}

const debounce: Debounce = (func, wait) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function CollectionsContent() {
  const [containerHeight, setContainerHeight] = useState("100vh");
  const [cardType, setCardType] = useState<"small" | "medium">("small");

  // Calculate container height
  const calculateHeight = useCallback(
    debounce(() => {
      const actualVH = window.innerHeight;
      setContainerHeight(`${actualVH}px`);
      document.documentElement.style.setProperty(
        "--actual-vh",
        `${actualVH * 0.01}px`
      );
    }, 100),
    []
  );

  // Update card type based on viewport width
  const updateCardType = useCallback(
    debounce(() => {
      setCardType(window.innerWidth >= 1024 ? "medium" : "small");
    }, 100),
    []
  );

  useEffect(() => {
    calculateHeight();
    updateCardType();
    window.addEventListener("resize", calculateHeight);
    window.addEventListener("orientationchange", calculateHeight);
    window.addEventListener("resize", updateCardType);

    return () => {
      window.removeEventListener("resize", calculateHeight);
      window.removeEventListener("orientationchange", calculateHeight);
      window.removeEventListener("resize", updateCardType);
    };
  }, [calculateHeight, updateCardType]);

  return (
    <>
      <div
        className="w-full pt-36 md:pb-24 pb-10 relative "
        style={{ height: containerHeight }}
      >
        <div className="w-full h-full flex lg:flex-row   flex-col ">
          <div className="w-full flex-shrink-0 h-full lg:w-[60%] relative">
            <h1 className="text-black font-avenir uppercase text-2xl font-semibold tracking-wide">
              Collections
            </h1>
            <p className="w-full sm:w-[70%] mt-4 font-avenir text-black/50 font-[500] text-md text-balance">
              Louis Vuitton’s collection of sunglasses for men offers designs to
              flatter every face. From the classic LV Match and modern aviator
              shapes to the fashion-forward.
            </p>
            <div className="mt-4 w-full relative h-full">
              <Image
                src="/bentos/bento.webp"
                fill
                sizes="100vw"
                alt="collection"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="w-full  mt-6 md:mt-0 hidden lg:flex lg:w-[40%] flex-shrink-0 ">
            <div className="w-full lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <CollectionCard key={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-36 md:mt-12 w-full  flex flex-col items-center text-black  home-main  transition-all">
        <div className="w-full grid  md:grid-cols-3 xl:grid-cols-4 items-stretch gap-6 transition-all duration-500 ease-in-out">
          {[1, 2, 3, 5].map((item) => (
            <div key={item}></div>
            // <ProductCard key={item} type="large" />
          ))}
        </div>
      </div>
    </>
  );
}

const CollectionCard = () => {
  return (
    <div className="w-full h-full ">
      <div className="w-full h-[90%] relative lex border border-black/10 rounded-sm cursor-pointer transition-shadow duration-300 hover:border hover:z-20 hover:border-black/20">
        <Image
          src="/images/hero-2.png"
          fill
          sizes="100vw"
          alt="collection"
          className="object-cover"
          priority
        />
      </div>
      <div className="w-full h-[10%] pt-3 px-[2px]">
        <div className="flex items-start justify-between">
          <div className="w-[60%] font-avenir font-normal text-black/70">
            T-A Polo
          </div>

          <div className="w-[30%] flex justify-end ">
            <p className="font-avenir font-normal text-black/50">GHS N/A</p>
          </div>
        </div>
      </div>
    </div>
  );
};

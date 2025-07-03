"use client";

import { cn } from "@/libs/cn";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBoundStore } from "@/store/store";
import ProductCard from "@/app/ui/product-card";
import { useGsapSlider } from "@/libs/gsapScroll";
import { ProductType } from "@/store/cart";
import { useSearchParams } from "next/navigation";

export default function ProductContainer({ nameID }: { nameID: string }) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const imageDiv = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const {
    isMobile,
    products,
    addToCart,
    setModal,
    closeModal,
    updateColor,
    updateSize,
    cartState,
    addBookmark,
    isBookmarked,
  } = useBoundStore();
  const [showButtons, setShowButtons] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [productData, setProductData] = useState<ProductType | null>(null);
  const [sizeSelected, setSizeSelected] = useState<{
    shown: boolean;
    active: boolean;
  }>({ shown: false, active: false });

  useEffect(() => {
    if (nameID && products.length > 0) {
      const singleProduct = products.find((item) => item.id === nameID);
      setProductData(singleProduct || null);
    }
  }, [nameID, products]);

  const handleInteraction = () => {
    setShowButtons(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowButtons(false);
    }, 3000);
  };

  useEffect(() => {
    if (!imageDiv.current || isMobile) return;

    const el = imageDiv.current;

    el.addEventListener("scroll", handleInteraction);
    el.addEventListener("click", handleInteraction);
    el.addEventListener("touchstart", handleInteraction);

    return () => {
      el.removeEventListener("scroll", handleInteraction);
      el.removeEventListener("click", handleInteraction);
      el.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  useGSAP(() => {
    if (isMobile) return;

    if (!stickyRef.current || !imageDiv.current) return;

    const sticky = stickyRef.current;
    const image = imageDiv.current;

    gsap.to(image, {
      scrollTrigger: {
        trigger: sticky,
        start: "top 10%",
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      },
    });
  });

  // buttons ref
  const prevBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const nextBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const cardRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

  const { isStart, isEnd } = useGsapSlider({
    sliderRef: imageDiv,
    prevRef: prevBtnRef,
    nextRef: nextBtnRef,
    cardRef,
    speed: 0.5,
  });

  const handleAdd = (product: ProductType) => {
    if (!product.selectedSize) {
      if (!sizeSelected.active) {
        setSizeSelected((stat) => ({ ...stat, shown: true }));
        return;
      }
    }

    // if (!sizeSelected.active || !product.selectedSize) {
    //   setSizeSelected((stat) => ({ ...stat, shown: true }));
    //   return;
    // }
    closeModal();
    addToCart(product);
    setModal("cart");
  };

  const handleSize = (id: string, newSize: string) => {
    setSizeSelected({ active: true, shown: false });
    updateSize(id, newSize);
  };

  return (
    <div className="w-full min-h-dvh flex flex-col items-center text-black bg-white home-main pt-24  transition-all">
      <div className="w-full flex flex-col md:flex-row ">
        <div className="w-full md:w-[50%] relative">
          <div
            ref={imageDiv}
            className="w-full flex flex-row md:flex-col  image-div relative overflow-x-scroll"
          >
            <div
              ref={cardRef}
              className="w-full h-[400px] flex-none md:h-[70vh] lg:h-[80vh] relative border border-black/10"
            >
              {productData?.mainImage && (
                <Image
                  src={productData.mainImage}
                  fill
                  priority
                  className="object-cover"
                  alt={productData?.name || "Product image"}
                />
              )}
            </div>
            <div className="w-full h-[400px] flex-none  md:h-[70vh] lg:h-[80vh] relative border border-black/10">
              <Image
                src="/images/hero-2.png"
                fill
                className="object-cover"
                alt="hero"
              />
            </div>
          </div>
          <div className="w-full h-full  absolute top-0 pointer-events-none  md:hidden z-20 flex items-center ">
            <div
              className={cn(
                "flex w-full justify-between px-4 imageButton opacity-0",
                {
                  "opacity-100": showButtons,
                }
              )}
            >
              <button
                ref={prevBtnRef}
                aria-label="Scroll left"
                className={cn(
                  "size-10 hover:bg-black  cursor-pointer pointer-events-auto  flex items-center justify-center invisible border rounded-full",
                  {
                    visible: !isStart,
                  }
                )}
              >
                <Image
                  src="/icons/arrow.svg"
                  width={18}
                  height={18}
                  alt="arrow"
                  className="rotate-90"
                />
              </button>
              <button
                ref={nextBtnRef}
                aria-label="Scroll right"
                className={cn(
                  "size-10 hover:bg-black cursor-pointer pointer-events-auto flex items-center invisible  justify-center border rounded-full",
                  {
                    visible: !isEnd,
                  }
                )}
              >
                <Image
                  src="/icons/arrow.svg"
                  width={20}
                  height={20}
                  alt="arrow"
                  className="rotate-270"
                />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={stickyRef}
          className="md:w-[50%] flex flex-col items-center pt-10 md:pt-4 lg:pt-20 sticky"
        >
          <div className="w-full px-6 md:px-8 md:w-[90%] lg:w-[80%] xl:w-[60%]">
            <div className="flex  justify-between items-center">
              <p className="text-black/50 text-sm font-[300] font-avenir">
                A440-2
              </p>
              <Image
                onClick={() => addBookmark(productData as ProductType)}
                src={
                  isBookmarked(
                    productData?.id as string,
                    productData?.selectedColor,
                    productData?.selectedSize
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
            <div className="my-4">
              <p className="font-avenir text-sm font-[300] text-black/50 my-1">
                NEW
              </p>
              <p className="font-avenir font-[400] text-lg">
                {productData?.name.toLocaleUpperCase()}
              </p>
              <p className="text-black/50 font-avenir font-[400] text-md">
                GHS {productData?.price}
              </p>
              <p className="my-4 text-black/60">{productData?.description}</p>
            </div>
            <div className="my-4 mt-10 md:mt-6">
              <div className="flex items-center gap-2">
                <p className="text-sm font-avenir font-[400]">COLORS </p>
                <div className="text-sm font-avenir font-[400] text-black/50 flex items-center gap-2 ml-4">
                  <div className="w-12 h-[1px] bg-black/30"></div>
                  {productData?.selectedColor}
                </div>
              </div>
              <div className="my-3 grid grid-cols-4 gap-3 md:gap-4 w-fit">
                {productData?.colors.map((item, index) => (
                  <div
                    onClick={() => updateColor(productData?.id, item)}
                    key={item}
                    className={cn(
                      "size-16 md:w-18 lg:size-20 border border-black/30 rounded-xl cursor-pointer relative overflow-hidden p-[2px]",
                      {
                        "border-2": item === productData?.selectedColor,
                      }
                    )}
                  >
                    <div className="w-full h-full relative overflow-hidden">
                      <Image
                        src="/images/hero-2.png"
                        fill
                        className="object-cover"
                        alt="hero"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full border-t  mt-10 pt-4 border-black/30">
                <div className="w-full flex justify-between items-center mb-2">
                  <p
                    className={cn("text-sm font-avenir font-[400]", {
                      "text-red-500": sizeSelected.shown,
                    })}
                  >
                    SIZE
                  </p>
                  <p className="underline text-sm font-avenir font-[400] underline-offset-4 underline-black/40 text-black/30 cursor-pointer">
                    SIZE GUILD
                  </p>
                </div>
                <div className="w-full flex items-center gap-2 md:gap-3 my-4">
                  {productData?.sizes.map((item) => (
                    <div
                      onClick={() => handleSize(productData.id, item)}
                      key={item}
                      className={cn(
                        "w-12 md:w-16 h-10 flex items-center justify-center rounded-[8px] hover:bg-black hover:text-white border-[0.5px] border-black/10 cursor-pointer bg-gray-100",
                        {
                          "bg-black text-white":
                            item === productData.selectedSize,
                          "border-red-500 bg-red-100": sizeSelected.shown,
                        }
                      )}
                    >
                      <p className="font-avenir text-xs">
                        {item.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                onClick={() => handleAdd(productData as ProductType)}
                className="mt-10 rounded py-2.5 flex items-center justify-center gap-3 w-full  bg-black  hover:bg-green-500 hover:border-green-500 border border-black/20  group/add cursor-pointer transition-all"
              >
                <p className="font-avenir font-[400] text-sm pt-[4px] text-white ">
                  ADD TO CART
                </p>
                <div className="w-4 h-[1px] bg-white " />
                <Image
                  src="/icons/bag-w.svg"
                  width={18}
                  height={18}
                  alt="bag"
                  className=""
                />
              </div>
              <div className="mt-8 border-t border-black/30 w-full pt-4">
                <div className="flex gap-10 items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Image
                      src="/icons/washing.svg"
                      width={44}
                      height={20}
                      alt="washing machine"
                      className="hidden lg:flex "
                    />
                    <Image
                      src="/icons/washing.svg"
                      width={32}
                      height={20}
                      alt="washing machine"
                      className="lg:hidden "
                    />
                    <p className="my-2 font-avenir text-[13px] font-[400] text-black/50">
                      MACHINE WASH 30
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image
                      src="/icons/fabric.svg"
                      width={44}
                      height={20}
                      alt="washing machine"
                      className="hidden lg:flex "
                    />
                    <Image
                      src="/icons/fabric.svg"
                      width={32}
                      height={20}
                      alt="washing machine"
                      className="lg:hidden "
                    />
                    <p className="my-2 font-avenir text-[13px] font-[400] text-black/50">
                      100% CUTTON
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-[50%]  md:my-24 ">
        <p className="font-avenir font-[400] text-md px-4 md:px-8">
          SIMILAR PRODUCTS
        </p>
        <div className="mt-4">
          <div className="w-full flex items-center justify-center ">
            <div
              // ref={sliderRef}
              className={cn(
                "grid grid-flow-col auto-cols-[90%] md:auto-cols-[30%] px-4 md:pl-8  xl:auto-cols-[25%] productSlider  gap-4 overflow-x-scroll overflow-hidden nav-slider",
                {
                  "auto-cols-[100%]":
                    cartState === "loading" || cartState === "error",
                }
              )}
            >
              {cartState === "loading" || cartState === "error" ? (
                <div className="min-w-[300px]  h-[400px] flex items-center justify-center">
                  <div className="flex items-center justify-center gap-1">
                    <Image
                      src="/icons/loader.svg"
                      width={24}
                      height={24}
                      alt="loader"
                    />
                    <p className="font-avenir font-[400] text-md mt-1 text-black/50">
                      Loading
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {products?.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      productData={product}
                      type="large"
                      cardRef={index === 0 ? cardRef : undefined}
                      cardStyle="md:mb-6"
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

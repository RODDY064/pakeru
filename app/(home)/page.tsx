"use client";

import { useBoundStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Button from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { horizontalLoop } from "@/libs/functions";
import { cn } from "@/libs/cn";
import { cubicBezier } from "motion";
import ProductCard from "../ui/product-card";
import SliderButton from "../ui/sliderButton";
import Video from "../ui/bentos";
import { useGsapSlider } from "@/libs/gsapScroll";
import { handleNavigation } from "@/libs/navigate";
import Slider from "../ui/slider";

const easing = cubicBezier(0.37, 0.24, 0.38, 0.99);

export default function Home() {
  const { scrollAmount, setRouteChange } = useBoundStore();
  const [containerHeight, setContainerHeight] = useState("100vh");

  const router = useRouter();
  useGSAP(() => {
    //  console.log(scrollAmount)
    if (scrollAmount >= 100) {
      const tl = gsap.timeline({});

      tl.set(".slider-container", {});
    }
  }, [scrollAmount]);

  useLayoutEffect(() => {
    const actualVH = window.innerHeight;
    setContainerHeight(`${actualVH}px`);
    document.documentElement.style.setProperty(
      "--actual-vh",
      `${actualVH * 0.01}px`
    );
  }, []);

  return (
    <div className="w-full min-h-dvh flex flex-col items-center bg-black home-main overflow-hidden">
      <Images
        containerHeight={containerHeight}
        action={(e: any) =>
          handleNavigation(e, "/shop", router, setRouteChange, 200)
        }
      />
      <div className="w-full mt-[1px]  pt-4 bg-white  ">
        <Slider containerHeight={containerHeight} />
        <Product />
        <Video />
      </div>
    </div>
  );
}

const Images = ({
  action,
  containerHeight,
}: {
  action: any;
  containerHeight: any;
}) => {
  const { hero } = useBoundStore();

  return (
    <div
      className="w-full slider-container font-avenir bg-white"
      style={{ height: containerHeight }}
    >
      <div className="slider w-full h-full">
        <div className="w-full h-full relative overflow-hidden flex flex-col">
          {/* Top Spacer - Responsive */}
          <div className="w-full h-[10vh] md:h-[8vh] lg:h-[6vh] flex-shrink-0" />

          {/* Hero Image Container */}
          <div className="flex-1 relative flex items-center justify-center min-h-0">
            <div className="w-full h-full relative mt-8">
              {/* Desktop Hero */}
              <Image
                src={
                  hero?.hero[0]?.image?.url?.trim()
                    ? hero.hero[0]?.image?.url
                    : "/images/hero/pakeru desktop hero.webp"
                }
                fill
                className="object-contain object-center hidden xl:block"
                alt="Pakeru Desktop Hero"
                priority
                sizes="100vw"
                quality={95}
              />

              {/* Tablet Hero */}
              <Image
                src={
                  hero?.hero[1]?.image?.url?.trim()
                    ? hero?.hero[1]?.image?.url
                    : "/images/hero/pakeru tablet hero.webp"
                }
                fill
                className="object-contain object-center hidden md:block xl:hidden"
                alt="Pakeru Tablet Hero"
                priority
                sizes="100vw"
                quality={95}
              />

              {/* Mobile Hero */}
              <Image
                src={
                  hero?.hero[2]?.image?.url?.trim()
                    ? hero?.hero[2]?.image?.url
                    : "/images/hero/pakeru mobile hero.webp"
                }
                fill
                className="object-contain object-center block md:hidden"
                alt="Pakeru Mobile Hero"
                priority
                sizes="100vw"
                quality={95}
              />
            </div>
          </div>

          {/* Content Section - Fixed Height */}
          <div className="w-full flex-shrink-0 flex flex-col items-center justify-center pb-10 relative ">
            <div className="w-full flex flex-col gap-3 items-center px-4">
              <p className="text-black font-avenir font-medium text-[13px] md:text-[16px] lg:text-[18px] text-center leading-8">
                {hero?.title}
              </p>

              <h1 className="text-black font-avenir uppercase  font-bold text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] leading-4 text-center">
                {hero?.description}
              </h1>

              <div className="">
                <Button ID="shop-button" action={action} word="GO TO SHOP" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Product = () => {
  const sliderRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const prevBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const nextBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const cardRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);


  const {
    isStart,
    isEnd,
    currentPage,
    totalPages,
    goToPage,
    reinitialize,
  } = useGsapSlider({
    sliderRef: sliderRef,
    prevRef: prevBtnRef,
    nextRef: nextBtnRef,
    cardRef,
    speed: 0.5,
  });

  const { products, cartProductState, loadProducts, currentFilters } = useBoundStore();

  useEffect(()=>{
     loadProducts()
  },[])

//   useEffect(() => {
//   console.log("cartProductState:", cartProductState);
//   console.log("products:", products?.length);
// }, [cartProductState, products]);


  useEffect(() => {
    if (products && products.length > 0) {
      reinitialize();
    }
  }, [products]);

  return (
    <div className="w-full mt-10 px-2 md:px-8 lg:mx-2">
      <p className="text-xl font-bold font-avenir mb-6">SHOP ALL</p>
      <div
        ref={sliderRef}
        className={cn(
          "grid grid-flow-col auto-cols-[minmax(16rem,1fr)] place-content-start py-2 md:auto-cols-[minmax(26rem,1fr)] productSlider nav-slider gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-2",
          {
            "auto-cols-[minmax(100%,1fr)]":
              cartProductState === "loading" || cartProductState === "error",
          }
        )}
        style={{ scrollBehavior: "smooth" }}>
        {(cartProductState === "loading" || cartProductState === "error" || cartProductState === "idle") ? (
          <div className="w-full  h-[400px] md:h-[450px] flex items-center justify-center">
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
            {products?.slice(0, 10).map((product, index) => (
              <ProductCard
                key={product._id}
                productData={product}
                type="large"
                cardRef={index === 0 ? cardRef : undefined}
                cardStyle="md:mb-6"
                hideDetails={true}
              />
            ))}
          </>
        )}
      </div>
      <div className="flex flex-col items-center">
        <div className="w-[80%] md:w-full mb-4 flex flex-wrap items-center justify-center gap-1 md:gap-3">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-6 h-[5px] md:w-6 md:h-2 rounded-full ${
                i === currentPage ? "bg-black " : "bg-black/20"
              }`}
            />
          ))}
        </div>
      </div>
      {cartProductState === "success" && products.length !== 0 && (
        <div className="md:flex items-center justify-center gap-6 md:gap-12 hidden ">
          <button
            ref={prevBtnRef}
            aria-label="Scroll left"
            className={cn(
              "size-10 hover:bg-black invisible cursor-pointer flex items-center justify-center border rounded-full group/a nav-prev",
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
              className="rotate-90 group-hover/a:hidden"
            />
            <Image
              src="/icons/arrow-w.svg"
              width={18}
              height={18}
              alt="arrow"
              className="hidden rotate-90 group-hover/a:flex"
            />
          </button>

          <button
            ref={nextBtnRef}
            aria-label="Scroll right"
            className={cn(
              "size-10 hover:bg-black cursor-pointer flex items-center invisible justify-center border rounded-full group/w nav-next",
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
              className="rotate-270 group-hover/w:hidden"
            />
            <Image
              src="/icons/arrow-w.svg"
              width={20}
              height={20}
              alt="arrow"
              className="hidden rotate-270 group-hover/w:flex"
            />
          </button>
        </div>
      )}
    </div>
  );
};

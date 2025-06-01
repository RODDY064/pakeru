"use client";

import React from "react";
import ProductCard from "./product-card";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import { cn } from "@/libs/cn";
import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Link from "next/link";
import { useGsapSlider } from "@/libs/gsapScroll";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollToPlugin);

const navImages = [
  "/images/img4.png",
  "/images/img7.png",
  "/images/im3.png",
  "/images/nm2.png",
];

export default function NavCurtain({
  type,
  animate,
  isSearching,
  handleSearchBlur,
}: {
  type: "search" | "nav" | "mobile";
  animate?: { container: any; content: any };
  isSearching?: boolean;
  handleSearchBlur?: any;
}) {
  const { navSearch, curtain } = useBoundStore();

  useGSAP(() => {
    // clip-path: circle(0.1% at 0 100%);
  });

  const navParent = {
    show: {},
    hide: {},
  };

  const navImage = {
    show: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 16,
        mass: 0.6,
      },
    },
    hide: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 16,
        mass: 0.6,
      },
    },
  };

  const textOverlay = {
    show: {
      clipPath: "circle(150% at 0 100%)",
    },
    hide: {
      clipPath: "circle(0.1% at 0 100%)",
    },
  };

  const imgDiv = {
    show: { opacity: 1 },
    hide: { opacity: 0 },
  };

  const textMovement = {
    show: {
      x: -8,
      transition: { type: "spring", stiffness: 150, damping: 16, mass: 0.6 },
    },
    hide: {
      x: 0,
      transition: { type: "spring", stiffness: 150, damping: 16, mass: 0.6 },
    },
  };

  return (
    <>
      {type === "nav" && (
        <motion.div
          variants={animate?.container}
          className={cn(
            " absolute w-full h-0   max-sm:hidden flex-none  overflow-hidden   md:top-[2.8rem] left-0  z-[-10]"
          )}
        >
          <motion.div className="bg-white overflow-hidden  relative mt-4  z-20 text-black  border-t-black border-t-[0.5px] h-fit">
            <motion.div variants={animate?.content}>
              <div className="w-full   flex items-start">
                <div className="w-[62%] px-4 md:px-8  py-8 h-full flex-none">
                  <p className="pb-6  text-sm font-manrop md:text-lg  uppercase font-black  text-black px-[2px]">
                    NEW IN
                  </p>
                  <NavSlider />
                </div>
                <div className="w-[38%] h-[530px] lg:h-[685px] items-end  grid md:grid-cols-1 xl:grid-cols-2">
                  {navImages.map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover="show"
                      initial="hide"
                      className={cn(
                        "w-full h-full relative border-[0.2px] border-black/20 overflow-hidden cursor-pointer",
                        {
                          "max-lg:hidden": index === 3,
                        }
                      )}
                    >
                      <motion.div
                        variants={navImage}
                        className="w-full h-full relative overflow-hidden"
                      >
                        <Image
                          src={item}
                          fill
                          className="object-cover"
                          alt="cart"
                        />
                      </motion.div>

                      <div className="w-full h-full absolute top-0 flex flex-col items-center pb-4 justify-end">
                        <motion.div
                          variants={textMovement}
                          className="relative overflow-hidden px-4 py-[3px] flex items-center justify-center"
                        >
                          <motion.div
                            variants={textOverlay}
                            className="w-full h-full bg-black absolute text-overlay"
                          />
                          <div className="flex gap-2 items-center relative z-20 flex-none">
                            <div className="size-1.5 bg-white rounded-full" />
                            <p className="font-manrop font-bold text-md text-white">
                              T-SHIRT
                            </p>
                            <motion.div variants={imgDiv}>
                              <Image
                                src="/icons/bag-b-w.svg"
                                width={20}
                                height={20}
                                alt="bag"
                              />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      {type === "search" && (
        <div className="w-full absolute left-0   ">
          <motion.div
            variants={animate?.container}
            className={cn(
              " absolute w-full h-0   max-sm:hidden flex-none   overflow-hidden mt-[40px] lg:mt-[-4.8px]   left-0  z-[10] nav-curtain"
            )}
          >
            <motion.div className="bg-white overflow-hidden  relative mt-4  z-20 text-black  border-black border-t-[0.5px] px-4 md:px-8 py-8 h-fit">
              <motion.div variants={animate?.content}>
                <div className="w-full flex justify-between items-center">
                  <p className="pb-6  text-sm font-manrop md:text-md text-black/30 font-semibold uppercase">
                    SHOWING RESULT'S FOR:
                    <span className="font-manrop font-semibold  text-black mx-2">
                      {navSearch}
                    </span>
                  </p>
                  <div onClick={(e) => handleSearchBlur(e)}>
                    <Image
                      className="cursor-pointer pb-6"
                      src="/icons/cancel.svg"
                      width={16}
                      height={16}
                      alt="cancel"
                    />
                  </div>
                </div>
                <NavSlider
                  navSearch={navSearch}
                  handleSearchBlur={handleSearchBlur}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export const NavSlider = ({
  navSearch,
  handleSearchBlur,
}: {
  navSearch?: string;
  handleSearchBlur?: any;
}) => {
  const sliderRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const prevBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const nextBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const cardRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

  const { isStart, isEnd } = useGsapSlider({
    sliderRef,
    prevRef: prevBtnRef,
    nextRef: nextBtnRef,
    cardRef,
    speed: 0.5,
  });

  const router = useRouter();

  const handleSeeMore = (e: any) => {
    router.push(`/product?searching=${navSearch}`);
    handleSearchBlur(e);
  };

  const { products } = useBoundStore();

  return (
    <div className="w-full " tabIndex={0}>
      <div ref={sliderRef} className="w-full flex gap-3  pr-10 nav-slider">
        {products.map((product) => (
          <ProductCard
            type="small"
            key={product.id}
            productData={product}
            cardRef={product.id === 1 ? cardRef : undefined}
          />
        ))}
      </div>

      <div className="w-full flex items-center justify-between mt-4">
        <p className="opacity-0">SEE MORE PRODUCTS</p>
        <div className="flex items-center justify-center gap-6 md:gap-12">
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
              width={18}
              height={18}
              alt="arrow"
              className="rotate-270 group-hover/w:hidden"
            />
            <Image
              src="/icons/arrow-w.svg"
              width={18}
              height={18}
              alt="arrow"
              className="hidden rotate-270 group-hover/w:flex"
            />
          </button>
        </div>
        <div onClick={(e) => handleSeeMore(e)} className="cursor-pointer">
          <p className="font-manrop underline-offset-3 text-md font-bold underline hover:text-blue-500">
            SEE MORE PRODUCTS
          </p>{" "}
        </div>
      </div>
    </div>
  );
};

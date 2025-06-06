"use client";

import { useBoundStore } from "@/store/store";
import {
  useAnimation,
  motion,
  AnimatePresence,
  cubicBezier,
} from "motion/react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import ProductCard from "./product-card";
import { useGsapSlider } from "@/libs/gsapScroll";
import { cn } from "@/libs/cn";
import SearchIcon from "./searchIcon";

type MenuItem = {
  title: string;
  isActive: boolean;
};



export default function Menu() {

  const navNames: MenuItem[] = [
  { title: "NEW IN", isActive: false },
  { title: "MEN", isActive: false },
  { title: "WOMEN", isActive: false },
  { title: "T-SHIRT", isActive: false },
  { title: "SHORTS", isActive: false },
  { title: "TROUSERS", isActive: false },
  { title: "OUR STORY", isActive: false },
];



  const { modal, products } = useBoundStore();
  const [activeMenu, setActiveMenu] = useState<MenuItem[]>(navNames);
  const controls = useAnimation();

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

  const handleMenu = (title: string) => {
    setActiveMenu((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        isActive: item.title === title ? !item.isActive : false,
      }))
    );
  };


  const menuRender = ()=>{
    return (
      <div className="w-full h-full">
                <div className="w-full flex">
                <div className="w-[50%] h-fit  cursor-pointer border-r border-black/20 ">
                  <div className="w-full h-[350px] relative overflow-hidden  border-b border-black/20">
                    <Image
                      src="/images/hero-2.png"
                      fill
                      alt="hero"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-center font-avenir fotn-[400] my-3 text-md">
                    WEST HAM
                  </p>
                </div>
                <div className="w-[50%] h-fit  cursor-pointer">
                  <div className="w-full h-[350px] relative overflow-hidden  border-b border-black/20">
                    <Image
                      src="/images/hero.png"
                      fill
                      alt="hero"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-center font-avenir fotn-[400] my-2 text-md">
                    {" "}
                    JACKETS
                  </p>
                </div>
              </div>
              <div className="border-t border-black/20">
                <p className="font-avenir font-[400] text-lg text-black/30 p-6 pb-2 ">
                  TRENDING
                </p>
                <div className="w-full  pl-6">
                  <div
                    ref={sliderRef}
                    className="w-full my-4 flex gap-3 pr-10 nav-slider"
                  >
                    {products.map((product, index) => (
                      <ProductCard
                        type="small"
                        key={product.id + "menu"}
                        productData={product}
                        cardRef={index === 0 ? cardRef : undefined}
                      />
                    ))}
                  </div>
                  <div className="hidden md:flex items-center pt-2 justify-center gap-6 md:gap-12 ">
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
                </div>
              </div>
              </div>
    )
  }



  return (
    <AnimatePresence>
      {/* Desktop  */}
      <motion.div
        variants={container}
        animate={modal ? "open" : "close"}
        initial="close"
        exit="close"
        className="md:w-[30%] lg:w-[30%] h-full bg-white  flex-col gap-4 relative z-20 menu-desktop hidden md:flex flex-none"
      >
        <div className="w-full h-full flex flex-none">
          <div className="w-full flex flex-none flex-col gap-6 pt-[120px] px-9 ">
            {activeMenu.map((item, index) => (
              <motion.div
                variants={list}
                onClick={() => handleMenu(item.title)}
                key={`${item.title}-${index}`}
                className={cn("font-avenir w-fit text-lg cursor-pointer relative z-20",{
                  "text-black/30": item.isActive
                })}>
                <p>{item.title}</p>
                <p
                  className={cn(
                    "w-full h-[1px]",
                    item.isActive ? "bg-amber-600" : "bg-black/20"
                  )}
                ></p>
              </motion.div>
            ))}
          </div>
          <motion.div
            variants={menuCon}
            animate={
              activeMenu?.some((item) => item.isActive) ? "visible" : "hide"
            }
            initial="hide"
            exit="hide"
            className="w-[130%] h-full relative top-0 bg-white flex flex-none border-l border-black/20"
          >
            <motion.div variants={menuChild} className="w-full h-full">
              <div className="w-full h-full">
                <div className="w-full flex">
                <div className="w-[50%] h-fit  cursor-pointer border-r border-black/20 ">
                  <div className="w-full h-[350px] relative overflow-hidden  border-b border-black/20">
                    <Image
                      src="/images/hero-2.png"
                      fill
                      alt="hero"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-center font-avenir fotn-[400] my-3 text-md">
                    WEST HAM
                  </p>
                </div>
                <div className="w-[50%] h-fit  cursor-pointer">
                  <div className="w-full h-[350px] relative overflow-hidden  border-b border-black/20">
                    <Image
                      src="/images/hero.png"
                      fill
                      alt="hero"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-center font-avenir fotn-[400] my-2 text-md">
                    {" "}
                    JACKETS
                  </p>
                </div>
              </div>
              <div className="border-t border-black/20">
                <p className="font-avenir font-[400] text-lg text-black/30 p-6 pb-2 ">
                  TRENDING
                </p>
                <div className="w-full  pl-6">
                  <div
                    ref={sliderRef}
                    className="w-full my-4 flex gap-3 pr-10 nav-slider"
                  >
                    {products.map((product, index) => (
                      <ProductCard
                        type="small"
                        key={product.id + "menu"}
                        productData={product}
                        cardRef={index === 0 ? cardRef : undefined}
                      />
                    ))}
                  </div>
                  <div className="hidden md:flex items-center pt-2 justify-center gap-6 md:gap-12 ">
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
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile */}
      <motion.div
        variants={mobileCon}
        animate={modal ? "open" : "close"}
        initial="close"
        exit="close"
        className="w-[100%] h-0 relative  bg-white flex-col gap-4 pt-[120px] px-12  flex  md:hidden menu-mobile"
      >
        {navNames.map((item, index) => (
          <motion.div
            variants={list}
            key={index}
            className="font-avenir w-fit text-lg cursor-pointer"
          >
            {item.title}
            <p className="w-full h-[1px] bg-amber-600"></p>
          </motion.div>
        ))}
        <motion.div variants={list}>
          <SearchIcon style="ml-0 mt-10" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const easingShow = cubicBezier(0.4, 0, 0.2, 1);

const container = {
  open: {
    x: 0,
    transition: {
      ease: easingShow,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  close: {
    x: -500,
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

const list = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      ease: easingShow,
    },
  },
  close: {
    opacity: 0,
    y: 20,
  },
};

const mobileCon = {
  open: {
    height: "100vh",
    transition: {
      ease: easingShow,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  close: {
    height: "0vh",
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

const menuCon = {
  visible: {
  width: "130%",
  opacity: 1,
  transition: {
    staggerChildren: 0,
    delayChildren: 0
  },
},
  hide: {
    width: "0%",
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
};

const menuChild = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      delay:0.25,
      ease: "easeOut",
    },
  },
  hide: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

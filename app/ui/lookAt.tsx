"use client";

import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import { motion, cubicBezier } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import ProductCard from "./product-card";
import { useGsapSlider } from "@/libs/gsapScroll";

const ease = cubicBezier(.32, .17, .45, .98);
const easingShow = cubicBezier(.4, 0, .2, 1);

export default function LookAt() {
  const { lookAt, SlideInview, setLookAt , products } = useBoundStore();
  const router = useRouter();

  const handleLink = () => {
    // router.push(SlideInview?.link as string);
    // setTimeout(() => {
    //   setLookAt(SlideInview?.id as any);
    // }, 500);
  };



   const sliderRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
const prevBtnRef = useRef<HTMLButtonElement>(null as unknown as HTMLButtonElement );
const nextBtnRef = useRef<HTMLButtonElement>(null as unknown as HTMLButtonElement);
const cardRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

const { isStart, isEnd } = useGsapSlider({
  sliderRef,
  prevRef: prevBtnRef,
  nextRef: nextBtnRef,
  cardRef,
  speed: 0.5, 
});


  return (
    <div
      className={cn(
        "fixed w-full top-0 z-[99] h-full flex flex-col items-center justify-end invisible",
        {
          "visible ": lookAt && SlideInview?.inView,
        }
      )}
    >
      <motion.div
        onClick={() => setLookAt(SlideInview?.id as any)}
        animate={
          lookAt && SlideInview?.inView ? { opacity: 1 } : { opacity: 0 }
        }
        transition={{ easings: easingShow }}
        className="w-full h-full absolute top-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        animate={lookAt && SlideInview?.inView ? { y: 0 } : { y: 400 }}
        transition={{ ease: ease }}
        className="w-[98%] md:w-[80%]  xl:w-[70%] h-[70vh] md:h-[85vh] bg-white relative z-20 p-4 md:p-10 overflow-y-scroll"
      >
        <div className="w-full">
          <div className="w-full flex justify-between items-center">
            <p className="font-bold font-avenir text-xl ">
              {SlideInview?.title}
            </p>
            <Image
              onClick={() => setLookAt(SlideInview?.id as any)}
              src="/icons/cancel.svg"
              className="cursor-pointer"
              width={16}
              height={16}
              alt="cancel"
            />
          </div>
          <div className="mt-4">
            <div className="">
              <p className="mt-2 text-md md:text-lg font-avenir font-[400]  lg:pr-6">
                The preparation for becoming a great copywriter is a lifestyle.
                It’s a hunger for knowledge, a curiosity and a desire to
                participate in life that is broad-based and passionate. The
                preparation for becoming a great copywriter is a lifestyle. It’s
                a hunger for knowledge, a curiosity and a desire to participate
                in life that is broad-based and passionate.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-7 md:grid-rows-4 h-[900px] md:h-[600px] lg:h-[700px] rounded overflow-hidden border-[0.5px] border-black/20 ">
              {SlideInview?.images.map((item, index) => (
                <div
                  onClick={handleLink}
                  key={index}
                  className={cn(
                    "overflow-hidden border-[0.5px] border-black/20 cursor-pointer",
                    {
                      "col-span-2 md:col-span-4 row-span-2 w-ful h-full relative":
                        index === 0,
                      "col-span-2 md:col-span-3 row-span-2  w-ful h-full relative":
                        index === 1,
                      "col-span-2 md:col-span-3 row-span-3  w-ful h-full relative":
                        index === 2,
                      "col-span-2 md:col-span-4 row-span-2   w-ful h-full relative":
                        index === 3,
                    }
                  )}
                >
                  <motion.div
                    variants={ImgH}
                    whileHover={"show"}
                    initial="hide"
                    className="w-full h-full absolute flex items-center justify-center"
                  >
                    <Image src={item} fill className="object-cover" alt="" />
                    <motion.div
                      variants={viewB}
                      className="absolute bottom-4 px-3 py-1.5 text-white bg-black overflow-hidden">
                      <div className="w-full h-full">
                        {" "}
                        <p className="font-avenir text-sm font-[400]">SHOP NOW</p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14">
            <p className="font-black font-avenir text-lg md:text-xl">
              PRODUCTS
            </p>
            <div className="overflow-hidden">
         <div 
            ref={sliderRef}
            className="w-full my-4 grid grid-flow-col auto-cols-[98%] md:auto-cols-[50%] lg:auto-cols-[40%]  xl:auto-cols-[40%] gap-3 pr-10 nav-slider">
              {products?.map((product,index) => (
                <ProductCard type="small" key={product.id} productData={product}   cardRef={index === 0 ? cardRef : undefined} />
              ))}
            </div>
            </div>
            <div className="hidden md:flex items-center pt-3 justify-center gap-6 md:gap-12 ">
              <button
                ref={prevBtnRef}
                aria-label="Scroll left"
                className={cn("size-10 hover:bg-black invisible cursor-pointer flex items-center justify-center border rounded-full group/a nav-prev",{
                    "visible": !isStart
                })}
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
                className={cn("size-10 hover:bg-black cursor-pointer flex items-center invisible justify-center border rounded-full group/w nav-next",{
                    "visible" : !isEnd
                })}
                
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
      </motion.div>
    </div>
  );
}

const ImgH = {
  show: {
    scale: 1.05,
  },
  hide: {
    scale: 1,
  },
};

const viewB = {
  show: {
    y: -10,
  },
  hide: {
    y: 60,
  },
};

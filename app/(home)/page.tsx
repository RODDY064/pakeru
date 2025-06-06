"use client";

import { useBoundStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Button from "../ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { horizontalLoop } from "@/libs/functions";
import { cn } from "@/libs/cn";
import { cubicBezier } from "motion";
import LookAt from "../ui/lookAt";
import ProductCard from "../ui/product-card";
import SliderButton from "../ui/sliderButton";
import Video from "../ui/video";
import { useGsapSlider } from "@/libs/gsapScroll";

const easing = cubicBezier(0.37, 0.24, 0.38, 0.99);

export default function Home() {
  const { scrollAmount } = useBoundStore();
  const router = useRouter();
  useGSAP(() => {
    //  console.log(scrollAmount)
    if (scrollAmount >= 100) {
      const tl = gsap.timeline({});

      tl.set(".slider-container", {});
    }
  }, [scrollAmount]);

  const handleAction = () => {
    router.push("/product");
  };

  return (
    <div className="w-full min-h-screen  flex flex-col items-center bg-black home-main">
      <Images action={handleAction} />
      <div className="w-full mt-[1px]  pt-4 bg-white  ">
        <Slider />
        <LookAt />
        <Product />
        <Video />
      </div>
    </div>
  );
}

const Images = ({ action }: { action: any }) => {
  return (
    <div className="w-full h-[600px] md:h-[90vh] lg:h-[96vh] slider-container font-avenir">
      <div className="slider w-full  h-full">
        <div className="w-full  h-full bg-white  relative overflow-hidden ">
          <div className="w-full h-[80%]   lg:h-[82%] relative">
            <Image
              src="/images/12.png"
              fill
              className="object-cover lg:flex hidden"
              alt="shop"
              priority
            />
            <Image
              src="/images/hero-pad.png"
              fill
              className="object-cover md:flex hidden lg:hidden"
              alt="shop"
              priority
            />
            <Image
              src="/images/hero-m.png"
              fill
              className="object-cover md:hidden"
              alt="shop"
              priority
            />
          </div>
          <div className="absolute w-full h-full flex  flex-col top-0 justify-end z-20 ">
            <div className="w-full  md:h-[18%] pb-6  flex flex-col gap-2 items-center ">
              <h1 className="text-black font-avenir font-bold text-[22px] md:text-3xl ">
                GET THE LOOKS, ROCK IT
              </h1>
              <p className="capitalise text-black font-avenir font-medium tex-[17px] md:text-sm text-center px-10 cursor-pointer ">
                EVERY PRODUCT WE CRAFT IS DESIGNED TO FUEL YOUR LOOKS.
              </p>
              <Button action={action} word="SHOP NOW" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Slider = () => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { slider, setLookAt, scrollAmount } = useBoundStore();

  useGSAP(() => {
    gsap.registerPlugin(Draggable, InertiaPlugin);

    const boxes = gsap.utils.toArray(".card") as HTMLElement[];
    let activeElement: HTMLElement | null = null;
    const loop = horizontalLoop(boxes, {
      paused: true,
      draggable: true,
      center: true,
      onChange: (element, index) => {
        activeElement && activeElement.classList.remove("active");
        element.classList.add("active");
        activeElement = element;
      },
    });

    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    nextBtn?.addEventListener("click", () => {
      loop.next({ duration: 0.4, ease: "power1.inOut" });
    });

    prevBtn?.addEventListener("click", () => {
      loop.previous({ duration: 0.4, ease: "power1.inOut" });
    });
  });

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="w-full h-full mt-10"
    >
      <div>
        <div
          ref={sliderRef}
          className="flex gap-1 md:gap-3 overflow-hidden text-white relative"
        >
          {slider.map((product) => (
            <div
              key={product.id}
              onClick={() => setLookAt(product.id)}
              className={cn(
                "w-[calc(90vw)] md:w-[calc(70vw)] card h-[400px] flex-shrink-0  relative lg:h-[calc(35vw)]  flex-none  flex items-center justify-center overflow-hidden  ",
                {
                  "pl-1 md:pl-3 ": product.id === 0,
                  "border border-black/5": product.id !== 0,
                }
              )}
            >
              {product.id === 0 ? (
                <div className="w-[calc(90vw)] md:w-[calc(70vw)] h-full relative  overflow-hidden border border-black/5">
                  <motion.div
                    variants={ImgC}
                    initial="hide"
                    whileHover={"show"}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 18,
                      mass: 0.7,
                    }}
                    className="w-full h-full relative flex items-center justify-center overflow-hidden will-change-transform preserve-3d backface-hidden"
                  >
                    <Image
                      src={product.mainImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="w-full h-full flex items-end justify-center text-white relative z-10">
                      <div className="w-full h-24 flex items-end justify-center pb-10 bg-gradient-to-b from-transparent to-black/20">
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
                            <p className="font-avenir font-[400] text-white">
                              T-SHIRT
                            </p>
                            <motion.div variants={imgDiv}>
                              <p>-- TAKE A LOOK</p>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  variants={ImgC}
                  initial="hide"
                  whileHover={"show"}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 18,
                    mass: 0.7,
                  }}
                  className="w-full h-full relative flex items-center justify-center will-change-transform preserve-3d backface-hidden"
                >
                  <Image
                    src={product.mainImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="w-full h-full flex items-end justify-center text-white relative z-10">
                    <div className="w-full h-24 flex items-end justify-center pb-10 bg-gradient-to-b from-transparent to-black/20">
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
                          <p className="font-avenir font-[400] text-white">
                            {product.title}
                          </p>
                          <motion.div variants={imgDiv}>
                            <p>-- TAKE A LOOK</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="md:flex items-center justify-center gap-6 md:gap-10 my-10   hidden ">
        <SliderButton />
      </div>
    </motion.div>
  );
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
    x: 35,
    transition: { type: "spring", stiffness: 150, damping: 16, mass: 0.6 },
  },
};

const ImgC = {
  show: {
    scale: 1.05,
  },
  hide: {
    scale: 1,
  },
};

const viewB = {
  show: {
    y: -60,
    transition: {
      delay: 0.02,
      ease: easing,
    },
  },
  hide: {
    y: 40,
  },
};

const veiwT = {
  show: {
    y: -45,
    opacity: 0,
    ease: easing,
  },
  hide: {
    y: 0,
    opacity: 1,
  },
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

  const { isStart, isEnd } = useGsapSlider({
    sliderRef,
    prevRef: prevBtnRef,
    nextRef: nextBtnRef,
    cardRef,
    speed: 0.5,
  });

  const { products } = useBoundStore();

  return (
    <div className="w-full mt-24 px-4 md:px-8">
      <p className="text-xl font-bold font-avenir mb-6">SHOP ALL</p>
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-scroll overflow-hidden nav-slider"
      >
        {products.map((product,index) => (
          <ProductCard
            key={product.id}
            productData={product}
            type="large"
            cardRef={index === 0 ? cardRef : undefined}
            cardStyle="md:mb-6"
          />
        ))}
      </div>
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
    </div>
  );
};

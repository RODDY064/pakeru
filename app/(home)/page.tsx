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
import Video from "../ui/bentos";
import { useGsapSlider } from "@/libs/gsapScroll";
import { handleNavigation } from "@/libs/navigate";

const easing = cubicBezier(0.37, 0.24, 0.38, 0.99);

export default function Home() {
  const { scrollAmount, setRouteChange } = useBoundStore();
  const router = useRouter();
  useGSAP(() => {
    //  console.log(scrollAmount)
    if (scrollAmount >= 100) {
      const tl = gsap.timeline({});

      tl.set(".slider-container", {});
    }
  }, [scrollAmount]);

  return (
    <div className="w-full min-h-dvh flex flex-col items-center bg-black home-main overflow-hidden">
      <Images
        action={(e: any) =>
          handleNavigation(e, "/product", router, setRouteChange, 200)
        }
      />
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
    <div className="w-full h-dvh  slider-container font-avenir pb-4 bg-white">
      <div className="slider w-full  h-full">
        <div className="w-full  h-full  relative overflow-hidden  ">
          <div className="w-full  flex flex-col items-end justify-center  h-full relative">
            <div className="w-full h-full  relative ">
              <div className="w-full h-[18%] md:h-[15%] lg:h-[10%] flex-none "></div>
              <div className="w-full h-[80%] md:h-[85%] lg:h-[90%] flex-none  relative flex items-center justify-center ">
                <div className="w-full h-full  relative">
                  <Image
                    src="/images/hero/pakeru desktop hero.webp"
                    fill
                    className="object-cover mx-auto  object-center max-w-7xl xl:flex hidden"
                    alt="hero"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
                  />
                  <Image
                    src="/images/hero/pakeru tablet hero.webp"
                    fill
                    className="object-cover object-center mx-auto max-w-4xl md:flex hidden xl:hidden"
                    alt="hero"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
                  />
                  <Image
                    src="/images/hero/pakeru mobile hero.webp"
                    fill
                    className="object-cover object-center max-w-xl mx-auto  flex md:hidden"
                    alt="hero"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
                  />
                </div>
              </div>
            </div>
            <div className=" w-full  flex-none flex  flex-col z-20 pb-12 md:pb-4 lg:pb-6 xl:pb-10">
              <div className="w-full  flex flex-col gap-2 items-center ">
                  <p className="capitalise text-black font-avenir font-medium text-[13px] md:text-[24px] hero-desc md:text-sm text-center px-10 cursor-pointer leading-10 ">
                  Made for you to
                </p>
                <h1 className="text-black font-avenir  font-bold text-[20px] lg:text-[28px] xl:text-[32px] main-hero-head leading-5">
                   DEFY THE NORM
                </h1>
                <Button ID="shop-button" action={action} word="GO TO SHOP" />
              </div>
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
      className="w-full h-full mt-10">
      <div>
        <div
          ref={sliderRef}
          className="flex gap-1 md:gap-3 overflow-hidden text-white relative hero-slider-div"
        >
          {slider.map((product) => (
            <div
              key={product._id}
              onClick={() => setLookAt(product._id)}
              className={cn(
                "w-[calc(90vw)] slider-element md:w-[calc(70vw)] card h-[350px]  flex-shrink-0  relative lg:h-[calc(35vw)]  flex-none  flex items-center justify-center overflow-hidden  ",
                {
                  "pl-1 md:pl-3 ": product._id === 0,
                  "border border-black/5 ": product._id !== 0,
                }
              )}
            >
              {product._id === 0 ? (
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

  const {
    isStart,
    isEnd,
    currentPage,
    itemsArray,
    totalPages,
    goToPage,
    reinitialize,
  } = useGsapSlider({
    sliderRef,
    prevRef: prevBtnRef,
    nextRef: nextBtnRef,
    cardRef,
    speed: 0.5,
  });

  const { products, cartState } = useBoundStore();

  useEffect(() => {
    if (products && products.length > 0) {
      console.log("Products loaded, reinitializing slider");
      reinitialize();
    }
  }, [products]);

  return (
    <div className="w-full mt-24 px-4 md:px-8 lg:mx-2">
      <p className="text-xl font-bold font-avenir mb-6">SHOP ALL</p>
      <div
        ref={sliderRef}
        className={cn(
          "grid grid-flow-col auto-cols-[minmax(320,2fr)] md:auto-cols-[minmax(400,2fr)] gap-4 overflow-x-scroll overflow-hidden nav-slider",
          {
            "auto-cols-[100%]  md:auto-cols-[100%] lg:auto-cols-[100%]  xl:auto-cols-[100%]":
              cartState === "loading" || cartState === "error",
          }
        )}
      >
        {cartState === "loading" ||
        cartState === "error" ||
        cartState === "idle" ? (
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
            {products?.slice(0,10).map((product, index) => (
              <ProductCard
                key={product._id}
                productData={product}
                type="large"
                cardRef={index === 0 ? cardRef : undefined}
                cardStyle="md:mb-6"
                showDetails={true}
              />
            ))}
          </>
        )}
      </div>
      <div className="flex flex-col items-center">
        <div className="w-[80%] md:w-full mb-4 flex flex-wrap items-center justify-center gap-1 md:gap-3">
          {Array.from({ length: totalPages - 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-6 h-[5px] md:w-6 md:h-2 rounded-full ${
                i === currentPage ? "bg-black" : "bg-black/20"
              }`}
            />
          ))}
        </div>
      </div>
      {cartState === "success" && (
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

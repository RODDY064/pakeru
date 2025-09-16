"use client";

import { useBoundStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Button from "../ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [containerHeight, setContainerHeight] = useState("100vh");

  useEffect(() => {
    const calculateHeight = () => {
      // Use actual viewport height for consistency across platforms
      const actualVH = window.innerHeight;
      setContainerHeight(`${actualVH}px`);

      // Set CSS custom property for dvh fallback
      document.documentElement.style.setProperty(
        "--actual-vh",
        `${actualVH * 0.01}px`
      );
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    window.addEventListener("orientationchange", calculateHeight);

    return () => {
      window.removeEventListener("resize", calculateHeight);
      window.removeEventListener("orientationchange", calculateHeight);
    };
  }, []);

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
                src="/images/hero/pakeru desktop hero.webp"
                fill
                className="object-contain object-center hidden xl:block"
                alt="Pakeru Desktop Hero"
                priority
                sizes="100vw"
                quality={95}
              />

              {/* Tablet Hero */}
              <Image
                src="/images/hero/pakeru tablet hero.webp"
                fill
                className="object-contain object-center hidden md:block xl:hidden"
                alt="Pakeru Tablet Hero"
                priority
                sizes="100vw"
                quality={95}
              />

              {/* Mobile Hero */}
              <Image
                src="/images/hero/pakeru mobile hero.webp"
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
                Made for you to
              </p>

              <h1 className="text-black font-avenir font-bold text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] leading-4 text-center">
                DEFY THE NORM
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
                  "border border-black/20 ": product._id !== 0,
                }
              )}
            >
              {product._id === 0 ? (
                <div className="w-[calc(90vw)] md:w-[calc(70vw)] h-full relative  overflow-hidden border border-black/10 ">
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
                    className="w-full h-full border-black/10 border  group/slider bg-[#f2f2f2] mx-auto relative flex items-center justify-center overflow-hidden will-change-transform preserve-3d backface-hidden"
                  >
                    <Image
                      src={product.mainImage}
                      alt={product.title}
                      fill
                      className="object-cover object-center max-w-2xl mx-auto bg-[#f2f2f2]"
                      priority
                    />
                    <div className="w-full h-full flex text-white relative z-10 top-2">
                      <div className="w-full h-24 flex px-4 pb-8 ">
                        <motion.div
                          variants={textMovement}
                          className="relative overflow-hidden px-4 py-[3px] flex items-center justify-center"
                        >
                          <motion.div
                            variants={textOverlay}
                            className="w-full h-full bg-black absolute  text-overlay"
                          />
                          <div className="flex gap-2 items-center relative z-20 flex-none">
                            <div className="size-1.5 bg-black group-hover/slider:bg-white rounded-full" />
                            <p className="font-avenir font-bold  text-black  group-hover/slider:text-white py-2">
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
                  className="w-full h-full group/slider relative bg-[#f2f2f2] border border-black/10 flex items-center justify-center will-change-transform preserve-3d backface-hidden overflow-hidden "
                >
                  <Image
                    src={product.mainImage}
                    alt={product.title}
                    fill
                    className="object-cover max-w-2xl mx-auto bg-[#f2f2f2]"
                    priority
                  />
                  <div className="w-full h-full flex top-2 items-start text-white relative z-10">
                    <div className="w-full h-24  flex px-4 pb-8">
                      <motion.div
                        variants={textMovement}
                        className="relative overflow-hidden px-4 py-[3px] flex items-center justify-center"
                      >
                        <motion.div
                          variants={textOverlay}
                          className="w-full h-full bg-black absolute text-overlay"
                        />
                        <div className="flex gap-2 items-center relative z-20 flex-none">
                          <div className="size-1.5 bg-black group-hover/slider:bg-white rounded-full" />
                          <p className="font-avenir font-bold text-black  group-hover/slider:text-white py-1.5">
                            {product.title}
                          </p>
                          <motion.div variants={imgDiv}>
                            <p>-- VIEW</p>
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
    x: 15,
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
    sliderRef:sliderRef,
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
          "grid grid-flow-col auto-cols-[minmax(20rem,1fr)] py-2 md:auto-cols-[minmax(30rem,1fr)] productSlider nav-slider gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none",
          {
            "auto-cols-[minmax(100%,1fr)]":
              cartState === "loading" || cartState === "error",
          }
        )}
        style={{ scrollBehavior: "smooth" }}>
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
            {products?.slice(0, 10).map((product, index) => (
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

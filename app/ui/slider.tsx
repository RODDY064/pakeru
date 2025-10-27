import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import Image from "next/image";
import { useBoundStore } from "@/store/store";
import { cn } from "@/libs/cn";
import { horizontalLoop } from "@/libs/functions";

const Slider = ({ containerHeight }: { containerHeight: any }) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const { slider, loadSliderWithCategory, isSliderLoading } = useBoundStore();
  const router = useRouter();

  // Load slider data on mount
  useEffect(() => {
    const load = async () => {
      await loadSliderWithCategory();
    };

    load();
  }, [loadSliderWithCategory]);



  useGSAP(() => {
    // Wait for slider data to load
    if (!slider || slider.length === 0) return;

    gsap.registerPlugin(Draggable, InertiaPlugin);

    const boxes = gsap.utils.toArray(".card") as HTMLElement[];
    let activeElement: HTMLElement | null = null;

    const loop = horizontalLoop(boxes, {
      paused: true,
      draggable: true,
      center: true,
      onChange: (element, index) => {
        activeElement?.classList.remove("active");
        element.classList.add("active");
        activeElement = element;
      },
    });

    const draggable = Draggable.get(".hero-slider-div");
    if (draggable) {
      draggable.vars.throwResistance = 6000;
      draggable.vars.dragResistance = 0.4;
      draggable.vars.edgeResistance = 0.8;
    }

    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    nextBtn?.addEventListener("click", () => {
      loop.next({ duration: 0.4, ease: "power1.inOut" });
    });
    prevBtn?.addEventListener("click", () => {
      loop.previous({ duration: 0.4, ease: "power1.inOut" });
    });
  }, [slider]); // Re-run when slider data changes

  if (isSliderLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <Image
          src="/icons/loader.svg"
          width={36}
          height={36}
          alt="Loading..."
        />
      </div>
    );
  }

  if (!slider || slider.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <p className="text-black/40 font-avenir">No categories available</p>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ maxHeight: containerHeight }}
      className="w-full h-full mt-10"
    >
      <div>
        <div
          ref={sliderRef}
          className="flex gap-1 md:gap-3 overflow-hidden text-white relative hero-slider-div"
        >
          {slider.map((product, index) => (
            <div
              key={product._id}
              onClick={() =>
                router.push(`/shop?category=${product._id}`)
              }
              className={cn(
                "w-[calc(90vw)] slider-element md:w-[calc(70vw)] card h-[350px] flex-shrink-0 relative lg:h-[calc(35vw)] flex-none flex items-center justify-center overflow-hidden",
                {
                  "pl-1 md:pl-3": index === 0,
                  "border border-black/20": index !== 0,
                }
              )}>
              <SlideCard product={product} isFirst={index === 0} />
            </div>
          ))}
        </div>
      </div>
      <div className="md:flex items-center justify-center gap-6 md:gap-10 my-10 hidden">
        <SliderButton />
      </div>
    </motion.div>
  );
};

// Extracted slide card component for clarity
const SlideCard = ({
  product,
  isFirst,
}: {
  product: any;
  isFirst: boolean;
}) => {
  const containerClasses = cn(
    "w-full h-full group/slider relative bg-[#f2f2f2] flex items-center justify-center will-change-transform preserve-3d backface-hidden overflow-hidden border border-black/10"
  );

  return (
    <>
      {isFirst ? (
        <div className="w-[calc(90vw)] md:w-[calc(70vw)re overflow-hidden h-full border border-black/20">
          <motion.div
            variants={ImgC}
            initial="hide"
            whileHover="show"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              mass: 0.7,
            }}
            className={containerClasses}
          >
            <Image
              src={product.mainImage}
              alt={product.title}
              fill
              className="object-cover object-center max-w-xl mx-auto bg-[#f2f2f2]"
              priority={isFirst}
              loading={isFirst ? "eager" : "lazy"}
            />

            <div className="w-full h-full flex text-white relative z-10 top-2">
              <div className="w-full h-24 flex px-4 pb-8">
                <motion.div className="relative overflow-hidden px-4 py-[3px] flex items-center justify-center">
                  <motion.div className="w-full h-full bg-black absolute text-overlay" />
                  <div className="flex gap-2 items-center relative z-20 flex-none">
                    <p className="font-avenir font-bold text-black group-hover/slider:translate-x-4 py-2">
                      {product.title}
                    </p>
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
          whileHover="show"
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            mass: 0.7,
          }}
          className={containerClasses}
        >
          <Image
            src={product.mainImage}
            alt={product.title}
            fill
            className="object-cover object-center max-w-xl mx-auto bg-[#f2f2f2]"
            priority={isFirst}
            loading={isFirst ? "eager" : "lazy"}
          />

          <div className="w-full h-full flex text-white relative z-10 top-2">
            <div className="w-full h-24 flex px-4 pb-8">
              <motion.div className="relative overflow-hidden px-4 py-[3px] flex items-center justify-center">
                <motion.div className="w-full h-full bg-black absolute text-overlay" />
                <div className="flex gap-2 items-center relative z-20 flex-none">
                  <p className="font-avenir font-bold text-black group-hover/slider:translate-x-4 py-2">
                    {product.title}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

// Animation variants
const ImgC = {
  show: {
    scale: 1.05,
  },
  hide: {
    scale: 1,
  },
};

// Slider button component (unchanged)
const SliderButton = () => {
  return (
    <>
      <button
        className="prev size-10 hover:bg-black cursor-pointer flex items-center justify-center border rounded-full group/a nav-prev transition-all duration-200"
        aria-label="Previous slide"
      >
        <Image
          src="/icons/arrow.svg"
          width={18}
          height={18}
          alt="Previous"
          className="rotate-90 group-hover/a:hidden transition-all duration-200"
        />
        <Image
          src="/icons/arrow-w.svg"
          width={18}
          height={18}
          alt="Previous"
          className="hidden rotate-90 group-hover/a:flex transition-all duration-200"
        />
      </button>

      <button
        className="next size-10 hover:bg-black cursor-pointer flex items-center justify-center border rounded-full group/w nav-next transition-all duration-200"
        aria-label="Next slide"
      >
        <Image
          src="/icons/arrow.svg"
          width={18}
          height={18}
          alt="Next"
          className="rotate-270 group-hover/w:hidden transition-all duration-200"
        />
        <Image
          src="/icons/arrow-w.svg"
          width={18}
          height={18}
          alt="Next"
          className="hidden rotate-270 group-hover/w:flex transition-all duration-200"
        />
      </button>
    </>
  );
};

export default Slider;

"use client";
import { cn } from "@/libs/cn";
import { handleNavigation } from "@/libs/navigate";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { memo } from "react";

interface ProductCardProps {
  type: "small" | "medium" | "large";
  cardRef?: React.RefObject<HTMLDivElement>;
  cardStyle?: string;
  productData: ProductData;
  showDetails?: boolean;
}

const ProductCard = ({
  type = "medium",
  cardRef,
  cardStyle,
  productData,
  showDetails = false,
}: ProductCardProps) => {
  const { openModal, updateColor, addToCart, closeModal, setRouteChange } =
    useBoundStore();
  const router = useRouter();

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();
    closeModal();
    handleNavigation(e, link, router, setRouteChange, 300);
  };

  // Default image fallback
  const imageSrc = productData?.mainImage?.url ?? "/images/hero-2.png";
  const productName = productData?.name?.toUpperCase() ?? "Unnamed Product";

  return (
    <div
      ref={cardRef}
      className={cn(
        "flex-shrink-0",
        {
          "mb-4 md:mb-12": type === "large",
          "mb-2 md:mb-8": type === "medium" || type === "small",
        },
        cardStyle
      )}
    >
      <motion.div
        variants={BoxAnimate}
        whileHover="show"
        whileTap="show"
        initial="hide"
        className={cn(
          "relative flex border border-black/5 rounded-sm ocursor-pointer transition-shadow duration-300 hover:border hover:z-20 hover:border-black/20 overflow-hidden",
          {
            "w-full h-[400px] md:h-[450px] lg:h-[460px] xl:h-[550px]": type === "large",
            "w-[250px] md:w-[300px] h-[350px] md:h-[400px]": type === "medium",
            "w-[200px] md:w-[250px] h-[300px]": type === "small",
          }
        )}>
        {/* Image Container */}
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            fill
            alt={productName}
            className="object-cover"
            sizes={cn({
              "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw": type === "large",
              "(max-width: 768px) 250px, 300px": type === "medium",
              "(max-width: 768px) 200px, 250px": type === "small",
            })}
            priority={type === "large"}
            quality={75}
          />
        </div>

        {/* Overlay and Link */}
        <div className="absolute inset-0 flex flex-col justify-end z-10">
          <Link
            href={`/product/${productData?._id}`}
            onClick={(e) => handleLink(e, `/product/${productData?._id}`)}
            className="absolute inset-0"
            aria-label={`View details for ${productName}`}
          />
          <div className="absolute top-2 left-2 p-1 px-2 flex items-center gap-1 bg-black rounded-sm">
            <div className="size-1.5 rounded-full bg-white" />
            <p className="text-white text-[10px] font-avenir">NEW</p>
          </div>
        </div>
      </motion.div>

      {/* Product Details */}
      <div
        className={cn(
          "pt-2 pb-4 px-3",
          {
            "w-full": type === "large",
            "w-[250px] md:w-[300px]": type === "medium",
            "w-[200px] md:w-[250px]": type === "small",
          }
        )}>
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "w-[60%] text-[14px] md:text-base font-avenir font-normal text-black/70",
              { "text-[13px]": type === "small" }
            )}
          >
            {productName}
          </div>
          {!showDetails && (
            <div className="w-[30%] text-right">
              <p
                className={cn(
                  "font-avenir font-normal text-[14px] md:text-base text-black/50",
                  { "text-[13px]": type === "small" }
                )}
              >
                GHS {productData?.price?.toFixed(2) ?? "N/A"}
              </p>
            </div>
          )}
        </div>

        {!showDetails && (
          <div className="mt-2 flex justify-between items-center">
            <div className="flex gap-1.5">
              {productData?.variants?.map((item) => (
                <button
                  key={item.color}
                  onClick={() => updateColor(productData?._id, item.color)}
                  className={cn(
                    "size-4 md:size-3.5 rounded-full p-0.5 hover:border border-black/50 transition-all duration-200",
                    {
                      "border-2 md:border-[1.5px] border-black":
                        item._id === productData?.selectedColor,
                    }
                  )}
                  aria-label={`Select color ${item.color}`}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: item.colorHex }}
                  />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <p className="font-avenir text-xs font-light">
                {productData?.numReviews ?? 0}
              </p>
              <Image
                src="/icons/star.svg"
                width={10}
                height={10}
                alt="Rating star"
                className="mt-0.5"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Animation Variants
const BoxAnimate = {
  show: { scale: 1.02, transition: { duration: 0.3 } },
  hide: { scale: 1, transition: { duration: 0.3 } },
};

// Memoize to prevent unnecessary re-renders
export default memo(ProductCard);
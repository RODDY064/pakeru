"use client";
import { buildCloudinaryUrl } from "@/libs/cloudinary";
import { cn } from "@/libs/cn";
import { handleNavigation } from "@/libs/navigate";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { memo, useEffect, useState } from "react";

interface ProductCardProps {
  type: "small" | "medium" | "large";
  cardRef?: React.RefObject<HTMLDivElement>;
  cardStyle?: string;
  productData: ProductData;
  hideDetails?: boolean;
}

const ProductCard = ({
  type = "medium",
  cardRef,
  cardStyle,
  productData,
  hideDetails = false,
}: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { openModal, updateColor, addToCart, closeModal, setRouteChange } =
    useBoundStore();
  const router = useRouter();

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();
    closeModal();
    handleNavigation(e, link, router, setRouteChange, 300);
  };

  // Image handling with Cloudinary support
  const imageSrc = productData?.mainImage?.url ?? "/images/hero-2.png";
  const isCloudinaryImage = imageSrc.includes("cloudinary");
  const productName = productData?.name?.toUpperCase() ?? "Unnamed Product";

  // Size configurations for responsive design
  const sizeConfig = {
    large: {
      container: "w-full h-[300px] md:h-[400px]  xl:h-[55vh]",
      details: "w-full",
      sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
      width: 800,
      height: 550,
    },
    medium: {
      container: "w-[250px] md:w-[300px] h-[300px] md:h-[400px]",
      details: "w-[250px] md:w-[300px]",
      sizes: "(max-width: 768px) 250px, 300px",
      width: 300,
      height: 400,
    },
    small: {
      container: "w-[200px] h-[250px] md:w-[250px] md:h-[300px]",
      details: "w-[200px] md:w-[150px]",
      sizes: "(max-width: 768px) 200px, 250px",
      width: 250,
      height: 300,
    },
  };

  const config = sizeConfig[type];

  // ---

  // Optional: Enhanced ProductCard with manual URL building
  // Use this if you need more control over transformations

  const renderImageWithCustomTransforms = () => {
    if (isCloudinaryImage) {
      // Extract public ID from Cloudinary URL
      const publicId = imageSrc.split("/upload/")[1]?.split(".")[0];

      if (publicId) {
        const transforms =
          type === "large"
            ? "c_pad,w_800,h_700,q_90,b_rgb:f2f2f2,f_auto,g_center"
            : type === "medium"
            ? "c_fit,w_300,h_400,q_90,f_auto,g_center"
            : "c_fit,w_250,h_300,q_90,b_rgb:f2f2f2,f_auto,f_auto,g_center";

        const optimizedUrl = buildCloudinaryUrl(publicId, transforms);

        // console.log(optimizedUrl)

        return (
          <Image
            src={optimizedUrl}
            fill
            alt={productName}
            className="object-cover bg-[#f2f2f2]"
            sizes={config.sizes}
            priority={type === "large"}
          />
        );
      }
    }

    // Fallback to regular Image
    return (
      <Image
        src={imageSrc}
        fill
        alt={productName}
        className="object-cover"
        sizes={config.sizes}
        priority={type === "large"}
        quality={75}
      />
    );
  };

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
      )}>
      <motion.div
        variants={cardAnimations}
        whileHover="hover"
        whileTap="tap"
        initial="initial"
        className={cn(
          "relative flex border border-black/5 rounded-sm cursor-pointer transition-shadow duration-300 hover:border hover:z-20 hover:border-black/20",
          config.container
        )}>
        {/* Image Container */}
        <div className="relative w-full h-full bg-[#f2f2f2]">
          {renderImageWithCustomTransforms()}
        </div>

        {/* Overlay and Interactive Elements */}
        <div className="absolute inset-0 flex flex-col justify-end z-10">
          <Link
            href={`/shop/${productData?._id}`}
            onClick={(e) => handleLink(e, `/shop/${productData?._id}`)}
            className="absolute inset-0"
            aria-label={`View details for ${productName}`}
          />

          {/* New Badge */}
          {productData?.createdAt &&
            (() => {
              const createdAtDate = new Date(productData.createdAt);
              const now = new Date();
              const diffDays =
                (now.getTime() - createdAtDate.getTime()) /
                (1000 * 60 * 60 * 24);
              return diffDays < 12 ? (
                <div className="absolute top-2 left-2 p-1 px-2 flex items-center gap-1 bg-black rounded-sm">
                  <div className="size-1.5 rounded-full bg-white" />
                  <p className="text-white text-[10px] font-avenir">NEW</p>
                </div>
              ) : null;
            })()}
        </div>
      </motion.div>

      {/* Product Details */}
      <ProductDetails
        type={type}
        productData={productData}
        productName={productName}
        hideDetails={hideDetails}
        updateColor={updateColor}
        containerWidth={config.details}
      />
    </div>
  );
};

// Extracted component for cleaner separation
const ProductDetails = ({
  type,
  productData,
  productName,
  hideDetails,
  updateColor,
  containerWidth,
}: {
  type: "small" | "medium" | "large";
  productData: ProductData;
  productName: string;
  hideDetails: boolean;
  updateColor: (id: string, color: string) => void;
  containerWidth: string;
}) => {
  const textSize =
    type === "small" ? "text-[13px]" : "text-[14px] md:text-base";

  return (
    <div className={cn("pt-2 pb-4 px-3", containerWidth)}>
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-[60%]",
            textSize
          )}
        >
         <p className="font-avenir  font-normal text-black/70">{productName}</p>
        </div>
        {!hideDetails && (
          <div className="w-[30%] text-right">
            <p
              className={cn("font-avenir font-normal text-black/50", textSize)}
            >
              GHS {productData?.price?.toFixed(2) ?? "N/A"}
            </p>
          </div>
        )}
      </div>

      {!hideDetails && (
        <div className="mt-2 flex justify-between items-center">
          <ColorVariants
            variants={productData?.variants?.map((variant) => ({
              ...variant,
              colorHex: variant.colorHex ?? "#000000",
            }))}
            selectedColor={productData?.selectedColor}
            productId={productData?._id}
            updateColor={updateColor}
          />
          <ReviewRating numReviews={productData?.numReviews ?? 0} />
        </div>
      )}
    </div>
  );
};

// Color selection component
const ColorVariants = ({
  variants,
  selectedColor,
  productId,
  updateColor,
}: {
  variants?: Array<{ _id: string; color: string; colorHex: string }>;
  selectedColor?: string;
  productId: string;
  updateColor: (id: string, color: string) => void;
}) => (
  <div className="flex gap-1.5">
    {variants?.map((variant) => (
      <button
        key={variant.color}
        onClick={() => updateColor(productId, variant.color)}
        className={cn(
          "size-4 md:size-3.5 rounded-full p-0.5 hover:border border-black/50 transition-all duration-200",
          {
            "border-2 md:border-[1.5px] border-black":
              variant._id === selectedColor,
          }
        )}
        aria-label={`Select color ${variant.color}`}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ backgroundColor: variant.colorHex }}
        />
      </button>
    ))}
  </div>
);

// Review rating component
const ReviewRating = ({ numReviews }: { numReviews: number }) => (
  <div className="flex items-center gap-1">
    <p className="font-avenir text-xs font-light">{numReviews}</p>
    <Image
      src="/icons/star.svg"
      width={10}
      height={10}
      alt="Rating star"
      className="mt-0.5"
    />
  </div>
);

// Refined animation variants
const cardAnimations = {
  initial: { scale: 1, transition: { duration: 0.1 }  },
  hover: { scale: 1.02, transition: { duration: 0.3 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

export default memo(ProductCard);

const calculateCardHeight = (type: "small" | "medium" | "large") => {
  if (typeof window === "undefined") return 400; // default for SSR

  const vh = window.innerHeight;

  switch (type) {
    case "large":
      return Math.min(Math.max(vh * 0.6, 450), 650);
    // 60% of viewport, but clamp between 450–650px
    case "medium":
      return Math.min(Math.max(vh * 0.45, 350), 500);
    case "small":
    default:
      return Math.min(Math.max(vh * 0.35, 250), 400);
  }
};

const useCardHeight = (type: "small" | "medium" | "large") => {
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const updateHeight = () => setHeight(calculateCardHeight(type));
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [type]);

  return height;
};

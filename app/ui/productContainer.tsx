"use client";

import { cn } from "@/libs/cn";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBoundStore } from "@/store/store";
import ProductCard from "@/app/ui/product-card";
import { useGsapSlider } from "@/libs/gsapScroll";
import { ProductData } from "@/store/dashbaord/products";
import SizeGuild from "./size-guild";
import ProductCare from "./productCare";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductContainer({ nameID }: { nameID: string }) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const imageDiv = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const imageDivSim = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const {
    isMobile,
    products,
    addToCart,
    openModal,
    closeModal,
    updateColor,
    updateSize,
    cartState,
    addBookmark,
    isBookmarked,
    setSizeGuild,
  } = useBoundStore();
  const [showButtons, setShowButtons] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [colorActive, setColorActive] = useState({ _id: "", name: "" });
  const [sizeSelected, setSizeSelected] = useState<{
    shown: boolean;
    active: boolean;
  }>({ shown: false, active: false });

  // Mobile scroll state
  const [mobileScrollIndex, setMobileScrollIndex] = useState(0);

  // Pinch zoom states
  const [pinchZoom, setPinchZoom] = useState({
    show: false,
    currentImageIndex: 0,
  });

  useEffect(() => {
    if (nameID && products.length > 0) {
      const singleProduct = products.find((item) => item._id === nameID);
      setProductData(singleProduct || null);
    }
  }, [nameID, products]);

  useEffect(() => {
    if (productData) {
      const activeVariant = productData.variants?.find(
        (variant) => variant._id === productData.selectedColor
      );

      if (activeVariant) {
        setColorActive({
          _id: activeVariant._id,
          name: activeVariant.color,
        });
      }
    }
  }, [productData]);

  // Reset mobile scroll when color changes
  useEffect(() => {
    if (isMobile) {
      setMobileScrollIndex(0);
      if (imageDiv.current) {
        imageDiv.current.scrollLeft = 0;
      }
    }
  }, [colorActive._id, isMobile]);

  const handleInteraction = () => {
    setShowButtons(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowButtons(false);
    }, 3000);
  };

  // Mobile scroll handler
  const handleMobileScroll = () => {
    if (!imageDiv.current || !isMobile) return;

    const scrollLeft = imageDiv.current.scrollLeft;
    const itemWidth = imageDiv.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setMobileScrollIndex(newIndex);
  };

  // Pinch detection on main images
  const pinchDetectionRef = useRef({
    isPinching: false,
    initialDistance: 0,
  });

  // Handle pinch start on main images
  const handleImageTouchStart = (e: React.TouchEvent, imageIndex: number) => {
    if (e.touches.length === 2) {
      const distance = Math.sqrt(
        Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
          Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
      );
      pinchDetectionRef.current = {
        isPinching: true,
        initialDistance: distance,
      };
    }
  };

  // Handle pinch move on main images
  const handleImageTouchMove = (e: React.TouchEvent, imageIndex: number) => {
    if (e.touches.length === 2 && pinchDetectionRef.current.isPinching) {
      e.preventDefault(); // Prevent default zoom

      const distance = Math.sqrt(
        Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
          Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
      );

      const scaleChange = distance / pinchDetectionRef.current.initialDistance;

      // If user pinches out (zoom in gesture), open the zoom modal
      if (scaleChange > 1.1) {
        setPinchZoom({
          show: true,
          currentImageIndex: imageIndex,
        });
        pinchDetectionRef.current.isPinching = false;
      }
    }
  };

  // Handle pinch end on main images
  const handleImageTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchDetectionRef.current.isPinching = false;
    }
  };

  // Handle image click for pinch zoom (fallback for non-touch devices)
  const handleImageClick = (imageIndex: number) => {
    if (!isMobile) {
      setPinchZoom({
        show: true,
        currentImageIndex: imageIndex,
      });
    }
  };

  useEffect(() => {
    if (!imageDiv.current) return;

    const el = imageDiv.current;

    if (isMobile) {
      // Mobile: Add scroll listener for image navigation
      el.addEventListener("scroll", handleMobileScroll);
      el.addEventListener("scroll", handleInteraction);
      el.addEventListener("touchstart", handleInteraction);
    } else {
      // Desktop: Add interaction listeners
      el.addEventListener("scroll", handleInteraction);
      el.addEventListener("click", handleInteraction);
      el.addEventListener("touchstart", handleInteraction);
    }

    return () => {
      if (isMobile) {
        el.removeEventListener("scroll", handleMobileScroll);
        el.removeEventListener("scroll", handleInteraction);
        el.removeEventListener("touchstart", handleInteraction);
      } else {
        el.removeEventListener("scroll", handleInteraction);
        el.removeEventListener("click", handleInteraction);
        el.removeEventListener("touchstart", handleInteraction);
      }
    };
  }, [isMobile]);

  

  useGSAP(() => {
    if (isMobile) return;
    if (!stickyRef.current || !imageDiv.current) return;

    const sticky = stickyRef.current;
    const image = imageDiv.current;

    // Clean up all ScrollTriggers for this component
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger === image || trigger.vars.pin === sticky) {
        trigger.kill();
      }
    });

    // Ensure images are loaded before creating ScrollTrigger
    const images = image.querySelectorAll("img");
    Promise.all(
      Array.from(images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => img.addEventListener("load", resolve))
      )
    ).then(() => {
      ScrollTrigger.create({
        trigger: image,
        start: "top top",
        end: "bottom bottom",
        pin: sticky,
        anticipatePin: 1,
        refreshPriority: -1,
      });

      ScrollTrigger.refresh();
    });
  }, [colorActive, productData, isMobile]);

  // buttons ref
  const prevBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const nextBtnRef = useRef<HTMLButtonElement>(
    null as unknown as HTMLButtonElement
  );
  const cardRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

  const { isStart, isEnd, currentPage, goToPage, totalPages } = useGsapSlider({
    sliderRef: imageDivSim,
    prevRef: prevBtnRef,
    nextRef: nextBtnRef,
    cardRef,
    speed: 0.5,
  });

  const handleAdd = (product: ProductData) => {
    if (!product.selectedSize) {
      if (!sizeSelected.active) {
        setSizeSelected((stat) => ({ ...stat, shown: true }));
        return;
      }
    }

    closeModal();
    addToCart(product);
    openModal("cart");
  };

  const handleSize = (id: string, newSize: string) => {
    setSizeSelected({ active: true, shown: false });
    updateSize(id, newSize);
  };

  // Mobile navigation functions
  const goToPreviousImage = () => {
    if (!imageDiv.current || !isMobile) return;
    const itemWidth = imageDiv.current.offsetWidth;
    const newIndex = Math.max(0, mobileScrollIndex - 1);
    imageDiv.current.scrollTo({
      left: newIndex * itemWidth,
      behavior: "smooth",
    });
  };

  const goToNextImage = () => {
    if (!imageDiv.current || !isMobile) return;
    const currentImages =
      productData?.variants.find((variant) => variant._id === colorActive._id)
        ?.images || [];
    const itemWidth = imageDiv.current.offsetWidth;
    const newIndex = Math.min(currentImages.length - 1, mobileScrollIndex + 1);
    imageDiv.current.scrollTo({
      left: newIndex * itemWidth,
      behavior: "smooth",
    });
  };

  // Get all product images
  const getProductImages = () => {
    const images: { _id: string; publicId: string; url: string }[] = [];
    const variantImg = productData?.variants.find(
      (variant) => variant._id === colorActive._id
    )?.images;
    if (variantImg) {
      const transformedImages = variantImg.map((img) => ({
        _id: img._id,
        publicId: img.productId,
        url: img.url,
      }));
      images.push(...transformedImages);
    }
    return images;
  };

  const currentImages =
    productData?.variants.find((variant) => variant._id === colorActive._id)
      ?.images || [];


      

  return (
    <div className="w-full min-h-dvh flex flex-col items-center text-black bg-white home-main">
      <div className="pt-18 opacity-0">hell</div>
      <div className="w-full flex flex-col md:flex-row pb-24 md:min-h-[150vh]">
        <div className="w-full md:w-[50%] relative">
          <div
            ref={imageDiv}
            className="w-full flex flex-row md:flex-col image-div relative overflow-x-auto md:overflow-x-hidden"
            style={{
              scrollSnapType: isMobile ? "x mandatory" : "none",
              scrollBehavior: "smooth",
    
            }}>
            {currentImages.map((img, index) => (
              <div
                key={index}
                className="w-full flex-none h-[400px] md:h-[70vh] lg:h-[80vh] relative overflow-hidden border flex items-center justify-center border-black/10 cursor-pointer"
                style={{
                  scrollSnapAlign: isMobile ? "start" : "none",
                }}
                onClick={() => handleImageClick(index)}
                onTouchStart={(e) => handleImageTouchStart(e, index)}
                onTouchMove={(e) => handleImageTouchMove(e, index)}
                onTouchEnd={handleImageTouchEnd}
              >
                <div className="w-[110%] h-[110%] absolute overflow-hidden">
                  <Image
                    src={img.url}
                    fill
                    className="object-cover select-none"
                    alt={productData?.name || "Product image"}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile navigation overlay */}
          {isMobile && (
            <div className="w-full h-full absolute top-0 pointer-events-none z-20 flex items-center">
              <div
                className={cn(
                  "flex w-full justify-between px-4 imageButton opacity-0 transition-opacity duration-300",
                  {
                    "opacity-100": showButtons,
                  }
                )}
              >
                <button
                  onClick={goToPreviousImage}
                  aria-label="Previous image"
                  className={cn(
                    "size-10 hover:bg-black cursor-pointer pointer-events-auto flex items-center justify-center border-black/30  invisible border rounded-full bg-white/80 backdrop-blur-sm transition-all",
                    {
                      visible: mobileScrollIndex > 0,
                    }
                  )}
                >
                  <Image
                    src="/icons/arrow.svg"
                    width={18}
                    height={18}
                    alt="arrow"
                    className="rotate-90"
                  />
                </button>
                <button
                  onClick={goToNextImage}
                  aria-label="Next image"
                  className={cn(
                    "size-10 hover:bg-black cursor-pointer pointer-events-auto flex items-center invisible justify-center border border-black/30 rounded-full bg-white/80 backdrop-blur-sm transition-all",
                    {
                      visible: mobileScrollIndex < currentImages.length - 1,
                    }
                  )}
                >
                  <Image
                    src="/icons/arrow.svg"
                    width={20}
                    height={20}
                    alt="arrow"
                    className="rotate-270"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Mobile image indicators */}
          {isMobile && currentImages.length > 1 && (
            <div className="flex flex-col items-center">
              <div className="w-[60%]  bottom-4 left-1/2 transform flex gap-2 z-20 items-center justify-center py-4">
                {currentImages.map((_, index) => (
                  <div
                    key={index}
                    className={cn("w-4 h-2 rounded-full transition-all", {
                      "bg-black w-6": index === mobileScrollIndex,
                      "bg-black/50": index !== mobileScrollIndex,
                    })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product details section */}
        <div
          ref={stickyRef}
          className="md:w-[50%] flex flex-col items-center pt-10  lg:pt-20"
        >
          <div className="w-full px-6 md:px-8 md:w-[90%] lg:w-[80%] xl:w-[60%]">
            <div className="flex justify-between items-center">
              <p className="text-black/50 text-sm font-[300] font-avenir">
                A440-2
              </p>
              <Image
                onClick={() => addBookmark(productData as ProductData)}
                src={
                  isBookmarked(
                    productData?._id as string,
                    productData?.selectedColor,
                    productData?.selectedSize
                  )
                    ? "/icons/bookmark2.svg"
                    : "/icons/bookmark.svg"
                }
                width={24}
                height={24}
                alt="bookmark"
                className="cursor-pointer"
              />
            </div>
            <div className="my-4">
              <p className="font-avenir text-sm font-[300] text-black/50 my-1">
                NEW
              </p>
              <p className="font-avenir font-[400] text-lg">
                {productData?.name.toLocaleUpperCase()}
              </p>
              <p className="text-black/50 font-avenir font-[400] text-md">
                GHS {productData?.price}
              </p>
              <div
                className="my-4 font-avenir text-lg responsive-description"
                dangerouslySetInnerHTML={{
                  __html: productData?.description || "",
                }}
              />
            </div>
            <div className="my-4 mt-10 md:mt-6">
              <div className="flex items-center gap-2">
                <p className="text-sm font-avenir font-[400]">COLORS </p>
                <div className="text-sm font-avenir font-[400] text-black/50 flex items-center gap-2 ml-4">
                  <div className="w-12 h-[1px] bg-black/30"></div>
                  <p className="font-avenir uppercase text-xs">
                    {colorActive.name}
                  </p>
                </div>
              </div>
              <div className="my-3 grid grid-cols-4 gap-3 md:gap-4 w-fit">
                {productData?.variants.map((variant, index) => (
                  <div key={index}>
                    <div
                      onClick={() => updateColor(productData?._id, variant._id)}
                      key={variant._id}
                      className={cn(
                        "size-16 md:w-18 lg:size-20 border border-black/30 rounded-xl cursor-pointer relative overflow-hidden p-[3px]",
                        {
                          "border-2":
                            variant._id === productData?.selectedColor,
                        }
                      )}
                    >
                      <div className="w-full h-full relative overflow-hidden rounded-lg">
                        <Image
                          src={variant.images[0].url}
                          fill
                          className="object-cover"
                          alt="hero"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full border-t mt-10 pt-4 border-black/30">
                <div className="w-full flex justify-between items-center mb-2">
                  <p
                    className={cn("text-sm font-avenir font-[400]", {
                      "text-red-500": sizeSelected.shown,
                    })}
                  >
                    SIZE
                  </p>
                    <p
                    onClick={setSizeGuild}
                    className="underline text-sm font-avenir font-[400] underline-offset-4 underline-black/40 text-black/30 cursor-pointer"
                    >
                    SIZE GUIDE
                    </p>
                </div>
                <div className="w-full flex items-center gap-2 md:gap-3 my-4">
                  {productData?.sizes?.map((item) => (
                    <div
                      onClick={() => handleSize(productData._id, item)}
                      key={item}
                      className={cn(
                        "w-12 md:w-16 h-10 flex items-center justify-center rounded-[8px] hover:bg-black hover:text-white border-[0.5px] border-black/10 cursor-pointer bg-gray-100",
                        {
                          "bg-black text-white":
                            item === productData.selectedSize,
                          "border-red-500 bg-red-100": sizeSelected.shown,
                        }
                      )}>
                      <p className="font-avenir text-xs">
                        {item.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                onClick={() => handleAdd(productData as ProductData)}
                className="mt-10 rounded py-2.5 flex items-center justify-center gap-3 w-full bg-black hover:bg-green-500 hover:border-green-500 border border-black/20 group/add cursor-pointer transition-all" >
                <p className="font-avenir font-[400] text-sm pt-[4px] text-white">
                  ADD TO CART
                </p>
                <div className="w-4 h-[1px] bg-white" />
                <Image
                  src="/icons/bag-w.svg"
                  width={18}
                  height={18}
                  alt="bag"
                  className=""
                />
              </div>
              <div className="mt-8 w-full pt-10">
                <ProductCare/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <div className="w-full mt-[60px] md:my-24 relative clear-both">
        <p className="font-avenir font-[400] text-md px-4 md:px-8">
          SIMILAR PRODUCTS
        </p>
        <div className="mt-4 px-10">
          <div className="w-full flex items-center justify-center">
            <div
              ref={imageDivSim}
              className={cn(
                "grid grid-flow-col auto-cols-[minmax(16rem,1fr)] py-4 md:px-4 md:auto-cols-[minmax(26rem,1fr)] productSlider nav-slider gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none",
                {
                  "auto-cols-[minmax(100%,1fr)]":
                    cartState === "loading" || cartState === "error",
                }
              )}
              style={{ scrollBehavior: "smooth" }}
            >
              {cartState === "loading" || cartState === "error" ? (
                <div className="min-w-[300px] h-[400px] flex items-center justify-center">
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
                  {products?.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      productData={product}
                      type="large"
                      cardRef={index === 0 ? cardRef : undefined}
                      cardStyle="md:mb-6"
                    />
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center mb-4">
            <div className="w-[80%] md:w-full mb-4 flex flex-wrap items-center justify-center gap-1 md:gap-3">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  className={`w-6 h-[5px] md:w-6 md:h-2 rounded-full ${
                    i === currentPage ? "bg-black w-8" : "bg-black/20"
                  }`}
                />
              ))}
            </div>
          </div>
          {cartState === "success" && (
            <div className="md:flex items-center justify-center gap-6 md:gap-12 hidden mt-2">
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
      </div>
      <SizeGuild gender="women" type="skirts" />

      {/* Pinch Zoom Modal */}
      {pinchZoom.show && (
        <PinchZoom
          title={productData?.name || "Product"}
          images={getProductImages()}
          show={pinchZoom.show}
          currentIndex={pinchZoom.currentImageIndex}
          onClose={() => setPinchZoom({ show: false, currentImageIndex: 0 })}
          onImageChange={(index) =>
            setPinchZoom((prev) => ({ ...prev, currentImageIndex: index }))
          }
        />
      )}
    </div>
  );
}

const PinchZoom = ({
  title,
  images,
  show,
  currentIndex,
  onClose,
  onImageChange,
}: {
  title: string;
  images: Array<{
    _id: string;
    publicId: string;
    url: string;
  }>;
  show: boolean;
  currentIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [isZooming, setIsZooming] = useState(false);
  const lastTouchRef = useRef({ distance: 0, center: { x: 0, y: 0 } });
  const initialTouchRef = useRef({ distance: 0, center: { x: 0, y: 0 } });

  // Get distance between two touch points
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Get center point between two touches
  const getCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsZooming(true);
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);

      lastTouchRef.current = { distance, center };
      initialTouchRef.current = { distance, center };
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(newIndex);
    setTransform({ scale: 1, x: 0, y: 0 }); // Reset zoom when changing images
  };

  const goToNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(newIndex);
    setTransform({ scale: 1, x: 0, y: 0 }); // Reset zoom when changing images
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 bg-white z-[90] w-full h-full p-6 md:p-10 text-black font-avenir">
      <div className="flex flex-col items-center ">
        <div className="w-full md:w-[80%] flex items-center justify-between pt-2">
          <p className="font-[400] text-lg">{title.toUpperCase()}</p>
          <div
            onClick={onClose}
            className="size-10 border  border-black/30 md:size-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/5"
          >
            <div className="w-[1.5px] h-[20px] md:h-[24px] bg-black rotate-[45deg]"></div>
            <div className="w-[1.5px] h-[20px] md:h-[24px] bg-black rotate-[-45deg]"></div>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex h-full   py-10 overflow-hidden flex-col items-center"
        onTouchStart={handleTouchStart}
      >
        <div
          ref={imageRef}
          className="w-full md:w-[80%] h-[80%] relative overflow-hidden select-none"
          style={{
            transform: `scale(${transform.scale}) translate(${
              transform.x / transform.scale
            }px, ${transform.y / transform.scale}px)`,
            transition: isZooming ? "none" : "transform 0.3s ease",
            transformOrigin: "center center",
          }}
        >
          <Image
            src={images[currentIndex].url}
            fill
            className="object-cover pointer-events-none"
            alt={title}
            priority
          />
        </div>

        {/* Navigation buttons - only show if not zoomed */}
        {transform.scale <= 1.1 && images.length > 1 && (
          <div className="absolute bottom-[12%]  md:w-[80%] flex justify-between z-10 w-full px-4 md:px-6">
            <button
              onClick={goToPrevious}
              className="cursor-pointer border border-black/20 size-10 rounded-full flex items-center justify-center hover:bg-black/5 bg-white/80 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <Image
                src="/icons/arrow.svg"
                width={20}
                height={20}
                alt="arrow"
                className="rotate-[90deg]"
              />
            </button>
            <button
              onClick={goToNext}
              className="cursor-pointer border border-black/20 size-10 rounded-full flex items-center justify-center hover:bg-black/5 bg-white/80 backdrop-blur-sm"
              aria-label="Next image"
            >
              <Image
                src="/icons/arrow.svg"
                width={20}
                height={20}
                alt="arrow"
                className="rotate-[-90deg]"
              />
            </button>
          </div>
        )}

        {/* Image indicator dots */}
        {images.length > 1 && (
          <div className="absolute bottom-[15%] left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onImageChange(index)}
                className={cn("w-2 h-2 rounded-full transition-all", {
                  "bg-black w-6": index === currentIndex,
                  "bg-black/30": index !== currentIndex,
                })}
              />
            ))}
          </div>
        )}

        {/* Zoom level indicator */}
        {transform.scale > 1.1 && (
          <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
            {Math.round(transform.scale * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

// deescription function

"use client";

import { cn } from "@/libs/cn";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useBoundStore } from "@/store/store";
import ProductCard from "@/app/ui/product-card";
import { useGsapSlider } from "@/libs/gsapScroll";
import { ProductData  } from "@/store/dashbaord/products";
import SizeGuild from "./size-guild";

export default function ProductContainer({ nameID }: { nameID: string }) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const imageDiv = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const imageDivSim = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const {
    isMobile,
    products,
    addToCart,
    setModal,
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
  const [sizeSelected, setSizeSelected] = useState<{
    shown: boolean;
    active: boolean;
  }>({ shown: false, active: false });

  // Pinch zoom states
  const [pinchZoom, setPinchZoom] = useState({
    show: false,
    currentImageIndex: 0,
  });

  useEffect(() => {
    if (nameID && products.length > 0) {
      const singleProduct = products.find((item) => item.id === nameID);
      setProductData(singleProduct || null);
    }
  }, [nameID, products]);

  const handleInteraction = () => {
    setShowButtons(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowButtons(false);
    }, 3000);
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
    if (isMobile) {
      setPinchZoom({
        show: true,
        currentImageIndex: imageIndex,
      });
    }
  };

  useEffect(() => {
    if (!imageDiv.current || isMobile) return;

    const el = imageDiv.current;

    el.addEventListener("scroll", handleInteraction);
    el.addEventListener("click", handleInteraction);
    el.addEventListener("touchstart", handleInteraction);

    return () => {
      el.removeEventListener("scroll", handleInteraction);
      el.removeEventListener("click", handleInteraction);
      el.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  useGSAP(() => {
    if (isMobile) return;

    if (!stickyRef.current || !imageDiv.current) return;

    const sticky = stickyRef.current;
    const image = imageDiv.current;

    gsap.to(image, {
      scrollTrigger: {
        trigger: sticky,
        start: "top 8%",
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
        scrub: 1,
        anticipatePin: 1,
      },
    });
  });

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
    setModal("cart");
  };

  const handleSize = (id: string, newSize: string) => {
    setSizeSelected({ active: true, shown: false });
    updateSize(id, newSize);
  };

  // Get all product images
  const getProductImages = () => {
    const images = [];
    if (productData?.mainImage) {
      images.push(productData.mainImage);
    }
    // Add additional images here - you might want to add them to your ProductData
    images.push("/images/hero-2.png"); // This is the second image you had hardcoded
    return images;
  };

  return (
    <div className="w-full min-h-dvh flex flex-col items-center text-black bg-white home-main   ">
      <div className="pt-18 opacity-0">hell</div>
      <div className="w-full flex flex-col md:flex-row ">
        <div className="w-full md:w-[50%] relative">
          <div
            ref={imageDiv}
            className="w-full flex flex-row md:flex-col  image-div relative overflow-x-scroll"
          >
            <div
              ref={cardRef}
              className="w-full h-[400px] flex-none md:h-[70vh] lg:h-[80vh] relative border border-black/10 cursor-pointer touch-pan-y"
              onClick={() => handleImageClick(0)}
              onTouchStart={(e) => handleImageTouchStart(e, 0)}
              onTouchMove={(e) => handleImageTouchMove(e, 0)}
              onTouchEnd={handleImageTouchEnd}
            >
              {productData?.mainImage && (
                <Image
                  src={productData.mainImage}
                  fill
                  priority
                  className="object-cover select-none"
                  alt={productData?.name || "Product image"}
                />
              )}
            </div>
            <div
              className="w-full h-[400px] flex-none  md:h-[70vh] lg:h-[80vh] relative border border-black/10 cursor-pointer touch-pan-y"
              onClick={() => handleImageClick(1)}
              onTouchStart={(e) => handleImageTouchStart(e, 1)}
              onTouchMove={(e) => handleImageTouchMove(e, 1)}
              onTouchEnd={handleImageTouchEnd}
            >
              <Image
                src="/images/hero-2.png"
                fill
                className="object-cover select-none"
                alt="hero"
              />
            </div>
          </div>
          <div className="w-full h-full  absolute top-0 pointer-events-none  md:hidden z-20 flex items-center ">
            <div
              className={cn(
                "flex w-full justify-between px-4 imageButton opacity-0",
                {
                  "opacity-100": showButtons,
                }
              )}
            >
              <button
                ref={prevBtnRef}
                aria-label="Scroll left"
                className={cn(
                  "size-10 hover:bg-black  cursor-pointer pointer-events-auto  flex items-center justify-center invisible border rounded-full",
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
                  className="rotate-90"
                />
              </button>
              <button
                ref={nextBtnRef}
                aria-label="Scroll right"
                className={cn(
                  "size-10 hover:bg-black cursor-pointer pointer-events-auto flex items-center invisible  justify-center border rounded-full",
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
                  className="rotate-270"
                />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={stickyRef}
          className="md:w-[50%] flex flex-col items-center pt-10 md:pt-4 lg:pt-20 "
        >
          <div className="w-full px-6 md:px-8 md:w-[90%] lg:w-[80%] xl:w-[60%]">
            <div className="flex  justify-between items-center">
              <p className="text-black/50 text-sm font-[300] font-avenir">
                A440-2
              </p>
              <Image
                onClick={() => addBookmark(productData as ProductData)}
                src={
                  isBookmarked(
                    productData?.id as string,
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
              <p className="my-4 text-black/60">{productData?.description}</p>
            </div>
            <div className="my-4 mt-10 md:mt-6">
              <div className="flex items-center gap-2">
                <p className="text-sm font-avenir font-[400]">COLORS </p>
                <div className="text-sm font-avenir font-[400] text-black/50 flex items-center gap-2 ml-4">
                  <div className="w-12 h-[1px] bg-black/30"></div>
                  {productData?.selectedColor}
                </div>
              </div>
              <div className="my-3 grid grid-cols-4 gap-3 md:gap-4 w-fit">
                {productData?.colors.map((item, index) => (
                  <div
                    onClick={() => updateColor(productData?.id, item)}
                    key={item}
                    className={cn(
                      "size-16 md:w-18 lg:size-20 border border-black/30 rounded-xl cursor-pointer relative overflow-hidden p-[2px]",
                      {
                        "border-2": item === productData?.selectedColor,
                      }
                    )}
                  >
                    <div className="w-full h-full relative overflow-hidden">
                      <Image
                        src="/images/hero-2.png"
                        fill
                        className="object-cover"
                        alt="hero"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full border-t  mt-10 pt-4 border-black/30">
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
                    SIZE GUILD
                  </p>
                </div>
                <div className="w-full flex items-center gap-2 md:gap-3 my-4">
                  {productData?.sizes.map((item) => (
                    <div
                      onClick={() => handleSize(productData.id, item)}
                      key={item}
                      className={cn(
                        "w-12 md:w-16 h-10 flex items-center justify-center rounded-[8px] hover:bg-black hover:text-white border-[0.5px] border-black/10 cursor-pointer bg-gray-100",
                        {
                          "bg-black text-white":
                            item === productData.selectedSize,
                          "border-red-500 bg-red-100": sizeSelected.shown,
                        }
                      )}
                    >
                      <p className="font-avenir text-xs">
                        {item.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                onClick={() => handleAdd(productData as ProductData)}
                className="mt-10 rounded py-2.5 flex items-center justify-center gap-3 w-full  bg-black  hover:bg-green-500 hover:border-green-500 border border-black/20  group/add cursor-pointer transition-all"
              >
                <p className="font-avenir font-[400] text-sm pt-[4px] text-white ">
                  ADD TO CART
                </p>
                <div className="w-4 h-[1px] bg-white " />
                <Image
                  src="/icons/bag-w.svg"
                  width={18}
                  height={18}
                  alt="bag"
                  className=""
                />
              </div>
              <div className="mt-8 border-t border-black/30 w-full pt-10">
                <div className="flex gap-10 items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Image
                      src="/icons/washing.svg"
                      width={44}
                      height={20}
                      alt="washing machine"
                      className="hidden lg:flex "
                    />
                    <Image
                      src="/icons/washing.svg"
                      width={32}
                      height={20}
                      alt="washing machine"
                      className="lg:hidden "
                    />
                    <p className="my-2 font-avenir text-[13px] font-[400] text-black/50">
                      MACHINE WASH 30
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image
                      src="/icons/fabric.svg"
                      width={44}
                      height={20}
                      alt="washing machine"
                      className="hidden lg:flex "
                    />
                    <Image
                      src="/icons/fabric.svg"
                      width={32}
                      height={20}
                      alt="washing machine"
                      className="lg:hidden "
                    />
                    <p className="my-2 font-avenir text-[13px] font-[400] text-black/50">
                      100% CUTTON
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-[50%]  md:my-24 ">
        <p className="font-avenir font-[400] text-md px-4 md:px-8">
          SIMILAR PRODUCTS
        </p>
        <div className="mt-4">
          <div className="w-full flex items-center justify-center ">
            <div
              ref={imageDivSim}
              className={cn(
                "grid grid-flow-col auto-cols-[90%] md:auto-cols-[30%] px-4 md:pl-8  xl:auto-cols-[25%] productSlider  gap-4 overflow-x-scroll overflow-hidden nav-slider",
                {
                  "auto-cols-[100%]":
                    cartState === "loading" || cartState === "error",
                }
              )}
            >
              {cartState === "loading" || cartState === "error" ? (
                <div className="min-w-[300px]  h-[400px] flex items-center justify-center">
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
                      key={product.id}
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
            <div className="md:flex items-center justify-center gap-6 md:gap-12 hidden mt-2 ">
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
      <SizeGuild />

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
  images: string[];
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
      <div className="flex items-center justify-between pt-2">
        <p className="font-[400] text-lg">{title.toUpperCase()}</p>
        <div
          onClick={onClose}
          className="size-10 border  border-black/30 md:size-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/5"
        >
          <div className="w-[1.5px] h-[20px] md:h-[24px] bg-black rotate-[45deg]"></div>
          <div className="w-[1.5px] h-[20px] md:h-[24px] bg-black rotate-[-45deg]"></div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex h-full  pt-4 pb-10 overflow-hidden"
        onTouchStart={handleTouchStart}
      >
        <div
          ref={imageRef}
          className="w-full h-[80%] relative overflow-hidden select-none"
          style={{
            transform: `scale(${transform.scale}) translate(${
              transform.x / transform.scale
            }px, ${transform.y / transform.scale}px)`,
            transition: isZooming ? "none" : "transform 0.3s ease",
            transformOrigin: "center center",
          }}
        >
          <Image
            src={images[currentIndex]}
            fill
            className="object-cover pointer-events-none"
            alt={title}
            priority
          />
        </div>

        {/* Navigation buttons - only show if not zoomed */}
        {transform.scale <= 1.1 && images.length > 1 && (
          <div className="absolute bottom-[12%] flex justify-between z-10 w-full px-4 md:px-6">
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

"use client";

import { useBoundStore } from "@/store/store";
import { motion, AnimatePresence, cubicBezier } from "motion/react";
import Image from "next/image";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import ProductCard from "./product-card";
import { useGsapSlider } from "@/libs/gsapScroll";
import { cn } from "@/libs/cn";
import SearchIcon from "./searchIcon";
import { MenuItem } from "@/store/modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useApiClient } from "@/libs/useApiClient";

export default function Menu() {
  const {
    modal,
    menuItems,
    toggleMenuItem,
    isSubBarRendered,
    openModal,
    bookMarks,
    closeModal,
    initializeMenuItems,
  } = useBoundStore();
  const [currentActiveItem, setCurrentActiveItem] = useState<string | null>(
    null
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const router = useRouter();

  const [mobileActiveItem, setMobileActiveItem] = useState<string | null>(null);
  const [showMobileSubMenu, setShowMobileSubMenu] = useState(false);
  const { get } = useApiClient();

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

  // Memoize active item to prevent unnecessary re-renders
  const activeMenuItem = useMemo(
    () => menuItems.find((item) => item.isActive),
    [menuItems]
  );

  useEffect(() => {
    const fetchMenuItems = async () => {
      await initializeMenuItems();
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      console.log("Menu loaded, reinitializing slider");
      reinitialize();
    }
  }, [menuItems]);

  // Stable transition handler
  const handleItemTransition = useCallback(
    (newActiveTitle: string | null) => {
      if (newActiveTitle !== currentActiveItem) {
        if (currentActiveItem !== null && newActiveTitle !== null) {
          // Smooth transition between items
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentActiveItem(newActiveTitle);
            setContentKey((prev) => prev + 1); // Force content refresh
            setIsTransitioning(false);
          }, 150); // Shorter transition time
        } else {
          // Direct update for first time or closing
          setCurrentActiveItem(newActiveTitle);
          setContentKey((prev) => prev + 1);
          setIsTransitioning(false);
        }
      }
    },
    [currentActiveItem]
  );

  const handleMobileMenuClick = useCallback(
    (itemTitle: string) => {
      console.log(itemTitle);
      if (mobileActiveItem === itemTitle) {
        setMobileActiveItem(null);
        setShowMobileSubMenu(false);
      } else {
        setMobileActiveItem(itemTitle);
        setShowMobileSubMenu(true);
      }
    },
    [mobileActiveItem]
  );

  useEffect(() => {
    const newActiveTitle = activeMenuItem?.category || null;
    handleItemTransition(newActiveTitle);
  }, [activeMenuItem, handleItemTransition]);

  const handlePush = (category: string) => {
    router.push(`/shop?category=${category.toLocaleLowerCase()}`);
    closeModal();
  };

  const MenuRender = React.memo(({ data }: { data: MenuItem }) => {
    const memoizedProducts = useMemo(
      () => data.menuProducts || [],
      [data.menuProducts]
    );

    return (
      <div className="w-full h-full">
        <div className="w-full flex">
          <div
            onClick={() => handlePush(data.category)}
            key={`${data?.image?._id}-img-${data.category}`}
            className={cn("h-fit cursor-pointer w-full")}
          >
            <div className="w-full min-h-[300px] xl:h-[350px] relative overflow-hidden border-b border-black/20">
              <Image
                src={data?.image?.url??"/images/image-fallback.png"}
                fill
                alt={data.category}
                className="object-contain"
                priority
              />
            </div>
            <p className="text-center font-avenir font-[400] my-3 text-sm uppercase">
              {data.category.toLocaleUpperCase()}
            </p>
          </div>
        </div>

        <div className="border-t border-black/20">
          <p className="font-avenir font-[400] text-sm text-black/50 p-6 pb-2">
            PRODUCTS
          </p>
          {data.menuProducts.length === 0 ? (
            <div className="w-full min-h-[300px] flex items-center justify-center">
              <p className="font-avenir text-black/40 text-lg">No product available</p>

            </div>
          ) : (
            <>
              <div className="w-full pl-6">
                {/* Fixed slider - removed conflicting layout animation */}
                <AnimatePresence mode="wait">
                  <div
                    ref={sliderRef}
                    className="w-full py-2 px-4 grid grid-flow-col auto-cols-[minmax(300,2fr)] md:auto-cols-[minmax(100,270px)]  pr-20 nav-slider "
                  >
                    <motion.div
                      key={`${data.category}-products-${contentKey}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 w-full relative "
                    >
                      {memoizedProducts.map((product, index) => (
                        <motion.div
                          className="w-full"
                          key={`${product._id}-${
                            product.selectedColor || "default"
                          }-${index}`}
                        >
                          <ProductCard
                            type="small"
                            productData={product}
                            cardRef={index === 0 ? cardRef : undefined}
                            hideDetails={true}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </AnimatePresence>
                <div className="flex flex-col items-center">
                  <div className="w-[80%] md:w-full my-2 flex flex-wrap items-center justify-center gap-1 md:gap-3">
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

                {/* Navigation buttons */}
                <div className="hidden md:flex items-center  justify-center gap-6 md:gap-12">
                  <button
                    ref={prevBtnRef}
                    aria-label="Scroll left"
                    className={cn(
                      "size-10 hover:bg-black invisible cursor-pointer flex items-center justify-center border rounded-full group/a nav-prev transition-all duration-200",
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
                      priority
                      className="rotate-90 group-hover/a:hidden transition-all duration-200"
                    />
                    <Image
                      src="/icons/arrow-w.svg"
                      width={18}
                      height={18}
                      alt="arrow"
                      priority
                      className="hidden rotate-90 group-hover/a:flex transition-all duration-200"
                    />
                  </button>

                  <button
                    ref={nextBtnRef}
                    aria-label="Scroll right"
                    className={cn(
                      "size-10 hover:bg-black cursor-pointer flex items-center invisible justify-center border rounded-full group/w nav-next transition-all duration-200",
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
                      priority
                      className="rotate-270 group-hover/w:hidden transition-all duration-200"
                    />
                    <Image
                      src="/icons/arrow-w.svg"
                      width={18}
                      height={18}
                      alt="arrow"
                      priority
                      className="hidden rotate-270 group-hover/w:flex transition-all duration-200"
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  });

  MenuRender.displayName = "MenuRender";

  // Simplified render function
  const RenderTAB = useCallback(
    (activeTitle: string) => {
      const activeMenuItem = menuItems.find(
        (item) => item.category === activeTitle
      );
      return activeMenuItem ? <MenuRender data={activeMenuItem} /> : null;
    },
    [menuItems]
  );

  const MobileMenuRender = React.memo(({ data }: { data: MenuItem }) => {
    const memoizedProducts = useMemo(
      () => data.menuProducts || [],
      [data.menuProducts]
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white"
      >
        {/* Mobile Images Grid */}
        <div className="w-full flex">
          <div
            key={`mobile-${data.category}-img`}
            className={cn("w-full h-fit cursor-pointer")}>
            <div className="w-full h-[200px]  relative border border-black/20">
              <Image
                src={data?.image?.url?? "/images/image-fallback.png"}
                fill
                className="object-contain"
                alt={data?.category}
              />
            </div>
            <div className="w-full border-b border-x border-black/20 py-2">
              <p className="text-center font-avenir font-[400] text-sm">
                {data?.category.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Trending Section */}
        <div className="mt-10 md:mt-6 px-4">
          <p className="font-avenir font-[400] text-sm text-black/30 mb-4">
            PRODUCTS
          </p>

          {/* Mobile Product Slider */}
          <div className="w-full flex gap-3 overflow-hidden nav-slider">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-${data.category}-products`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3"
              >
                {memoizedProducts.map((product, index) => (
                  <motion.div
                    key={`mobile-${product._id}-${index}`}
                    className="flex-shrink-0"
                  >
                    <ProductCard
                      type="small"
                      productData={product}
                      hideDetails={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  });

  MobileMenuRender.displayName = "MobileMenuRender";

  const RenderMobileTAB = useCallback(
    (activeTitle: string) => {
      const activeMenuItem = menuItems.find(
        (item) => item.category === activeTitle
      );
      return activeMenuItem ? <MobileMenuRender data={activeMenuItem} /> : null;
    },
    [menuItems]
  );

  const handleClick = () => {
    openModal("idle");

    setTimeout(() => {
      openModal("wardrobe");
    }, 270);
  };
  return (
    <AnimatePresence>
      {/* Desktop */}
      <motion.div
        variants={container}
        animate={modal ? "open" : "close"}
        initial="close"
        exit="close"
        key="desktop-menu"
        className="md:w-[35%] xl:w-[30%] h-full bg-white flex-col gap-4 relative z-20 menu-desktop hidden md:flex flex-none"
      >
        <div className="w-full h-full flex flex-none">
          <div className="w-full flex flex-none flex-col gap-6 pt-[120px] px-9">
            {menuItems?.length === 0 ? (
              <div className="w-full min-h-[300px] flex items-center justify-center">
                <div className="flex items-center gap-0">
                  <Image
                    src="/icons/loader.svg"
                    width={36}
                    height={36}
                    alt="loader"
                  />
                </div>
              </div>
            ) : (
              <>
                {menuItems.map((item, index) => (
                  <motion.div
                    variants={list}
                    onClick={() => toggleMenuItem(item.category)}
                    key={`menu-${item.category}-${index}`}
                    className={cn(
                      "font-avenir w-fit text-md hover:text-black/60 cursor-pointer relative text-black z-20 transition-colors duration-200",
                      {
                        "text-black/30": item.isActive,
                      }
                    )}
                  >
                    <p className="font-avenir uppercase">{item.category}</p>
                    <motion.div
                      className="w-full h-[1px]"
                      animate={{
                        backgroundColor: item.isActive
                          ? "#d97706"
                          : "rgba(0,0,0,0.2)",
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                ))}
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ type: "tween", delay: 0.5 }}
                  className="mt-6"
                >
                  <Link onClick={closeModal} href="/about-us">
                    <p className="font-avenir my-2 uppercase text-md cursor-pointer hover:text-black text-blue-600">
                      ABOUT US
                    </p>
                  </Link>
                  <Link onClick={closeModal} href="/faqs">
                    <p className="font-avenir uppercase text-md cursor-pointer  hover:text-black  text-blue-600">
                      FAQs
                    </p>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          <motion.div
            variants={menuCon}
            transition={{ type: "tween" }}
            animate={isSubBarRendered ? "visible" : "hide"}
            initial="hide"
            exit="hide"
            className="mini-[160%] h-full relative top-0 bg-white flex flex-none border-l border-black/20 "
          >
            <motion.div variants={menuChild} className="w-full h-full">
              <AnimatePresence mode="wait">
                {currentActiveItem && !isTransitioning && (
                  <motion.div
                    key={`content-${currentActiveItem}-${contentKey}`}
                    variants={contentFade}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="w-full h-full"
                  >
                    {RenderTAB(currentActiveItem)}
                  </motion.div>
                )}
              </AnimatePresence>
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
        key="mobile-menu"
        className="w-[100%] h-0 relative bg-white flex-col gap-4 pt-[120px] px-12 flex md:hidden menu-mobile"
      >
        {menuItems.map((item, index) => (
          <motion.div
            variants={list}
            key={index}
            onClick={() => handleMobileMenuClick(item.category)}
            className="font-avenir w-fit text-md md:text-lg cursor-pointer uppercase"
          >
            {item.category}
            <p className="w-full h-[1px] bg-amber-600"></p>
          </motion.div>
        ))}
        <motion.div variants={list}>
          <SearchIcon style="ml-0 mt-10" />
          <div onClick={handleClick} className="flex items-center gap-1 mt-4">
            <Image
              src={
                bookMarks.length > 0
                  ? "/icons/bookmark2.svg"
                  : "/icons/bookmark.svg"
              }
              width={18}
              height={18}
              alt="bookmark"
            />
            <p className="font-avenir font-[400] text-sm mt-[4px]">BOOKMARKS</p>
          </div>
          <Link
            onClick={() => closeModal()}
            href="/account?userPage=profile"
            className="flex items-center gap-1.5 mt-6"
          >
            <Image src="/icons/user.svg" width={16} height={16} alt="user" />
            <p className="font-avenir font-[400] text-sm mt-[8px]">ACCOUNT</p>
          </Link>
          <Link onClick={closeModal} href="/account?userPage=orders">
            <div className="flex items-center gap-1 mt-2">
              <Image
                src="/icons/orders.svg"
                width={18}
                height={18}
                alt="bookmark"
              />
              <p className="font-avenir font-[400] text-sm mt-[4px]">
                MY ORDERS
              </p>
            </div>
          </Link>
          <div onClick={async() => await signOut()} className="flex flex-col  mt-12">
            <p className=" px-4 w-[60%] border text-center bg-black/10 font-avenir text-md border-black cursor-pointer py-4 rounded-full">
              Logout
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* mobile nav */}
      <AnimatePresence mode="wait">
        {showMobileSubMenu && mobileActiveItem && (
          <motion.div
            key={`content-${showMobileSubMenu}-${contentKey}`}
            variants={contentFade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full h-full fixed top-0 pt-32 z-[99] bg-white"
          >
            {RenderMobileTAB(mobileActiveItem)}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// Optimized animation variants
const easingShow = cubicBezier(0.4, 0, 0.2, 1);

const container = {
  open: {
    x: 0,
    transition: {
      ease: easingShow,
      staggerChildren: 0.06,
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
    minWidth: "160%",
    opacity: 1,
    transition: {
      staggerChildren: 0,
      delayChildren: 0,
      duration: 0.3,
      ease: easingShow,
    },
  },
  hide: {
    width: "0%",
    opacity: 0,
    transition: {
      when: "afterChildren",
      duration: 0.2,
      ease: easingShow,
    },
  },
};

const menuChild = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      delay: 0.25,
    },
  },
  hide: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

// Improved content fade with shorter transitions
const contentFade = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: easingShow,
    },
  },
  hidden: {
    opacity: 0,
    y: 5,
    transition: {
      duration: 0.15,
      ease: easingShow,
    },
  },
};

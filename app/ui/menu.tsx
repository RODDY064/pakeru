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
import { signOut, useSession } from "next-auth/react";
import { useApiClient } from "@/libs/useApiClient";
import { debounce } from "lodash";

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
    menuLoading,
  } = useBoundStore();
  const [currentActiveItem, setCurrentActiveItem] = useState<string | null>(
    null
  );

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

  const activeMenuItem = useMemo(
    () => menuItems.find((item) => item.isActive),
    [menuItems]
  );
  const latestActiveItemRef = useRef<string | null>(null);

  useEffect(() => {
    initializeMenuItems();
  }, []);

  const groupedMenuItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    const ungrouped: MenuItem[] = [];

    menuItems.forEach((item) => {
      if (item.parentCategory) {
        const parent = item.parentCategory;
        if (!groups[parent]) {
          groups[parent] = [];
        }
        groups[parent].push(item);
      } else {
        ungrouped.push(item);
      }
    });

    return { groups, ungrouped };
  }, [menuItems]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const toggleGroup = useCallback((parent: string) => {
    setOpenGroups((prev) => {
      if (prev.has(parent)) {
        return new Set();
      }
      return new Set([parent]);
    });
  }, []);

  const debouncedHandleItemTransition = useCallback(
    debounce((newActiveTitle: string | null) => {
      if (newActiveTitle !== currentActiveItem) {
        setCurrentActiveItem(newActiveTitle);
      }
    }, 100), // 100ms debounce delay
    [currentActiveItem]
  );

  const handleMobileMenuClick = useCallback(
    (itemTitle: string) => {
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
    latestActiveItemRef.current = newActiveTitle;
    debouncedHandleItemTransition(newActiveTitle);
  }, [activeMenuItem, debouncedHandleItemTransition]);

  useEffect(() => {
    return () => {
      debouncedHandleItemTransition.cancel();
    };
  }, [debouncedHandleItemTransition]);

  const handlePush = (category: string) => {
    router.push(`/shop?category=${category.toLocaleLowerCase()}`);
    closeModal();
  };

  const MenuRender = React.memo(({ data }: { data: MenuItem }) => {
    const memoizedProducts = useMemo(
      () => data.menuProducts || [],
      [data.menuProducts]
    );

    const productsKey = useMemo(
      () => data.menuProducts?.map((p) => p._id).join("-") || "empty",
      [data.menuProducts]
    );

    const getContentKey = useCallback((category: string) => {
        return `content-${category}-${contentKey}`},[contentKey]);

    return (
      <div className="w-full h-full flex- flex-col ">
        <div className="w-full flex">
          <div
            onClick={() => handlePush(data.category)}
            key={getContentKey(data.category)}
            className={cn("h-fit cursor-pointer w-full")}>
            <Link href={`/shop?category=${data.category}`}>
              <div className="w-full h-[30dvh] relative overflow-hidden border-b border-black/20">
                <Image
                  src={data?.image?.url ?? "/images/image-fallback.png"}
                  fill
                  alt={data.category}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="text-center font-avenir font-[400] my-3 text-sm uppercase">
              {data.category.toLocaleUpperCase()}
            </p>
          </div>
        </div>

        <div className="border-t h-full  border-black/20">
          <p className="font-avenir font-[400] text-sm text-black/50 p-6 pb-2">
            PRODUCTS
          </p>
          {data.menuProducts.length === 0 ? (
            <div className="w-full min-h-[300px] flex items-center justify-center">
              <p className="font-avenir text-black/40 text-lg">
                No product available
              </p>
            </div>
          ) : (
            <>
              <div className="w-full pl-6">
                <AnimatePresence mode="wait">
                  <div
                    ref={sliderRef}
                    className="w-full py-2 px-4 grid grid-flow-col auto-cols-[minmax(300,2fr)] md:auto-cols-[minmax(100,270px)]  pr-20 nav-slider "
                  >
                    <motion.div
                      key={productsKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex gap-3 w-full relative"
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
              </div>
            </>
          )}
        </div>
      </div>
    );
  });

  MenuRender.displayName = "MenuRender";

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
        <div className="w-full flex">
          <div
            key={`mobile-${data.category}-img`}
            className={cn("w-full h-fit cursor-pointer")}
          >
            <div className="w-full h-[200px]  relative border border-black/20">
              <Image
                src={data?.image?.url ?? "/images/image-fallback.png"}
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

        <div className="mt-10 md:mt-6 px-4">
          <p className="font-avenir font-[400] text-sm text-black/30 mb-4">
            PRODUCTS
          </p>

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

  const { data: session } = useSession();

  const handleMenuClick = useCallback(
    (catID: string) => {
      toggleMenuItem(catID);
    },
    [toggleMenuItem]
  );

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
          <div className="w-full flex flex-none flex-col gap-1 pt-[120px] px-9 overflow-y-auto">
            {menuItems?.length === 0 || menuLoading ? (
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
                {/* Render grouped items */}
                {Object.entries(groupedMenuItems.groups).map(
                  ([parent, items]) => {
                    const isOpen = openGroups.has(parent);

                    return (
                      <motion.div
                        key={parent}
                        variants={list}
                        className="w-full overflow-hidden border-b border-black/10 last:border-b-0"
                      >
                        {/* Parent Header */}
                        <div
                          onClick={() => toggleGroup(parent)}
                          className="flex items-center justify-between cursor-pointer py-3 hover:opacity-70 transition-opacity"
                        >
                          <p className="font-avenir uppercase font-bold text-sm">
                            {parent}
                          </p>
                          <motion.div
                            animate={{ rotate: isOpen ? 0 : -90 }}
                            transition={{ duration: 0.3, ease: easingShow }}
                          >
                            <Image
                              src="/icons/arrow.svg"
                              width={16}
                              height={16}
                              alt="arrow"
                            />
                          </motion.div>
                        </div>

                        {/* Collapsible Content */}
                        <motion.div
                          initial="closed"
                          animate={isOpen ? "open" : "closed"}
                          variants={accordionContainer}
                          className="overflow-hidden"
                        >
                          <motion.div
                            className="pl-6 pb-3"
                            variants={accordionContent}
                          >
                            {items.map((item, index) => (
                              <div
                                key={`menu-${item.category}-${index}`}
                                className={cn(
                                  "font-avenir w-fit text-md hover:text-black/60 cursor-pointer relative text-black z-20 transition-colors duration-200 mb-3",
                                  {
                                    "text-black/30": item.isActive,
                                  }
                                )}
                                onClick={() => handleMenuClick(item.category)}
                              >
                                <p className="font-avenir uppercase">
                                  {item.category}
                                </p>
                                <motion.div
                                  className="w-full h-[1px]"
                                  animate={{
                                    backgroundColor: item.isActive
                                      ? "#d97706"
                                      : "rgba(0,0,0,0.2)",
                                  }}
                                  transition={{ duration: 0.2 }}
                                />
                              </div>
                            ))}
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    );
                  }
                )}

                {/* Render ungrouped items without parent header and no padding */}
                {groupedMenuItems.ungrouped.length > 0 && (
                  <div className="w-full flex flex-col gap-3 py-3">
                    {groupedMenuItems.ungrouped.map((item, index) => (
                      <motion.div
                        variants={list}
                        onClick={() => handleMenuClick(item.category)}
                        key={`ungrouped-${item.category}-${index}`}
                        className={cn(
                          "font-avenir w-fit text-md hover:text-black/60 cursor-pointer relative text-black z-20 transition-colors duration-200",
                          {
                            "text-black/30": item.isActive,
                          }
                        )}>
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
                  </div>
                )}

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ type: "tween", delay: 0.5 }}
                  className="mt-6 pb-6"
                >
                  <Link onClick={closeModal} href="/about-us">
                    <p className="font-avenir uppercase text-md cursor-pointer hover:text-black text-blue-600">
                      ABOUT US
                    </p>
                  </Link>
                  <Link onClick={closeModal} href="/help">
                    <p className="font-avenir uppercase text-md cursor-pointer hover:text-black text-blue-600">
                      HEPLS
                    </p>
                  </Link>
                  <Link onClick={closeModal} href="/help">
                    <p className="font-avenir uppercase text-md cursor-pointer hover:text-black text-blue-600">
                      POLICY
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
                {currentActiveItem && (
                  <motion.div
                    key={currentActiveItem}
                    variants={contentFade}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="w-full h-full">
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
        className="w-[100%]  pb-10  relative bg-white flex-col pt-[110px] px-12 flex md:hidden menu-mobile"
      >
        <div className="flex flex-col gap-2 overflow-auto nav-slider pb-[45px]">
          {/* Render grouped items for mobile */}
          {Object.entries(groupedMenuItems.groups).map(([parent, items]) => {
            const isOpen = openGroups.has(parent);

            return (
              <motion.div
                key={`mobile-${parent}`}
                variants={list}
                className="w-full o border-b border-black/10 last:border-b-0"
              >
                {/* Parent Header */}
                <div
                  onClick={() => toggleGroup(parent)}
                  className="flex items-center justify-between cursor-pointer py-3 hover:opacity-70 transition-opacity"
                >
                  <p className="font-avenir uppercase font-bold text-md">
                    {parent}
                  </p>
                  <motion.div
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.3, ease: easingShow }}
                  >
                    <Image
                      src="/icons/arrow.svg"
                      width={16}
                      height={16}
                      alt="arrow"
                    />
                  </motion.div>
                </div>

                {/* Collapsible Content */}
                <motion.div
                  layout
                  initial={false}
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: easingShow }}
                  className={cn("overflow-hidden", isOpen ? "pb-3" : "pb-0")}
                >
                  {isOpen && (
                    <div className="pl-4">
                      {items.map((item, index) => (
                        <div
                          key={`mobile-menu-${item.category}-${index}`}
                          onClick={() => handleMobileMenuClick(item.category)}
                          className="font-avenir w-fit text-md cursor-pointer uppercase mb-3"
                        >
                          {item.category}
                          <p className="w-full h-[1px] bg-amber-600"></p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}

          {/* Render ungrouped items for mobile without parent header and no padding */}
          {groupedMenuItems.ungrouped.length > 0 && (
            <div className="w-full flex flex-col gap-3 py-2">
              {groupedMenuItems.ungrouped.map((item, index) => (
                <motion.div
                  variants={list}
                  initial={false}
                  key={`mobile-ungrouped-${item.category}-${index}`}
                  onClick={() => handleMobileMenuClick(item.category)}
                  className="font-avenir w-fit text-md cursor-pointer uppercase"
                >
                  {item.category}
                  <p className="w-full h-[1px] bg-amber-600"></p>
                </motion.div>
              ))}
            </div>
          )}

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
              <p className="font-avenir font-[400] text-sm mt-[4px]">
                BOOKMARKS
              </p>
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

            {session?.user._id ? (
              <div
                onClick={async () => await signOut({ callbackUrl: "/sign-in" })}
                className="flex flex-col my-12"
              >
                <p className="px-4 w-[60%] border text-center bg-black/10 font-avenir text-md border-black cursor-pointer py-4 rounded-full">
                  Logout
                </p>
              </div>
            ) : (
              <Link href="/sign-in">
                <div className="flex flex-col my-12">
                  <p className="px-4 w-[60%] border text-center bg-black/10 font-avenir text-md border-black cursor-pointer py-4 rounded-full">
                    Sign in
                  </p>
                </div>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>
      {/* mobile nav */}
      <motion.div variants={menuChild} className="w-full h-full">
        <AnimatePresence mode="wait">
          {showMobileSubMenu && mobileActiveItem && (
            <motion.div
              key={`content-${showMobileSubMenu}-${contentKey}`}
              variants={contentFade}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full h-full fixed top-0 pt-32 z-[99] bg-white">
              {RenderMobileTAB(mobileActiveItem)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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

// Accordion animation variants - centralized
const accordionContainer = {
  open: {
    maxHeight: 600,
    transition: {
      duration: 0.3,
      ease: easingShow,
    },
  },
  closed: {
    maxHeight: 0,
    transition: {
      duration: 0.3,
      ease: easingShow,
    },
  },
};

const accordionContent = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

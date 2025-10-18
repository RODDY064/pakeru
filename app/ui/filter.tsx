"use client";

import { cn } from "@/libs/cn";
import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function Filter() {
  const {
    filter,
    filterState,
    filteritems,
    toggleSelection,
    setFilterView,
    setPriceRange,
    getFilterQueries,
    applyFiltersToURL,
    loadFiltersFromURL,
    clearAllSelections,
    hasActiveFilters,
    getActiveFilterCount,
    modal,
    categories,
    loadProducts,
    setFilterCategories,
    getCartIdByName,
  } = useBoundStore();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false);
  const [heights, setHeights] = useState<{ [key: string]: number }>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { get } = useApiClient();
    // Load categories first
  useEffect(() => {
    const loadCats = async () => {
      await setFilterCategories();
      setCategoriesLoaded(true);
    };
    loadCats();
  }, [setFilterCategories]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const newHeights: { [key: string]: number } = {};
    filteritems.forEach((filt) => {
      const el = contentRefs.current[filt.name];
      if (el) {
        newHeights[filt.name] = el.scrollHeight + 10;
      }
    });
    setHeights(newHeights);
  }, [filteritems]);

  // Load filters from URL only after categories are loaded
  useEffect(() => {
    if (!isInitialized && categoriesLoaded && categories.length > 0) {
      console.log("Loading filters from URL with categories:", categories.length);
      loadFiltersFromURL(searchParams);
      
      const hasParams = Array.from(searchParams.keys()).some(
        (key) => key !== "page" && searchParams.get(key)
      );

      if (hasParams) {
        console.log("Has URL params, loading products...");
        const timer = setTimeout(() => {
          const queries = getFilterQueries();
          console.log("Filter queries:", queries);
          loadProducts(false, 1, 25, queries);
        }, 200);

        return () => clearTimeout(timer);
      }

      setIsInitialized(true);
    }
  }, [
    categoriesLoaded,
    categories.length,
    searchParams,
    loadFiltersFromURL,
    getFilterQueries,
    loadProducts,
    isInitialized,
  ]);

  // Sync URL when filters change (only after initialization)
  useEffect(() => {
    if (isInitialized && categoriesLoaded && categories.length > 0) {
      applyFiltersToURL(searchParams, pathname, router);
    }
  }, [
    filteritems,
    categoriesLoaded,
    categories.length,
    applyFiltersToURL,
    pathname,
    router,
    searchParams,
    isInitialized,
  ]);

  const handlePriceChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setPriceMin(value);
    } else {
      setPriceMax(value);
    }

    const min =
      type === "min"
        ? value
          ? parseInt(value)
          : undefined
        : priceMin
        ? parseInt(priceMin)
        : undefined;

    const max =
      type === "max"
        ? value
          ? parseInt(value)
          : undefined
        : priceMax
        ? parseInt(priceMax)
        : undefined;

    setPriceRange(min, max);
  };

  const ApplyFilter = () => {
    const queries = getFilterQueries();
    console.log("Applying filters:", queries);
    loadProducts(true, 1, 25, queries);
    filterState(false);
  };

  const activeFilterCount = getActiveFilterCount();
  const hasFilters = hasActiveFilters();

  const renderPriceInputs = (isMobileView: boolean = false) => (
    <div className="flex flex-col gap-3 font-avenir">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium w-12">Min:</label>
        <input
          type="number"
          value={priceMin}
          min={0}
          placeholder="0"
          onChange={(e) => handlePriceChange("min", e.target.value)}
          className="flex-1 h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium w-12">Max:</label>
        <input
          type="number"
          value={priceMax}
          min={0}
          placeholder="No limit"
          onChange={(e) => handlePriceChange("max", e.target.value)}
          className="flex-1 h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
      {(priceMin || priceMax) && (
        <p className="text-xs text-black/60 font-avenir">
          GHS {priceMin || "0"} - GHS {priceMax || "∞"}
        </p>
      )}
    </div>
  );

  return (
    <>
      {!isMobile ? (
        <>
          <div
            className={`fixed w-full top-0 h-full flex flex-col   z-[99] ${
              filter
                ? "pointer-events-auto bg-black/70"
                : "pointer-events-none "
            }`}
          >
            <AnimatePresence>
              <motion.div
                variants={Parent}
                animate={filter ? "show" : "hide"}
                initial="hide"
                exit="hide"
                transition={{ ease: "easeInOut" }}
                className={cn(
                  "font-avenir text-black md:flex flex-col bg-black/70 h-full  border-black overflow-hidden"
                )}
              >
                <motion.div className="w-full h-full z-50   bg-white border-r-[0.5px] relative">
                  <motion.div className="w-full h-full flex-none overflow-hidden   p-10 items-start">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-avenir">FILTERS</h2>
                        {hasFilters && (
                          <span className="bg-black text-white text-xs size-6 py-1 flex items-center justify-center rounded-full">
                            {activeFilterCount}
                          </span>
                        )}
                      </div>
                      <div
                        onClick={() => filterState(!filter)}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        <div className="relative flex">
                          <div className="w-[16px] h-[1px] bg-black rotate-45"></div>
                          <div className="w-[16px] h-[1px] bg-black rotate-[-45deg] absolute"></div>
                        </div>
                        <p className="text-sm font-avenir font-medium pt-0.5">
                          CLOSE
                        </p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {filteritems.map((filt) => (
                        <motion.div
                          layout
                          animate={
                            filt.view ? { height: "auto" } : { height: 50 }
                          }
                          key={filt.name}
                          className="overflow-hidden border-b border-dashed"
                        >
                          <div className="py-4">
                            <div className="w-full flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <p className="text-md font-avenir pt-[3px]">
                                  {filt.name.toUpperCase()}
                                </p>
                                {filt.selected.length > 0 && (
                                  <div className="bg-black text-white text-center text-[11px] size-5 pt-1 flex items-center justify-center flex-none rounded-full">
                                    {filt.selected.length}
                                  </div>
                                )}
                              </div>
                              <div
                                onClick={() => setFilterView(filt.name)}
                                className="cursor-pointer"
                              >
                                <Image
                                  src="/icons/arrow.svg"
                                  width={16}
                                  height={16}
                                  alt="arrow"
                                  className={cn("transition-transform", {
                                    "rotate-[-180deg]": filt.view,
                                  })}
                                />
                              </div>
                            </div>

                            <div
                              ref={(el) => {
                                contentRefs.current[filt.name] = el;
                              }}
                              className={cn("mt-4 grid gap-1.5 grid-cols-2  ", {
                                "grid-cols-1 h-fit ": filt.name === "sort by",
                              })}
                            >
                              {filt.name === "price"
                                ? renderPriceInputs()
                                : Array.isArray(filt.content) &&
                                  filt.content.map(
                                    (item: string, index: number) => {
                                      const targetValue =
                                        filt.type === "category"
                                          ? getCartIdByName(
                                              item as string
                                            )?.toLowerCase() ?? ""
                                          : (item as string);
                                      const isSelected =
                                        filt.selected.includes(targetValue);

                                      return (
                                        <div
                                          onClick={() =>
                                            toggleSelection(filt.name, item)
                                          }
                                          key={index}
                                          className="flex gap-2 items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                                        >
                                          <div className="size-3.5 border rounded-full p-[1px] flex items-center justify-center">
                                            <motion.div
                                              animate={
                                                isSelected
                                                  ? { opacity: 1 }
                                                  : { opacity: 0 }
                                              }
                                              transition={{ duration: 0.3 }}
                                              className="w-full h-full bg-black rounded-full"
                                            />
                                          </div>
                                          <p className="font-avenir text-black/70 text-sm">
                                            {item.toUpperCase()}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div
                      onClick={ApplyFilter}
                      className="mt-12 w-full py-3 text-center bg-black rounded-full cursor-pointer"
                    >
                      <p className="font-avenir text-white text-md">
                        Apply Filter
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* { filter && <div className="bg-black/70 w-full h-full absolute top-0"/>} */}
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            variants={mobileParent}
            transition={{ ease: "easeInOut" }}
            animate={filter ? "show" : "hide"}
            initial="hide"
            exit="hide"
            className={`fixed bottom-0   flex flex-col justify-end z-[999] `}
          >
            <div
              className={cn(
                "w-screen vail absolute h-full bg-black/60  opacity-0 top-0 left-0 backdrop-blur-sm",
                { " opacity-100": filter }
              )}
            ></div>
            {!modal && (
              <motion.div
                variants={mfiltButton}
                transition={{ ease: "easeInOut" }}
                className="w-screen pb-2 bg-white flex items-center justify-center z-50 mobile-nav-filt"
              >
                <motion.div
                  variants={mFiltTextB}
                  transition={{ ease: "easeInOut" }}
                  className="flex w-fit items-center justify-between px-4 py-1 rounded-[2px] relative  cursor-pointer"
                >
                  <div
                    onClick={() => filterState(!filter)}
                    className="w-full flex items-center justify-center"
                  >
                    <div
                      onClick={() => filterState(!filter)}
                      className="fixed bottom-4 flex  py-2  px-5 rounded-full tex-sm bg-black text-white cursor-pointer font-avenir items-center justify-center gap-1"
                    >
                      <p>Filter</p>
                      <Image
                        src="/icons/filter-w.svg"
                        width={16}
                        height={16}
                        alt="filter"
                      />
                    </div>
                    <div className="w-full flex justify-end px-4">
                      <Image
                        src="/icons/cancel.svg"
                        width={18}
                        height={18}
                        alt="cancel"
                        className={cn("flex", { hidden: !filter })}
                      />
                    </div>
                  </div>
                  <motion.div
                    variants={mobFiltItem}
                    transition={{ ease: "easeInOut" }}
                    className="absolute top-10   opacity-0  border-t-[0.5px] w-full left-0 px-4 pt-4"
                  >
                    <motion.div className="w-auto relative  border-black ">
                      {filteritems.map((filt) => (
                        <motion.div
                          layout
                          animate={
                            filt.view ? { height: "auto" } : { height: 50 }
                          }
                          key={filt.name}
                          className="overflow-hidden border-b border-dashed"
                        >
                          <div className="py-4">
                            <div className="w-full flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <p className="text-md font-avenir pt-[3px]">
                                  {filt.name.toUpperCase()}
                                </p>
                                {filt.selected.length > 0 && (
                                  <div className="bg-black text-white text-center text-[11px] size-5  flex items-center justify-center flex-none rounded-full">
                                    {filt.selected.length}
                                  </div>
                                )}
                              </div>
                              <div
                                onClick={() => setFilterView(filt.name)}
                                className="cursor-pointer"
                              >
                                <Image
                                  src="/icons/arrow.svg"
                                  width={16}
                                  height={16}
                                  alt="arrow"
                                  className={cn("transition-transform", {
                                    "rotate-[-180deg]": filt.view,
                                  })}
                                />
                              </div>
                            </div>

                            <div
                              ref={(el) => {
                                contentRefs.current[filt.name] = el;
                              }}
                              className={cn("mt-4 grid gap-1.5 grid-cols-2  ", {
                                "grid-cols-1 h-fit ": filt.name === "sort by",
                              })}
                            >
                              {filt.name === "price"
                                ? renderPriceInputs()
                                : Array.isArray(filt.content) &&
                                  filt.content.map(
                                    (item: string, index: number) => {
                                      const targetValue =
                                        filt.type === "category"
                                          ? getCartIdByName(
                                              item as string
                                            )?.toLowerCase() ?? ""
                                          : (item as string);
                                      const isSelected =
                                        filt.selected.includes(targetValue);

                                      return (
                                        <div
                                          onClick={() =>
                                            toggleSelection(filt.name, item)
                                          }
                                          key={index}
                                          className="flex gap-2 items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                                        >
                                          <div className="size-3.5 border rounded-full p-[1px] flex items-center justify-center">
                                            <motion.div
                                              animate={
                                                isSelected
                                                  ? { opacity: 1 }
                                                  : { opacity: 0 }
                                              }
                                              className="w-full h-full bg-black rounded-full"
                                            />
                                          </div>
                                          <p className="font-avenir text-black/70 text-sm">
                                            {item.toUpperCase()}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      <button
                        onClick={ApplyFilter}
                        className="mt-6 w-full py-3 text-center bg-black rounded-full cursor-pointer"
                      >
                        <p className="font-avenir text-white text-md">
                          Apply Filters
                        </p>
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

// Improved animation variants
const Parent = {
  show: {
    width: "600px",
    transition: { duration: 0.3 },
  },
  hide: {
    width: "0px",
    transition: { duration: 0.3 },
  },
};

const mobileParent = {
  show: {
    height: "100%",
    paddingBottom: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.02,
    },
  },
  hide: {
    height: "auto",
    transition: {
      duration: 0.3,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const mfiltButton = {
  show: {
    height: "75%",
    alignItems: "flex-start",
    backgroundColor: "white",
    paddingTop: 16,
    transition: {
      duration: 0.3,
      delay: 0.1,
    },
  },
  hide: {
    height: "auto",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    paddingTop: 8,
    transition: {
      duration: 0.2,
    },
  },
};

const mFiltTextB = {
  show: {
    width: "100%",
    justifyContent: "space-between",
    color: "black",
    transition: {
      duration: 0.3,
    },
  },
  hide: {
    width: "120px",
    justifyContent: "center",
    color: "white",
    transition: {
      duration: 0.25,
    },
  },
};

const mobFiltItem = {
  show: {
    opacity: 1,
    transition: {
      delay: 0.4,
    },
  },
  hide: {
    opacity: 0,
  },
};

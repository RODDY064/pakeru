"use client";
import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useEffect } from "react";
import Icon from "./Icon";
import ProductCard from "./product-card";

export default function Search() {
  const { isSearching, toggleSearch, search, setNavSearch, searchProduct } =
    useBoundStore();

 useEffect(() => {
  const timeout = setTimeout(() => {
    const modal = document.querySelector(".searchModal") as HTMLElement | null;
    if (modal) {
      modal.style.visibility = "visible";
    }
  }, 200); 

  return () => clearTimeout(timeout); 
}, []);


  useEffect(() => {
    const searchParent = document.querySelector(".searchParent");
    const container = document.querySelector(".searchCon");
    let scrollTimeout: string | number | NodeJS.Timeout | undefined;

    const handleScroll = () => {
      // Add border immediately on scroll
      searchParent?.classList.add("border-t");

      // Clear existing timeout
      clearTimeout(scrollTimeout);

      // Set timeout to remove border after 2 seconds of no scrolling
      scrollTimeout = setTimeout(() => {
        searchParent?.classList.remove("border-t");
      }, 2000);
    };

    container?.addEventListener("scroll", handleScroll);

    // Cleanup function
    return () => {
      container?.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const renderSearchContent = () => {
    if (!search.trim()) {
      return (
        <div className="flex flex-col  items-center justify-center h-full text-gray-500">
          <Image
            src="/icons/search.svg"
            width={32}
            height={32}
            alt="search"
            className="mb-4 opacity-30"
          />
          <p className="text-lg font-avenir font-[400]">
            Start typing to search products
          </p>
          <p className="text-sm mt-1 font-avenir font-[400] text-black/30">
            Search by product name or category
          </p>
        </div>
      );
    }

    if (searchProduct.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className=" mb-4">
            <Image
              src="/icons/search.svg"
              width={32}
              height={32}
              alt="search"
              className="opacity-30"
            />
          </div>
          <p className="font-avenir font-[400] text-lg">No products found</p>
          <p className="mt-1 font-avenir text-sm text-black/30">
            Try a different search term
          </p>
        </div>
      );
    }

    return searchProduct.map((product) => (
      <ProductCard
        key={product.id}
        productData={product}
        type="large"
        cardStyle="mb-4 md:mb-4"
      />
    ));
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        animate={isSearching ? "visible" : "hide"}
        initial={{ height: "0%", opacity: 0 }}
        exit="hide"
        className={`fixed top-0 z-[99] w-full bg-white flex flex-col searchModal invisible items-center opacity-0 h-0 left-0 font-avenir overflow-hidden ${
          isSearching ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="w-full flex items-center flex-none justify-between px-4 md:px-24">
          <div className="hidden md:flex" />
          <motion.div variants={logoVariants}>
            <Image
              src="/icons/logoText.svg"
              width={130}
              height={130}
              alt="logo"
              className="my-8"
            />
          </motion.div>
          <motion.div variants={closeVariants}>
            <Icon name="close" onToggle={toggleSearch} />
          </motion.div>
        </div>

        <motion.div
          variants={searchContainerVariants}
          className="mt-10 w-full flex items-center flex-col"
        >
          <motion.div
            variants={searchBoxVariants}
            onClick={() => document.getElementById("search-input")?.focus()}
            className="w-[90%] rounded-full md:w-[50%] xl:w-[35%] h-16 md:h-20 border overflow-hidden items-center flex cursor-text hover:border-gray-400 transition-colors"
          >
            <motion.div
              variants={searchIconVariants}
              className="mr-4 flex flex-none pl-6"
            >
              <Image
                src="/icons/search.svg"
                width={24}
                height={24}
                alt="search"
              />
            </motion.div>
            <motion.input
              variants={inputVariants}
              id="search-input"
              value={search}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full flex-none focus:outline-none text-md mt-1.5 placeholder:mt-2"
              placeholder="Search for a product"
              autoFocus
            />
            {search && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNavSearch("");
                }}
                className="mr-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Image
                  src="/icons/close.svg"
                  width={16}
                  height={16}
                  alt="clear"
                />
              </button>
            )}
          </motion.div>

          {search && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-gray-600 font-avenir font-[400]"
            >
              {searchProduct.length} result
              {searchProduct.length !== 1 ? "s" : ""} for "{search}"
            </motion.p>
          )}
        </motion.div>

        <motion.div
          variants={searchParentVariants}
          className="w-full h-full searchParent  border-black/10 mt-6 items-center justify-center flex"
        >
          <div
            className={cn("w-[90%] xl:w-[80%] h-full pt-5 pb-72 px-2  gap-6  grid md:grid-cols-2 lg:grid-cols-3  overflow-y-scroll searchCon",{
              "flex items-center justify-center": searchProduct.length === 0 
            })}>
            {renderSearchContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const overlayVariants = {
  visible: {
    height: ["0%", "20%", "100%"],
    opacity: [0, 1, 1],
    transition: {
      height: {
        duration: 0.5,
        ease: "easeOut",
        times: [0, 0.15, 1],
      },
      opacity: {
        duration: 0.3,
        ease: "easeOut",
        times: [0, 1, 1],
      },
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
  hide: {
    eight: ["100%", "20%", "0%"],
    opacity: [1, 1, 0],
    transition: {
      height: {
        duration: 0.5,
        ease: "easeIn",
      },
      opacity: {
        duration: 0.2,
        ease: "easeIn",
      },
      staggerChildren: 0.045,
      staggerDirection: -1,
    },
  },
};

const logoVariants = {
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  hide: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

const searchContainerVariants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
      staggerChildren: 0.06,
    },
  },
  hide: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const searchBoxVariants = {
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
  hide: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const searchIconVariants = {
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
  hide: {
    opacity: 0,
    x: -10,
    rotate: -90,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

const inputVariants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
      delay: 0.2,
    },
  },
  hide: {
    opacity: 0,
    x: 10,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

const closeVariants = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
  hide: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

const searchParentVariants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      delay: 0.5,
    },
  },
  hide: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

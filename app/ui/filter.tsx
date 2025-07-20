"use client";

import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function Filter() {
  const { filter, filterState, filteritems, toggleSelection, setFilterView, modal } =
    useBoundStore();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [heights, setHeights] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const newHeights: { [key: string]: number } = {};
    filteritems.forEach((filt) => {
      const el = contentRefs.current[filt.name];
      if (el) {
        newHeights[filt.name] = el.scrollHeight;
      }
    });
    setHeights(newHeights);
  }, [filteritems]);

  // useEffect(() => {
  //   console.log(filteritems, "item");
  // }, [filteritems]);

  return (
    <>
      {!isMobile ? (
        <>
          <div
            className={cn(
              "fixed w-full top-0 h-screen bg-black/60 backdrop-blur-sm z-[90] invisible opacity-0",
              {
                "visible opacity-100": filter,
              }
            )}
          />
          <motion.div
            variants={Parent}
            animate={filter ? "show" : "hide"}
            initial="hide"
            className={cn(
              "font-avenir text-black md:flex flex-col bg-white   z-[99]  py-4 hidden h-full relative mt-[-2px] border-black"
            )}>
            <motion.div
              variants={ParentSub}
              className="fixed h-full z-50 w-0   bg-white border-r-[0.5px] "
            >
              <motion.div
                variants={filtButton}
                onClick={() => filterState(!filter)}
                className="flex w-[120px] items-center justify-between p-6 py-4 text-white border-b-[0.5px] bg-black border-l-[0.5px] border-black cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <p className="text-md font-extrabold">FILTER</p>
                  <Image
                    src="/icons/filter-w.svg"
                    width={20}
                    height={16}
                    alt="filter"
                    className={cn("flex", { hidden: filter })}
                  />
                  <Image
                    src="/icons/filter.svg"
                    width={20}
                    height={16}
                    alt="filter"
                    className={cn("hidden", { flex: filter })}
                  />
                </div>
                <Image
                  src="/icons/cancel.svg"
                  width={18}
                  height={18}
                  alt="cancel"
                  className={cn("flex", { hidden: !filter })}
                />
              </motion.div>
              <motion.div className="w-auto h-full flex-none overflow-hidden  border-black pt-4 pl-5">
                {filteritems.map((filt) => (
                  <motion.div
                    layout
                    animate={
                      filt.view
                        ? { height: heights[filt.name] }
                        : { height: 40 }
                    }
                    key={filt.name}
                    className="mr-6 pb-4  overflow-hidden border-b border-dashed mt-4" >
                    <div className="w-full flex justify-between">
                      <p className="text-md font-semibold">
                        {filt.name.toLocaleUpperCase()}
                      </p>
                      <div
                        onClick={() => setFilterView(filt.name)}
                        className="cursor-pointer" >
                        <Image
                          src="/icons/arrow.svg"
                          width={16}
                          height={16}
                          alt="arrow"
                          className={cn("",{
                            "rotate-[-180deg]": filt.view
                          })}
                        />
                      </div>
                    </div>
                    <div
                      className={cn("mt-4 grid gap-1.5 grid-cols-2 ", {
                        "grid-cols-1 max-h-[100px] ": filt.name === "sort by",
                      })}>
                      {filt.content.map((item, index) => (
                        <div
                          onClick={() => toggleSelection(filt.name, item)}
                          key={index}
                          className={cn(
                            "flex gap-2 items-center cursor-pointer "
                          )} >
                          <div className="size-3.5 border rounded-full p-[1px] flex items-center justify-center">
                            <motion.div 
                            animate={filt.selected.includes(item) ? { opacity:1}:{ opacity:0}}
                            className="w-full h-full bg-black rounded-full"></motion.div>
                          </div>
                          <p className="font-semibold text-black/70 text-sm">
                            {item.toLocaleUpperCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      ) : (
        <motion.div
          variants={mobileParent}
          animate={filter ? "show" : "hide"}
          initial="hide"
          className="fixed h-[100%] flex flex-col justify-end z-[999] bottom-0" >
          <div
            className={cn(
              "w-screen vail absolute h-full bg-black/60 invisible opacity-0 top-0 left-0 backdrop-blur-sm",
              {
                "visible opacity-100": filter,
              }
            )}
          ></div>
         {!modal &&  <motion.div
            variants={mfiltButton}
            className="w-screen pb-2 flex items-center justify-center z-20 mobile-nav-filt" >
            <motion.div
              variants={mFiltTextB}
              className="flex w-fit items-center justify-between px-4 py-1 rounded-[2px] relative text-white bg-black border-black cursor-pointer">
              <div 
              onClick={() => filterState(!filter)}
              className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                <p className="text-md font-extrabold">FILTER</p>
                <Image
                  src="/icons/filter-w.svg"
                  width={16}
                  height={16}
                  alt="filter"
                  className={cn("flex", { hidden: filter })}
                />
                <Image
                  src="/icons/filter.svg"
                  width={16}
                  height={16}
                  alt="filter"
                  className={cn("hidden", { flex: filter })}
                />
              </div>
              <Image
                src="/icons/cancel.svg"
                width={18}
                height={18}
                alt="cancel"
                className={cn("flex", { hidden: !filter })}
              />
              </div>
               <motion.div 
               variants={mobFiltItem}
               className="absolute top-10   border-t-[0.5px] w-full left-0 px-4 pt-4">
                <motion.div className="w-auto relative  border-black ">
               
                {filteritems.map((filt) => (
                  <motion.div
                    layout
                    animate={
                      filt.view
                        ? { height: heights[filt.name] }
                        : { height: 40 }
                    }
                    key={filt.name}
                    className="pb-4  overflow-hidden border-b border-dashed mt-4" >
                    <div className="w-full flex justify-between">
                      <p className="text-md font-medium md:font-semibold">
                        {filt.name.toLocaleUpperCase()}
                      </p>
                      <div
                        onClick={() => setFilterView(filt.name)}
                        className="cursor-pointer" >
                        <Image
                          src="/icons/arrow.svg"
                          width={16}
                          height={16}
                          alt="arrow"
                          className={cn("",{
                            "rotate-[-180deg]": filt.view
                          })}
                        />
                      </div>
                    </div>
                    <div
                      className={cn("mt-4 grid gap-1.5 grid-cols-2 ", {
                        "grid-cols-1 max-h-[150px] ": filt.name === "sort by",
                      })}>
                      {filt.content.map((item, index) => (
                        <div
                          onClick={() => toggleSelection(filt.name, item)}
                          key={index}
                          className={cn(
                            "flex gap-2 items-center cursor-pointer "
                          )} >
                          <div className="size-3.5 border rounded-full p-[1px] flex items-center justify-center">
                            <motion.div 
                            animate={filt.selected.includes(item) ? { opacity:1}:{ opacity:0}}
                            className="w-full h-full bg-black rounded-full"></motion.div>
                          </div>
                          <p className="font-medium text-black/70 text-sm">
                            {item.toLocaleUpperCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
               </motion.div>

            </motion.div>
          </motion.div> 

         }

        </motion.div>
      )}
    </>
  );
}

// Improved animation variants
const Parent = {
  show: {
    width: "320px",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  hide: {
    width: "0px",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const ParentSub = {
  show: {
    width: "320px",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  hide: {
    width: "0px",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const filtButton = {
  show: {
    width: 320,
    backgroundColor: "transparent",
    color: "black",
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: "black",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  hide: {
    width: 120,
    backgroundColor: "black",
    color: "white",
    borderTopWidth: 0,
    borderRightWidth: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};


const mobileParent = {
  show: {
    height: "100%",
    paddingBottom: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
      staggerChildren: 0.02,
    },
  },
  hide: {
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const mfiltButton = {
  show: {
    height: "75%",
    backgroundColor: "white",
    alignItems: "start",
    paddingTop: 16,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      delay: 0.1,
    },
  },
  hide: {
    height: "auto",
    backgroundColor: "transparent",
    paddingTop: 8,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const mFiltTextB = {
  show: {
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    color: "black",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  hide: {
    width: "120px",
    justifyContent: "center",
    backgroundColor: "black",
    color: "white",
    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },
};


const mobFiltItem = {
  show: {
    opacity: 1,
    transition: {
      delay: 0.4
    }
  },
  hide: {
    opacity: 0
  }
};

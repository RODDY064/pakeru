"use client";

import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function Filter() {
  const {
    filter,
    filterState,
    filteritems,
    setFilterPrice,
    toggleSelection,
    setFilterView,
    modal,
  } = useBoundStore();
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
        newHeights[filt.name] = el.scrollHeight + 10;
      }
    });
    setHeights(newHeights);
  }, [filteritems]);

  useEffect(() => {
    console.log(filter, "filter");
  }, [filter]);

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
                    <div
                      onClick={() => filterState(!filter)}
                      className="flex items-center mb-10 gap-1 cursor-pointer"
                    >
                      <div className="relative flex">
                        <div className="w-[16px] h-[1px] bg-black rotate-45"></div>
                        <div className="w-[16px] h-[1px] bg-black rotate-[-45deg] absolute"></div>
                      </div>
                      <p className="tex-sm font-avenir font-medium pt-0.5">
                        CLOSE
                      </p>
                    </div>
                    {filteritems.map((filt) => (
                      <motion.div
                        layout
                        animate={
                          filt.view
                            ? { height: heights[filt.name] }
                            : { height: 40 }
                        }
                        key={filt.name}
                        className="mr-6 pb-4  overflow-hidden border-b border-dashed mt-4"
                      >
                        <div className="w-full flex justify-between">
                          <p className="text-md  font-avenir">
                            {filt.name.toLocaleUpperCase()}
                          </p>
                          <div
                            onClick={() => setFilterView(filt.name)}
                            className="cursor-pointer"
                          >
                            <Image
                              src="/icons/arrow.svg"
                              width={16}
                              height={16}
                              alt="arrow"
                              className={cn("", {
                                "rotate-[-180deg]": filt.view,
                              })}
                            />
                          </div>
                        </div>
                        <div
                          className={cn("mt-4 grid gap-1.5 grid-cols-2 ", {
                            "grid-cols-1 max-h-[100px] ":
                              filt.name === "sort by",
                          })}
                        >
                          {typeof filt.content === "string" ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="number"
                                value={filt?.content ?? "0"}
                                min={0}
                                onChange={(e) => setFilterPrice(e.target.value)}
                                className="w-full h-12 cursor-pointer mt-2 focus:outline-none"
                              />
                              <p className="text-xs text-black/50 font-avenir">
                                Above GHS {filt.content}
                              </p>
                            </div>
                          ) : (
                            filt.content.map((item: string, index: number) => (
                              <div
                                onClick={() => toggleSelection(filt.name, item)}
                                key={index}
                                className="flex gap-2 items-center cursor-pointer"
                              >
                                <div className="size-3.5 border rounded-full p-[1px] flex items-center justify-center">
                                  <motion.div
                                    animate={
                                      filt.selected.includes(item)
                                        ? { opacity: 1 }
                                        : { opacity: 0 }
                                    }
                                    className="w-full h-full bg-black rounded-full"
                                  />
                                </div>
                                <p className="font-avenir text-black/70 text-sm">
                                  {item.toLocaleUpperCase()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div className="mt-12 w-full py-3 text-center bg-black rounded-full cursor-pointer">
                      <p className="font-avenir text-white text-md">Apply Filter</p>
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
                className="w-screen pb-2 bg-white flex items-center justify-center z-20 mobile-nav-filt"
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
                      className="fixed bottom-6 flex  py-2  px-5 rounded-full tex-sm bg-black text-white cursor-pointer font-avenir items-center justify-center gap-1"
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
                            filt.view
                              ? { height: heights[filt.name] }
                              : { height: 40 }
                          }
                          key={filt.name}
                          className="pb-4  overflow-hidden border-b border-dashed mt-4"
                        >
                          <div className="w-full flex justify-between">
                            <p className="text-md font-medium md:font-semibold">
                              {filt.name.toLocaleUpperCase()}
                            </p>
                            <div
                              onClick={() => setFilterView(filt.name)}
                              className="cursor-pointer"
                            >
                              <Image
                                src="/icons/arrow.svg"
                                width={16}
                                height={16}
                                alt="arrow"
                                className={cn("", {
                                  "rotate-[-180deg]": filt.view,
                                })}
                              />
                            </div>
                          </div>
                          <div
                            className={cn("mt-4 grid gap-1.5 grid-cols-2 ", {
                              "grid-cols-1 max-h-[150px] ":
                                filt.name === "sort by",
                            })}
                          >
                            {typeof filt.content === "string" ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="number"
                                  value={filt?.content ?? "0"}
                                  min={0}
                                  onChange={(e) =>
                                    setFilterPrice(e.target.value)
                                  }
                                  className="w-full h-12 cursor-pointer mt-2"
                                />
                                <p className="text-xs text-black/50">
                                  Above ${filt.content}
                                </p>
                              </div>
                            ) : (
                              filt.content.map(
                                (item: string, index: number) => (
                                  <div
                                    onClick={() =>
                                      toggleSelection(filt.name, item)
                                    }
                                    key={index}
                                    className={cn(
                                      "flex gap-2 items-center cursor-pointer "
                                    )}
                                  >
                                    <div className="size-3.5 border rounded-full p-[1px] flex items-center justify-center">
                                      <motion.div
                                        animate={
                                          filt.selected.includes(item)
                                            ? { opacity: 1 }
                                            : { opacity: 0 }
                                        }
                                        className="w-full h-full bg-black rounded-full"
                                      ></motion.div>
                                    </div>
                                    <p className="font-medium text-black/70 text-sm">
                                      {item.toLocaleUpperCase()}
                                    </p>
                                  </div>
                                )
                              )
                            )}
                          </div>
                        </motion.div>
                      ))}
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
    width: "400px",
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
    alignItems: "start",
    paddingTop: 16,
    transition: {
      duration: 0.3,
      delay: 0.1,
    },
  },
  hide: {
    height: "auto",
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

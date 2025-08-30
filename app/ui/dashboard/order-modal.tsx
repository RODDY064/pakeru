"use client";
import React from "react";
import { motion, AnimatePresence, cubicBezier } from "motion/react";
import { useBoundStore } from "@/store/store";
import Image from "next/image";

export default function OrderModal() {
  const { showOrderModal, setOrderModal } = useBoundStore();

  return (
    <motion.div
      variants={modalVariants}
      className={`fixed left-0 top-0 z-[99] w-full h-full hidden md:block ${
        showOrderModal ? "pointer-events-auto " : "pointer-events-none "
      }`}
    >
      <AnimatePresence>
        {showOrderModal && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute w-full h-full bg-black/80"
              onClick={setOrderModal}
            />

            {/* Modal */}
            <motion.div className="h-full relative flex z-20 justify-end">
              <motion.div
                key="modal"
                variants={container}
                initial="close"
                animate="open"
                exit="close"
                className="w-[600px] xl:w-[650px] 2xl:w-[680px] bg-white h-full"
              >
                <div className="flex items-center justify-between pt-8 pb-4 px-10 border-b border-black/20">
                  <p className="font-avenir text-lg font-normal">#ORD-000</p>
                  <div
                    onClick={setOrderModal}
                    className="flex  gap-1 cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-[16px] h-[1px] rotate-45 bg-black"></div>
                      <div className="w-[16px] h-[1px] rotate-[-45deg] bg-black absolute "></div>
                    </div>
                    <p className="capitalize font-avenir font-[400] text-sm mt-1">
                      CLOSE
                    </p>
                  </div>
                </div>
               <div className="h-full overflow-scroll pb-24">
                 <div className="px-10 py-6 ">
                  <div>
                    <p className="text-black/40 text-md font-avenir font-[300]">
                      Date
                    </p>
                    <p className="font-avenir font-[500] text-lg mt-1">
                      July 2, 12:05pm
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="text-black/40 text-md font-avenir font-[300] mt-1">
                      Customer
                    </p>
                    <p className="font-avenir font-[500] text-lg">
                      John Taylor
                    </p>
                    <p className="font-avenir font-[500] text-md text-black/50">
                      johntaylor@gmail.com
                    </p>
                  </div>
                  <div className="mt-10 w-full flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="font-avenir text-lg">Payment Status</p>
                      <div className=" flex  gap-2">
                        <div className="relative flex  items-center">
                          <select className="appearance-none w-[150px] px-4 py-1 pr-8 text-sm border border-green-500/50 text-green-600 bg-green-50 rounded-lg focus:outline-none">
                            <option>Completed</option>
                          </select>
                          <Image
                            src="/icons/arrow-gn.svg"
                            width={12}
                            height={12}
                            alt="arrow"
                            className="absolute right-3 opacity-100"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-avenir text-lg">Delivery Status</p>
                      <div className=" flex  gap-2">
                        <div className="relative flex  items-center ">
                          <select className="appearance-none w-[150px] px-4 py-1 pr-8 text-sm border border-yellow-500/50 text-yellow-600 bg-yellow-50 rounded-lg focus:outline-none">
                            <option>Pending</option>
                          </select>
                          <Image
                            src="/icons/arrow-y.svg"
                            width={12}
                            height={12}
                            alt="arrow"
                            className="absolute right-3 opacity-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 w-full flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <p className="text-black/40 text-md font-avenir font-[300]">
                        Product's
                      </p>
                      <p className="size-5 flex  text-sm items-center justify-center border border-red-500 rounded-full">
                        3
                      </p>
                    </div>
                    <div className="w-full min-h-[450px] grid grid-cols-2 gap-4">
                      <ProductOrderCard />
                       <ProductOrderCard />
                    </div>
                    <div className="mt-2">
                      <p className="text-black text-xl font-bold font-avenir ">
                        TOTAL
                      </p>
                      <p className="text-black/50 text-xl  font-avenir ">
                        GHS 500
                      </p>
                    </div>
                     <div className="mt-2">
                        <p className="text-black font-bold text-md uppercase  font-avenir ">
                        Discount
                      </p>
                          <p className="text-black/50 text-lg  font-avenir ">
                        GHS 500
                      </p>
                     </div>
                     <div className="mt-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                       Commet
                      </p>
                      <textarea
                       placeholder="Add a comment"
                       className="w-full h-24 max-h-24 min-h-24  bg-black/5 mt-2 rounded-2xl border p-3 flex items-start focus:outline-none focus:border-black/30 border-black/20"/>
                     </div>
                    <div className="mt-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                       Actions
                      </p>
                      <div className="w-full h-12 bg-red-100 border border-red-500 rounded-xl cursor-pointer flex items-center justify-center">
                        <p className="text-md font-avenir text-red-500">DELETE</p>
                      </div>
                    </div>
                  </div>
                </div>
               </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const ProductOrderCard = () => {
  return (
    <div className="w-full h-[450px] bg-black/5 rounded-[20px] flex gap-2 flex-col border border-dashed  border-black/60 p-2">
      <div className="w-full h-[85%]  border border-black/30 rounded-2xl relative overflow-hidden">
        <Image
          src="/images/hero-2.png"
          fill
          alt="hero"
          className="object-cover"
        />
      </div>
      <div className="w-full py-1 px-1 ">
        <p className="font-avenir text-sm">LEATHER BIKER JACKET</p>
        <div className="flex items-center justify-between">
          <p className="font-avenir text-sm text-black/50">GHS 159</p>
          <p className="font-avenir text-xs text-green-500 bg-green-50 border-[0.5px] border-green-500 px-2 rounded-full">
            available
          </p>
        </div>
      </div>
      <div className="w-full h-[40px] flex gap-2 ">
        <div className="w-full h-full border border-black/30 rounded-[10px] flex items-center justify-center bg-white">
          XL
        </div>
        <div className="w-full h-full border border-black/30 rounded-[10px] flex gap-2 items-center justify-center bg-white">
          <div className="size-4 border bg-black border-black rounded-full"></div>
          <p className="font-avenir text-sm text-black pt-[1.5px]">BLACK</p>
        </div>
      </div>
      <div className="w-full h-[40px] flex-shrink-0  border border-black/30 flex items-center justify-center rounded-[10px] bg-white">
        <p className="font-avenir text-sm text-black pt-[1.5px]">
          <span className="text-black/50">QUANTITY:</span> 2
        </p>
      </div>
    </div>
  );
};

// Optimized animation variants
const easingShow = cubicBezier(0.4, 0, 0.2, 1);

// modalVariants.ts
export const modalVariants = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      staggerChildren: 0,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "afterChildren",
    },
  },
};

export const overlay = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

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
    x: 500,
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

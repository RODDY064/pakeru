"use client";
import React, { use, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, cubicBezier } from "motion/react";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { ProductData } from "@/store/dashbaord/products";
import ProductOrderCard from "./productOrderCard";

export default function OrderModal() {
  const {
    showOrderModal,
    setOrderModal,
    orderInView,
    loadOrder,
  } = useBoundStore();

  const [state, setState] = useState<"idle" | "loading" | "failed">("loading");



  useEffect(() => {
    if (orderInView) {
      setState("idle");
    }
  }, [orderInView]);

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
              onClick={() => setOrderModal(!showOrderModal)}
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
                  <div className="flex items-center gap-4">
                    <p className="font-avenir text-lg font-normal pt-1">
                      #{orderInView?.IDTrim ?? "ORDER"}
                    </p>
                    {orderInView?.IDTrim && (
                      <div className="px-4 bg-black py-1 text-white font-avenir font-[500] text-md rounded-md cursor-pointer">
                        Fulfiled item
                      </div>
                    )}
                  </div>
                  <div
                    onClick={() => setOrderModal(!showOrderModal)}
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
                        {new Date(orderInView?.date ?? "").toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                          }
                        )}
                        , {orderInView?.time}
                      </p>
                    </div>
                    <div className="mt-4">
                      <p className="text-black/40 text-md font-avenir font-[300] mt-1">
                        Customer
                      </p>
                      <p className="font-avenir font-[500] text-lg">
                        {`${orderInView?.user?.firstname
                          .charAt(0)
                          .toUpperCase()}${orderInView?.user?.firstname.slice(
                          1
                        )} ${orderInView?.user?.lastname
                          .charAt(0)
                          .toUpperCase()}${orderInView?.user?.lastname?.slice(
                          1
                        )}`}
                      </p>
                      <p className="font-avenir font-[500] text-md text-black/50">
                        {orderInView?.user?.email}
                      </p>
                    </div>
                    <div className="mt-10 w-full flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <p className="font-avenir text-lg">Payment Status</p>
                        <div className=" flex  gap-2">
                          <div className="relative flex  items-center">
                            <select
                              value={orderInView?.paymentStatus}
                              className="appearance-none w-[150px] px-4 py-1 pr-8 text-sm border border-green-500/50 text-green-600 bg-green-50 rounded-lg focus:outline-none"
                            >
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
                            <select
                              value={orderInView?.deliveryStatus}
                              className="appearance-none w-[150px] px-4 py-1 pr-8 text-sm border border-yellow-500/50 text-yellow-600 bg-yellow-50 rounded-lg focus:outline-none"
                            >
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
                    <div className="mt-6 w-full flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                          Product's
                        </p>
                        <p className="size-5 flex  text-sm items-center justify-center border border-red-500 rounded-full">
                          {orderInView?.items.numOfItems}
                        </p>
                      </div>
                      <div className="w-full min-h-[450px] grid grid-cols-2 gap-4">
                        {orderInView?.items.products.map((prod) => (
                          <ProductOrderCard
                            key={prod._id}
                            colorID={prod.variantID}
                            size={prod.size}
                            productID={prod._id}
                            quantity={prod.quantiy}
                          />
                        ))}
                      </div>
                      <div className="mt-4">
                        <p className="text-black/70 text-md font-bold font-avenir ">
                          SUBTOTAL
                        </p>
                        <p className="text-black/50 text-xl  font-avenir ">
                          GHS 500
                        </p>
                      </div>
                      <div className="">
                        <p className="text-black/70 font-bold text-md uppercase  font-avenir ">
                          Discount
                        </p>
                        <p className="text-black/50 text-lg  font-avenir ">
                          GHS 200
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-black text-2xl font-bold font-avenir ">
                          TOTAL
                        </p>
                        <p className="text-black/50 text-2xl  font-avenir ">
                          GHS 500
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                          Commet
                        </p>
                        <textarea
                          placeholder="Add a comment"
                          className="w-full h-24 max-h-24 min-h-24  bg-black/5 mt-2 rounded-2xl border p-3 flex items-start focus:outline-none focus:border-black/30 border-black/20"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                          Actions
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            onClick={() => setOrderModal(!showOrderModal)}
                            className="w-full h-12 bg-black/10 border hover:bg-black/5 border-black/30 rounded-xl cursor-pointer flex items-center justify-center"
                          >
                            <p className="text-md font-avenir text-black">
                              CANCEL
                            </p>
                          </div>
                          <div className="w-full h-12 bg-red-100 hover:bg-red-50 border border-red-500 rounded-xl cursor-pointer flex items-center justify-center">
                            <p className="text-md font-avenir text-red-500">
                              DELETE
                            </p>
                          </div>
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
    x: 600,
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

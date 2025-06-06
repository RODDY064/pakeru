"use client";
import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import React from "react";
import CartContainer from "./bagContainer";
import Menu from "./menu";

export default function Modal() {
  const { modal, closeModal, modalDisplay, cartItems } = useBoundStore();

  return (
    <motion.div
      variants={modalVariants}
      animate={modal && modalDisplay !== "idle" ? "visible" : "hidden"}
      initial="hidden"
      className={cn(
        "fixed top-0 right-0 w-full h-full",
        modal ? "pointer-events-auto" : "pointer-events-none",)}>
      <motion.div
      variants={overlay}
        className="absolute w-full h-full bg-black/95"
      />
      {modalDisplay === "menu" && <Menu />}
      {modalDisplay === "cart" && <CartContainer/>}
    </motion.div>
  );
}

// modalVariants.ts
export const modalVariants = {
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  hidden: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut", delay:0.2 },
  },
};

export const overlay = {
 visible:{
  opacity:1,
 },
 hidden:{
  opacity:0,
  transition:{
    delay:0.5
  }
 }
}

{
  /* <motion.div
        initial={{ opacity: 0 }}
        animate={modal ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full  flex justify-end z-20 mt-12 relative px-0 md:p-[10px] ">
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={modal ? { x: 0, opacity: 1 } : { x: 500, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: modal ? 0.1 : 0,
          }}
          className="w-[95%] md:w-3/5 xl:w-[35%] h-[95%] md:h-[98%] pb-4 bg-white pt-10  overflow-hidden relative  flex-col flex rounded">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={modal ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              delay: modal ? 0.2 : 0,
              duration: 0.2,
            }}
            className="flex items-center justify-between px-4 md:px-6">
            <div className="relative">
              <p className="font-avenir text-xl font-black">
                {modalDisplay === "cart" ? "Your Cart" : "Your Bookmark"}
              </p>
              <div className="absolute top-[-1.2rem] right-[-1rem] size-6 border  border-red-600 rounded-full flex items-center justify-center">
                <p className="text-0 text-xs font-avenir font-bold">{cartItems.length}</p>
              </div>
            </div>
            <div onClick={closeModal}>
              <Image
                src="/icons/cancel.svg"
                width={16}
                height={16}
                alt="cancel"
                className="cursor-pointer"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={modal ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              delay: modal ? 0.25 : 0,
              duration: 0.2,
            }}
            className="w-full min-h-[700px] border-t-[0.5px] mt-4 py-6  px-4 md:p-6 overflow-y-scroll">
            <CartContainer />
          </motion.div>
           <motion.div
             initial={{ opacity: 0  }}
            animate={modal ? { opacity: 1 } : { opacity: 0, }}
            transition={{
              delay: modal ? 0.25 : 0,
              duration: 0.2,
            }}
            className="w-full   h-fit pb-10 border-t-2  border-black/10 text-black px-6 py-3  bg-white z-10">
              <div className="flex justify-between items-center">
                <p className="font-avenir font-black text-md md:text-lg">SUBTOTAL</p>
                 <p className="font-avenir font-black  text-black/50 text-md md:text-lg">GHS 12000</p>
              </div>
            <div 
            className="w-full mt-2 h-10 md:h-13 opacity- bg-green-500 rounded flex items-center justify-center cursor-pointer hover:bg-transparent hover:text-green-500 group/check hover:border-[0.5px] border-green-500">
                <p className="font-avenir  text-md md:text-lg font-black text-white group-hover/check:text-green-500">CHECKOUT</p>
            </div>
            </motion.div>     
        </motion.div>
      </motion.div> */
}

"use client";
import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import { motion } from "motion/react";
import Image from "next/image";
import React from "react";
import CartContainer from "./cartContainer";

export default function Modal() {
  const { modal, closeModal, modalDisplay } = useBoundStore();

  return (
    <div
      className={cn("fixed w-full h-full z-[999] invisible ", {
        visible: modal,
      })}>
      <motion.div
        animate={modal ? { opacity: 1 } : { opacity: 0 }}
        className="absolute w-full h-full bg-black/60 backdrop-blur-sm "
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={modal ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full  flex justify-end z-20 pt-12 relative px-0 md:p-[10px] ">
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={modal ? { x: 0, opacity: 1 } : { x: 500, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: modal ? 0.1 : 0,
          }}
          className="w-[95%] md:w-3/5 lg:w-[35%] h-[95vh] md:h-[98vh] pb-4 bg-white pt-10  overflow-hidden relative  flex-col flex rounded">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={modal ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              delay: modal ? 0.2 : 0,
              duration: 0.2,
            }}
            className="flex items-center justify-between px-4 md:px-6">
            <div className="relative">
              <p className="font-manrop text-xl font-black">
                {modalDisplay === "cart" ? "Your Cart" : "Your Bookmark"}
              </p>
              <div className="absolute top-[-1.2rem] right-[-1rem] size-6 border  border-red-500 rounded-full flex items-center justify-center">
                <p className="text-0 text-xs font-manrop font-bold">2</p>
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
            className="w-full border-t-[0.5px] mt-4 py-6  px-4 md:p-6 overflow-y-scroll">
            <CartContainer />
          </motion.div>
           <motion.div
             initial={{ opacity: 0  }}
            animate={modal ? { opacity: 1 } : { opacity: 0, }}
            transition={{
              delay: modal ? 0.25 : 0,
              duration: 0.2,
            }}
            className="w-full    left-0 h-fit border-t-2 border-black/10 text-black px-6 py-3  bg-white z-10">
              <div className="flex justify-between items-center">
                <p className="font-manrop font-black text-md md:text-lg">SUBTOTAL</p>
                 <p className="font-manrop font-black  text-black/50 text-md md:text-lg">GHS 12000</p>
              </div>
            <div 
            className="w-full mt-2 h-10 md:h-13 opacity- bg-green-500 rounded flex items-center justify-center cursor-pointer hover:bg-transparent hover:text-green-500 group/check hover:border-[0.5px] border-green-500">
                <p className="font-manrop  text-md md:text-lg font-black text-white group-hover/check:text-green-500">CHECKOUT</p>
            </div>
            </motion.div>     
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import React from "react";
import CartCard from "./bagCard";
import { useBoundStore } from "@/store/store";
import { motion, cubicBezier, AnimatePresence } from "motion/react";
import Icon from "./Icon";
import Link from "next/link";

export default function BagContainer() {
  const { cartItems, modalDisplay, modal,setModal } = useBoundStore();

  return (
    <AnimatePresence>
      <div className="w-full h-full flex justify-end">
        <motion.div
          variants={container}
          animate={modal ? "open" : "close"}
          initial="close"
          exit="close"
          className="md:w-[50%] lg:w-[40%] xl:w-[35%] h-full bg-white  flex-col  relative z-20 menu-desktop hidden md:flex flex-none pt-12 ">
          <div className="flex pb-2 items-center justify-between px-4 md:px-8   border-b border-black/20 ">
            <div className="relative">
              <p className="font-avenir text-md">
                {modalDisplay === "cart" ? "SHOPPING BAG" : "Your Bookmark"}
              </p>
              <div className="absolute top-[-1.2rem] right-[-1rem] size-6 border  border-red-600 rounded-full flex items-center justify-center">
                <p className="text-0 text-xs font-manrop font-bold">
                  {cartItems.length}
                </p>
              </div>
            </div>
            <div>
             <Icon  name="cart" onToggle={()=> setModal('cart')}/>
            </div>
          </div>
        <div className="w-full flex  flex-col gap-2  pt-4 overflow-y-scroll cart-con px-4 md:px-8 pb-12 ">
        {cartItems.map((cart) => (
          <CartCard key={cart.id} cartData={cart} />
        ))}
        <div className="mt-4 w-full ">
          <div className="w-full flex items-center justify-between">
            <p className="font-avenir font-[400]">TOTAL</p>
             <p className="font-avenir font-[400]">GHS {cartItems.reduce((total, item) => total + (item.price || 0), 0).toFixed(2)}</p>
          </div>
          <div className="w-full text-white bg-black py-3 text-center mt-8 rounded ">
             <Link href="/shopping-cart" className="">
            <p className="font-avenir font-[400] text-sm"> GO TO YOUR CART</p>
          </Link>
          </div>
        </div>
      </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const easingShow = cubicBezier(0.4, 0, 0.2, 1);

const container = {
  open: {
    x: 0,
    transition: {
      ease: easingShow,
      staggerChildren: 0.07,
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

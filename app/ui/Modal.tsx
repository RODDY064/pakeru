"use client";
import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import React, { useEffect } from "react";
import CartContainer from "./bagContainer";
import Menu from "./menu";

export default function Modal() {
  const { modal, closeModal, modalDisplay, cartItems } = useBoundStore();


  useEffect(() => {
  const html = document.documentElement;

  const applyLock = () => {
    const isMobile = window.innerWidth <= 734;

    if (modal && isMobile) {
      html.classList.add("globalnav-noscroll");
    } else {
      html.classList.remove("globalnav-noscroll");
    }
  };
  applyLock();
  window.addEventListener("resize", applyLock);
  return () => {
    html.classList.remove("globalnav-noscroll");
    window.removeEventListener("resize", applyLock);
  };
}, [modal]);


  return (
    <AnimatePresence>
      {modal && modalDisplay !== "idle" && (
        <motion.div
          key="modal"
          transition={{ type:"tween"}}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={cn(
            "fixed top-0 right-0 w-full h-full z-50",
            "pointer-events-auto"
          )}>
          <motion.div
            variants={overlay}
            className="absolute w-full h-full bg-black/95"
            onClick={() => closeModal()}
          />
          <AnimatePresence mode="wait">
            {modalDisplay === "menu" && <Menu key="menu-component" />}
            {(modalDisplay === "cart" || modalDisplay === "wardrobe") && (
              <CartContainer key="cart-component" />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// modalVariants.ts
export const modalVariants = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3,
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

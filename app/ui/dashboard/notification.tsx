"use client";

import { useBoundStore } from "@/store/store";
import { AnimatePresence, cubicBezier, motion } from "motion/react";
import React from "react";

export default function Notification() {
  const { isNotModalOpen, toggleNotModal } = useBoundStore();

  return (
    <div
      className={`w-full h-full fixed bg-black/80 top-0 left-0 z-[99] ${
        isNotModalOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <AnimatePresence>
        {isNotModalOpen && (
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
                    Notification
                  </p>
                </div>
                <div
                  onClick={toggleNotModal}
                  className="flex gap-1 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-[16px] h-[1px] rotate-45 bg-black"></div>
                    <div className="w-[16px] h-[1px] rotate-[-45deg] bg-black absolute"></div>
                  </div>
                  <p className="capitalize font-avenir font-[400] text-sm mt-1">
                    CLOSE
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Animation variants
const easingShow = cubicBezier(0.4, 0, 0.2, 1);

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

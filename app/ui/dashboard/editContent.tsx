"use client";

import { capitalize } from "@/libs/functions";
import { useBoundStore } from "@/store/store";
import { motion, cubicBezier, AnimatePresence } from "motion/react";
import Image from "next/image";
import React from "react";
import AttachPicker from "./attachPicker";

export default function EditContent() {
  const { isContentModalOpen, toggleContentModal, contentModalType, content } =
    useBoundStore();

  return (
    <div
      className={`fixed w-full h-full bg-black/80 top-0 left-0 z-[99] ${
        isContentModalOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}>
      <div className="w-full h-full flex justify-end">
        <AnimatePresence>
          <motion.div
            animate={isContentModalOpen ? "open" : "close"}
            variants={container}
            initial="close"
            exit="close"
            className="w-[40%] bg-white h-full">
            <div className="flex items-center justify-between pt-8 pb-4 px-10 border-b border-black/20">
              <div className="flex items-center gap-4">
                <p className="font-avenir text-lg font-normal pt-1">
                  Edit {capitalize(contentModalType as string)}
                </p>
              </div>
              <div
                onClick={() => toggleContentModal(false)}
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
            <div className="h-full overflow-scroll pb-24 px-10 pt-10 ">
              <div className="w-full flex-nowrap flex-none h-[400px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                    <Image
                      src="/icons/plus-w.svg"
                      width={30}
                      height={30}
                      alt="Add"
                      className="invert opacity-60"
                    />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 size-8 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <div className="w-[20px] h-[1px] bg-white"></div>
                    <div className="w-[1px] h-[20px] bg-white absolute"></div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                {contentModalType === "hero" && (
                  <>
                    <div>
                      <label className="font-avenir text-lg">Tittle</label>
                      <input
                        placeholder="e.g Made for you "
                        className="border border-black/30 w-full h-12 mt-2 rounded-xl focus:outline-none focus:border-black/60 p-3"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="font-avenir text-lg">Description</label>
                      <textarea
                        placeholder="e.g DEFY THE NORM"
                        className="border min-h-[90px] max-h-[90px] h-[90px] border-black/30 w-full  mt-2 rounded-xl focus:outline-none focus:border-black/60 p-2 ove"
                      />
                    </div>
                  </>
                )}

                {(contentModalType === "gallery" || contentModalType === "slider" )&& (
                  <>
                    <div>
                      <label className="font-avenir text-lg">Name</label>
                      <input
                        placeholder="e.g Aegis "
                        className="border border-black/30 w-full h-12 mt-2 rounded-xl focus:outline-none focus:border-black/60 p-3"
                      />
                    </div>
                     <AttachPicker type={contentModalType === "gallery" ? "products" : "categories"} />
                  </>
                )}

                <div className="flex items-center gap-3 mt-8">
                  <div className="rounded-full p-4 bg-black w-full cursor-pointer border border-black">
                    <p className="text-white text-md font-avenir text-center">
                      Upload
                    </p>
                  </div>
                  <div className="rounded-full p-4 bg-black/10 w-full cursor-pointer border border-black">
                    <p className="text-black text-md font-avenir text-center">
                      Remove
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

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
    x: 700,
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

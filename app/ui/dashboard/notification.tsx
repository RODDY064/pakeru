"use client";

import { capitalize } from "@/libs/functions";
import { useBoundStore } from "@/store/store";
import { AnimatePresence, cubicBezier, motion } from "motion/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function Notification() {
  const { isNotModalOpen, toggleNotModal, notModalType } = useBoundStore();
  const { data: session } = useSession();


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
              className="w-[500px] xl:w-[500px] 2xl:w-[600px] bg-white h-full"
            >
              <div className="flex items-center justify-between pt-8 pb-4 px-10 border-b border-black/20">
                <div className="flex items-center gap-4">
                  <div className="pt-1">
                    {notModalType === "control" && (
                      <div className="flex items-center gap-3">
                        <p className="font-avenir text-lg font-normal ">
                          Dashboard
                        </p>
                        <Link href="/">
                          <p className="px-4 py-2 rounded-lg bg-black text-white font-avenir text-sm">
                            Visit Store
                          </p>
                        </Link>
                      </div>
                    )}
                    {notModalType === "notification" && (
                      <p className="font-avenir text-lg font-normal ">
                        {" "}
                        Notification
                      </p>
                    )}
                  </div>
                </div>
                <div
                  onClick={() => toggleNotModal(null)}
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
              <div className="h-full overflow-scroll pb-24">
                <div className="px-10 py-6">
                  {notModalType === "control" && (
                    <>
                      <p className="text-black/50 text-md font-avenir font-[300]">
                        Username
                      </p>
                      <p className="font-avenir font-[500] text-lg mt-2">
                        {session?.user && (
                          <>
                            {capitalize(session?.user?.firstname ?? "")}{" "}
                            {capitalize(session?.user.lastname ?? "")}
                          </>
                        )}
                      </p>
                      <p className="font-avenir font-[500]  text-black/50 decoration-dotted underline underline-offset-2 text-md">
                        {session?.user?.username}
                      </p>
                     <div onClick={async()=> await signOut({ callbackUrl:"/sign-in"})} className="flex flex-col items-center">
                       <div className="mt-12 w-[80%] border border-black py-4 cursor-pointer bg-black/10 hover:bg-black/5 rounded-full">
                        <p className="font-avenir text-lg  text-center">Logout</p>
                      </div>
                     </div>
                    </>
                  )}
                  {notModalType === "notification" && (
                    <p className="py-10 font-avenir text-lg text-black/50 decoration-dotted underline underline-offset-2  ">Notification still under work</p>
                  )}
                  
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

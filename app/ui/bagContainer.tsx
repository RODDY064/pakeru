"use client";

import React, { useEffect, useRef, useState } from "react";
import CartCard from "./bagCard";
import { useBoundStore } from "@/store/store";
import { motion, cubicBezier, AnimatePresence } from "motion/react";
import Icon from "./Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleNavigation } from "@/libs/navigate";
import Image from "next/image";
import Button from "./button";
import Lottie from "lottie-react";
import loaderAnimation from "../../public/lottie/pakeru.json";
import isEqual from "lodash.isequal";

export default function BagContainer() {
  const {
    cartItems,
    modalDisplay,
    modal,
    setModal,
    closeModal,
    setRouteChange,
    bookMarks,
    addAllBookmarksToCart,
    isMobile,
  } = useBoundStore();
  const router = useRouter();
  const [changeState, setChangeState] = useState<boolean>(false);
  const prevModalRef = useRef<string | null>(null);
  const prevCartItemsRef = useRef<any[]>([]);

  const handleClick = (e: any) => {
    closeModal();
    handleNavigation(e, "/shopping-cart", router, setRouteChange, 200);
  };

  const handleLink = (e: any) => {
    closeModal();
    handleNavigation(e, "/product", router, setRouteChange, 200);
  };


  useEffect(() => {
    const prevModal = prevModalRef.current;
    const prevCartItems = prevCartItemsRef.current;

    const cartChanged = !isEqual(prevCartItems, cartItems); 

    if (prevModal === "wardrope" && modalDisplay === "cart" && cartChanged) {
      setChangeState(true);

      setTimeout(() => {
        setChangeState(false);
      }, 2500);
    }

    // Update refs
    prevModalRef.current = modalDisplay;
    prevCartItemsRef.current = cartItems;
  }, [modalDisplay, cartItems]);

  return (
    <AnimatePresence>
      <div className="w-full h-full flex justify-end">
        <motion.div
          variants={container}
          animate={modal ? "open" : "close"}
          initial="close"
          exit="close"
          className="md:w-[50%] lg:w-[40%] xl:w-[35%] h-full bg-white  flex-col  relative z-20 menu-desktop hidden md:flex flex-none pt-12 "
        >
          <motion.div variants={list} className="h-full">
            <div className="flex pb-2 items-center justify-between px-4 md:px-8   border-b border-black/20 ">
              <div className="relative">
                <p className="font-avenir text-md">
                  {modalDisplay === "cart" ? "SHOPPING BAG" : "YOUR BOOKMARK"}
                </p>
                <div className="absolute top-[-1.3rem] right-[-1rem] size-6 border  border-red-600 rounded-full flex items-center justify-center">
                  <p className="text-0 text-xs font-manrop font-bold">
                    {modalDisplay === "cart"
                      ? cartItems.length
                      : bookMarks.length}
                  </p>
                </div>
              </div>
              <div>
                <Icon name="close" onToggle={() =>  modalDisplay === "cart" ? setModal("cart"): setModal("wardrope")} />
              </div>
            </div>
            {(modalDisplay === "cart" && cartItems.length > 0) ||
            (modalDisplay === "wardrope" && bookMarks.length > 0) ? (
              <div className="w-full h-full overflow-y-scroll pb-24">
                <div className="w-full flex flex-col gap-2 pt-4 cart-con px-4 md:px-8 pb-12 ">
                  {modalDisplay === "cart"
                    ? cartItems.map((item) => (
                        <CartCard key={item.cartItemId} cartData={item} />
                      ))
                    : bookMarks.map((item) => (
                        <CartCard key={item.bookmarkId} cartData={item} />
                      ))}

                  {modalDisplay === "cart" && (
                    <div className="mt-4 w-full">
                      <div className="w-full flex items-center justify-between">
                        <p className="font-avenir font-[400]">TOTAL</p>
                        <p className="font-avenir font-[400]">
                          {cartItems
                            .reduce(
                              (total, item) => total + (item.price || 0),
                              0
                            )
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="w-full text-white bg-black py-3 text-center mt-8 rounded ">
                        <Link onClick={handleClick} href="/shopping-cart">
                          <p className="font-avenir font-[400] text-sm">
                            GO TO YOUR CART
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}
                  {modalDisplay === "wardrope" && (
                    <div className="mt-4 w-full">
                      <div className="w-full text-white bg-black py-3 text-center mt-8 rounded ">
                        <div
                          onClick={() => addAllBookmarksToCart}
                          className="cursor-pointer"
                        >
                          <p className="font-avenir font-[400] text-sm">
                            ADD ALL BOOKMARKS TO CART
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center ">
                <div className="w-full flex items-center justify-center min-h-24">
                  <Image
                    src="/icons/bag-empty.svg"
                    width={200}
                    height={24}
                    alt="bag empty"
                  />
                </div>
                <p className="text-gray-500 font-avenir font-[400] text-md">
                  {modalDisplay === "cart"
                    ? "YOUR BAG IS EMPTY"
                    : modalDisplay === "wardrope"
                    ? "YOUR BOOKMARK IS EMPTY"
                    : ""}
                </p>
                <div className="mt-4">
                  <Button action={handleLink} word="GO TO SHOP" />
                </div>
              </div>
            )}
          </motion.div>
          <motion.div
            animate={changeState ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0 }}
            className={`w-full h-full absolute bg-white top-0 flex items-center justify-center ${
              changeState ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <div className="size-20 relative z-10">
              <Lottie
                animationData={loaderAnimation}
                loop={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          variants={mobileCon}
          animate={modal ? "open" : "close"}
          initial="close"
          exit="close"
          className="w-full h-full absolute md:hidden top-0 bg-white z-20"
        >
          <motion.div variants={list} className="h-full">
            <div className="flex  pt-8 pb-4 items-center justify-between px-4 md:px-8   border-b border-black/20 ">
              <div className="relative">
                <p className="font-avenir text-md">
                  {modalDisplay === "cart" ? "SHOPPING BAG" : "YOUR BOOKMARK'S"}
                </p>
                <div className="absolute top-[-1.3rem] right-[-1rem] size-6 border  border-red-600 rounded-full flex items-center justify-center">
                  <p className="text-0 text-xs font-manrop font-bold">
                    {cartItems.length}
                  </p>
                </div>
              </div>
              <div>
                <Icon name="close" onToggle={() => setModal("cart")} />
              </div>
            </div>
            {(modalDisplay === "cart" && cartItems.length > 0) ||
            (modalDisplay === "wardrope" && bookMarks.length > 0) ? (
              <div className="w-full h-full overflow-y-scroll pb-24">
                <div className="w-full flex flex-col gap-2 pt-4 cart-con px-4 md:px-8 pb-12 ">
                  {modalDisplay === "cart"
                    ? cartItems.map((item) => (
                        <CartCard key={item.cartItemId} cartData={item} />
                      ))
                    : bookMarks.map((item) => (
                        <CartCard key={item.bookmarkId} cartData={item} />
                      ))}

                  {modalDisplay === "cart" && (
                    <div className="mt-4 w-full">
                      <div className="w-full flex items-center justify-between">
                        <p className="font-avenir font-[400]">TOTAL</p>
                        <p className="font-avenir font-[400]">
                          {cartItems
                            .reduce(
                              (total, item) => total + (item.price || 0),
                              0
                            )
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="w-full text-white bg-black py-3 text-center mt-8 rounded ">
                        <Link onClick={handleClick} href="/shopping-cart">
                          <p className="font-avenir font-[400] text-sm">
                            GO TO YOUR CART
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}
                  {modalDisplay === "wardrope" && (
                    <div className="mt-4 w-full">
                      <div className="w-full text-white bg-black py-3 text-center mt-8 rounded ">
                        <div
                          onClick={() => addAllBookmarksToCart}
                          className="cursor-pointer"
                        >
                          <p className="font-avenir font-[400] text-sm">
                            ADD ALL BOOKMARKS TO CART
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center ">
                <div className="w-full flex items-center justify-center min-h-24">
                  <Image
                    src="/icons/bag-empty.svg"
                    width={200}
                    height={24}
                    alt="bag empty"
                  />
                </div>
                <p className="text-gray-500 font-avenir font-[400] text-md">
                  {modalDisplay === "cart"
                    ? "YOUR BAG IS EMPTY"
                    : modalDisplay === "wardrope"
                    ? "YOUR BOOKMARK IS EMPTY"
                    : ""}
                </p>
                <div className="mt-4">
                  <Button action={handleLink} word="GO TO SHOP" />
                </div>
              </div>
            )}
          </motion.div>
          <motion.div
            animate={changeState ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0 }}
            className={`w-full h-full absolute z-20 bg-white top-0 flex items-center justify-center ${
              changeState ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <div className="size-20 relative z-10">
              <Lottie
                animationData={loaderAnimation}
                loop={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>
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
      staggerChildren: 0.05,
      delayChildren: 0.15,
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

const mobileCon = {
  open: {
    height: "100%",
    transition: {
      ease: easingShow,
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
  close: {
    height: "0",
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useAnimation,
  cubicBezier,
} from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { cn } from "@/libs/cn";
import NavCurtain from "./nav-curtain";
import { useSearchAndHoverControls } from "@/libs/navAnimation";

const ads = [
  {
    ad: "EASY RETURN POLICY | FIND OUT MORE",
    link: "/",
  },
  {
    ad: "FREE SHIPPING ON ORDERS OVER $50",
    link: "/",
  },
  {
    ad: "SIGN UP FOR 10% OFF YOUR FIRST ORDER",
    link: "/",
  },
];

const Links = [
  {
    name: "NEW IN",
    link: "/",
  },
  {
    name: "MEN",
    link: "/",
  },
  {
    name: "OUR STORIES",
    link: "/",
  },
  {
    name: "OUTLET",
    link: "/",
  },
];

const iconTabs = [
  {
    name: "bag",
    src: "/icons/bag.svg",
    src_w: "/icons/bag-w.svg",
    link: "/bag",
  },
  {
    name: "user",
    src: "/icons/user.svg",
    src_w: "/icons/user-w.svg",
    link: "/account",
    width: 21,
    height: 21,
  },
  {
    name: "bookmark",
    src: "/icons/bookmark.svg",
    src_w: "/icons/bookmark-w.svg",
    link: "/account",
    width: 22,
    height: 22,
  },
];

export default function Nav() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentAd, setCurrentAd] = useState(0);
  const {
    scrollAmount,
    setNavSearch,
    navSearch,
    showCurtain,
    hideCurtain,
    setModal,
    cartItems
  } = useBoundStore();
  const [hasStick, setHasStick] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    // console.log(scrollAmount);
    if (scrollAmount >= 15) {
      gsap.to(".nav-ads", {
        y: -40,
        duration: 0.3,
      });
      gsap.to(".nav", {
        y: -40,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(".bar", {
        backgroundColor: "white",
        color: "black",
        duration: 0.3,
        ease: "power2.out",
      });

      setHasStick(true);
    } else {
      setHasStick(false);

      gsap.to(".nav-ads", {
        y: 0,
        duration: 0.3,
      }),
        gsap.to(".nav", {
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        }),
        gsap.to(".bar", {
          backgroundColor: "transparent",
          color: "white",
          duration: 0.3,
          ease: "power2.out",
        });
    }
  }, [scrollAmount]);

  const controls = useAnimation();
  const searchControls = useAnimation();

  const {
    isHover,
    isSearching,
    handleHoverStart,
    handleHoverEnd,
    handleSearchFocus,
    handleSearchBlur,
    handleSearchInputChange,
  } = useSearchAndHoverControls(searchControls, controls);

  const easingShow = cubicBezier(0.4, 0, 0.2, 1);
  const easingHide = cubicBezier(0.83, 0, 0.17, 1);
  const easingHeight = cubicBezier(0.32, 0.17, 0.24, 1.05);

  // nav slide down animation

  const Parent = {
    show: {
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    hide: {
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const slideCon = {
    show: {
      height: isMobile ? 550 : 720,
      transition: {
        height: { duration: 0.5, ease: easingHeight },
        opacity: { duration: 0.5, ease: easingHeight },
      },
    },
    hide: {
      height: 0,
      transition: {
        height: { duration: 0.4, ease: easingHeight },
        opacity: { duration: 0.4, ease: easingHeight },
        delay: 0.35,
      },
    },
  };

  const slideContent = {
    show: {
      opacity: 1,
      transition: {
        opacity: { duration: 0.4, ease: easingShow, delay: 0.15 },
      },
    },
    hide: {
      opacity: 0,
      transition: {
        opacity: { duration: 0.3, ease: easingShow },
      },
    },
  };

  return (
    <div className="fixed w-full z-[999] ">
      <div className="w-full  flex items-center px-4 md:px-8  py-3 bg-black text-white overflow-hidden h-[40px] nav-ads  justify-between"></div>
      <div className="nav ">
        <div className="w-full flex flex-row bar justify-between px-4 md:px-8 items-center    hover:text-black">
          <div className="md:w-1/5 realtive z-20">
            <Link
              href="/"
              className={cn("text-xl font-bold font-manrop hidden md:flex ")}
            >
              PAKERU
            </Link>
            <div className="flex md:hidden flex-col gap-1">
              <div
                className={cn("w-6 h-[1.5px] bg-white", {
                  "bg-black": hasStick,
                })}
              />
              <div
                className={cn("w-5 h-[1.5px] bg-white", {
                  "bg-black": hasStick,
                })}
              />
              <div
                className={cn("w-4 h-[1.5px] bg-white", {
                  "bg-black": hasStick,
                })}
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              variants={Parent}
              animate={controls}
              initial="hide"
              exit="hide"
              onHoverStart={handleHoverStart}
              onHoverEnd={handleHoverEnd}
              className="items-center text-md font-manrop justify-center flex realtive z-20"
            >
              {Links.map((item, index) => (
                <div
                  key={index}
                  className="hidden  h-full p-3 pb-4 pt-6 md:block cursor-pointer"
                >
                  {item.name}
                </div>
              ))}
              <Link
                href="/"
                className="text-xl font-bold font-manrop md:hidden py-3"
              >
                PAKERU
              </Link>
              <div className="absolute w-full md:w-[35%] lg:w-[25%]  flex-none flex-nowrap top-[-40px] h-[40px] flex items-center justify-center  ads-text ">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAd}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                  >
                    <Link
                      href={ads[currentAd].link}
                      className="font-manrop text-xs  flex-none flex-nowrap"
                    >
                      {ads[currentAd].ad}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
              <NavCurtain
                type="nav"
                animate={{ container: slideCon, content: slideContent }}
              />
            </motion.div>
          </AnimatePresence>
          <motion.div animate={searchControls} variants={Parent}>
            <div className="flex gap-4 items-center realtive z-20">
              <div
                className={cn(
                  "w-54 h-9 rounded-2xl border border-white/30 relative px-3 items-center hidden lg:flex ",
                  {
                    "border-black/30": hasStick,
                  }
                )}
              >
                <div>
                  {hasStick ? (
                    <Image
                      className="group-has-"
                      src="/icons/search.svg"
                      width={24}
                      height={24}
                      alt="search"
                    />
                  ) : (
                    <Image
                      className="group-has-"
                      src="/icons/search-w.svg"
                      width={24}
                      height={24}
                      alt="search"
                    />
                  )}
                </div>
                <input
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  value={navSearch}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="bg-transparent h-full text-sm focus:outline-none"
                  placeholder="Search..."
                />
              </div>
              <div className="flex-row-reverse flex gap-3 items-center">
                {iconTabs.map((icon, index) => (
                  <div key={icon.name} className="relative">
                    {icon.name !== "user" ? (
                      <div
                        onClick={() =>
                          icon.name === "bag"
                            ? setModal("cart")
                            : setModal("wardrope")
                        }
                        className={cn("md:flex hidden cursor-pointer", {
                          flex: index === 0,
                        })}
                        key={index}
                      >
                        {hasStick ? (
                          <Image
                            className="group-has-"
                            src={icon.src}
                            width={icon.width ?? 24}
                            height={icon.height ?? 24}
                            alt={icon.name}
                          />
                        ) : (
                          <Image
                            className="group-has-"
                            src={icon.src_w}
                            width={icon.width ?? 24}
                            height={icon.height ?? 24}
                            alt={icon.name}
                          />
                        )}
                        {icon.name === "bag" && (
                          <div className="absolute top-[-0.9rem] right-[-0.6rem] size-5 rounded-full border-[1px] border-red-white flex items-center justify-center">
                            <p className="text-[10px] font-black font-manrop text-red-600">{cartItems.length}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={icon.link}
                        className={cn("md:flex hidden", {
                          flex: index === 0,
                        })}
                        key={index}
                      >
                        {hasStick ? (
                          <Image
                            className="group-has-"
                            src={icon.src}
                            width={icon.width ?? 24}
                            height={icon.height ?? 24}
                            alt={icon.name}
                          />
                        ) : (
                          <Image
                            className="group-has-"
                            src={icon.src_w}
                            width={icon.width ?? 24}
                            height={icon.height ?? 24}
                            alt={icon.name}
                          />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <NavCurtain
              type="search"
              animate={{ container: slideCon, content: slideContent }}
              handleSearchBlur={handleSearchBlur}
            />
          </motion.div>
        </div>
        {/*  mobile search*/}
        <div className="text-white lg:hidden focus-within:backdrop-blur-lg ">
          <div className="w-full h-10 border-y border-white/30 flex gap-2 items-center px-4">
            <Image
              className="group-hover/ms:hidden"
              src="/icons/search-w.svg"
              width={24}
              height={24}
              alt="search"
            />
            <Image
              className="group-hover/ms:flex hidden "
              src="/icons/search.svg"
              width={24}
              height={24}
              alt="search"
            />
            <input
              onFocus={handleSearchFocus}
              onBlur={(e) => handleSearchBlur(e)}
              value={navSearch}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="bg-transparent w-full h-full text-sm focus:outline-none relative z-30 nav-input"
              placeholder="Searching..."
            />
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isHover || isSearching ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.01, ease: easingShow }}
        className={cn(
          "w-full h-screen veil top-0 flex flex-col justify-end absolute invisible left-0 z-[-10]",
          {
            visible: isHover || isSearching,
          }
        )}
      >
        <motion.div
          initial={{ backdropFilter: "blur(0px)" }}
          animate={
            isHover || isSearching
              ? { backdropFilter: "blur(50px)" }
              : { backdropFilter: "blur(0px)" }
          }
          className="w-full md:h-[85%] lg:h-[88%]  bg-white/20"
        />
      </motion.div>
    </div>
  );
}

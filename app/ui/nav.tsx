"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { cn } from "@/libs/cn";
import NavCurtain from "./nav-curtain";

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
  const [currentAd, setCurrentAd] = useState(0);
  const { scrollAmount, setNavSearch, showCurtain, hideCurtain, setModal } =
    useBoundStore();
  const [hasStick, setHasStick] = useState<boolean>(false);

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
        duration:0.3
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
        duration:0.3
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

  let hideTimeout: ReturnType<typeof setTimeout>;

 function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
  clearTimeout(hideTimeout);
  const target = e.target as HTMLElement;
   const navLinkElement = target.closest("[data-navlink]");

  //  console.log(target.closest('[data-navlink]'),'target')

  // setTimeout(()=>{
  //   showCurtain()
  // },100)



  
}

  function handleMouseLeave(e:React.MouseEvent<HTMLDivElement>) {
    // console.log(e.target, 'nav ')
    hideTimeout = setTimeout(() => {
      // hideCurtain();
    }, 300);
  }

  return (
    <div className="nav-div fixed w-full z-[99] ">
      <div className="w-full  flex items-center px-4 md:px-8  py-3 bg-black text-white overflow-hidden h-[40px] nav-ads  justify-between"></div>
      <div 
       className="nav  ">
        <div className="w-full ">
          <div className="w-full   flex flex-row bar justify-between px-4 md:px-8 items-center py-4   hover:text-black">
            <div  className="md:w-1/5">
              <Link
                href="/"
                className={cn("text-xl font-bold font-manrop hidden md:flex ")}
              >
                MA~S
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
            <div 
           onMouseMove={handleMouseMove}
            className="items-center text-md   font-manrop  justify-center flex">
              {Links.map((item, index) => (
                <div
                 data-navlink
                  className="hidden  h-full p-3  md:block cursor-pointer"
                  key={index}
                >
                  {item.name}
                </div>
              ))}
              <p className="text-xl font-bold font-manrop md:hidden">MA~S</p>
              <div className="absolute w-full top-[-40px] h-[40px] flex items-center justify-center  ads-text ">
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
                      className="font-manrop text-xs"
                    >
                      {ads[currentAd].ad}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="flex gap-4 items-center ">
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
                  onMouseEnter={() => showCurtain()}
                  onMouseLeave={() => hideCurtain()}
                  onChange={(e) => setNavSearch(e.target.value)}
                  className="bg-transparent h-full text-sm focus:outline-none"
                  placeholder="Searching..."
                />
              </div>
              <div className="flex-row-reverse flex gap-3 items-center">
                {iconTabs.map((icon, index) => (
                  <div key={icon.name}>
                  {icon.name !== "user" ?
                  <div
                    onClick={()=> icon.name === "bag" ? setModal( "cart"):setModal("wardrope")}
                    className={cn("md:flex hidden cursor-pointer", {
                      flex: index === 0,
                    })}
                  
                    key={index} >
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
                  </div>:
                  <Link
                     href={icon.link}
                    className={cn("md:flex hidden", {
                      flex: index === 0,
                    })}
                  
                    key={index} >
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

                  }
                  </div>
                ))}
              </div>
            </div>
            <NavCurtain />
          </div>
        </div>
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
              onFocus={() => typeof showCurtain === "function" && showCurtain()}
              onBlur={() => typeof hideCurtain === "function" && hideCurtain()}
              onChange={(e) => setNavSearch(e.target.value)}
              className="bg-transparent w-full h-full text-sm focus:outline-none relative z-30"
              placeholder="Searching..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

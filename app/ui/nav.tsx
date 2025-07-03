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
import Modal from "./Modal";
import Search from "./search";
import SearchIcon from "./searchIcon";
import Icon from "./Icon";
import { usePathname, useRouter } from "next/navigation";
import { handleNavigation } from "@/libs/navigate";
import { useStoreInitialization } from "@/libs/cartPersist";

gsap.registerPlugin(ScrollTrigger);

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
    src_w: "/icons/bookmark2.svg",
    link: "/account",
    width: 22,
    height: 22,
  },
];

export default function Nav() {
  const [isSnap, setIsSnap] = useState<boolean>(false);
  const [currentAd, setCurrentAd] = useState(0);
  const [paused, setPaused] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const {
    setModal,
    cartItems,
    setIsMobile,
    routeChange,
    setRouteChange,
    loadProducts,
    loadCategories,
    products,
    modalDisplay,
    modal,
    bookMarks,
    assignCatID
  } = useBoundStore();

  useStoreInitialization();

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [paused, ads.length]);

  useEffect(()=>{
    console.log(products.slice(0,4))
  },[products])

  useEffect(() => {
    loadProducts();
    assignCatID()

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

  useGSAP(() => {
    // Clean up any existing ScrollTriggers first
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // Small delay to ensure DOM is ready after route change
    const timer = setTimeout(() => {
      gsap.to(".nav-ads", {
        y: -40,
        duration: 0.3,
        scrollTrigger: {
          trigger: ".nav-ads",
          start: "top top",
          scrub: 1,
        },
      });

      gsap.to(".navbar", {
        y: -40,
        scrollTrigger: {
          trigger: ".nav-ads",
          start: "top top",
          scrub: 1,
          onEnter: () => {
            setIsSnap(true);
          },
          onLeaveBack: () => {
            setIsSnap(false);
          },
        },
      });

      gsap.to(".menuIcon", {
        y: -40,
        scrollTrigger: {
          trigger: ".nav-ads",
          start: "top top",
          scrub: 1,
        },
      });

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [pathname]);

  return (
    <div className="fixed top-0 w-full left-auto z-[90] ">
      <div className="w-full">
        <div className="w-full flex items-center px-4 md:px-8 py-4 bg-black text-white overflow-hidden h-[40px] nav-ads justify-between">
          <p className="opacity-0">h</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Link
                href={ads[currentAd].link}
                // onClick={(e)=> handleNavigation(e,ads[currentAd].link,router,setRouteChange,300)}
                className="font-avenir text-xs flex-none flex-nowrap"
              >
                {ads[currentAd].ad}
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="cursor-pointer" onClick={() => setPaused((p) => !p)}>
            <Image
              src="/icons/play.svg"
              width={24}
              height={24}
              alt="play"
              className={`${paused ? "" : "hidden"} play`}
            />
            <Image
              src="/icons/pause.svg"
              width={24}
              height={24}
              alt="pause"
              className={`${paused ? "hidden" : ""} pause`}
            />
          </div>
        </div>
        <div
          className={cn(
            "w-full flex flex-row justify-between px-3 md:px-8 py-4 pt-4.5 items-center navbar",
            {
              "bg-white border-[1px] border-black/20": isSnap,
            }
          )}>
          <div
            className={`w-10 md:w-20 flex-none flex overflow-visible  relative gap-4 items-center ${
              !routeChange ? "pointer-events-auto" : "pointer-events-none"
            }`}>
            <SearchIcon style="hidden md:flex" />
          </div>
          <Link
            href="/"
            onClick={(e) =>
              handleNavigation(e, "/", router, setRouteChange, 200)
            }
            className={`flex-none w-24 h-[24px] ${
              !routeChange ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <Image
              src="/icons/textLogo.svg"
              width={150}
              height={12}
              alt="logo"
              className="mt-[-2.4rem]"
            />
          </Link>
          <div
            className={`flex md:gap-4 max-sm:mr-1 ${
              !routeChange ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
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
                    <Image
                      src={
                        icon.name === "bookmark" && bookMarks.length > 0
                          ? icon.src_w
                          : icon.src
                      }
                      width={22}
                      height={22}
                      alt={icon.name}
                    />
                    {icon.name === "bag" && (
                      <div className="absolute top-[-0.88rem] right-[-0.6rem] size-4.5 rounded-full border-[1px] border-red-white flex items-center justify-center">
                        <p className="text-[12px] font-black font-avenir text-red-600">
                          {cartItems.length}
                        </p>
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
                    <Image
                      className=""
                      src={icon.src}
                      width={22}
                      height={22}
                      alt={icon.name}
                    />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className={cn(
          `w-20 flex-none  relative flex gap-4 top-[-2.5rem] left-2 md:left-8 items-center menuIcon ${
            !routeChange ? "pointer-events-auto" : "pointer-events-none"
          } `,
          {
            "z-[98]": modalDisplay === "menu",
          }
        )}>
        <Icon name="menu" onToggle={() => setModal("menu")} />
      </div>
      <Modal />
      <Search />
    </div>
  );
}

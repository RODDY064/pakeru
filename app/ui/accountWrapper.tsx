"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { AccountContext, useAccount } from "../(home)/account/account-context";
import { usePathname, useRouter } from "next/navigation";
import { useBoundStore } from "@/store/store";
import { signOut } from "next-auth/react";

gsap.registerPlugin(ScrollTrigger);

export default function AccountWrapper({
  children,
}: {
  children: React.ReactNode;
}) {

    
  const [pages, setPages] = useState([
    {
      name: "profile",
      label: "MY PROFILE",
      isActive: true,
    },
    {
      name: "mybookmarks",
      label: "MY BOOKMARKS",
      isActive: false,
    },
    {
      name: "orders",
      label: "MY ORDERS",
      isActive: false,
    },
  ]);
  const router = useRouter()
  const pathname = usePathname()
  const { scrollAmount } = useBoundStore()
  const navRef = useRef<HTMLDivElement>(null); 

  const handlePage = (pageName: string) => {
    // if not on /account, navigate there
    if (pathname !== "/account") {
      router.push("/account");
    }

    // update active tab
    setPages(prev =>
      prev.map(page => ({
        ...page,
        isActive: page.name === pageName,
      }))
    );
  };

 useGSAP(() => {
    if (!navRef.current) return;

    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Create the scroll animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body, // Use body as trigger for more reliable detection
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          // Smooth transform based on scroll progress
          const progress = self.progress;
          gsap.to(navRef.current, {
            y: progress > 0.02 ? -35 : 0,
            duration: 0.6,
          });
        }
      }
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [pathname]);

  // Refresh ScrollTrigger when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);


  return (
    <AccountContext.Provider value={{ pages, handlePage }}>
      <div 
      ref={navRef}
      style={{ transform: "translateY(0)" }} 
      className="w-full h-12 md:h-20 px-2 md:px-8 fixed border-t border-b border-black/10 flex justify-between account-nav z-20 bg-white ">
        <div
          onClick={() => handlePage("profile")}
          className="h-full flex  items-center relative md:border-x border-black/10 cursor-pointer " >
          <p className="font-avenir font-[500] text-sm  md:px-6">MY PROFILE</p>
          {pages[0].isActive && (
            <div className="w-full absolute bottom-0 h-[10px] md:bg-black/10"></div>
          )}
        </div>
        <div className="flex items-center h-full">
          <div className="md:flex hidden h-full">
            <div
              onClick={() => handlePage("mybookmarks")}
              className="h-full flex  items-center relative border-x border-black/10 cursor-pointer"
            >
              <p className="font-avenir font-[500] text-sm px-6">
                MY BOOKMARKS
              </p>
              {pages[1].isActive && (
                <div className="w-full absolute bottom-0 h-[10px] md:bg-black/10"></div>
              )}
            </div>
            <div
              onClick={() => handlePage("orders")}
              className="h-full flex  items-center relative border-x border-black/10 cursor-pointer"
            >
              <p className="font-avenir font-[500] text-sm px-6">MY ORDER</p>
              {pages[2].isActive && (
                <div className="w-full absolute bottom-0 h-[10px] md:bg-black/10"></div>
              )}
            </div>
            <div className="h-full flex px-10 items-center relative border-r border-black/10">
              <div onClick={()=>signOut()} className="py-2 px-8 bg-black text-white rounded cursor-pointer">
                Sign out
              </div>
            </div>
          </div>
          <div className="px-3 md:hidden">
            <Image
              src="/icons/account-menu.svg"
              width={20}
              height={20}
              alt="menu"
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
      {children}
    </AccountContext.Provider>
  );
}

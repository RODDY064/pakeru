"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/app/ui/button";
import Image from "next/image";
import PersonalDetails from "@/app/ui/personal-details";
import Orders from "@/app/ui/orders";

gsap.registerPlugin(ScrollTrigger);

export default function Account() {
  const [pages, setPages] = useState([
    {
      name: "profile",
      label: "MY PROFILE",
      isActive: true,
    },
    {
      name: "orders",
      label: "MY ORDERS",
      isActive: false,
    },
  ]);

  const handlePage = (pageName: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => ({
        ...page,
        isActive: page.name === pageName,
      }))
    );
  };

  useGSAP(() => {
    gsap.to(".account-nav", {
      y: -38,
      scrollTrigger: {
        trigger: ".nav-ads",
        start: "top top",
        scrub: 1,
      },
    });
  });

  function render() {
    const activePage = pages.find((page) => page.isActive)?.name;
    switch (activePage) {
      case "profile":
        return <PersonalDetails />; 
      case "orders":
        return <Orders/>; 
      default:
        return null;
    }
  }

  return (
    <div className="w-full min-h-dvh flex flex-col items-center text-black  pt-24 md:pt-24 ">
      <div className="w-full h-12 md:h-20 px-2 md:px-8 fixed bg-white border-t border-b border-black/10 flex justify-between account-nav z-20  ">
        <div
        onClick={()=>handlePage('profile')}
         className="h-full flex  items-center relative md:border-x border-black/10 cursor-pointer ">
          <p className="font-avenir font-[500] text-sm  md:px-6">MY PROFILE</p>
          { pages[0].isActive && <div className="w-full absolute bottom-0 h-[10px] md:bg-black/10"></div>}
        </div>
        <div className="flex items-center h-full">
          <div className="md:flex hidden h-full">
            <div 
             onClick={()=>handlePage('orders')}
            className="h-full flex  items-center relative border-x border-black/10 cursor-pointer">
              <p className="font-avenir font-[500] text-sm px-6">MY ORDER</p>
              { pages[1].isActive && <div className="w-full absolute bottom-0 h-[10px] md:bg-black/10"></div>}
            </div>
            <div className="h-full flex px-10 items-center relative border-r border-black/10">
              <div className="py-2 px-8 bg-black text-white rounded cursor-pointer">
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
      <div className="text-black  w-full h-full bg-[#f2f2f2] px-4  xl:px-24  pt-32 pb-24 ">
        {render()}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Input from "./input";
import { useForm } from "react-hook-form";
import Submit from "./submit";
import Image from "next/image";
import Link from "next/link";
import { useBoundStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { handleNavigation } from "@/libs/navigate";

const socailMedia = [
  {
    name: "tiktok",
    icon: "tiktok.svg",
    size: 30,
    href: "https://www.tiktok.com/@pakeru_",
  },
  {
    name: "instagram",
    icon: "instagram.svg",
    size: 30,
    href: "https://www.instagram.com/pakeru_",
  },
  {
    name: "snapchat",
    icon: "snapchat.svg",
    size: 34,
    href: "https://snapchat.com/t/2roHlINV",
  },
  {
    name:"facebook",
    icon:"facebook.svg",
    size:30,
    href:"https://www.facebook.com/share/1FGrwyBGT6/?mibextid=wwXIfr"
  }
];

export default function Footer() {
  const { register } = useForm();
  const { setRouteChange } = useBoundStore();
  const router = useRouter();

  return (
    <div className="w-full h-fit px-2 sm:px-4 md:px-8 text-black bg-b py-12 relative">
      <div className="w-full h-full border-t-2 border-t-black/5 pt-10 flex flex-col xl:flex-row xl:justify-between">
        <div className="flex xl:w-[40%]">
          <div className="ml-4 font-avenir grid items-stretch justify-between grid-cols-2 sm:grid-cols-2 gap-6  md:gap-10 xl:gap-12 md:grid-cols-3 w-full mt-6">
            {/* Shopping Links */}
            <div className="text-black/70">
              <p className="text-sm md:text-md font-[400] font-avenir">SHOP</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-3">
               <Link href="shop?createdAt=newest">
                <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  New Arrivals
                </li>
               </Link>
                <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Best Sellers
                </li>
                <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  All Products
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="text-black/70 ">
              <p className="text-sm md:text-md font-[400] font-avenir">
                CUSTOMER SERVICE
              </p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Shippment
                </li>
                <Link href="/account">
                  <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                    Order Tracking
                  </li>
                </Link>
                <Link href="/faqs">
                  <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                    FAQs
                  </li>
                </Link>
              </ul>
            </div>

            {/* Company Info */}
            <div className="text-black/70">
              <p className="text-sm md:text-md font-[400] font-avenir">
                COMPANY
              </p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <Link href="/about-us">
                  <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                    About us
                  </li>
                </Link>
                <Link href="/policy">
                  <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                    Privacy Policy
                  </li>
                </Link>
                {/* <li className="text-sm md:text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Returns Policy
                </li> */}
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[40%] flex flex-col px-4 xl:mt-6 mt-12 xl:ml-0  h">
          <div className="w-full">
            <p className="text-sm font-[400] text-black/70 font-avenir">
              GET IN TOUCH
            </p>
            <div className="my-4 mt-2 w-full flex gap-2">
              <Link href="mailto:pakeru@25gmail.com" className="w-full">
                <div className="w-[70%] h-12 bg-black flex gap-2 items-center justify-center rounded-md cursor-pointer">
                  <Image
                    src="/icons/contacts.svg"
                    width={24}
                    height={24}
                    alt="contacts"
                  />
                  <p className="text-white font-avenir pt-[3px]">Email Us</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div className="flex items-center gap-1 my-3">
              {socailMedia.map((item, index) => (
                <Link target="_blank" key={index} href={item.href}>
                  <div className="size-10  rounded-lg cursor-pointer flex items-center justify-center">
                    <Image
                      src={`/social/${item.icon}`}
                      width={item.size}
                      height={item.size}
                      alt={item.name}
                    />
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-xs text-black/50 hidden md:flex">
              &copy; {new Date().getFullYear()} PAKERU. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-center mt-6 md:mt-12">
        <Link
          href="/"
          onClick={(e) => handleNavigation(e, "/", router, setRouteChange, 200)}
          className="w-fit "
        >
          <div className=" w-fit h-12 overflow-hidden flex my-2 items-center gap-1 cursor-pointer ">
            <Image
              src="/icons/logo.svg"
              width={38}
              height={24}
              alt="logo"
              className="hidden md:flex"
            />
            <Image
              src="/icons/logo.svg"
              width={24}
              height={24}
              alt="logo"
              className="md:hidden"
            />
            <Image
              src="/icons/logoText.svg"
              width={150}
              height={24}
              alt="logo"
              className="hidden md:flex"
            />
            <Image
              src="/icons/logoText.svg"
              width={70}
              height={24}
              alt="logo"
              className="md:hidden"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}

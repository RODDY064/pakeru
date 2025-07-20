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

export default function Footer() {
  const { register } = useForm();
  const { setRouteChange } = useBoundStore();
  const router = useRouter();

  return (
    <div className="w-full h-fit px-4 md:px-8 text-black bg-b ">
      <div className="w-full h-full border-t-2 border-t-black/5 pb-24 pt-10 flex flex-col xl:flex-row">
        <div className="xl:w-[60%] flex gap-2 ">
          <Link
            href="/"
            onClick={(e) =>
              handleNavigation(e, "/", router, setRouteChange, 200)
            }
            className="w-fit hidden md:flex " >
            <div className=" w-fit h-12 overflow-hidden flex my-2 items-center gap-1 cursor-pointer pr-4">
              <Image src="/icons/logo.svg" width={22} height={24} alt="logo" />
              <Image
                src="/icons/logoText.svg"
                width={72}
                height={24}
                alt="logo"
              />
            </div>
          </Link>
          <div className="ml-4 font-avenir grid items-stretch justify-between grid-cols-2 gap-10 md:grid-cols-3 w-full mt-6">
            {/* Shopping Links */}
            <div className="text-black/70">
              <p className="text-md font-[400] font-avenir">SHOP</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-3">
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  New Arrivals
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Best Sellers
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Sale
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Gift Cards
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  All Products
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="text-black/70 ">
              <p className="text-md font-[400] font-avenir">CUSTOMER SERVICE</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Help Center
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Shipping & Returns
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Order Tracking
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Size Guide
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  FAQs
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div className="text-black/70">
              <p className="text-md font-[400] font-avenir">COMPANY</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="w-fit text-md font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  About Us
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Careers
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Press
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Sustainability
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Affiliate Program
                </li>
              </ul>
            </div>

            {/* Legal */}
            {/* <div className="text-black/70">
              <p className="text-md font-[400] font-avenir">LEGAL</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Terms of Service
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Privacy Policy
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Cookie Policy
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Accessibility
                </li>
                <li className="text-md w-fit font-avenir  text-black/50 cursor-pointer hover:text-black/30">
                  Returns Policy
                </li>
              </ul>
            </div> */}
          </div>
        </div>
        <div className="w-full md:w-[40%] flex flex-col px-4 xl:mt-6 mt-12 xl:ml-0  h">
          <div className="w-full">
            <p className="text-sm font-[400] text-black/70 font-avenir">GET IN TOUCH</p>
            <div className="my-4 mt-2 w-full flex items-center justify-center gap-2">
              <div className="w-[70%]">
                <Input
                  label=""
                  textStyle="hidden"
                  register={register}
                  name="phone"
                  placeH="Get in touch with us"
                  type="email"
                  image="/icons/contact.svg"
                  imageW={24}
                  imageH={24}
                />
              </div>
              <div className="w-[30%]">
                <Submit submitType="in-touch" type="idle" subStyle="mt-1" />
              </div>
            </div>
          </div>
          <p className="text-xs text-black/50">
            © 2025 PAKERU. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

/*  {



} */

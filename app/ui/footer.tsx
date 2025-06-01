"use client";

import React from "react";
import Input from "./input";
import { useForm } from "react-hook-form";
import Submit from "./submit";

export default function Footer() {
  const { register } = useForm();

  return (
    <div className="w-full h-fit px-4 md:px-8 text-black ">
      <div className="w-full h-full border-t-2 border-t-black/5 py-6 flex flex-col xl:flex-row">
        <div className="xl:w-[60%] flex gap-2 ">
          <div className="flex-none hidden md:flex">
            <p className="text-sm font-black font-manrop text-black/20 cursor-pointer">
              PAKERU {">"}
            </p>
          </div>
          <div className="ml-4 font-manrop grid items-stretch justify-between grid-cols-2 gap-10 md:grid-cols-4 w-full">
            {/* Shopping Links */}
            <div className="text-black/70">
              <p className="text-sm font-bold">SHOP</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  New Arrivals
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Best Sellers
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Sale
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Gift Cards
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  All Products
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="text-black/70">
              <p className="text-sm font-bold">CUSTOMER SERVICE</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Help Center
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Shipping & Returns
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Order Tracking
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Size Guide
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  FAQs
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div className="text-black/70">
              <p className="text-sm font-bold">COMPANY</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  About Us
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Careers
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Press
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Sustainability
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Affiliate Program
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-black/70">
              <p className="text-sm font-bold">LEGAL</p>
              <ul className="mt-3 list-disc ml-4 flex flex-col gap-2">
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Terms of Service
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Privacy Policy
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Cookie Policy
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Accessibility
                </li>
                <li className="text-sm font-bold text-black/50 cursor-pointer hover:text-black/30">
                  Returns Policy
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="md:w-[40%] flex flex-col px-4 xl:mt-0 mt-8 xl:ml-0 ml-18">
          <div className="w-full">
            <p className="text-sm font-bold text-black/70">GET IN TOUCH</p>
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
                 <Submit submitType='in-touch' type="idle" subStyle="mt-1"/>
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

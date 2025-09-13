"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import Icon from "../Icon";
import { WebhookConnectionStatus } from "@/app/(dashboard)/orders/hooks/webhookProivider";


export default function Navbar() {
  return (
    <div className="w-full fixed z-[99] py-2 md:py-4 px-2 md:px-8 bg-black text-white font-avenir font-[500] flex items-center justify-between">
      <div>
        <Image
          src="/icons/text-logo-w.svg"
          width={90}
          height={24}
          alt="pakeru logo"
          className="hidden md:flex"
        />
        <Image
          src="/icons/text-logo-w.svg"
          width={60}
          height={24}
          alt="pakeru logo"
          className="flex md:hidden"
        />
      </div>
      <div className="flex items-center gap-2 ">
          <WebhookConnectionStatus/>
        <div className="px-2 rounded-lg py-2  max-sm:mt-2 md:bg-white/15 relative cursor-pointer">
          <Image
            src="/icons/notification.svg"
            width={24}
            height={24}
            alt="notification"
          />
          <div className="size-5 rounded-full border border-white/50 absolute top-[-10px] right-0 flex items-center justify-center">
            <p className="font-avenir font-[300] text-red-500 text-xs pt-[2px]">
              3
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-white/15 rounded-lg cursor-pointer hidden md:flex">
          <p className="font-avenir font-[500] text-md">Pakeru Store</p>
        </Link>
        <div className="size-11 rounded-full  items-center justify-center bg-white/15 hidden md:flex cursor-pointer">
          <p className="font-avenir font-[500] text-md">MS</p>
        </div>
    
      </div>
    </div>
  );
}

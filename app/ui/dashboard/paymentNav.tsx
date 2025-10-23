"use client";

import { handleNavigation } from "@/libs/navigate";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function PaymentNav() {
  const { setRouteChange, cartItems, getCartStats } = useBoundStore();
  const router = useRouter();

  return (
    <div 
    className="w-full flex flex-row justify-between px-3 md:px-8 items-center fixed z-50 bg-white border-b border-black/20">
      <Link
        href="/"
        onClick={(e) => handleNavigation(e, "/", router, setRouteChange, 200)}
        className="flex-none w-24 h-[24px] "
      >
        <Image
          src="/icons/text-logo.svg"
          width={150}
          height={12}
          alt="logo"
          className="mt-[-2.4rem] "
        />
      </Link>
      <div className="w-fit h-full  border-l border-black/20 py-5 text-center pl-6 flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 flex-none">
          <Image src="/icons/call.svg" width={20} height={20} alt="call" />
          <p className="font-avenir font-[400] text-black/60 text-md mt-1">
            Call us at <span className="pl-1">+233 5569 867 61</span>
          </p>
        </div>
      </div>
    </div>
  );
}

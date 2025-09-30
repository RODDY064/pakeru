"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PersonalDetails from "@/app/ui/personal-details";
import MyBookmarks from "@/app/ui/mybookmarks";
import { useAccount } from "./account-context";
import MyOrders from "@/app/ui/myorders";
import { useSession } from "next-auth/react";

gsap.registerPlugin(ScrollTrigger);

export default function Account() {
  const { pages } = useAccount();
  const { data: session } = useSession();

  function render() {
    const activePage = pages?.find((page) => page.isActive)?.name;
    switch (activePage) {
      case "profile":
        return <PersonalDetails />;
      case "orders":
        return <MyOrders />;
      case "mybookmarks":
        return <MyBookmarks />;
      default:
        return null;
    }
  }

  return (
    <div className="w-full min-h-dvh">
      <div className="text-black  w-full h-full bg-[#f2f2f2] px-4  pt-20 sm:px-12 lg:px-16 xl:px-24 md:pt-32 pb-24 ">
        {session?.user && <>{render()}</>}
      </div>
    </div>
  );
}

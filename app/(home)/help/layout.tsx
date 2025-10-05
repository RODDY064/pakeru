"use client"


import Image from "next/image";
import React, { useState } from "react";
import { Helps } from "./data";


export default function HelpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const [search, seSearch] = useState("")


  return (
    <div className="w-full min-h-screen flex flex-col pt-32 md:pt-[12rem] items-center">
      <h1 className="font-avenir text-xl md:text-3xl">GET HELP</h1>
      <div className="w-full flex flex-col items-center">
        <div className="w-[80%] md:w-[60%] xl:w-[30%] h-10 md:h-14 border flex items-center border-black/50 focus-within:border-black mt-4 rounded-xl md:rounded-2xl p-2 px-3 md:p-4 md:px-5 relative">
          <input
            placeholder="What can we help you with?"
            className="w-[90%] focus:outline-none text-black/70"
          />
          <div className="flex justify-end w-full cursor-pointer">
            <Image
              src="/icons/search.svg"
              width={16}
              height={16}
              alt="search"
            />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

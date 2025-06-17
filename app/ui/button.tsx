"use client"

import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React from "react";

export default function Button({
  word,
  bagIcon,
  backColor,
  action
}: {
  word: string;
  bagIcon?: boolean;
  backColor?:'white' |'black',
  action?:()=>void
}) 
{


  return <div 
  onClick={action}
  className="max-w-64  bg-white text-black my-4 cursor-pointer px-8 md:px-10 py-2 flex items-center justify-center gap-2 rounded-[0.1rem]">
    <p className="capitalize font-manrop font-[500] text-sm md:text-lg mt-1">{word}</p>
    <Image 
    src="/icons/bag-b.svg"
    width={22}
    height={22}
    className="hidden md:block"
    alt="bag"/>
    <Image 
    src="/icons/bag-b.svg"
    width={18}
    height={18}
    className="md:hidden"
    alt="bag"/>
  </div>;
}

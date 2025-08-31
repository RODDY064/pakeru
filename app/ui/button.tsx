"use client"

import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React from "react";

export default function Button({
  word,
  bagIcon,
  backColor,
  action,
  ID
}: {
  word: string;
  bagIcon?: boolean;
  backColor?:'white' |'black'
  ID?:string
  action?:(e:any)=>void
}) 
{


  return <div 
  onClick={action}
  id={ID}
  className=" bg-black text-white mt-2 cursor-pointer px-6 py-2 flex items-center justify-center gap-2 rounded-[0.1rem]">
    <p className="capitalize font-avenir font-[400] text-sm md:text-sm mt-1">{word}</p>
    <Image 
    src="/icons/bag-w.svg"
    width={18}
    height={18}
    className="hidden md:block"
    alt="bag"/>
    <Image 
    src="/icons/bag-w.svg"
    width={18}
    height={18}
    className="md:hidden"
    alt="bag"/>
  </div>;
}

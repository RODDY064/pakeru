"use client"

import { cn } from "@/libs/cn";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React from "react";

export default function SearchIcon({ style }:{ style:string}) {
  const { toggleSearch } = useBoundStore()
  return (
    <div className={cn("ml-24 flex",style)}>
      <div onClick={toggleSearch} className="cursor-pointer flex gap-2 items-center ">
        <Image src="/icons/search.svg" width={16} height={16} alt="search"/>
        <div className="relative h-[18px]">
          <span className="block font-avenir font-medium text-sm pt-[1px]">
            SEARCH
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React from "react";

export default function Checkbox({ active, action}:{ active:boolean,action:()=>void} ) {

  return (
    <div 
    onClick={action}
    className="size-5 border border-black/20  rounded-sm flex-none cursor-pointer">
      {active && (
        <Image src="/icons/check.svg" width={20} height={20} alt="check" />
      )}
    </div>
  );
}

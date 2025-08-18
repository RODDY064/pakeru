"use client"

import React from "react";
import Image from "next/image";
import Richtext from "@/app/ui/dashboard/richtext";


export default function CreateProduct() {
  return (
    <div className="px-4 xl:px-8  xl:ml-[15%]  pt-24 pb-32">
      <div className="w-[90%] flex items-center gap-4">
        <Image
          src="/icons/arrow.svg"
          width={20}
          height={20}
          alt="arrow"
          className="rotate-90 cursor-pointer"
        />
        <div className="flex justify-between items-center w-full ">
          <p className="font-avenir text-2xl font-bold mt-[5px]">
            Add a product
          </p>
          <div className="px-3 py-2 bg-black flex items-center gap-2 cursor-pointer rounded-lg">
            <p className="font-avenir text-sm font-[500] text-white mt-[3px]">
              Create
            </p>
            <Image src="/icons/plus-w.svg" width={18} height={18} alt="plus" />
          </div>
        </div>
      </div>
      <div className="w-full flex items-center mt-10 ">
        <div className="w-[70%]">
          <div className="w-full min-h-[300px] bg-white border border-black/20 rounded-3xl p-6">
           <div>
             <p className="font-avenir font-[500] text-xl ">Title</p>
            <input 
            placeholder="Sheet Sleeve Hoodie"
            className="w-full border placeholder:text-black/30 border-black/10 bg-black/5 rounded-lg mt-2 h-11 p-2 focus:outline-none focus-within:border-black/30"/>
           </div>
           <div className="mt-4">
             <p className="font-avenir font-[500] text-xl ">Descritpion</p>
           <div className="mt-2">
             <Richtext/>
           </div>
           </div>
          </div>
        </div>
        <div className="w-[30%]"></div>
      </div>
    </div>
  );
}

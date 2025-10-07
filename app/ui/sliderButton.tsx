"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import React, { useRef } from "react";


export default function SliderButton() {


  return (
    <div
      className="w-fit  h-16 rounded-full bg-black navButton items-center text-white justify-center lg:flex hidden px-3"
    >
      <div className="flex items-center justify-between w-full">
        <div className="size-10 hero-slider-prev hover:border-white/50 cursor-pointer flex items-center justify-center border rounded-full prev flex-none">
          <Image
            src="/icons/arrow-w.svg"
            width={18}
            height={18}
            alt="arrow"
            className="rotate-90 group-hover/sc:hidden"
          />
        </div>
        <p className="font-avenir font-[300]  flex-none flex mx-4 text-center text-md">
          Drag the slider or click the buttons to slide
        </p>
        <div className="size-10 hero-slider-next cursor-pointer flex items-center justify-center border rounded-full next hover:border-white/50 flex-none">
          <Image
            src="/icons/arrow-w.svg"
            width={18}
            height={18}
            alt="arrow"
            className="rotate-270"
          />
        </div>
      </div>
    </div>
  );
}

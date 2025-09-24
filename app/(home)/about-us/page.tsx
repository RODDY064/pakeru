import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AboutUs() {
  return (
    <div className="w-full min-h-dvh px-4 pt-[35%] sm:pt-[25%] md:pt-32 xl:pt-42  flex xl:items-center  justify-center mb-24">
      <div className="w-[95%] md:w-[70%] lg:w-[60%]  min-h-[400px]">
        <h1 className=" font-avenir text-[24px] md:text-[32px] xl:text-[38px]  font-semibold ">
          About us
        </h1>
        <p className="text-justify md:text-pretty text-md md:text-2xl font-avenir mt-4 indent-8 text-black/50">
          "In a quiet village nestled between emerald hills, Lie, a curious fox
          with fur like autumn leaves, discovered a shimmering stone hidden
          beneath a gnarled oak. Each night, it whispered forgotten secrets of
          the forest, tales of ancient trees and wandering spirits. Lie,
          enchanted, shared these stories with the village children, who
          gathered under starlight, eyes wide with wonder.
        </p>
        <p className="text-justify md:text-pretty text-md md:text-2xl  font-avenir mt-4 text-black/50">
          But the stone’s glow began to fade, and Lie realized it thrived on
          truth. So, the fox wove its tales with honesty, and the stone shone
          brighter, binding the village in trust and magic forever."
        </p>

        <div className="mt-12 flex flex-col items-center">
          <div className="w-[98%] md:w-[80%] lg:w-[60%] h-[200px] md:h-[250px] bg-[#f2f2f2] rounded-2xl p-[2px] overflow-hidden relative flex items-center justify-center">
            <div className="absolute h-full p-[2px]  w-full flex items-center justify-center top-0 left-0">
              <div className="bg-white w-full h-full flex items-center justify-center rounded-2xl relative">
                <Image
                  src="/icons/logoText.svg"
                  width={150}
                  height={50}
                  alt="pakeru logo"
                  className="opacity-10 md:opacity-30"
                />
                <Image
                  src="/icons/logo.svg"
                  width={34}
                  height={34}
                  alt="pakeru logo"
                  className="absolute bottom-4 right-3"
                />
              </div>
            </div>
            <div className="w-full h-full rounded-2xl p-4 md:p-8 relative top-0 ">
              <Link href="mailto:pakeru@gmail.com">
                <p className="font-avenir text-blue-600 underline decoration-dotted underline-offset-2 cursor-pointer text-lg">
                  Pakeru@gmail.com
                </p>
              </Link>
              <p className="font-avenir text-black mt-2 underline decoration-dotted underline-offset-2 cursor-pointer text-lg">
                +233 5999 69735
              </p>
              <p className="font-avenir text-black mt-3  text-lg">
                Kumasi, KNUST
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

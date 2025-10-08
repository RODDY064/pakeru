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
          "You were never made to blend in. The world teaches conformity, but
          you were built to write your own rules. Pakeru exists for you: the
          ambitious, the unorthodox, the one who chooses to Defy the Norm. Born
          in Ghana, Pakeru is where Western refinement meets Ghanaian soul.
          Every piece is crafted in limited runs, shaped by local artisans who
          bring precision, meaning, and human touch into every detail. We
          believe true luxury is not loud, it is rare, intentional, and refined.
          Our collections are more than clothing. 
        </p>
        <p className="text-justify md:text-pretty text-md md:text-2xl  font-avenir mt-4 text-black/50">
          They are symbols of identity
          rewards for those who have escaped the ordinary, and challenges for
          those still breaking free. Minimal yet bold, tailored yet expressive,
          each garment is designed to move with you, to become part of your
          story. At Pakeru, we do not chase trends. We honor craft, rarity, and
          defiance. This is not just our story it is yours. A legacy carried in
          fabric, stitched for those who dare to stand apart."
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
                  Pakeru25@gmail.com
                </p>
              </Link>
              <p className="font-avenir text-black mt-2 underline decoration-dotted underline-offset-2 cursor-pointer text-lg">
                +233 55 698-6761
              </p>
              <p className="font-avenir text-black mt-3  text-lg">
                Asokore Mampong,
              </p>
              <p className="font-avenir text-black   text-lg">Ashanti</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

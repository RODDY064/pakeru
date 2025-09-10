import Image from "next/image";
import React from "react";

export default function Notification() {
  return (
    <div className="mt-26 flex flex-col items-center w-full">
      <div className="w-[90%] sm:w-[80%] lg:w-[60%]  max-w-3xl h-[500px] sm:h-[600px] bg-white border border-black/20 flex flex-col items-center relative overflow-hidden">
        <div className="absolute right-[-8%] flex   opacity-30  w-[40%] h-[40%] bottom-[-10%]  md:bottom-[-3%]">
          <div className="w-full h-full  relative ">
            <Image
              src="/icons/logo.svg"
              fill
              alt="pakeru logo"
              className="rotate-[-42deg] "
            />
          </div>
        </div>
        <div className="w-full h-full relative z-20 flex flex-col items-center p-4  md:p-16 pt-12 sm:pt-20">
          <div className="flex items-center gap-2  flex-none">
            <p className="font-avenir  text-xl sm:text-2xl font-semibold pt-[2px]">
              Payment Paid 
            </p>
            <Image
              src="/icons/tick-circle.svg"
              width={32}
              height={32}
              alt="tick-circle"
              className="hidden sm:flex"
            />
            <Image
              src="/icons/tick-circle.svg"
              width={24}
              height={24}
              alt="tick-circle "
              className="flex sm:hidden"
            />
          </div>
          <div className="mt-4 w-full bg-amber-60 flex flex-col items-center">
            <p className="text-center text-md md:text-lg font-avenir w-[90%]  sm:w-[70%] ">
              Your payment has been received, and your order has been placed
              successfully. You can check your order  status anytime in your
              account dashboard.
            </p>
            <p className="text-center text-md md:text-lg font-avenir mt-4 w-[90%] sm:w-[80%]"> A confirmation email has been sent to  ro********@gmail.com
              with your order details.</p>
            <p className="mt-10 font-semibold uppercase text-sm md:text-md font-avenir text-center px-10">
              Thank you for shopping with us
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

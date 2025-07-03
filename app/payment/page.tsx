"use client"

import { handleNavigation } from "@/libs/navigate";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function Payment() {
  const { setRouteChange} = useBoundStore()
  const router = useRouter()
 
  return (
    <div className="w-full min-h-dvh flex flex-col items-center bg-[#f2f2f2]">
      <div className="w-full flex flex-row justify-between px-3 md:px-8 items-center bg-white border-b border-black/20">
        <Link href="/" onClick={(e)=>handleNavigation(e, "/", router, setRouteChange, 200)} className="flex-none w-24 h-[24px] ">
          <Image
            src="/icons/textLogo.svg"
            width={150}
            height={12}
            alt="logo"
            className="mt-[-2.4rem] "
          />
        </Link>
        <div className="w-fit h-full  border-l border-black/20 py-5 text-center pl-6 flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 flex-none">
            <Image src="/icons/call.svg" width={20} height={20} alt="call" />
            <p className="font-avenir font-[400] text-black/60 text-md mt-1">
              Call us at <span className="pl-1">0599969735</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-12 w-[95%] md:w-[94%] lg:w-[80%] flex flex-col md:flex-row items-start gap-4">
        <div className="w-full md:w-[60%]  lg:w-[65%] flex flex-none flex-col">
          <div className="flex gap-2 items-center cursor-pointer">
            <Image
              src="/icons/arrow.svg"
              width={16}
              height={16}
              alt="call"
              className="rotate-90"
            />
            <p className="font-avenir text-md font-[400] mt-[4px]">Back</p>
          </div>
          <div className="w-full min-h-32 bg-white mt-3.5 rounded-md px-4 py-6">
            <div className="flex items-center justify-between">
                <p className="font-avenir font-[400] text-sm">IDENTIFICATION</p>
                 <p className="font-avenir font-[400] text-sm text-black/50 cursor-pointer underline underline-offset-3">
                EDIT
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col gap-4 flex-none py-10 ">
          <div className="w-full min-h-32 bg-white rounded-md px-4 py-6">
            <div className="flex items-center justify-between">
              <p className="font-avenir font-[400] text-sm">MY SHOPPING CART</p>
              <p className="font-avenir font-[400] text-sm text-black/50 cursor-pointer underline underline-offset-3">
                EDIT
              </p>
            </div>
            <div className="mt-4">
              {[1, 2, 3].map((item) => (
                <PaymentCard key={item} />
              ))}
            </div>
            <div className="mt-8">
                <div className="w-full flex items-center justify-between">
                     <p className="font-avenir font-[400] text-sm">SUBTOTAL</p>
                      <p className="font-avenir font-[400] text-sm">GHS 0.00</p>
                </div>
                <div className="w-full flex items-center justify-between mt-1">
                     <p className="font-avenir font-[400] text-sm">SHIPPING</p>
                      <p className="font-avenir font-[400] text-sm">GHS 0.00</p>
                </div>
            </div>
          </div>
          <div className="w-full min-h-32 bg-white rounded-md px-4 py-6">
             <div className="flex items-start gap-3 py-4 border-b border-black/10">
                <Image
                  src="/icons/payment.svg"
                  width={24}
                  height={24}
                  alt="payment"
                />
                <div className="">
                  <p className="font-avenir font-[400] text-md ">Payment</p>
                  <p className="font-avenir text-sm text-black/50 my-1 ">
                    Mobile money or Credit credit
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-4">
                <Image
                  src="/icons/shipping.svg"
                  width={24}
                  height={24}
                  alt="payment"
                />
                <div className="">
                  <p className="font-avenir font-[400] text-md ">
                    Shipping & Delivery
                  </p>
                  <p className="font-avenir text-sm text-black/50 my-1 ">
                    Mobile money or Credit credit
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}


const PaymentCard = () => {
  return (
    <div className="py-4 border-b border-black/10 flex items-end gap-3">
      <div className="w-[30%] md:w-[20%] h-20 lg:h-20 rounded relative overflow-hidden">
        <Image
          src="/images/hero-2.png"
          fill
          className="object-cover"
          alt="hero"
        />
      </div>
      <div>
        <p className="font-avenir font-[400] text-sm">PORLO MEN'S WEAR</p>
        <p className="font-avenir  font-[400]  text-sm text-black/50  ">
          GHS 550
        </p>
        <p className="font-avenir  font-[400]  text-xs text-black/50   mt-2">QUANTITY: 2</p>
      </div>
    </div>
  );
};

"use client"

import Image from 'next/image';
import Link from 'next/link';
import {  useRouter } from 'next/navigation';
import React from 'react'



export default function  MyOrderDynamic ({ name }: { name: string }){
    const router = useRouter()

  
  return (
    <div className="w-full  h-full bg-[#f2f2f2] px-4  pt-20 sm:px-12 xl:px-24 md:pt-32 pb-24 ">
      <div className="flex gap-2 items-center">
        <div onClick={()=> router.back()} className="size-6 md:size-8 cursor-pointer border border-black/30 flex items-center justify-center rounded-full">
          <Image
            src="/icons/arrow.svg"
            width={16}
            height={16}
            alt="arrow"
            className="rotate-90 md:flex hidden"
          />
          <Image
            src="/icons/arrow.svg"
            width={12}
            height={12}
            alt="arrow"
            className="rotate-90 md:hidden"
          />
        </div>
        <p className="font-avenir text-sm md:text-xl pt-[6px]">Back</p>
      </div>
      <div className="mt-10 px-4 md:px-10">
        <p className="font-avenir text-xl md:text-3xl  font-semibold ">
          Order {name}
        </p>
      </div>
      <div className="flex flex-col items-center mt-10">
        <div className="w-full sm:w-[80%]  lg:w-[55%] border border-black/20 bg-white p-4 md:p-10 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-[#888888] text-lg md:text-2xl">Receipt</p>
            <div className="bg-[#f2f2f2] flex rounded-full  border border-black/10 px-1.5 gap-2">
              <Image
                src="/icons/shipping.svg"
                width={24}
                height={24}
                alt="shipped"
                className="sm:flex hidden"
              />
              <Image
                src="/icons/shipping.svg"
                width={16}
                height={16}
                alt="shipped"
                className=" sm:hidden"
              />
              <p className="font-avenir text-[13px] pt-[3px]">Shipped</p>
            </div>
          </div>
          <p className="font-avenir text-[15px] sm:text-[16px] xl:text-[18px] text-balance my-4">
            Arriving at <span className="font-semibold"> 09 Augutst,</span>{" "}
            7:00am to 1:00am.
          </p>
          <div className="my-6 flex flex-col items-start gap-0.5 py-4 border-dotted px-4 bg-[rgb(250,250,250)] rounded-md border-[0.2px] border-black/10">
            <div>
              <p className="font-avenir text-[13px] text-black/70">
                EMAIL:{" "}
                <span className="text-blue-600 underline-offset-2 underline decoration-dotted text-[15px] md:text-[16px] pl-1">
                  {" "}
                  alanturing@gmail.com
                </span>
              </p>
              <p className="font-avenir text-[13px] text-black/70">
                INVOICE DATE:{" "}
                <span className="text-black text-[15px] md:text-[16px] pl-1">
                  {" "}
                  18 Jan 2023
                </span>
              </p>
              <p className="font-avenir text-[13px] text-black/70">
                ORDER ID:{" "}
                <span className="text-black text-[15px] md:text-[16px] pl-1">
                  {" "}
                  ML4F5L8522
                </span>
              </p>
            </div>
            <div className="mt-4">
              <p className="font-avenir text-[13px] text-black/50">BILLED TO</p>
              <p className="font-avenir text-[15px] md:text-[16px] text-black/70">
                Visa .... 7461
              </p>
              <p className="font-avenir text-[15px] md:text-[16px] text-black/70">
                Alan Turing
              </p>
              <p className="font-avenir text-[15px] md:text-[16px] text-black/70">
                San Francisco, CA 94123
              </p>
            </div>
          </div>
          <div className="my-4 px-4 bg-[rgb(250,250,250)]">
            <p className="font-avenir text-md">Product's</p>
          </div>
          <div className="my-4 flex flex-col">
            <div className="flex items-center justify-between border-b-[0.5px] border-black/20 py-4">
              <div className="flex items-end gap-3">
                <div className="size-[70px] md:size-[120px] relative rounded-xl overflow-hidden bg-[#f3f3f3]">
                  <Image
                    src="/images/hero-2.png"
                    fill
                    alt="hero"
                    className="object-cover"
                  />
                </div>
                <div className="flex-col flex gap-0.5 md:gap-1">
                  <p className="font-avenir font-semibold text-[13px] md:text-[20px]">
                    Livity
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="uppercase font-avenir text-[13px] md:text-[15px] pt-[3px]">
                      Black
                    </p>
                    <div className=" h-[15px]  w-[1px] bg-black " />
                    <p className="uppercase font-avenir text-[13px] md:text-[15px] pt-[3px]">
                      SM
                    </p>
                  </div>
                  <Link
                    href="#"
                    className="text-blue-600 font-avenir text-[13px] md:text-[16px]"
                  >
                    Write a Review
                  </Link>
                </div>
              </div>
              <div className="flex  flex-col justify-end gap-1">
                <p className="font-avenir text-[12px] md:text-[13px] text-black/60 text-end">QUANTITY: 1</p>
                <p className="font-avenir text-[13px]  md:text-[18px] ">
                  GHS 300.99
                </p>
              </div>
            </div>
            <div className="  pt-3 border-black/20 flex justify-end">
              <p className="font-avenir text-[12px] md:text-[13px]  text-black/40">SUBTOTAL: <span className="text-black/60 text-[13px] md:text-[16px] ">GHS 500.00</span></p>
            </div>
            <div className="border-b-[0.5px] pb-3 border-black/20 flex justify-end">
              <p className="font-avenir text-[13px] md:text-[16px] text-black/40">DISCOUNT: <span className="text-black/60"> - GHS 500.00</span></p>
            </div>
            <div className="border-b-[0.5px]  border-black/20 flex gap-2 justify-end">
              <p className="font-avenir text-[15px] md:text-[18px] text-black/80 py-3">TOTAL</p>
              <div className="w-[1px] sefl-stretch  bg-black/20"/>
               <p className="font-avenir text-[16px] md:text-[20px] text-black/80  py-3">GHS 500.00</p>
            </div>
          </div>
          <div className="mt-6 text-center w-full flex flex-col items-center ">
            <p className="font-avenir text-[13px] text-balance md:text-[17px] text-black/60 w-[90%] md:w-[70%]">
              Thank you for your purchase! Your order is being processed and will be shipped within 7 days.
            </p>
            <p className="font-avenir text-[13px] text-balance md:text-[17px] text-black/60 mt-4  w-[90%] md:w-[70%]">
              We appreciate your business and look forward to serving you again.
            </p>
          </div>
        </div>
        
      </div>
      
    </div>
  );
};

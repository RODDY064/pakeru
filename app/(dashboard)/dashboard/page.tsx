import Lines from "@/app/ui/dashboard/lines";
import Image from "next/image";
import React from "react";

export default function Dashboard() {
  return (
    <div className="min-h-dvh md:h-dvh px-4 md:px-8  md:ml-[20%] py-20 md:pt-24">
      <div className="flex">
        <div className="bg-white border border-black/15 rounded-lg cursor-pointer py-1.5  px-4 flex items-center gap-2 flex-none">
          <Image
            src="/icons/calender.svg"
            width={18}
            height={20}
            alt="calender"
          />
          <select className="w-full appearance-none focus:outline-none cursor-pointer">
            <option className="font-avenir font-[500] text-md pt-[3px]">
              {" "}
              Last 7 days
            </option>
            <option className="font-avenir font-[500] text-md pt-[3px]">
              {" "}
              Last 3 months
            </option>
          </select>
        </div>
      </div>
      <div className="bg-white mt-4 w-[100%] xl:w-[80%] min-h-[400px] pb-6 border border-black/15 rounded-3xl md:p-4 relative">
        <div className="flex gap-4 items-center mt-2 px-2">
          <div className="md:w-[180px] flex-none flex flex-col gap-1 bg-black text-white px-6 md:px-4 py-2 rounded-xl border border-black/10 cursor-pointer">
            <p className="font-avenir font-[500] text-sm">Total Orders</p>
            <div className="w-full border-[0.5px] border-dashed border-white/70" />
            <p className="font-avenir font-[600] text-md text-white mt-1">
              200
            </p>
          </div>
          <div className="md:w-[180px] flex-none flex flex-col gap-1 bg-[#f2f2f2]/20  px-6 md:px-4  py-2 rounded-xl border border-black/10 cursor-pointer">
            <p className="font-avenir font-[500] text-sm">Total Sales</p>
            <div className="w-full border-[0.5px] border-dashed border-black/30" />
            <p className="font-avenir font-[600] text-md text-black/40 mt-1">
              GHS 300.0
            </p>
          </div>
        </div>
        <div className="">
          <Lines />
        </div>
        <div className="w-full flex items-center justify-center md:justify-end md:px-8 mt-6">
          <div className="flex gap-6 items-center ">
            <div className="bg-white border border-black/15 rounded-lg cursor-pointer py-1.5  px-4 flex items-center gap-2 flex-none">
              <p className="font-avenir font-[500] text-sm pt-[3px]">
                <span className="text-black/30">FROM: </span>
                Dec 25, 2024
              </p>
            </div>
            <div className="bg-white border border-black/15 rounded-lg cursor-pointer py-1.5  px-4 flex items-center gap-2 flex-none">
              <p className="font-avenir font-[500] text-sm pt-[3px]">
                <span className="text-black/30">TO: </span>
                Dec 31, 2024
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <p className="font-avenir font-[500] text-xl">Requires Attention</p>
        <div className="mt-4 w-full xl:w-[80%]  bg-white border border-black/15 rounded-2xl ">
        <div className="flex p-4  border-b border-black/10">
         <div className="w-full min-h-[20px] flex justify-between items-center cursor-pointer">
               <p>Remove Products</p>
               <div className="flex items-center justify-center gap-2">
                <Image src="/icons/product.svg" width={20} height={20} alt="products"/>
                <div className="size-5.5 rounded-full border border-black/70 flex items-center justify-center">
                <p className="font-avenir font-[3000] text-red-500 text-sm">3</p></div>
                <div className="mx-4 ml-6">
                    <Image src="/icons/arrow.svg" width={18} height={20} alt="arrow" className="opacity-20 rotate-[-90deg] mt-[2px]"/>
                </div>
               </div>
         </div>
        </div>
        <div className="flex p-4  ">
            <div className="w-full min-h-[20px] flex justify-between items-center cursor-pointer">
               <p>Orders Ready to be shipped</p>
               <div className="flex items-center justify-center gap-2">
                <Image src="/icons/orders.svg" width={20} height={20} alt="orders"/>
                <div className="size-5.5 rounded-full border border-black/70 flex items-center justify-center">
                <p className="font-avenir font-[3000] text-red-500 text-sm">3</p></div>
                <div className="mx-4 ml-6">
                    <Image src="/icons/arrow.svg" width={18} height={20} alt="arrow" className="opacity-20 rotate-[-90deg] mt-[2px]"/>
                </div>
               </div>
         </div>
        </div>
        </div>
      </div>
    </div>
  );
}

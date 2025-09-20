import Lines from "@/app/ui/dashboard/lines";
import Image from "next/image";
import React from "react";

export default function Dashboard() {
  return (
    <div className="min-h-dvh md:h-dvh px-4 md:px-8  md:ml-[20%] py-20 md:pt-24">
      <div className="bg-white mt-4 w-[100%] xl:w-[80%] h-[500px] pb-6 border border-black/15 rounded-4xl md:p-10 relative">
        <div className="flex gap-4 items-center mt-2 px-2">
          <div>
            <p  className="font-avenir text-xl text-black/60">TOTAL AMOUNT</p>
            <h1 className="text-6xl font-avenir font-semibold my-2">GHS: 2500.00</h1>
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
                <Image
                  src="/icons/product.svg"
                  width={20}
                  height={20}
                  alt="products"
                />
                <div className="size-5.5 rounded-full border border-black/70 flex items-center justify-center">
                  <p className="font-avenir font-[3000] text-red-500 text-sm">
                    3
                  </p>
                </div>
                <div className="mx-4 ml-6">
                  <Image
                    src="/icons/arrow.svg"
                    width={18}
                    height={20}
                    alt="arrow"
                    className="opacity-20 rotate-[-90deg] mt-[2px]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex p-4  ">
            <div className="w-full min-h-[20px] flex justify-between items-center cursor-pointer">
              <p>Orders Ready to be shipped</p>
              <div className="flex items-center justify-center gap-2">
                <Image
                  src="/icons/orders.svg"
                  width={20}
                  height={20}
                  alt="orders"
                />
                <div className="size-5.5 rounded-full border border-black/70 flex items-center justify-center">
                  <p className="font-avenir font-[3000] text-red-500 text-sm">
                    3
                  </p>
                </div>
                <div className="mx-4 ml-6">
                  <Image
                    src="/icons/arrow.svg"
                    width={18}
                    height={20}
                    alt="arrow"
                    className="opacity-20 rotate-[-90deg] mt-[2px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

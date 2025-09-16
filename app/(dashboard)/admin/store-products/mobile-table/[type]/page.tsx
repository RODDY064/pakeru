import Image from "next/image";
import React from "react";

export default async function MobileTable({
  params,
}: {
  params: Promise<{ type: "all" | "active" | "out-of-stocks" | "inactive" }>;
}) {
  const { type } = await params;

  return (
    <div className="md:hidden">
      <div className="fixed bg-[#f2f2f2]  z-[20]  w-full left-0 top-0 pt-20 px-2 pb-2 border-b border-dashed border-black/30">
        <div className="flex gap-2">
          <Image
            src="/icons/arrow.svg"
            width={16}
            height={16}
            alt="arrow"
            className="rotate-90"
          />
          <p className="font-avenir text-lg mt-[3px] font-bold ">
            {type.charAt(0).toUpperCase() + type.slice(1)} Products
          </p>
        </div>
        <div className="my-2 flex items-center gap-2 justify-between">
          <input
            placeholder="Search for products by name or customer"
            className="w-full h-8 border border-black/20 rounded-2xl p-2 text-[13px] focus:outline-none focus:border-black/50 px-3"
          />
          <div className="bg-black/20 cursor-pointer border border-black/20 size-8 rounded-full flex-shrink-0 flex items-center justify-center">
            <Image
              src="/icons/filter.svg"
              width={16}
              height={16}
              alt="arrow"
              className="rotate-90"
            />
          </div>
        </div>
      </div>
      <div className="pt-[180px] flex flex-col gap-4">
       {[1,2,3,5,6].map((item)=>(
         <div key={item} className="bg-white/30 h-fit px-4 py-3 border border-black/15 relative">
          <div className="flex justify-between items-start">
            <div className="flex my-2">
              <div className=" bg-[#f2f2f2]  w-11 h-11  top-0 left-0 border border-black/20 rounded-[7px] relative overflow-hidden">
                <Image
                  src="/images/hero-2.png"
                  fill
                  alt="hero"
                  className="object-cover"
                />
              </div>
              <div className="ml-3 flex flex-col gpa-[1px]">
                <p className=" font-avenir text-[16px] mt-[1px]">
                  Vintage Luxe Line Blazer
                </p>
                <p className=" font-avenir text-[14px] text-black/50 lowercase">
                  Accessories
                </p>
              </div>
            </div>
             <Image
                src="/icons/arrow.svg"
                width={12}
                height={12}
                alt="arrow"
                className="rotate-[-90deg] opacity-50"
              />
          </div>
          <div className="flex justify-between items-center">
            <p className="font-avenir text-sm">79 in stocks</p>
            <p className="px-2 bg-red-100 text-[12px] border-[0.5px] border-red-300 font-avenir text-red-500 rounded-full">out-of-sctocks</p>
          </div>
        </div>
       ))

       }
      </div>
    </div>
  );
}

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
            {type.charAt(0).toUpperCase() + type.slice(1)} Orders
          </p>
        </div>
        <div className="my-2 flex items-center gap-2 justify-between">
          <input
            placeholder="Search for orders"
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
      <div className="pt-[180px] flex flex-col gap-3">
        {[1, 2, 3, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-white/30 h-fit px-4 py-3 border border-black/15 relative"
          >
            <div className="flex justify-between  items-start">
              <div className="flex ">
                <div className="flex flex-col gpa-[1px]">
                  <p className="font-avenir text-[16px]">Emily Brown</p>
                  <p className=" font-avenir text-[14px] text-black/50 lowercase">
                    4 Products
                  </p>
                </div>
              </div>
              <div className="flex items-end flex-col">
                <Image
                  src="/icons/arrow.svg"
                  width={12}
                  height={12}
                  alt="arrow"
                  className="rotate-[-90deg] opacity-50"
                />
                <p className="mt-2.5 text-yellow-500 font-avenir text-[12px] px-2 rounded-full bg-yellow-50 border-[0.5px] border-yellow-500 lowercase">
                 pending
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="font-avenir text-sm">GHS 167.57</p>
              <p className="font-avenir text-sm text-black/50">
                Jul 2, 6:07 am
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

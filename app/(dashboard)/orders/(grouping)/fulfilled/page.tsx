"use client";
import StatCard from "@/app/ui/dashboard/statsCard";
import Image from "next/image";
import React, { useState } from "react";

export default function Fulfilled() {
  const [fulfilledStats, setFulfilledStats] = useState([
    { label: "Delivered", value: 0 },
    { label: "Shipped", value: 0 },
    { label: "Processing (ready to ship)", value: 0 },
  ]);

  return (
    <div className="min-h-dvh md:h-dvh sm:px-4 xl:px-8   xl:ml-[15%] pb-36 pt-20   md:pt-24 md:pb-32 ">
      <p className="font-avenir text-xl md:text-2xl font-bold max-sm:px-3">
        Fulfilled Orders
      </p>
      <div className="mt-4 w-full h-fit bg-white border border-black/15 sm:rounded-2xl grid grid-cols-2 md:flex md:px-4">
        {fulfilledStats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </div>
  );
}


// table headr
const Header = () => {
  return (
    <>
      <div className="px-2 w-[50%] lg:w-[30%] py-2 bg-black/10 rounded-xl border-black/15 border flex gap-1 items-center">
        <Image
          src="/icons/search.svg"
          width={16}
          height={16}
          alt="search"
          className="mb-[5px]"
        />
        <input
          placeholder="Search by name or emails"
          className="w-full h-full focus:outline-none px-2 text-md font-avenir "
        />
      </div>
      <div className="flex items-center gap-2">
        <p className="font-avenir text-md font-[500] text-black/50">
          Filter by:
        </p>
        <div className="flex items-center justify-center gap-2 border border-black/20 pl-3 pr-1 py-[2px] rounded-lg">
          <p className="font-avenir font-[500] text-md">Status: </p>
          <div className="relative flex items-center">
            <select className="appearance-none cursor-pointer text-gray-600 focus:outline-none px-2 py-[2px] rounded-md font-avenir font-[500] text-md bg-gray-200 border border-gray-500/20 pr-7">
              <option value="Clothing">All</option>
              <option className="font-avenir">Active</option>
            </select>
            <Image
              src="/icons/arrow.svg"
              width={10}
              height={10}
              alt="arrow"
              className="absolute right-2 opacity-70"
            />
          </div>
        </div>
        <div className=" ml-2 flex items-center justify-center gap-2 border border-black/20 pl-3 pr-1 py-[2px] rounded-lg">
          <p className="font-avenir font-[500] text-md">Last Joined: </p>
          <div className="flex items-center border py-[2px]  border-gray-500/20  bg-gray-200 px-2 rounded-md">
            <p className="font-avenir text-md text-black/50">From:</p>
            <input
              type="date"
              placeholder="GHS 00.00"
              className="w-24 focus:outline-none  px-2 text-md font-avenir cursor-pointer"
            />
          </div>
          <div className="flex items-center border py-[2px]  border-gray-500/20  bg-gray-200 px-2 rounded-md">
            <p className="font-avenir text-md text-black/50">To:</p>
            <input
              type="date"
              placeholder="GHS 00.00"
              className="w-24 focus:outline-none  px-2 text-md font-avenir cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
};


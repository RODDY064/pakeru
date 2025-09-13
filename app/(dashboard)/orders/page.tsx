"use client";

import Checkbox from "@/app/ui/dashboard/checkbox";
import OrderModal from "@/app/ui/dashboard/order-modal";
import Pagination from "@/app/ui/dashboard/pagination";
import { cn } from "@/libs/cn";
import { OrdersData, OrdersStore } from "@/store/dashbaord/orders-store/orders";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Orders() {
  return (
    <div className="md:hidden min-h-dvh md:h-dvh sm:px-4 xl:px-8   xl:ml-[15%] pb-36 pt-20   md:pt-24 md:pb-32 ">
      <p className="font-avenir text-xl md:text-2xl font-bold max-sm:px-3">
        Orders
      </p>
      <MobileTabs />
    </div>
  );
}



const MobileTabs = () => {
  const tabs = [
    {
      name: "All",
      icon: "orders.svg",
      num: 3,
    },
    {
      name: "Pending",
      icon: "product-ac.svg",
      num: 5,
    },
    {
      name: "Delivered",
      icon: "product-out.svg",
      num: 0,
    },
     {
      name: "Cancelled",
      icon: "product-inac.svg",
      num: 2,
    },
  ];

  return (
    <div className="mt-6 max-sm:px-3 md:hidden">
        <p className="font-avenir text-lg md:text-2xl ">Notice</p>
        <div className="mt-2 flex flex-col gap-2">
          <Link
            href={`/store-products/mobile-table/fulfills`}>
            <div className="w-full bg-white border border-black/20 py-2 px-3 rounded-xl flex items-center justify-between">
              <div className="flex  gap-1">
                <Image
                  src={`/icons/orders.svg`}
                  width={16}
                  height={16}
                  alt="products"
                />
                <p className="text-sm font-avenir mt-[3px] ">Fulfilled Orders</p>
              </div>
              <div className="flex  gap-1">
                <div className="size-5 rounded-full border border-red-500 flex items-center justify-center">
                  <p className="text-xs font-avenir">{5}</p>
                </div>
                <Image
                  src="/icons/arrow.svg"
                  width={12}
                  height={12}
                  alt="arrow"
                  className="rotate-[-90deg]"
                />
              </div>
            </div>
          </Link>
           <Link
            href={`/store-products/mobile-table/fulfills`}>
            <div className="w-full bg-white border border-black/20 py-2 px-3 rounded-xl flex items-center justify-between">
              <div className="flex  gap-1">
                <Image
                  src={`/icons/orders.svg`}
                  width={16}
                  height={16}
                  alt="products"
                />
                <p className="text-sm font-avenir mt-[3px] ">unfulfilled Orders</p>
              </div>
              <div className="flex  gap-1">
                <div className="size-5 rounded-full border border-red-500 flex items-center justify-center">
                  <p className="text-xs font-avenir">{5}</p>
                </div>
                <Image
                  src="/icons/arrow.svg"
                  width={12}
                  height={12}
                  alt="arrow"
                  className="rotate-[-90deg]"
                />
              </div>
            </div>
          </Link>
        </div>
        <p className="mb-10 mt-3 px-2 font-avenir text-black/40">Fulfilled orders are those already attended to, while unfulfilled orders are still pending.</p>
      <p className="font-avenir text-lg md:text-2xl ">Tables</p>
      <div className="mt-2 flex flex-col gap-2">
        {tabs.map((tab, index) => (
          <Link
            href={`/orders/mobile-table/${tab.name.toLowerCase()}`}
            key={index+tab.name}>
            <div className="w-full bg-white border border-black/20 py-2 px-3 rounded-xl flex items-center justify-between">
              <div className="flex  gap-1">
                <Image
                  src={`/icons/${tab.icon}`}
                  width={16}
                  height={16}
                  alt="products"
                />
                <p className="text-sm font-avenir mt-[3px] ">
                  {tab.name} Orders
                </p>
              </div>
              <div className="flex  gap-1">
                <div className="size-5 rounded-full border border-red-500 flex items-center justify-center">
                  <p className="text-xs font-avenir">{tab.num}</p>
                </div>
                <Image
                  src="/icons/arrow.svg"
                  width={12}
                  height={12}
                  alt="arrow"
                  className="rotate-[-90deg]"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

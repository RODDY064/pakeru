"use client";

import { cn } from "@/libs/cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "motion/react";

const pages: Array<{ name: string; icon: string; path: string, imgW?:number,imgH?:number }> = [
  {
    name: "Home",
    icon: "home.svg",
    path: "/dashboard",
  },
  {
    name: "Orders",
    icon: "orders.svg",
    path: "/orders",
  },
    {
    name:"Products",
    icon:'product.svg',
    path:"/store-products",
    imgW:18
  },
  {
    name: "Customers",
    icon: "customers.svg",
    path: "/customers",
    imgW:18
  },
   {
    name: "Discount",
    icon: "discount.svg",
    path: "/discount",
    imgW:18
  },
];

export default function SideMenu() {
  const pathname = usePathname();

  return (
    <div className="fixed md:w-[20%] xl:inline hidden xl:w-[15%]  h-full bg-[#E9E9E9] border border-black/5 px-8 py-10 pt-24">
      <ul className="flex flex-col gap-1">
        {pages.map((item) => (
          <div
            
            key={item.name}
            className={cn(
              "cursor-pointer px-4 py-2 rounded-xl border border-black/0 hover:bg-white/20 hover:border-[#888888]/20",
              { "bg-white/60  hover:bg-bg-white/60 border-black/10  hover:border-black/10 ": pathname === item.path }
            )}>
            <Link href={item.path} className=" flex items-center gap-2  ">
              <Image
                src={`/icons/${item.icon}`}
                width={item.imgW?? 16}
                height={16}
                alt="home"
              />
              <p className="font-avenir font-[500] text-md mt-[2px] ">
                {item.name}
              </p>
            </Link>
          </div>
        ))}
      </ul>
      <ul className="mt-10">
        <p className="font-avenir font-[500] text-sm text-black/30 ml-3">Manage Store</p>
           <div
            className={cn(
              "cursor-pointer px-4 py-2 rounded-xl border border-black/0 hover:bg-white/20 hover:border-[#888888]/20 mt-2",
              { "bg-white/60  hover:bg-bg-white/60 border-black/10  hover:border-black/10 ": pathname === '/content' }
            )}>
            <Link href={'/content'} className=" flex items-center gap-2  ">
              <Image
                src={`/icons/content.svg`}
                width={19}
                height={16}
                alt="home"
              />
              <p className="font-avenir font-[500] text-md mt-[2px] ">
                Contents
              </p>
            </Link>
          </div>
      </ul>
    </div>
  );
}

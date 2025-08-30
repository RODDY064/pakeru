"use client";

import { cn } from "@/libs/cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "motion/react";

const pages: Array<{ name: string; icon: string; icon_w?:string; path: string, imgW?:number,imgH?:number }> = [
  {
    name: "Home",
    icon: "home.svg",
    icon_w:"home-w.svg",
    path: "/dashboard",
  },
  {
    name: "Orders",
    icon: "orders.svg",
    icon_w:"orders-w.svg",
    path: "/orders",
  },
    {
    name:"Products",
    icon:'product.svg',
    icon_w:"product-w.svg",
    path:"/store-products",
    imgW:18
  },
  {
    name: "Customers",
    icon: "customers.svg",
    icon_w:"customers-w.svg",
    path: "/customers",
    imgW:18
  },
   {
    name: "Discount",
    icon: "discount.svg",
    icon_w:"discount-w.svg",
    path: "/discount",
    imgW:18
  },
];

export default function SideMenu() {
  const pathname = usePathname();

  return (
   <>
    <div className="fixed md:w-[20%] xl:inline hidden xl:w-[15%]  h-full bg-[#E9E9E9] border border-black/5 px-8 py-10 pt-24">
      <ul className="flex flex-col gap-1">
        {pages.map((item) => (
          <Link key={item.name} href={item.path} className=" w-full">
          <div
            
            key={item.name}
            className={cn(
              "cursor-pointer flex w-full gap-2 px-4 py-2 rounded-xl border border-black/0 hover:bg-white/20 hover:border-[#888888]/20",
              { "bg-white/60  hover:bg-bg-white/60 border-black/10  hover:border-black/10 ": pathname === item.path }
            )}>
             <Image
                src={`/icons/${item.icon}`}
                width={item.imgW?? 16}
                height={16}
                alt="home"
              />
              <p className="font-avenir font-[500] text-md mt-[2px] ">
                {item.name}
              </p>
          </div></Link>
        ))}
      </ul>
      <ul className="mt-10">
        <p className="font-avenir font-[500] text-sm text-black/30 ml-3">Manage Store</p>
           <div
            className={cn(
              "cursor-pointer px-4 py-2 rounded-xl border border-black/0 hover:bg-white/20 hover:border-[#888888]/20 mt-2",
              { "bg-white/60  hover:bg-bg-white/60 border-black/10  hover:border-black/10 ": pathname === '/contents' }
            )}>
            <Link href={'/contents'} className=" flex items-center gap-2  ">
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
    <div className=" flex  fixed left-0 bottom-0 w-full min-h-12 bg-black z-[99] py-3 md:hidden items-center justify-center px-4">
       <div className="flex max-sm:gap-4 gap-10 items-center justify-between max-sm:w-full">
        {pages.map((page,index)=>(
         <Link key={index} href={page.path}>
          <div key={index} className="flex flex-col items-center gap-1">
           <div className={cn("",{
            "opacity-50" : pathname !== page.path
           })}>
            <Image src={`/icons/${page.icon_w??""}`} width={22} height={20} alt={page.name}/>
           </div>
           <p className={cn("text-xs text-white",{
            "text-white/50" : pathname !== page.path
           })}>{page.name}</p>
          </div>
         </Link>
        ))
        }
       </div>
    </div>
   </>
  );
}

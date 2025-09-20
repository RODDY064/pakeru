"use client";

import { cn } from "@/libs/cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "motion/react";

const pages: Array<{
  name: string;
  icon: string;
  icon_w?: string;
  path?: string;
  mobilePath?: string;
  imgW?: number;
  imgH?: number;
  subMenus?: Array<{
    name: string;
    path: string;
  }>;
}> = [
  {
    name: "Home",
    icon: "home.svg",
    icon_w: "home-w.svg",
    path: "/admin",
  },
  {
    name: "Orders",
    icon: "orders.svg",
    icon_w: "orders-w.svg",
    subMenus: [
      { name: "Unfulfilled", path: "/admin/orders/unfulfilled" },
      { name: "Fulfilled", path: "/admin/orders/fulfilled" },
    ],
    mobilePath: "/orders",
  },
  {
    name: "Products",
    icon: "product.svg",
    icon_w: "product-w.svg",
    path: "/admin/store-products",
    imgW: 18,
  },
  {
    name: "Customers",
    icon: "customers.svg",
    icon_w: "customers-w.svg",
    path: "/admin/customers",
    imgW: 18,
  }
];

export default function SideMenu() {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed md:w-[20%] xl:inline hidden xl:w-[15%] h-full  bg-[#E9E9E9] border border-black/5 px-8  pt-24">
        <ul className="flex flex-col gap-1">
          {pages.map((item) => (
            <div key={item.name} className="relative w-full group">
              {item.path ? (
                <Link href={item.path} className="w-full">
                  <div
                    className={cn(
                      "cursor-pointer flex w-full gap-2 px-4 py-2 rounded-xl border border-black/0 hover:bg-white/30 hover:border-black/20",
                      {
                        "bg-white/60 border-black/20": pathname.includes(
                          item.path
                        ),
                      }
                    )}
                  >
                    <Image
                      src={`/icons/${item.icon}`}
                      width={item.imgW ?? 16}
                      height={16}
                      alt={item.name}
                    />
                    <p className="font-avenir font-[500] text-md mt-[2px]">
                      {item.name}
                    </p>
                  </div>
                </Link>
              ) : (
                <div
                  className={cn(
                    "cursor-pointer flex flex-col relative w-full gap-2 py-2 h-10  px-4 overflow-hidden hover:h-38  rounded-xl border border-black/0 hover:bg-white/30 hover:border-black/20 group/order",
                    {
                      "bg-white/60 border-black/20 h-38": pathname.includes(
                        item.name.toLowerCase()
                      ),
                    }
                  )}
                >
                  <div className="flex gap-2 justify-between w-full max-h-12 h-full items-center  ">
                    <Image
                      src={`/icons/${item.icon}`}
                      width={item.imgW ?? 16}
                      height={16}
                      alt={item.name}
                    />
                    <p className="font-avenir font-[500] text-md mt-[2px]">
                      {item.name}
                    </p>
                    <Image
                      src="/icons/arrow.svg"
                      width={12}
                      height={12}
                      alt="submenu"
                      className={`ml-auto rotate-[-90deg] group-hover/order:rotate-[0deg] opacity-70 ${
                        pathname.includes(item.name.toLowerCase()) &&
                        "rotate-[0deg] "
                      }`}
                    />
                  </div>
                  <div className=" ml-4">
                    {item.subMenus && (
                      <div className=" w-full flex flex-col gap-1">
                        {item.subMenus.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className={cn(
                              "cursor-pointer flex w-full gap-2 px-4 py-2 rounded-xl border border-black/0 hover:bg-white/30 hover:border-black/20",
                              {
                                "bg-white/60 border-black/20":
                                  pathname.includes(sub.path),
                              }
                            )}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </ul>
        <ul className="mt-10">
          <p className="font-avenir font-[500] text-sm text-black/30 ml-3">
            Manage Store
          </p>
          <div
            className={cn(
              "cursor-pointer px-4 py-2 rounded-xl border border-black/0 hover:bg-white/30 hover:border-[#888888]/20 mt-2",
              {
                "bg-white/60  hover:bg-bg-white/60 border-black/20  hover:border-black/20 ":
                  pathname === "/admin/contents",
              }
            )}
          >
            <Link href={"/admin/contents"} className=" flex items-center gap-2  ">
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
          {pages.map((page, index) => (
            <Link key={index} href={page.mobilePath ?? "#"}>
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className={cn("", {
                    "opacity-50": pathname !== page.path,
                  })}
                >
                  <Image
                    src={`/icons/${page.icon_w ?? ""}`}
                    width={22}
                    height={20}
                    alt={page.name}
                  />
                </div>
                <p
                  className={cn("text-xs text-white", {
                    "text-white/50": pathname !== page.path,
                  })}
                >
                  {page.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

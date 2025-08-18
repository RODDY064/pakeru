"use client";
import Checkbox from "@/app/ui/dashboard/checkbox";
import { cn } from "@/libs/cn";
import { generateProduct } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function Products() {
  return (
    <div className="h-screen px-4 xl:px-8   xl:ml-[15%]  pt-24 pb-32">
      <div className="flex items-center justify-between">
        <p className="font-avenir text-2xl font-bold">Products</p>
        <div className="px-3 py-2 bg-black flex items-center gap-2 cursor-pointer rounded-lg">
            <p className="font-avenir text-sm font-[500] text-white mt-[3px]">Create Product</p>
            <Image src="/icons/plus-w.svg" width={18} height={18} alt="plus"/>
        </div>
      </div>
      <StatsCard />
      <Tables />
    </div>
  );
}

function StatsCard() {
  const [stats, setStats] = useState([
    { label: "Product Sells Rate", value: 0 },
    { label: "Total Products", value: 0 },
    { label: "Active Products", value: 0 },
    { label: "Inactive Products", value: 0 },
    { label: "Product Out of Stock", value: 0 },
  ]);

  return (
    <div className="mt-4 w-full bg-white border border-black/15 rounded-2xl flex jus ">
      {stats.map((item, index) => (
        <div
          key={index}
          className="w-full flex items-start border-r border-black/10 py-2.5 px-10 flex-col last:border-r-0"
        >
          <p className="font-avenir font-[500] text-md mt-[2px] text-black/60">
            {`${item.label}`}
          </p>
          <div className="w-full border-[0.5px] border-dashed border-black/50 mt-1" />
          <p className="font-avenir font-semibold text-xl mx-1 mt-2 text-black/70">
            {`${item.value} ${item.label === "Product Sells Rate" ? "%" : ""} `}
          </p>
        </div>
      ))}
    </div>
  );
}

const Tables = () => {
  const { productFilters, setProductFilters, setProducts, storeProducts } =
    useBoundStore();

  useEffect(() => {
    const products = generateProduct(7);
    useBoundStore.getState().setProducts(products);
  }, []);

  const [paginations, setPaginations] = useState({
    current: 1,
  });

  return (
    <div className="mt-4 w-full h-[94%] bg-white border border-black/15 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-black/15 px-4 py-4 ">
        <div className="px-2 w-[50%] py-2 bg-black/10 rounded-xl border-black/15 border flex gap-1 items-center">
          <Image src="/icons/search.svg" width={16} height={16} alt="search" />
          <input
            placeholder="Search for products"
            className="w-full h-full focus:outline-none px-2"
          />
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-2 border border-black/10 pl-3 pr-1 py-[2px] rounded-lg">
            <p className="font-avenir font-[500] text-sm">Category: </p>
            <div className="relative flex items-center">
              <select
                value={productFilters.category}
                onChange={(e) =>
                  setProductFilters({ category: e.target.value })
                }
                className="appearance-none text-gray-600 focus:outline-none px-2 py-[0.8px] rounded-md font-avenir font-[500] text-sm bg-gray-200 border border-gray-500/10 pr-7"
              >
                <option value="Clothing">Clothing</option>
                <option value="None">None</option>
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
          <div className=" flex items-center justify-center  gap-2 border border-black/10 pl-3 pr-1 py-[2px] rounded-lg">
            <p className="font-avenir font-[500] text-sm">Status: </p>
            <div className="relative flex items-center">
              <select
                value={productFilters.status}
                onChange={(e) =>
                  setProductFilters({
                    status: e.target.value as
                      | "active"
                      | "inactive"
                      | "all"
                      | "out-of-stock",
                  })
                }
                className={cn(
                  "appearance-none focus:outline-none px-2 py-[0.8px] rounded-md font-avenir font-[500] text-sm  border pr-7 border-black/15",
                  {
                    "bg-green-200 border-green-500/10 text-green-600":
                      productFilters.status === "active",
                    "bg-gray-200 border-gray-500/10 text-gray-600":
                      productFilters.status === "inactive",
                    "bg-red-200 border-red-500/10 text-red-600":
                      productFilters.status === "out-of-stock",
                    "bg-yellow-200 border-yellow-500/10 text-yellow-600":
                      productFilters.status === "all",
                  }
                )}
              >
                <option>All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
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
        </div>
      </div>
      <div className="py-4 bg-[#f2f2f2] px-4 flex items-center border-b border-black/10 ">
        <div className="w-[70px] flex  gap-2 cursor-pointer  flex-none">
          <Checkbox action={() => {}} active={false} />
        </div>

        <div className="w-[400px]   flex  gap-2 items-center cursor-pointer flex-none ">
          <p className="font-avenir font-[500] text-md">Product</p>
          <div className="flex flex-col gap-[2px] ">
            <Image
              src="icons/arrow.svg"
              width={10}
              height={10}
              alt="arrow-up"
              className={cn("rotate-180 opacity-30", {})}
            />

            <Image
              src="icons/arrow.svg"
              width={10}
              height={10}
              alt="arrow-down"
              className={cn("opacity-30", {})}
            />
          </div>
        </div>
        <div className="w-[180px]   flex   items-center flex-none ">
          <p className="font-avenir font-[500] text-md">Status</p>
        </div>
        <div className="w-[180px] flex  items-center  flex-none ">
          <p className="font-avenir font-[500] text-md">Inventory</p>
        </div>
        <div className="w-[200px]  flex items-center flex-none ">
          <p className="font-avenir font-[500] text-md">Category</p>
        </div>
        <div className="w-[250px] flex   items-center flex-none ">
          <p className="font-avenir font-[500] text-md">Colors in Stock</p>
        </div>
        <div className="w-[50] flex justify-end h-full">
          <p className="opacity-0">h</p>
        </div>
      </div>
      <div className="overflow-scroll h-[70%]">
        {storeProducts.map((product) => (
          <div
            key={product.id}
            className="py-6 px-4 cursor-pointer flex items-center border-b border-black/15"
          >
            <div className="w-[70px] gap-2">
              <Checkbox action={() => {}} active={false} />
            </div>
            <div className="w-[400px] flex-none flex gap-2 items-center  ">
              <div className="flex items-center relative">
                <div className="size-10 border border-black/15 rounded-md rotate-[-10deg] absolute z-30 bg-white overflow-hidden">
                  <Image
                    src="/images/product.png"
                    fill
                    className="object-cover"
                    alt="image"
                  />
                </div>
                <div className="size-10 border border-black/15 rounded-md rotate-[-9deg] absolute left-3 z-20 bg-white overflow-hidden">
                  <Image
                    src="/images/product2.png"
                    fill
                    className="object-cover"
                    alt="image"
                  />
                </div>
                <div className="size-10 border border-black/15 rounded-md rotate-[-6deg] absolute left-6  bg-white overflow-hidden">
                  <Image
                    src="/images/product3.png"
                    fill
                    className="object-cover"
                    alt="image"
                  />
                </div>
              </div>
              <p className="pl-20 font-avenir font-[500] text-md">
                {product.name}
              </p>
            </div>
            <div className="w-[180px] flex   items-center ">
              <p
                className={cn(
                  "font-avenir font-[500] text-md  rounded-lg px-4 py-[0.5px]",
                  {
                    "bg-green-200 text-green-500": product.status === "active",
                    "bg-gray-200 text-gray-500": product.status === "inactive",
                    "bg-red-200 text-red-500":
                      product.status === "out-of-stock",
                  }
                )}
              >
                {product.status}
              </p>
            </div>
            <div className="w-[180px] flex  ">
              <p className="font-avenir font-[500] text-md">
                {product.totalNumber} in stocks
              </p>
            </div>
            <div className="w-[200px] flex  ">
              <p className="font-avenir font-[500] text-md">
                {product.category}
              </p>
            </div>
            <div className="w-[250px] flex   items-center flex-none  gap-2">
              <div className="flex items-center gap-2">
                <p>7</p>
                <div className="size-4 border border-black/15 rounded-sm bg-teal-500"></div>
              </div>
              ,
              <div className="flex items-center gap-2">
                <p>13</p>
                <div className="size-4 border border-black/15 rounded-sm bg-yellow-200"></div>
              </div>
              ,
              <div className="flex items-center gap-2">
                <p>60</p>
                <div className="size-4 border border-black/15 rounded-sm bg-red-400"></div>
              </div>
            </div>
            <div className="w-[50] flex justify-end h-full">
              <Image
                src="/icons/arrow.svg"
                width={13}
                height={13}
                className="rotate-270 opacity-30"
                alt="arrow"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex items-center justify-end py-5 px-10 gap-4 border-t border-black/10">
        <div className="h-12 border border-black/15 items-center flex rounded-xl">
          <p className="px-6 font-avenir font-[500] text-md text-black/50">
            Page Size
          </p>
          <div className="px-3 pl-4 border-l border-black/15  h-full flex items-center justify-center ">
            <div className="flex items-center gap-2 cursor-pointer ">
              <select className="font-avenir font-[500] text-md appearance-none h-full focus:outline-none cursor-pointer">
                <option>7</option>
                <option>10</option>
                <option>15</option>
              </select>
              <Image
                src="/icons/arrow.svg"
                width={13}
                height={16}
                alt="arrow"
                className="opacity-50"
              />
            </div>
          </div>
        </div>
        <div className="h-12 border border-black/15 flex rounded-xl items-center justify-center cursor-pointer">
          <div className="flex items-center justify-center px-4 gap-2 border-r h-full border-black/15  ">
            <Image
              src="/icons/arrow.svg"
              width={13}
              height={16}
              alt="arrow"
              className="opacity-50 rotate-90"
            />
            <p className="text-black/70 font-avenir font-[500] text-md">
              Previous
            </p>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="size-7.5 rounded-md bg-black/5 border border-black/25 flex items-center justify-center ">
                <p className="font-avenir text-sm font-[500] ">1</p>
              </div>
              <div className="size-7.5 rounded-md bg-black/30 border border-black/25 flex items-center justify-center ">
                <p className="font-avenir text-sm font-[500] ">2</p>
              </div>
              <div className="size-7.5 rounded-md bg-black/5 border border-black/25 flex items-center justify-center ">
                <p className="font-avenir text-sm font-[500] ">3</p>
              </div>
              <div className="h-7.5 rounded-md flex  items-center justify-center ">
                <Image
                  src="/icons/dots.svg"
                  width={15}
                  height={15}
                  alt="dots"
                  className="rotate-90"
                />
              </div>
            </div>
          </div>
          <div className="flex h-full items-center justify-center px-4 border-l border-black/15 gap-2">
            <p>Next</p>
            <Image
              src="/icons/arrow.svg"
              width={13}
              height={16}
              alt="arrow"
              className="opacity-50 rotate-270"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

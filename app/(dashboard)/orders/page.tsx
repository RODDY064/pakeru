"use client";

import Checkbox from "@/app/ui/dashboard/checkbox";
import { cn } from "@/libs/cn";
import {
  generateMockOrders,
  OrdersData,
  OrdersStore,
} from "@/store/dashbaord/orders";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function Orders() {
  return (
    <div className="px-4 xl:px-8 h-screen  xl:ml-[15%]  pt-24 pb-32">
      <p className="font-avenir text-2xl font-bold">Orders</p>
      <StatsCard />
      <Tables />
    </div>
  );
}

function StatsCard() {
  const {
    totalOrders,
    orderShipped,
    ordersDelivered,
    pendingOrders,
    cancelledOrders,
  } = useBoundStore();

  const [stats, setStats] = useState([
    { label: "Total Orders", value: 0 },
    { label: "Returns", value: 0 },
    { label: "Orders Delivered", value: 0 },
    { label: "Orders Shipped", value: 0 },
    { label: "Pending Orders", value: 0 },
    { label: "Cancelled Orders", value: 0 },
  ]);

  useEffect(() => {
    setStats([
      { label: "Total Orders", value: totalOrders },
      { label: "Returns", value: 0 },
      { label: "Orders Delivered", value: ordersDelivered },
      { label: "Orders Shipped", value: orderShipped },
      { label: "Pending Orders", value: pendingOrders },
      { label: "Cancelled Orders", value: cancelledOrders },
    ]);
  }, [
    totalOrders,
    orderShipped,
    ordersDelivered,
    pendingOrders,
    cancelledOrders,
  ]);

  return (
    <div className="mt-4 w-full  bg-white border border-black/15 rounded-2xl flex ">
      <div className="flex items-center gap-2 border-r border-black/10 py-3 px-8">
        <Image
          src="/icons/calender.svg"
          width={18}
          height={18}
          alt="calendar"
        />
        <p className="font-avenir font-[500] text-md mt-[2px]">This Week</p>
      </div>
      {stats.map((item, index) => (
        <div
          key={index}
          className="flex items-start border-r border-black/10 py-2.5 px-10 flex-col last:border-r-0">
          <p className="font-avenir font-[500] text-md mt-[2px] text-black/60">
            {item.label}
          </p>
          <div className="w-full border-[0.5px] border-dashed border-black/50 mt-1" />
          <p className="font-avenir font-semibold text-xl mx-1 mt-2 text-black/70">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

const Tables = () => {
  const filters = ["All", "Pending", "Cancelled", "Completed"];
  const [activeFilter, setActiveFilter] = useState("All");

  const {
    orders,
    selectAllOrders,
    toggleSelectOrder,
    toggleSelectAll,
    selectedOrders,
    sortDate,
    toggleDateSorting,
  } = useBoundStore();

  useEffect(() => {
    const orders = generateMockOrders(10);
    useBoundStore.getState().setOrders(orders);
  }, []);

  // pagination

  const [paginations, setPaginations] = useState({
    current:1,

  })

  return (
    <div className="mt-4 w-full h-[95%] bg-white border border-black/15 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-black/15">
        <div className="pt-3 pb-4 px-4 flex items-center gap-4 ">
          {filters.map((filter) => (
            <div
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeFilter === filter
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-avenir font-[500] text-md">{filter}</p>
            </div>
          ))}
        </div>
        <div className="px-4">
          <div className="w-[300px] border-[1.5px] border-black/10 bg-black/5 rounded-xl flex py-2 px-2 relative focus-within:border-black/70">
            <Image
              src="/icons/search.svg"
              width={16}
              height={20}
              alt="search"
              className="absolute opacity-60"
            />
            <input
              placeholder="Search bg date, customer & total "
              className="w-full h-full pl-6 focus:outline-none font-avenir font-[500] text-sm"
            />
          </div>
        </div>
      </div>
      <div className="py-4 bg-[#f2f2f2] px-4 flex items-center border-b border-black/10 ">
        <div className="w-[150px]  flex  gap-2 cursor-pointer">
          <Checkbox action={toggleSelectAll} active={selectAllOrders} />
          <p className="font-avenir font-[500] text-md relative ">Order</p>
        </div>
        <div
          onClick={toggleDateSorting}
          className="w-[150px]  flex  gap-2 items-center cursor-pointer">
          <p className="font-avenir font-[500] text-md">Date</p>
          <div className="flex flex-col gap-[2px] ">
            <Image
              src="icons/arrow.svg"
              width={10}
              height={10}
              alt="arrow-up"
              className={cn("rotate-180 opacity-30", {
                "opacity-100": sortDate === "ascending",
              })}
            />

            <Image
              src="icons/arrow.svg"
              width={10}
              height={10}
              alt="arrow-down"
              className={cn("opacity-30", {
                "opacity-100": sortDate === "descending",
              })}
            />
          </div>
        </div>
        <div className="w-[180px]   flex  gap-2 items-center">
          <p className="font-avenir font-[500] text-md">Customer</p>
        </div>
        <div className="w-[150px] flex  items-center">
          <p className="font-avenir font-[500] text-md">Total</p>
        </div>
        <div className="w-[180px]  flex items-center">
          <p className="font-avenir font-[500] text-md">Payment Status</p>
        </div>
        <div className="w-[180px] flex  g items-center">
          <p className="font-avenir font-[500] text-md">Delivery Status</p>
        </div>
        <div className="w-[120px] flex  items-center">
          <p className="font-avenir font-[500] text-md">Items</p>
        </div>
        <div className="w-[120px] flex  items-center">
          <p className="font-avenir font-[500] text-md">Discount</p>
        </div>
        <div className="w-[60px]  flex    items-center ">
          <p className="font-avenir font-[500] text-md">Actions</p>
        </div>
      </div>
      <div className="overflow-scroll h-[70%]">
        {orders
        .filter((order) =>
          activeFilter === "All"
            ? true
            : order.paymentStatus.toLowerCase() === activeFilter.toLowerCase()
        )
        .map((order, index, filteredOrders) => (
          <div
            key={order.id}
            className={cn(
              "py-4 px-4 bg-white flex items-center border-black/15 border-b "
            )}
          >
            <div className="w-[150px]  flex  gap-2">
              <Checkbox
                action={() => toggleSelectOrder(order)}
                active={!!selectedOrders.find((item) => item.id === order.id)}
              />
              <p className="font-avenir font-[500] text-sm lg:text-md relative text-black/60 ">
                #{order.id}
              </p>
            </div>
            <div className="w-[150px]  flex  gap-2">
              <p className="font-avenir font-[500] text-md text-black/60 relative ">
                {new Date(order.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                , {order.time}
              </p>
            </div>
            <div className="w-[180px]  flex  gap-2 ">
              <p className="font-avenir font-[500] text-md text-black/60 relative  cursor-pointer line-clamp-1">
                {order.customer.firstname + " " + order.customer.lastname}
              </p>
            </div>
            <div className="w-[150px]  flex  gap-2">
              <p className="font-avenir font-[500] text-md text-black/60 relative  cursor-pointer">
                GHS {order.total}
              </p>
            </div>
            <div className="w-[180px]  flex  gap-2">
              <div className="relative flex  items-center">
                <select className="appearance-none px-4 py-1 pr-8 text-sm border border-green-500/50 text-green-600 bg-green-50 rounded-lg focus:outline-none">
                  <option>Completed</option>
                </select>
                <Image
                  src="/icons/arrow-gn.svg"
                  width={12}
                  height={12}
                  alt="arrow"
                  className="absolute right-3 opacity-100"
                />
              </div>
            </div>
            <div className="w-[180px]  flex  gap-2">
              <div className="relative flex  items-center">
                <select className="appearance-none px-4 py-1 pr-8 text-sm border border-yellow-500/50 text-yellow-600 cursor-pointer bg-yellow-50 rounded-lg focus:outline-none">
                  <option>Pending</option>
                </select>
                <Image
                  src="/icons/arrow-y.svg"
                  width={12}
                  height={12}
                  alt="arrow"
                  className="absolute right-3 opacity-100"
                />
              </div>
            </div>
            <div className="w-[120px]  flex  gap-2">
              <p className="font-avenir font-[500] text-md text-black/60 relative  cursor-pointer">
                {order.items.numOfItems}
              </p>
            </div>
            <div className="w-[120px]  flex  gap-2">
              <p className="font-avenir font-[500] text-md text-black/60 relative  cursor-pointer">
                GHS {order.discount}
              </p>
            </div>
            <div className="w-[60px] flex gap-2 relative ">
              <div className="relative group/delete">
                <Image
                  typeof="delete"
                  src="/icons/delete.svg"
                  width={20}
                  height={20}
                  alt="delete"
                  className="cursor-pointer"
                />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover/delete:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Delete
                </span>
              </div>
              <div className="relative group/comment">
                <Image
                  typeof="comment"
                  src="/icons/comment.svg"
                  width={24}
                  height={24}
                  alt="delete"
                  className="cursor-pointer"
                />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover/comment:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Comment
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex items-center justify-end py-5 px-10 gap-4 border-t border-black/15">
        <div className="h-12 border border-black/15 items-center flex rounded-xl">
          <p className="px-6 font-avenir font-[500] text-md text-black/50">
            Show Items Per
          </p>
          <div className="px-3 pl-4 border-l border-black/15  h-full flex items-center justify-center ">
            <div className="flex items-center gap-2 cursor-pointer ">
              <select className="font-avenir font-[500] text-md appearance-none h-full focus:outline-none cursor-pointer">
                <option>7</option>
                <option>10</option>
                  <option >15</option>
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
          <p className="text-black/70 font-avenir font-[500] text-md">Previous</p>
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
            <Image src="/icons/dots.svg" width={15} height={15} alt="dots" className="rotate-90"/>
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

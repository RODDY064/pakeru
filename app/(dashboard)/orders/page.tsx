"use client";

import Checkbox from "@/app/ui/dashboard/checkbox";
import OrderModal from "@/app/ui/dashboard/order-modal";
import { cn } from "@/libs/cn";
import {
  generateMockOrders,
  OrdersData,
  OrdersStore,
} from "@/store/dashbaord/orders";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export default function Orders() {
  return (
    <div className="min-h-dvh md:h-dvh sm:px-4 xl:px-8   xl:ml-[15%] pb-36 pt-20   md:pt-24 md:pb-32 ">
      <p className="font-avenir text-xl md:text-2xl font-bold max-sm:px-3">
        Orders
      </p>
      <StatsCard />
      <Tables />
      <MobileTabs />
      <OrderModal key={crypto.randomUUID()} />
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
    <div className="mt-4 w-full h-fit bg-white border border-black/15  sm:rounded-2xl grid grid-cols-2 md:flex md:px-4  ">
      <div className="flex items-center gap-2 border-r border-black/10 py-3 px-4 md:px-8 col-span-2">
        <Image
          src="/icons/calender.svg"
          width={18}
          height={18}
          alt="calendar"
        />
        <p className="font-avenir font-[500] text-sm md:text-md mt-[3px] md:mt-[2px]">
          {" "}
          Monday <span className="md:hidden">25 August</span>
        </p>
      </div>
      {stats.map((item, index) => (
        <div
          key={index}
          className="w-full flex items-start border-r max-sm:border-t border-black/10 py-2.5 px-3 lg:px-5 xl:px-10 flex-col last:border-r-0"
        >
          <p className="ont-avenir font-[500] text-sm md:text-md md:mt-[2px] text-black/60">
            {item.label}
          </p>
          <div className="w-full border-[0.5px] border-dashed border-black/50 mt-1" />
          <p className="font-avenir font-semibold md:text-xl mx-1 mt-2 text-black/70">
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
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const {
    productFilters,
    setProductFilters,
    setProducts,
    storeProducts,
    setOrderModal,
  } = useBoundStore();

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


  // Synchronize scroll between header and content
  const handleHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const scrollTable = (turn: "right" | "left") => {
    const container = headerScrollRef.current || contentScrollRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;
      const totalWidth = container.scrollWidth;

      if (turn === "right") {
        const remainingWidth = totalWidth - currentScroll - containerWidth;
        const scrollAmount = Math.min(containerWidth * 0.8, remainingWidth);

        // Scroll both header and content
        if (headerScrollRef.current) {
          headerScrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
      } else {
        const scrollAmount = Math.min(containerWidth * 0.8, currentScroll);

        // Scroll both header and content
        if (headerScrollRef.current) {
          headerScrollRef.current.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
        }
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }
  };

  return (
    <div className="mt-4 w-full h-[94%] bg-white border border-black/15 rounded-2xl overflow-hidden hidden md:block">
      <div className="flex items-center justify-between border-b border-black/15">
        <div className="pt-3 pb-4 px-4 flex items-center gap-4 ">
          {filters.map((filter) => (
            <div
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-1 xl:py-1.5 rounded-lg cursor-pointer transition-colors ${
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

      {/* table */}
      <div className="flex flex-col h-[77%] flex-none relative">
        <div className="absolute px-6 py-3 flex justify-between items-center w-full z-10 2xl:hidden pointer-events-none">
          <div
            onClick={() => scrollTable("left")}
            className="cursor-pointer pointer-events-auto"
          >
            <Image
              src="icons/double-arrow.svg"
              width={24}
              height={24}
              alt="double-arrow-left"
              className="rotate-180"
            />
          </div>
          <div
            onClick={() => scrollTable("right")}
            className="cursor-pointer pointer-events-auto"
          >
            <Image
              src="icons/double-arrow.svg"
              width={24}
              height={24}
              alt="double-arrow-right"
            />
          </div>
        </div>
        <div className="w-full min-h-30 2xl:min-h-10 pb-6 xl:py-4 bg-[#f2f2f2] border-b border-black/10 flex flex-col justify-end ">
          <div className="w-full h-[1px] bg-black/30 my-4 2xl:hidden" />
          <div
            ref={headerScrollRef}
            onScroll={handleHeaderScroll}
            className="overflow-x-auto scrollbar-hide px-4 scroll-table"
          >
            <div className="flex min-w-fit">
              <div className="w-[150px]  flex  gap-2 cursor-pointer flex-shrink-0">
                <Checkbox action={toggleSelectAll} active={selectAllOrders} />
                <p className="font-avenir font-[500] text-md relative ">
                  Order
                </p>
              </div>
              <div
                onClick={toggleDateSorting}
                className="w-[150px] flex-shrink-0  flex  gap-2 items-center cursor-pointer"
              >
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
              <div className="w-[180px] flex-shrink-0  flex  gap-2 items-center">
                <p className="font-avenir font-[500] text-md">Customer</p>
              </div>
              <div className="w-[150px] flex flex-shrink-0 items-center">
                <p className="font-avenir font-[500] text-md">Total</p>
              </div>
              <div className="w-[180px]  flex-shrink-0 flex items-center">
                <p className="font-avenir font-[500] text-md">Payment Status</p>
              </div>
              <div className="w-[180px] flex  flex-shrink-0 items-center">
                <p className="font-avenir font-[500] text-md">
                  Delivery Status
                </p>
              </div>
              <div className="w-[120px] flex flex-shrink-0  items-center">
                <p className="font-avenir font-[500] text-md">Items</p>
              </div>
              <div className="w-[120px] flex flex-shrink-0 items-center">
                <p className="font-avenir font-[500] text-md">Discount</p>
              </div>
              <div className="w-[60px]  flex  flex-shrink-0  items-center ">
                <p className="font-avenir font-[500] text-md">Actions</p>
              </div>
            </div>
          </div>
        </div>
        <div
          ref={contentScrollRef}
          onScroll={handleContentScroll}
          className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide">
          <div className="min-w-fit">
            {orders
              .filter((order) =>
                activeFilter === "All"
                  ? true
                  : order.paymentStatus.toLowerCase() ===
                    activeFilter.toLowerCase()
              )
              .map((order, index, filteredOrders) => (
                <div
                  onClick={setOrderModal}
                  key={order.id}
                  className={cn(
                    "py-4 px-4 bg-white flex items-center border-black/15 border-b cursor-pointer"
                  )}>
                  <div className="w-[150px]  flex  gap-2">
                    <Checkbox
                      action={() => toggleSelectOrder(order)}
                      active={
                        !!selectedOrders.find((item) => item.id === order.id)
                      }
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
        </div>
      </div>

      <div className="w-full h-fit flex items-center justify-end py-5 px-10 gap-4 border-t border-black/15">
        <div className="h-12 border border-black/15 items-center flex rounded-xl">
          <p className="px-6 font-avenir font-[500] text-md text-black/50">
            Show Items Per
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
      name: "Cancelled",
      icon: "product-inac.svg",
      num: 2,
    },
    {
      name: "Delivered",
      icon: "product-out.svg",
      num: 0,
    },
    {
      name: "Complete",
      icon: "product-out.svg",
      num: 0,
    },
  ];

  return (
    <div className="mt-6 max-sm:px-3 md:hidden">
      <p className="font-avenir text-lg md:text-2xl ">Tables</p>
      <div className="mt-2 flex flex-col gap-2">
        {tabs.map((tab, index) => (
          <Link
            href={`/orders/mobile-table/${tab.name.toLowerCase()}`}
            key={index}
          >
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

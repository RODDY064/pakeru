"use client";
import OrderModal from "@/app/ui/dashboard/order-modal";
import StatCard from "@/app/ui/dashboard/statsCard";
import StatusBadge from "@/app/ui/dashboard/statusBadge";
import Table from "@/app/ui/dashboard/table";
import { formatJoinedDate } from "@/libs/functions";
import { useApiClient } from "@/libs/useApiClient";
import { OrdersData } from "@/store/dashbaord/orders-store/orders";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react";

function FulfilledContent() {
  const { get, patch }  = useApiClient()
  const [fulfilledStats, setFulfilledStats] = useState([
    { label: "Delivered", value: 0 },
    { label: "Shipped", value: 0 },
    { label: "Processing (ready to ship)", value: 0 },
  ]);

  const {
    fulfilledOrders,
    sortDate,
    toggleDateSorting,
    setOrderModal,
    loadOrders,
    showOrderModal,
    fulfilledState,
    setOrderInView,
    loadStoreProducts,
    storeProducts,
    setPaginationConfig,
    updatePaginationFromAPI,
    getPaginatedSlice,
    pagination,
  } = useBoundStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadOrders("fulfilled",{ force: true, get }),
          loadStoreProducts(),
        ]);
      } catch (error) {
        console.log("Failed to initialize data:", error);
      }
    };
    initializeData();
  }, [loadOrders, loadStoreProducts]);

  const handleSelect = useCallback(
    (order: OrdersData) => {
      setOrderInView(order);
      setOrderModal(!showOrderModal);
    },
    [showOrderModal, setOrderInView, setOrderModal]);

  const tableColumns = [
    {
      label: "Order",
      width: "w-[150px] ml-4",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md ">
            {order.IDTrim}
          </p>
        </div>
      ),
    },
    {
      label: "Date",
      width: "w-[150px] ml-4",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md ">
            {formatJoinedDate(order.date)}
          </p>
        </div>
      ),
    },
    {
      label: "Time",
      width: "w-[90px] ml-4",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md ">
            {order.time}
          </p>
        </div>
      ),
    },
    {
      label: "Customer ",
      width: "w-[150px] ml-4",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md text-blue-600  decoration-dotted underline underline-offset-2 decoration-doted">
            {order.user.firstname + " " + order.user.lastname}
          </p>
        </div>
      ),
    },
    {
      label: "Payment Status",
      width: "w-[150px] ml-4",
      render: (order: OrdersData) => (
        <StatusBadge
          status={order.paymentStatus}
          statuses={["completed", "pending", "cancelled"]}
        />
      ),
    },
    {
      label: "Delivery Status",
      width: "w-[150px] ml-4",
      render: (order: OrdersData) => (
        <StatusBadge
          status={order.deliveryStatus}
          statuses={["delivered", "pending", "cancelled", "shipped"]}
        />
      ),
    },
    {
      label: "Total",
      width: "w-[120px] ml-4",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md ">
            GHS {order.total.toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      label: "Item's",
      width: "w-[70px] ml-4",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md ">
            {order.items.numOfItems}
          </p>
        </div>
      ),
    },
    {
      label: "Shipment Days",
      width: "w-[150px] ml-4 ",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md ">
            {order.shipmentDays}
          </p>
        </div>
      ),
    },
  ];

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
      <Table
        header={<Header />}
        columns={tableColumns}
        data={fulfilledOrders}
        tableName="Fulfuilled Orders"
        tabelState={fulfilledState}
        reload={() => loadOrders("fulfilled",{ force: true, get })}
        columnStyle="py-4"
        dateKey="date"
        columnClick={(order) => handleSelect(order)}
      />
      <OrderModal type="fulfilled" />
    </div>
  );
}




export default function Fulfilled() {
  return (
    <Suspense fallback={<div className="w-full h-full fixed top-0 left-0 flex flex-col items-center justify-center">
          <Image src="/icons/loader.svg" width={34} height={34} alt="loader"/>
        </div>}>
      <FulfilledContent />
    </Suspense>
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
          placeholder="Search by order id, customer "
          className="w-full h-full focus:outline-none px-2 text-md font-avenir "
        />
      </div>
      <div className="flex items-center gap-2">
        <p className="font-avenir text-md font-[500] text-black/50">
          Filter by:
        </p>
        <div className="flex items-center justify-center gap-2 border border-black/20 pl-3 pr-1 py-[2px] rounded-lg">
          <p className="font-avenir font-[500] text-sm">Status: </p>
          <div className="relative flex items-center">
            <select className="appearance-none cursor-pointer text-sm text-gray-600 focus:outline-none px-2 py-[2px] rounded-md font-avenir font-[500] text-md bg-gray-200 border border-gray-500/20 pr-7">
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
          <p className="font-avenir font-[500] text-sm">Date: </p>
          <div className="flex items-center border py-[2px]  border-gray-500/20  bg-gray-200 px-2 rounded-md">
            <p className="font-avenir text-sm text-black/50">From:</p>
            <input
              type="date"
              placeholder="GHS 00.00"
              className="w-24 focus:outline-none  px-2 text-sm font-avenir cursor-pointer"
            />
          </div>
          <div className="flex items-center border py-[2px]  border-gray-500/20  bg-gray-200 px-2 rounded-md">
            <p className="font-avenir text-sm text-black/50">To:</p>
            <input
              type="date"
              placeholder="GHS 00.00"
              className="w-24 focus:outline-none  px-2 text-sm font-avenir cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
};

"use client";
import OrderModal from "@/app/ui/dashboard/order-modal";
import StatCard from "@/app/ui/dashboard/statsCard";
import StatusBadge from "@/app/ui/dashboard/statusBadge";
import Table from "@/app/ui/dashboard/table";
import { toast } from "@/app/ui/toaster";
import { formatJoinedDate } from "@/libs/functions";
import { computeOrdersStats, OrdersData } from "@/store/dashbaord/orders-store/orders";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useOrdersWebhook } from "../../hooks/orderWebhooks";

export default function Unfulfilled() {
  const [unfulfilledStats, setUnfulfilledStats] = useState([
    { label: "Total Unfulfilled", value: 0 },
    { label: "Pending", value: 0 },
    { label: "Response per order", value: 0 },
  ]);

  const { isConnected, } = useOrdersWebhook();

  const {
    unfulfilledOrders,
    sortDate,
    toggleDateSorting,
    setOrderModal,
    loadOrders,
    showOrderModal,
    unfulfilledState,
    orderInView,
    setSingleOrderState,
    loadOrder,
    setOrderInView,
    loadStoreProducts,
    storeProducts,
    setPaginationConfig,
    updatePaginationFromAPI,
    getPaginatedSlice,
    pagination,
    updateOrder,
  } = useBoundStore();

  const orderStats = useMemo(() => computeOrdersStats(unfulfilledOrders), [unfulfilledOrders]);

  useEffect(() => {
    if (!orderStats) return;

    setUnfulfilledStats([
      { label: "Total Unfulfilled", value: orderStats.totalOrders ?? 0 },
      { label: "Pending", value: orderStats.pendingOrders ?? 0 },
      { label: "Response per order", value: 0 },
    ]);
  }, [orderStats]);

  const [renderCount, setRenderCount] = React.useState(0);
  useEffect(() => {
    setRenderCount((prev) => prev + 1);
  }, [unfulfilledOrders]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadOrders("unfulfilled",{ force: true}),
          loadStoreProducts(),
        ]);
      } catch (error) {
        console.log("Failed to initialize data:", error);
      }
    };

    initializeData();
  }, [loadOrders, loadStoreProducts]);

  

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
      width: "w-[150px] ml-4",
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
      width: "w-[180px] ml-4",
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
      width: "w-[180px] ml-4",
      render: (order: OrdersData) => (
        <StatusBadge
          status={order.paymentStatus}
          statuses={["completed", "pending", "cancelled"]}
        />
      ),
    },
    {
      label: "Total",
      width: "w-[150px] ml-4",
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
      width: "w-[150px] ml-4",
      render: (order: OrdersData) => (
        <div className="flex items-center gap-2">
          <p className="font-avenir font-[500] text-sm lg:text-md ">
            {order.items.numOfItems}
          </p>
        </div>
      ),
    },
  ];

  const handleSelect = useCallback(
    (order: OrdersData) => {
      setOrderInView(order);
      setOrderModal(!showOrderModal);
    },
    [showOrderModal, setOrderInView, setOrderModal]
  );

  return (
    <div className="min-h-dvh md:h-dvh sm:px-4 xl:px-8   xl:ml-[15%] pb-36 pt-20   md:pt-24 md:pb-32 ">
      {/* <div className="relative w-24 overflow-hidden">
       <div  className="absolute left-0 bg-amber-500">
         {process.env.NODE_ENV === 'development' && <DebugPanelComponent  />}
       </div>
       </div> */}
      {/* <div
        style={{
          position: "fixed",
          top: 120,
          left: 10,
          background: "black",
          color: "white",
          padding: 10,
          borderRadius: 5,
          fontSize: 12,
          zIndex: 9999,
        }}
      >
        <div>Renders: {renderCount}</div>
        <div>Orders: {unfulfilledOrders.length}</div>
      </div> */}
      <p className="font-avenir text-xl md:text-2xl font-bold max-sm:px-3">
        Unfulfilled Orders
      </p>
      <div className="mt-4 w-full h-fit bg-white border border-black/15 sm:rounded-2xl grid grid-cols-2 md:flex md:px-4">
        {unfulfilledStats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
      <Table
        header={<Header />}
        columns={tableColumns}
        data={unfulfilledOrders}
        tableName="Unfulfuilled Orders"
        tabelState={unfulfilledState}
        reload={() => loadOrders("unfulfilled",{ force: true})}
        columnStyle="py-4"
        dateKey="date"
        columnClick={(order) => handleSelect(order)}
      />
      <OrderModal type="unfulfilled" />
    </div>
  );
}

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
          <p className="font-avenir font-[500] text-sm">Payment Status: </p>
          <div className="relative flex items-center">
            <select className="appearance-none text-sm cursor-pointer text-gray-600 focus:outline-none px-2 py-[2px] rounded-md font-avenir font-[500] text-md bg-gray-200 border border-gray-500/20 pr-7">
              <option value="Clothing">Completed</option>
              <option>Pending</option>
              <option>Cancelled</option>
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
              className="w-24 focus:outline-none text-sm  px-2 text-md font-avenir cursor-pointer"
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

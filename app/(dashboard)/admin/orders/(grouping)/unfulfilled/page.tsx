"use client";
import OrderModal from "@/app/ui/dashboard/order-modal";
import StatCard from "@/app/ui/dashboard/statsCard";
import StatusBadge from "@/app/ui/dashboard/statusBadge";
import Table from "@/app/ui/dashboard/table";
import { toast } from "@/app/ui/toaster";
import { formatJoinedDate } from "@/libs/functions";
import {
  computeOrdersStats,
  OrdersData,
  PaymentStatusFilter,
} from "@/store/dashbaord/orders-store/orders";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useOrdersWebhook } from "../../hooks/orderWebhooks";
import { useApiClient } from "@/libs/useApiClient";

export default function Unfulfilled() {
  const { get, patch } = useApiClient();
  const { isConnected } = useOrdersWebhook();

  const {
    unfulfilledOrders,
    toggleDateSorting,
    setOrderModal,
    loadOrders,
    showOrderModal,
    unfulfilledState,
    orderInView,
    setSingleOrderState,
    setOrderInView,
    loadStoreProducts,
    storeProducts,
    configure,
    updateFromAPI,
    slice,
    pagination,
    updateOrder,
    setOrderTypeFilter,
    unfulfilledFilteredOrders,
    UnfulfilledStats,
    applyOrderFilters,
  } = useBoundStore();

  const [isFilterd, setIsFilterd] = useState(false);

  useEffect(() => {
    if (unfulfilledFilteredOrders.length === 0) {
      setIsFilterd(true);
    }
  }, [unfulfilledFilteredOrders]);

  const orderStats = useMemo(
    () => computeOrdersStats(unfulfilledFilteredOrders),
    [unfulfilledOrders, unfulfilledFilteredOrders, orderInView]
  );

  const [currentOrders, setCurrentOrders] = useState<OrdersData[]>([]);

  const unfulfilledStats = useMemo(() => {
    return [
      { label: "Total Unfulfilled", value: UnfulfilledStats.total ?? 0 },
      { label: "Pending", value: UnfulfilledStats.pending ?? 0 },
    ];
  }, [UnfulfilledStats, unfulfilledOrders]);

  const loadOrdersForPagination = async (page: number) => {
    await loadOrders("unfulfilled", false, 25,get, page);
  };

  useEffect(() => {
    configure({
      dataKey: "unfulfilledFilteredOrders",
      loadFunction: (page) => loadOrdersForPagination(pagination.page),
      size: 25,
    });

    setOrderTypeFilter("unfulfilled");
  }, []);

  useEffect(() => {
    updateFromAPI({
      total: UnfulfilledStats.total,
      page: 1,
    });
  }, [UnfulfilledStats]);

  useEffect(() => {
    const sliceData = slice(unfulfilledFilteredOrders);
    setCurrentOrders(sliceData);
  }, [pagination, unfulfilledOrders, unfulfilledFilteredOrders]);

  const [renderCount, setRenderCount] = React.useState(0);
  useEffect(() => {
    setRenderCount((prev) => prev + 1);
    applyOrderFilters();
  }, [unfulfilledOrders]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadOrders("unfulfilled",true,25, get ),
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
    <div className="min-h-dvh md:h-dvh sm:px-4 xl:px-8   xl:ml-[16%] pt-4 pb-24  ">
      <p className="font-avenir text-xl font-bold max-sm:px-3">
        Unfulfilled Orders
      </p>
      <div className="mt-2 w-full h-fit bg-white border border-black/15 sm:rounded-2xl grid grid-cols-2 md:flex md:px-4">
        {unfulfilledStats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
      <Table
        header={<Header />}
        columns={tableColumns}
        data={currentOrders}
        tableName="Unfulfuilled Orders"
        tabelState={unfulfilledState}
        reload={() => loadOrdersForPagination(pagination.page)}
        columnStyle="py-4"
        dateKey="date"
        columnClick={(order) => handleSelect(order)}
        isFilterd={isFilterd}
      />
      <OrderModal type="unfulfilled" />
    </div>
  );
}

const Header = () => {
  const {
    OrderFilters,
    setOrderSearch,
    setDeliveryStatusFilter,
    setPaymentStatusFilter,
    setDateFilter,
    resetOrdersFilters,
  } = useBoundStore();

  useEffect(() => {
    resetOrdersFilters();
  }, []);

  return (
    <>
      <div className="px-2 w-[50%] lg:w-[30%] py-[6px] bg-black/10 rounded-xl border-black/15 border flex gap-1 items-center">
        <Image
          src="/icons/search.svg"
          width={16}
          height={16}
          alt="search"
          className="mb-[5px]"
        />
        <input
          value={OrderFilters.search}
          onChange={(e) => setOrderSearch(e.target.value)}
          placeholder="Search  (by ID, customer name, or email) "
          className="w-full h-full focus:outline-none px-2 text-sm font-avenir "
        />
      </div>
      <div className="flex items-center gap-2">
        <p className="font-avenir text-md font-[500] text-black/50">
          Filter by:
        </p>
        <div className="flex items-center justify-center gap-2 border border-black/20 pl-3 pr-1 py-[2px] rounded-lg">
          <p className="font-avenir font-[500] text-sm">Payment Status: </p>
          <div className="relative flex items-center">
            <select
              value={OrderFilters.paymentStatus}
              onChange={(e) =>
                setPaymentStatusFilter(e.target.value as PaymentStatusFilter)
              }
              className="appearance-none text-sm cursor-pointer text-gray-600 focus:outline-none px-2 py-[2px] rounded-md font-avenir font-[500] text-md bg-gray-200 border border-gray-500/20 pr-7"
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
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
              value={OrderFilters.dateFilter.from ?? ""}
              onChange={(e) => setDateFilter({ from: e.target.value })}
              className="w-24 focus:outline-none text-sm  px-2 text-md font-avenir cursor-pointer"
            />
          </div>
          <div className="flex items-center border py-[2px]  border-gray-500/20  bg-gray-200 px-2 rounded-md">
            <p className="font-avenir text-sm text-black/50">To:</p>
            <input
              type="date"
              placeholder="GHS 00.00"
              value={OrderFilters.dateFilter.to ?? ""}
              onChange={(e) => setDateFilter({ to: e.target.value })}
              className="w-24 focus:outline-none  px-2 text-sm font-avenir cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
};

"use client";
import OrderModal from "@/app/ui/dashboard/order-modal";
import StatCard from "@/app/ui/dashboard/statsCard";
import StatusBadge from "@/app/ui/dashboard/statusBadge";
import Table from "@/app/ui/dashboard/table";
import { formatJoinedDate } from "@/libs/functions";
import { useApiClient } from "@/libs/useApiClient";
import {
  DeliveryStatusFilter,
  OrdersData,
} from "@/store/dashbaord/orders-store/orders";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { useRouter, } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

function FulfilledContent() {
  const { get, patch } = useApiClient();
  const [fulfilledDashStats, setFulfilledDashStats] = useState([
    { label: "Delivered", value: 0 },
    { label: "Shipped", value: 0 },
    { label: "Processing (ready to ship)", value: 0 },
    { label: "Cancelled", value: 0 },
  ]);

  const {
    fulfilledOrders,
    toggleDateSorting,
    setOrderModal,
    loadOrders,
    showOrderModal,
    fulfilledState,
    setOrderInView,
    loadStoreProducts,
    storeProducts,
    configure,
    updateFromAPI,
    slice,
    pagination,
    getOrdersStats,
    setOrderTypeFilter,
    fulfilledFilteredOrders,
    orderInView,
    fulfilledStats
  } = useBoundStore();

  const [currentOrders, setCurrentOrders] = useState<OrdersData[]>([]);
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadOrders("fulfilled",true, 25, get ),
          loadStoreProducts(false, get),
        ]);
      } catch (error) {
        console.log("Failed to initialize data:", error);
      }
    };
    initializeData();
  }, [loadOrders, loadStoreProducts]);

  const [isFilterd, setIsFilterd] = useState(false);

  useEffect(() => {
    if (fulfilledFilteredOrders.length === 0) {
      setIsFilterd(true);
    }
  }, [fulfilledFilteredOrders]);

  const loadOrdersForPagination = async (page: number) => {
    await loadOrders("fulfilled", true, 25, get, page )
  };

  useEffect(() => {
    configure({
      dataKey: "fulfilledFilteredOrders",
      loadFunction: (page)=> loadOrdersForPagination(pagination.page),
      size: 25,
    });
    setOrderTypeFilter("fulfilled");
  }, []);



  useEffect(() => {
    setFulfilledDashStats([
      { label: "Delivered", value: fulfilledStats.delivered ?? 0 },
      { label: "Shipped", value: fulfilledStats.shipped ?? 0 },
      { label: "Cancelled", value: fulfilledStats.cancelled?? 0 },
    ]);
  }, [fulfilledStats, storeProducts]);

  useEffect(() => {
    updateFromAPI({
      total: fulfilledStats.total,
      page: 1,
    });
  }, [fulfilledStats]);

  useEffect(() => {
    const sliceData = slice(fulfilledFilteredOrders);
    setCurrentOrders(sliceData);
  }, [pagination, fulfilledOrders, fulfilledFilteredOrders]);

  const handleSelect = useCallback(
    (order: OrdersData) => {
      setOrderInView(order);
      setOrderModal(!showOrderModal);
    },
    [showOrderModal, setOrderInView, setOrderModal]
  );

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
    <div className="overflow-hidden h-dvh md:h-dvh sm:px-4 xl:px-8   xl:ml-[16%]  pt-4 pb-24  ">
      <p className="font-avenir text-xl font-bold max-sm:px-3">
        Fulfilled Orders
      </p>
      <div className="mt-2 w-full h-fit bg-white border border-black/15 sm:rounded-2xl grid grid-cols-2 md:flex md:px-4">
        {fulfilledDashStats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
      <Table
        header={<Header />}
        columns={tableColumns}
        data={currentOrders}
        tableName="Fulfuilled Orders"
        tabelState={fulfilledState}
        reload={() => loadOrdersForPagination(pagination.page)}
        columnStyle="py-4"
        dateKey="date"
        columnClick={(order) => handleSelect(order)}
        isFilterd={isFilterd}
      />
      <OrderModal type="fulfilled" />
    </div>
  );
}

export default function Fulfilled() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full fixed top-0 left-0 flex flex-col items-center justify-center">
          <Image src="/icons/loader.svg" width={34} height={34} alt="loader" />
        </div>
      }
    >
      <FulfilledContent />
    </Suspense>
  );
}

// table headr
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
          value={OrderFilters.search ?? ""}
          onChange={(e) => setOrderSearch(e.target.value)}
          placeholder="Search (by ID, customer name, or email) "
          className="w-full h-full focus:outline-none px-2 text-sm font-avenir "
        />
      </div>
      <div className="flex items-center gap-2">
        <p className="font-avenir text-md font-[500] text-black/50">
          Filter by:
        </p>
        <div className="flex items-center justify-center gap-2 border border-black/20 pl-3 pr-1 py-[2px] rounded-lg">
          <p className="font-avenir font-[500] text-sm">Delivery Status: </p>
          <div className="relative flex items-center">
            <select
              value={OrderFilters.deliveryStatus}
              onChange={(e) =>
                setDeliveryStatusFilter(e.target.value as DeliveryStatusFilter)
              }
              className="appearance-none cursor-pointer text-sm text-gray-600 focus:outline-none px-2 py-[2px] rounded-md font-avenir font-[500] text-md bg-gray-200 border border-gray-500/20 pr-7"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Delivered">Delivered</option>
              <option value="Shipped">Shipped</option>
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
              className="w-24 focus:outline-none  px-2 text-sm font-avenir cursor-pointer"
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

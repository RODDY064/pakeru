"use client";

import StatCard from "@/app/ui/dashboard/statsCard";
import Table from "@/app/ui/dashboard/table";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function Customers() {
  // stats
  const [stats, setStats] = useState([
    { label: "Total Customers", value: 0 },
    { label: "Active Customers", value: 0 },
    { label: "Inactive Customers", value: 0 },
    { label: "New Customers (30d)", value: 0 },
    { label: "Churned Customers", value: 0, highlight: true },
  ]);

  // samples customer json =
  const customers = [
    {
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      status:"Active",
      totalSpent: "240",
      orders:"12",
      lastOrder: "2024-08-20",
      joined: "2022-01-05",
      loyalty: "Gold",
    },
    {
      firstname: "Jane",
      lastname: "Smith",
      email: "jane@example.com",
      status:"Inactive",
      totalSpent: "120",
      orders:"4",
      lastOrder: "2024-05-12",
      joined: "2021-11-14",
      loyalty: "Basic",
    },
  ];

  function formatJoinedDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "2-digit",
    year: "2-digit",
  };

  return date.toLocaleDateString("en-US", options);
}


  const tableColumns = [
    {
      label: "Name",
      width: "w-[200px]",
      render: (customer: any) => (
        <div className="flex items-center gap-2 ">
          <Image
            src="/icons/user.svg"
            alt={"user icon"}
            width={16}
            height={16}
            className="rounded-full"
          />
          <p className="font-avenir font-[500]">{`${customer.firstname} ${customer.lastname}`}</p>
        </div>
      ),
    },
    {
      label: "Emails",
      width: "w-[230px]",
      render: (customer: any) => (
        <div className="flex items-center gap-2 ">
          <p className="font-avenir font-[500] underline decoration-dotted text-blue-500">{`${customer.email}`}</p>
        </div>
      ),
    },
    {
      label: "Status",
       width: "w-[150px]",
      render: (customer: any) => (
        <div className=" relative flex  items-center">
          <div className={`appearance-none w-20 flex items-center justify-center py-1  text-sm ${customer.status === "Active" ? "border-green-500/50 text-green-600 bg-green-50":"border-yellow-500/50 text-yellow-600 bg-yellow-50"} border  rounded-lg`}>
            {customer.status}
          </div>
        </div>
      ),
    },
    {
      label:"Orders",
      width:"w-[100px]",
      render: (customer: any) => (
        <div className="flex items-center">
             <p className="font-avenir font-[500]">{customer.orders}</p>
        </div>
      )
    },
    {
      label:"Total Spent",
      width:"w-[150px]",
      render: (customer: any) => (
        <div className="flex items-center">
             <p className="font-avenir font-[500]">GHS {customer.totalSpent}</p>
        </div>
      )
    },
    {
      label:"Last Order Date",
      width:"w-[180px]",
      render: (customer: any) => (
        <div className="flex items-center">
             <p className="font-avenir font-[500]">{formatJoinedDate(customer.lastOrder)}</p>
        </div>
      )
    },
     {
      label:"Joined Date",
      width:"w-[180px]",
      render: (customer: any) => (
        <div className="flex items-center">
             <p className="font-avenir font-[500]">{formatJoinedDate(customer.joined)}</p>
        </div>
      )
    },
     {
      label:"Loyalty",
      width:"w-[100px]",
      render: (customer: any) => (
        <div className="flex items-center">
             <p className="font-avenir font-[500]">{customer.loyalty}</p>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-dvh md:h-dvh sm:px-4 xl:px-8 pb-36   xl:ml-[15%] pt-20  md:pt-24 md:pb-32">
      <div className="flex items-center max-sm:px-3">
        <p className="font-avenir text-xl md:text-2xl font-bold">Customers</p>
      </div>
      <div className="mt-4 w-full h-fit bg-white border border-black/15 sm:rounded-2xl grid grid-cols-2 md:flex md:px-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
      <Table
        header={<Header />}
        columns={tableColumns}
        data={customers}
        tableName="Customers"
        tabelState="success"
        reload={() => {}}
        columnStyle="py-4"
      />
    </div>
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
          placeholder="Search by name or emails"
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
            <select className="appearance-none cursor-pointer text-gray-600 focus:outline-none px-2 py-[2px] rounded-md font-avenir font-[500] text-sm bg-gray-200 border border-gray-500/20 pr-7">
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
          <p className="font-avenir font-[500] text-sm">Last Joined: </p>
          <div className="flex items-center border py-[2px]  border-gray-500/20  bg-gray-200 px-2 rounded-md">
            <p className="font-avenir text-sm text-black/50">From:</p>
            <input
              type="date"
              placeholder="GHS 00.00"
              className="w-24 focus:outline-none  px-2 text-sm font-avenir cursor-pointer"
            />
          </div>
          <div className="flex items-center border py-[2px]  border-gray-500/20  bg-gray-200 px-2 rounded-md">
            <p className="font-avenir text-md text-black/50">To:</p>
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

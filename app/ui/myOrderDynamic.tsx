"use client";

import { capitalize } from "@/libs/functions";
import { useApiClient } from "@/libs/useApiClient";
import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Cedis from "./cedis";

export default function MyOrderDynamic({ name }: { name: string }) {
  const router = useRouter();
  const { loadOrder, singleOrderState, orderInView } = useBoundStore();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { get } = useApiClient();

  useEffect(() => {
    loadOrder(id as string, { get });
  }, [id]);

  useEffect(() => {
    console.log(orderInView, "order");
  }, [orderInView]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(/(\d+)/, (match) => {
        const day = parseInt(match);
        const suffix =
          day >= 11 && day <= 13
            ? "th"
            : ["th", "st", "nd", "rd"][day % 10] || "th";
        return day + suffix;
      });
  };

  const activeVariant = orderInView?.items.products;

  type DeliveryStatus = "delivered" | "pending" | "cancelled" | "shipped";

  const deliveryStyles: Record<DeliveryStatus, string> = {
    delivered: "border-green-500/50 text-green-600 bg-green-50",
    pending: "border-yellow-500/50 text-yellow-600 bg-yellow-50",
    cancelled: "border-red-500/50 text-red-600 bg-red-50",
    shipped: "border-blue-500/50 text-blue-600 bg-blue-50",
  };

  const normalizeStatus = (status: string): DeliveryStatus => {
    const s = status.toLowerCase();
    if (["delivered", "pending", "cancelled", "shipped"].includes(s)) {
      return s as DeliveryStatus;
    }
    return "pending";
  };

  function formatToDayMonth(dateString: string): string {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });

    return `${day} ${month}`;
  }


  return (
    <div className="w-full  h-full bg-[#f2f2f2] px-4  pt-20 sm:px-12 xl:px-24 md:pt-32 pb-24 ">
      <div className="flex gap-2 items-center">
        <div
          onClick={() => router.back()}
          className="size-6 md:size-8 cursor-pointer border border-black/30 flex items-center justify-center rounded-full"
        >
          <Image
            src="/icons/arrow.svg"
            width={16}
            height={16}
            alt="arrow"
            className="rotate-90 md:flex hidden"
          />
          <Image
            src="/icons/arrow.svg"
            width={12}
            height={12}
            alt="arrow"
            className="rotate-90 md:hidden"
          />
        </div>
        <p className="font-avenir text-sm md:text-xl pt-[6px]">Back</p>
      </div>
      <div className="mt-10 px-4 md:px-10">
        <p className="font-avenir text-xl md:text-3xl  font-semibold ">
          Order {name}
        </p>
      </div>
      <div className="flex flex-col items-center mt-10">
        {singleOrderState === "loading" && (
          <div className="w-full mt-16 flex flex-col items-center">
            <Image
              src="/icons/loader.svg"
              width={36}
              height={36}
              alt="laoding icon"
            />
          </div>
        )}
        {singleOrderState === "failed" && (
          <div className="w-full mt-16 flex flex-col items-center">
            <p className="font-avenir text-2xl text-red-500 text-balance">
              Something went anything.
            </p>
            <div className="mt-6">
              <div
                onClick={() => loadOrder(id as string, { get })}
                className="py-2 px-10 cursor-pointer bg-black text-white uppercase font-avenir text-md"
              >
                RELOAD
              </div>
            </div>
          </div>
        )}
        {singleOrderState === "success" && (
          <div className="w-full sm:w-[80%]  lg:w-[55%] border border-black/20 bg-white p-4 md:p-10 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-[#888888] text-lg md:text-2xl">Receipt</p>
              <div
                className={`flex rounded-full border px-2 gap-1.5 ${
                  deliveryStyles[
                    normalizeStatus(orderInView?.deliveryStatus as string)
                  ]
                }`}
              >
                <Image
                  src={`/icons/shipping-${orderInView?.deliveryStatus
                    .slice(0, 1)
                    .toLocaleLowerCase()}.svg`}
                  width={24}
                  height={24}
                  alt={orderInView?.paymentStatus as string}
                  className="sm:flex hidden"
                />
                <Image
                  src={`/icons/shipping-${orderInView?.deliveryStatus
                    .slice(0, 1)
                    .toLocaleLowerCase()}.svg`}
                  width={16}
                  height={16}
                  alt={orderInView?.paymentStatus as string}
                  className=" sm:hidden"
                />
                <p className="font-avenir text-[13px] pt-[3.5px]">
                  {capitalize(orderInView?.deliveryStatus)}
                </p>
              </div>
            </div>
            <p className="font-avenir text-[15px] sm:text-[16px] xl:text-[18px] text-balance my-4">
              Arriving at <span className="font-semibold"> {formatToDayMonth(orderInView?.deliveredAt as string)},</span>{" "}
              7:00am to 8:00pm.
            </p>
            <div className="my-6 flex flex-col items-start gap-0.5 py-4 border-dotted px-4 bg-[rgb(250,250,250)] rounded-md border-[0.2px] border-black/10">
              <div>
                <p className="font-avenir text-[13px] text-black/70">
                  EMAIL:{" "}
                  <span className="text-blue-600 underline-offset-2 underline decoration-dotted text-[15px] md:text-[16px] pl-1">
                    {" "}
                    {orderInView?.user?.email}
                  </span>
                </p>
                <p className="font-avenir text-[13px] text-black/70">
                  INVOICE DATE:{" "}
                  <span className="text-black text-[15px] md:text-[16px] pl-1">
                    {" "}
                    {formatDate(orderInView?.date as string)}
                  </span>
                </p>
                <p className="font-avenir text-[13px] text-black/70">
                  ORDER ID:{" "}
                  <span className="text-black text-[15px] md:text-[16px] pl-1">
                    {" "}
                    {orderInView?.IDTrim}
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <p className="font-avenir text-[13px] text-black/50">
                  BILLED TO
                </p>
                <p className="font-avenir text-[15px] md:text-[16px] text-black/70">
                  Visa .... 7461
                </p>
                <p className="font-avenir text-[15px] md:text-[16px] text-black/70">
                  {capitalize(orderInView?.user.firstname) +
                    " " +
                    capitalize(orderInView?.user.lastname)}
                </p>
                <p className="font-avenir text-[15px] md:text-[16px] text-black/70">
                  {orderInView?.shippingAddress?.address},{" "}
                  {orderInView?.shippingAddress.town}{" "}
                  {orderInView?.shippingAddress.region}
                </p>
              </div>
            </div>
            <div className="my-4 px-4 bg-[rgb(250,250,250)]">
              <p className="font-avenir text-md">Product's</p>
            </div>
            <div className="my-4 flex flex-col">
              {orderInView?.items?.products.map((ordeProd) => (
                <ProductSection
                  key={ordeProd._id}
                  product={ordeProd.product}
                  quantity={ordeProd.quantity}
                  size={ordeProd.size}
                  variantID={ordeProd.variantID}
                />
              ))}
              <div className="  pt-3 border-black/20 flex justify-end">
                <p className="font-avenir text-[12px] md:text-[15px]  text-black/40 flex items-center gap-1">
                  <span className="mt-[2px]">SUBTOTAL: </span>
                  <span className="text-black/60 text-[13px] md:text-[16px] flex items-center  gap-0.5">
                    <Cedis />{" "}
                    <span className="mt-[2px]">
                      {orderInView?.total.toFixed(2)}
                    </span>
                  </span>
                </p>
              </div>
              <div className="border-b-[0.5px] pb-3 border-black/20 flex justify-end">
                <p className="font-avenir text-[13px] md:text-[15px] text-black/40 flex items-center gap-1">
                  <span className="mt-[2px]">DISCOUNT: </span>
                  <span className="text-black/60 text-[13px] md:text-[16px] flex items-center  gap-0.5">
                    - <Cedis />{" "}
                    <span className="mt-[2px]">
                      {orderInView?.discount.toFixed(2)}
                    </span>
                  </span>
                </p>
              </div>
              <div className="border-b-[0.5px]  border-black/20 flex gap-2 justify-end">
                <p className="font-avenir text-[15px] md:text-[18px] text-black/80 py-3 mt-[4px]">
                  TOTAL
                </p>
                <div className="w-[1px] sefl-stretch  bg-black/20" />
                <p className="font-avenir text-[16px] md:text-[20px] text-black/80  py-3 flex items-center gap-1">
                  <Cedis cedisStyle="opacity-70" size={16} />{" "}
                  <span className="mt-[3px]">
                    {orderInView?.total.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-6 text-center w-full flex flex-col items-center ">
              <p className="font-avenir text-[13px] text-balance md:text-[17px] text-black/60 w-[90%] md:w-[70%]">
                Thank you for your purchase! Your order is being processed and
                will be shipped within 7 days.
              </p>
              <p className="font-avenir text-[13px] text-balance md:text-[17px] text-black/60 mt-4  w-[90%] md:w-[70%]">
                We appreciate your business and look forward to serving you
                again.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ProductSection = ({
  product,
  variantID,
  size,
  quantity,
}: {
  product: ProductData;
  variantID: string;
  size: string;
  quantity: number;
}) => {
  const variant = useMemo(() => {
    return product?.variants?.find((v) => v._id === variantID);
  }, [product?.variants, variantID]);

  return (
    <div className="flex items-center justify-between border-b-[0.5px] border-black/20 py-4">
      <div className="flex items-end gap-3">
        <div className="size-[70px] md:size-[120px] relative rounded-xl overflow-hidden bg-[#f3f3f3]">
          <Image
            src={variant?.images[0].url as string}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div className="flex-col flex gap-0.5 md:gap-1">
          <p className="font-avenir font-semibold text-[13px] md:text-[20px] capitalize">
            {product.name}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="uppercase font-avenir text-[13px] md:text-[15px] pt-[3px]">
              {variant?.color}
            </p>
            <div className=" h-[15px]  w-[1px] bg-black " />
            <p className="uppercase font-avenir text-[13px] md:text-[15px] pt-[3px]">
              {size}
            </p>
          </div>
          <Link
            href="#"
            className="text-blue-600 font-avenir text-[13px] md:text-[16px]"
          >
            Write a Review
          </Link>
        </div>
      </div>
      <div className="flex  flex-col justify-end gap-1">
        <p className="font-avenir text-[12px] md:text-[13px] text-black/60 text-end">
          QUANTITY: {quantity}
        </p>
        <p className="font-avenir text-[13px]  md:text-[18px] flex items-center gap-1 ">
          <Cedis cedisStyle="opacity-70" size={16} />
          <span className="mt-[3px]">{product.price}</span>
        </p>
      </div>
    </div>
  );
};

"use client";

import { useApiClient } from "@/libs/useApiClient";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import Button from "./button";
import { useRouter } from "next/navigation";
import { OrdersData } from "@/store/dashbaord/orders-store/orders";
import { capitalize } from "@/libs/functions";
import { cn } from "@/libs/cn";

export default function MyOrders() {
  const { get } = useApiClient();
  const { loadUserOrders, userOrdersState, userOrders } = useBoundStore();
  const router = useRouter();
  const [arrivingOrder, setArrivingOrder] = useState<OrdersData[]>([]);
  const [history, setHistory] = useState<OrdersData[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      loadUserOrders({ get });
    };
    initializeData();
  }, []);

  // seprate data

  return (
    <div className="w-full">
      <p className="font-avenir text-xl md:text-3xl  font-semibold ">
        What's coming up
      </p>
      <div className="mt-10 flex flex-col gap-4">
        {(userOrdersState === "loading" || userOrdersState === "idle") && (
          <div className="w-full mt-16 flex flex-col items-center">
            <Image
              src="/icons/loader.svg"
              width={36}
              height={36}
              alt="laoding icon"
            />
          </div>
        )}
        {userOrdersState === "failed" && (
          <div className="w-full mt-16 flex flex-col items-center">
            <p className="font-avenir text-2xl text-red-500 text-balance">
              Something went anything.
            </p>
            <div className="mt-6">
              <div
                onClick={() => loadUserOrders({ get })}
                className="py-2 px-10 cursor-pointer bg-black text-white uppercase font-avenir text-md"
              >
                REFRESH
              </div>
            </div>
          </div>
        )}
        {userOrdersState === "success" && (
          <>
            <div className="full">
              {userOrders.length === 0 ? (
                <div className="w-full mt-16 flex flex-col items-center">
                  <p className="font-avenir text-2xl text-black/50 text-balance">
                    You've not ordered anything.
                  </p>
                  <div className="mt-4">
                    <Button
                      word="GO TO SHOP"
                      action={() => router.push("/product")}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full flex flex-wrap gap-4">
                    {userOrders
                      .filter((ord) => ord.deliveryStatus !== "delivered")
                      .map((order) => (
                        <MyOrderCard
                          type="arriving"
                          key={order._id}
                          order={order}
                        />
                      ))}
                  </div>
                  <div className="mt-24">
                    <p className="font-avenir text-xl md:text-3xl text-black/50  font-semibold ">
                     Order  History
                    </p>
                    <div className="w-full flex flex-wrap gap-4 mt-4">
                      {userOrders
                        .filter((ord) => ord.deliveryStatus === "delivered")
                        .map((order) => (
                          <MyOrderCard
                            type="arriving"
                            key={order._id}
                            order={order}
                          />
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MyOrderCard = ({
  type,
  order,
}: {
  type: "arriving" | "delivered";
  order: OrdersData;
}) => {
  // products

  const variant = useMemo(() => {
    return order.items.products[0].product?.variants?.find(
      (v) => v._id === order.items.products[0].variantID
    );
  }, [order]);

  function formatToDayMonth(dateString: string): string {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });

    return `${day} ${month}`;
  }

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

  return (
    <div className="w-full h-[400px] sm:w-[500px] md:w-[600px] xl:w-[650px] sm:h-[300px] xl:h-[350px] flex sm:flex-row flex-col bg-white rounded-2xl border border-black/15 overflow-hidden shrink-0 ">
      <div className="w-full h-[55%] max-sm:shrink-0 sm:h-auto sm:w-[55%] flex-srink-0  p-[5px] ">
        <div className="w-full h-full bg-[#f2f2f2] rounded-xl overflow-hidden border border-black/5">
          <div className="w-full h-[80%]  relative overflow-hidden">
            <Image
              src={variant?.images[0].url as string??"/images/image-fallback.png"}
              fill
              alt={order.items?.products[0]?.product?.name}
              className="object-cover"
            />
          </div>
          <div className="flex-1 self-stretch p-1.5 sm:p-3  flex justify-between">
            <p className="font-avenir text-[12px] sm:text-[16px]">
              {order?.items?.products[0]?.product?.name}
            </p>
            {order.items.products.length > 1 && (
              <div className="rounded-full size-6 sm:size-9 flex gap-0.5 items-center justify-center bg-black right-2 bottom-2">
                <div className="items-center flex justify-center relative">
                  <div className="w-[1px] h-[6px] bg-white"></div>
                  <div className="w-[6px] h-[1px] bg-white absolute"></div>
                </div>
                <p className="font-avenir text-[12px] text-white pt-[1px]">
                  {order.items?.products?.length - 1}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full h-full self-stretch sm:w-[45%] flex-srink-0 p-4 md:pb-10 flex  flex-col justify-between">
        <div className="flex justify-between items-center">
          <p className="font-avenir text-[12px] text-black/60 ">
            {order.IDTrim}
          </p>
          <div
            className={`flex rounded-full border px-2 gap-1.5 ${
              deliveryStyles[normalizeStatus(order?.deliveryStatus)]
            }`}
          >
            <Image
              src={`/icons/shipping-${order?.deliveryStatus
                .slice(0, 1)
                .toLocaleLowerCase()}.svg`}
              width={24}
              height={24}
              alt={order.paymentStatus}
              className="sm:flex hidden"
            />
            <Image
              src={`/icons/shipping-${order?.deliveryStatus
                .slice(0, 1)
                .toLocaleLowerCase()}.svg`}
              width={16}
              height={16}
              alt={order?.paymentStatus}
              className=" sm:hidden"
            />
            <p className="font-avenir text-[13px] pt-[3.5px]">
              {capitalize(order?.deliveryStatus)}
            </p>
          </div>
        </div>
        <div>
          {order.deliveryStatus === "delivered" ? (
            <>
              <p className="font-avenir text-[15px] sm:text-[16px] xl:text-[18px] text-balance font-semibold">
                Delivered
              </p>
              <p className="font-avenir text-[15px] sm:text-[16px] xl:text-[18px] text-balance font-semibold">
                {formatToDayMonth(order?.deliveredAt)}
              </p>
            </>
          ) : (
            <p className="font-avenir text-[15px] sm:text-[16px] xl:text-[18px] text-balance">
              Arriving at{" "}
              <span className="font-semibold">
                {" "}
                {formatToDayMonth(order?.deliveredAt)},
              </span>{" "}
              7:00am to 8:00pm.
            </p>
          )}
          <div className="mt-1 md:mt-4 ">
            <div className="border-y-[0.5px] border-black/10 w-full flex justify-end ">
              <p className="p-2 font-avenir  text-[12px] md:text-[15px] text-black/70 font-semibold ">
                TOTAL
              </p>
              <div className="w-[1px] self-stretch bg-black/10 sm:mx-2" />
              <p className="p-2 font-avenir text-[12px] md:text-[15px]  text-black/70 font-semibold ">
                GHS {order?.total}
              </p>
            </div>
          </div>
          <Link href={`/account/myorder/${order?.IDTrim}?id=${order._id}`}>
            <p className="mt-2 sm:mt-4 sm:text-[15px] text-[12px] font-avenir text-blue-600 cursor-pointer underline-offset-1 underline decoration-dotted">
              View detials
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

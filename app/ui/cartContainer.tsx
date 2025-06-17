"use client";

import React from "react";
import CartCard from "./cartCard";
import { useBoundStore } from "@/store/store";

export default function CartContainer() {
  const { cartItems } = useBoundStore();

  return (
    <div className="w-full h-full ">
      <div className="w-full flex flex-col gap-2 pb-4 overflow-y-scroll cart-con">
        {cartItems.map((cart) => (
          <CartCard key={cart.id} cartData={cart} />
        ))}
      </div>
    </div>
  );
}

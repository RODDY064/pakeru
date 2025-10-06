"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

export const Receipt = () => {
  return (
    <div
      id="receipt-content"
      className="w-[300px] text-xs font-mono bg-white p-4 rounded-md shadow"
    >
      <div className="text-center mb-3">
        <div className="flex justify-center">
          <Image
            src="/icons/logoText.svg" 
            alt="Shop Logo"
            width={74}
            height={74}
            className="rounded-md"
            priority
          />
        </div>
        <p className="font-bold mt-2">My Online Store</p>
        <p>123 Fashion Ave, NY</p>
        <p>Tel: +1 (555) 123-4567</p>
      </div>

      <hr />

      <div className="mt-2 space-y-1">
        {[1, 2, 4].map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item}</span>
            <span>
              {item} × ${item.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-2" />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span> 1300</span>
      </div>
      <div className="flex flex-col items-center mt-4">
        <QRCodeSVG value="https://reactjs.org/" size={80} />
      </div>
      <p className="mt-2 text-center">Thank you for shopping!</p>
    </div>
  );
};

import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

export default function ProductOrderCard({
  product,
  variantID,
  size,
  quantity,
}: {
  product: ProductData;
  variantID: string;
  size:string,
  quantity:number,

}) {
  const variant = useMemo(() => {
    return product?.variants?.find((v) =>  v._id  === variantID);
  }, [product?.variants, variantID]);

  return (
    <div className="w-full h-[450px] bg-black/5 rounded-[20px] flex gap-2 flex-col border border-dashed  border-black/60 p-2">
      <div className="w-full h-[85%]  border border-black/30 rounded-2xl relative overflow-hidden">
        <Image
          src={variant?.images[0]?.url as string??"/images/image-fallback.png"}
          fill
           alt={`${product?.name} - ${variant?.color}`}
          className="object-cover"
        />
      </div>
      <div className="w-full py-1 px-1 ">
        <p className="font-avenir text-sm uppercase">{product?.name}</p>
        <div className="flex items-center justify-between">
          <p className="font-avenir text-sm text-black/50">
            GHS {product?.price}
          </p>
          <p className="font-avenir text-xs text-green-500 bg-green-50 border-[0.5px] border-green-500 px-2 rounded-full">
            available
          </p>
        </div>
      </div>
      <div className="w-full h-[40px] flex gap-2 ">
        <div className="w-full h-full border border-black/30 rounded-[10px] flex items-center  uppercase justify-center bg-white">
          <p>{size}</p>
        </div>
        <div className="w-full h-full border border-black/30 rounded-[10px] flex gap-2 items-center justify-center bg-white">
          <div 
          style={{ backgroundColor: variant?.colorHex, borderColor:variant?.colorHex}}
          className="size-4 border  rounded-full"></div>
          <p className="font-avenir text-sm text-black pt-[1.5px] uppercase">{variant?.color}</p>
        </div>
      </div>
      <div className="w-full h-[40px] flex-shrink-0  border border-black/30 flex items-center justify-center rounded-[10px] bg-white">
        <p className="font-avenir text-sm text-black pt-[1.5px]">
          <span className="text-black/50">QUANTITY:</span> {quantity??2}
        </p>
      </div>
    </div>
  );
}



import { cn } from "@/libs/cn";
import Image from "next/image";
import React from "react";

export default function Input({
  type,
  placeH,
  style,
  textStyle,
  image,
  imageW,
  imageH,
  label,
  name,
}: {
  type: string;
  placeH: string;
  textStyle?: string;
  style?: string;
  image: string;
  imageW?: number;
  imageH?: number;
  label: string;
  name: string;
}) {
  return (
    <div className={cn(style)}>
      <label className={cn("font-manrop text-md md:text-lg font-medium",textStyle)}>
        {label}
      </label>
      <div className="mt-1 w-full h-11 border border-black/30 rounded flex items-center focus-within:border-blue-600">
        <Image src={image} width={imageW??20} height={imageH??20} alt="user" className="mx-4" />
        <div className="w-[1px] h-[70%] bg-black/30 "></div>
        <input type={type} className="w-full h-full px-2 focus:outline-none font-manrop" placeholder={placeH}/>
      </div>
    </div>
  );
}

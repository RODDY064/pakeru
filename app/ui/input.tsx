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
  register,
  error
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
  register:any,
  error?:any
  
}) {
  return (
    <div className={cn(style)}>
      <label className={cn("font-manrop text-md md:text-lg font-medium",textStyle)}>
        {label}
      </label>
      <div className={cn("mt-1 w-full h-10 md:h-11 border border-black/30 rounded flex items-center focus-within:border-blue-600",{
       "border-red-500" : error && error[name] 
      })}>
        <Image src={image} width={imageW??20} height={imageH??20} alt="user" className="mx-4 hidden md:flex" />
        <Image src={image} width={16} height={16} alt="user" className="mx-3 md:hidden" />
        <div className="w-[1px] h-[70%] bg-black/30 "></div>
        <input
          {...register(name,{ required:true })}
         type={type} className="w-full h-full px-2 focus:outline-none font-manrop" placeholder={placeH}/>
      </div>
      {error && error[name] && <p className="text-sm text-red-500 my-1 font-manrop">{error[name].message}</p>}
    </div>
  );
}

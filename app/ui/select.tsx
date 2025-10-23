import { cn } from "@/libs/cn";
import Image from "next/image";
import React from "react";

export default function Select({
  placeH,
  style,
  textStyle,
  image,
  imageW,
  imageH,
  label,
  name,
  register,
  error,
  disabled = false,
  options
}: {
  placeH: string;
  textStyle?: string;
  style?: string;
  image: string;
  imageW?: number;
  imageH?: number;
  label: string;
  name: string;
  register: any;
  error?: any;
  disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div key={name} className={cn("", style)}>
      <label className={cn("font-avenir text-md md:text-lg font-medium", textStyle)}>
        {label}
      </label>
      <div
        className={cn(
          "mt-1 w-full h-10 md:h-11 border border-black/30 rounded flex items-center focus-within:border-blue-600",
          {
            "border-red-500": error && error[name],
          }
        )}
      >
        <Image
          src={image}
          width={imageW ?? 20}
          height={imageH ?? 20}
          alt="icon"
          className="mx-4 hidden md:flex"
        />
        <Image
          src={image}
          width={16}
          height={16}
          alt="icon"
          className="mx-3 md:hidden"
        />
        <div className="w-[1px] h-[70%] bg-black/30"></div>
        <select
          {...register(name, { required: true })}
          disabled={disabled}
          defaultValue="" 
          className="w-full h-full px-2 focus:outline-none font-avenir bg-transparent cursor-pointer">
          <option  disabled selected>
            {placeH}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && error[name] && (
        <p className="text-sm text-red-500 my-1 font-avenir">{error[name].message}</p>
      )}
    </div>
  );
}

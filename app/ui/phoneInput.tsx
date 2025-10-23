"use client";

import React, { useState } from "react";
import { AsYouType, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import Image from "next/image";

type PhoneInputProps = {
  register: any;
  setValue?: any;
  name: string;
  label?: string;
  defaultCountry?: CountryCode;
  error?: any;
  image?: string;
  imageW?: number;
  imageH?: number;
  disabled?: boolean;
  className?: string;
};

export default function PhoneInput({
  register,
  setValue,
  name,
  label,
  defaultCountry = "GH",
  error,
  image,
  imageW,
  imageH,
  disabled = false,
  className
}: PhoneInputProps) {
  const [display, setDisplay] = useState<string>("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const noSpaces = raw.replace(/\s/g, "");
    let formValue = noSpaces;
    if (!noSpaces.startsWith("+")) {
      formValue = `+233${noSpaces.replace(/^\+?233/, "")}`;
    } else if (noSpaces === "+") {
      formValue = "+233";
    }
    let formatted;
    try {
      const parsed = parsePhoneNumberFromString(formValue);
      if (parsed) {
        formatted = parsed.formatInternational();
      } else {
        formatted = new AsYouType(defaultCountry).input(formValue);
      }
    } catch {
      formatted = formValue;
    }
    
    setDisplay(formatted);
    setValue(name, formValue.replace(/\s/g, ""), {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  return (
    <div className={className}>
      {label && <label className="font-avenir text-md md:text-lg font-medium">{label}</label>}
      <div className={`mt-1 w-full h-10 md:h-11 border border-black/30 rounded flex items-center focus-within:border-blue-600 ${error && error[name] ? "border-red-500" : ""}`}>
        {image && (
          <>
            <Image src={image} width={imageW ?? 20} height={imageH ?? 20} alt="icon" className="mx-4 hidden md:flex" />
            <Image src={image} width={16} height={16} alt="icon" className="mx-3 md:hidden" />
          </>
        )}
        <div className="w-[1px] h-[70%] bg-black/30 "></div>
        <input
          {...register(name)}
          value={display}
          onChange={handleChange}
          disabled={disabled}
          inputMode="tel"
          type="tel"
          className="w-full h-full px-2 focus:outline-none font-avenir"
          placeholder="+233 551 234 5678"
        />
      </div>
      {error && error[name] && <p className="text-sm text-red-500 my-1 font-avenir">{error[name].message}</p>}
    </div>
  );
}
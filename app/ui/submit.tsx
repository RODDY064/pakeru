"use client";

import { cn } from "@/libs/cn";
import Image from "next/image";
import React from "react";

export default function Submit({
  type,
  submitType,
  subStyle
}: {
  type: "loading" | "idle" | "submitted" | "error";
  submitType?: "otp" | "sign-in" | "sign-up"| "in-touch";
  subStyle?:String
}) {
  const getButtonText = () => {
    switch (submitType) {
      case "otp":
        return "Verify OTP";
      case "sign-in":
        return "Sign In";
      case "sign-up":
        return "Create Account";
      case "in-touch" :
        return "Submit"
      default:
        return "Submit";
    }
  };

  const getLoadingText = () => {
    switch (submitType) {
      case "otp":
        return "Verifying OTP...";
      case "sign-in":
        return "Signing in...";
      case "sign-up":
        return "Creating account...";
      default:
        return "Processing...";
    }
  };

  const getSuccessText = () => {
    switch (submitType) {
      case "otp":
        return "OTP verified successfully!";
      case "sign-in":
        return "Signed in successfully!";
      case "sign-up":
        return "Account created successfully!";
      default:
        return "Success!";
    }
  };

  return (
    <div
      className={cn(
        "w-full h-11 mt-8 rounded font-manrop font-semibold text-md flex items-center justify-center overflow-hidden border-[0.5px]",
        {
          "border-gray-400 bg-black hover:bg-black/5 hover:border-black text-white hover:text-black cursor-pointer":
            type === "idle",
          "border-[#1A1A1A] bg-transparent cursor-not-allowed": type === "loading",
          "border-green-400 bg-green-400 cursor-not-allowed text-white": type === "submitted",
          "border-red-500 bg-red-500 cursor-not-allowed text-white": type === "error",
        },subStyle
      )}>
      {type === "idle" && (
        <input
          type="submit"
          value={getButtonText()}
          className="w-full h-full cursor-pointer font-manrop"
        />
      )}

      {type === "loading" && (
        <div className="flex gap-3 items-center justify-center">
          <Image src="/icons/loader.svg" width={20} height={20} alt="loader" />
          <p className="text-sm font-manrop text-black/50">{getLoadingText()}</p>
        </div>
      )}

      {type === "submitted" && (
        <div className="flex gap-3 items-center justify-center">
          <Image src="/icons/tick.svg" width={24} height={20} alt="tick" />
          <p className="text-sm font-manrop text-white">{getSuccessText()}</p>
        </div>
      )}

      {type === "error" && (
        <div className="flex gap-3 items-center justify-center">
          <Image src="/icons/cancel-w.svg" width={14} height={14} alt="cancel" />
          <p className="text-sm font-manrop text-white">Something went wrong. Try again</p>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import Input from "./input";
import { useForm } from "react-hook-form";
import CardSvg from "./cardSvg";
import Image from "next/image";
import { useBoundStore } from "@/store/store";
import { capitalize } from "@/libs/functions";
import { useSession } from "next-auth/react";
import { useApiClient } from "@/libs/useApiClient";

export default function PersonalDetails() {
  const { data: session } = useSession();
  const { register } = useForm();
  const { get } = useApiClient()

  async function Refresh() {
    try {
      
      const res = await get("/api/auth/refresh")

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-center justify-center ">
      <div className="w-full md:w-[60%] bg-white rounded-md p-6 md:p-10 pb-12">
        <div className="w-full flex items-center justify-between">
          <p className="font-avenir font-[500] text-sm md:text-lg">MY PROFILE</p>
          <p className="text-blue-600 font-avenir font-[500] text-sm md:text-lg  cursor-pointer">
            EDIT
          </p>
        </div>
        <div className="flex items-center justify-between mt-6 md:mt-10">
          <p className="font-avenir font-[500] text-[13px] md:text-sm text-black/50">
            PERSONAL DETAILS
          </p>
        </div>
        <div className="my-2 mt-4 flex gap-3 items-end">
          <div className="size-12 md:size-20 rounded-full border border-black/20 flex-none "></div>
          <div className="md:w-[50%]  md:mb-2 flex justify-between ">
            <div className="">
              <p className="font-avenir text-[15px] md:text-xl font-medium ">
                {capitalize(session?.user?.firstname) + " " + capitalize(session?.user?.lastname)}
              </p>
              <p className="font-avenir text-[13px]  md:text-md font-[500] text-black/50">
                {session?.user?.username}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <p className="font-avenir font-[500]  text-[13px] md:text-sm mt-4 md:mt-8 text-black/50">
            SHIPPING ADDRESS
          </p>
          <div className="mt-3 md:mt-4">
            <p className="font-avenir font-[500] text-[15px]  md:text-md text-black/60">
              Region: <span className="text-black"></span>
            </p>
            <p className="font-avenir font-[500]  text-[15px]  md:text-md text-black/60">
              Address:
              <span className="text-black"></span>
            </p>
          </div>
        </div>
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="font-avenir font-[500] text-[15px] md:text-sm  text-black/50">
              Passowrd
            </p>
            <div className="py-2 px-3  bg-black text-white text-[13px] md:text-sm md:mt-2 cursor-pointer">
              Change password
            </div>
          </div>
          <div className="mt-10 md:w-[75%]">
            <Input
              placeH="Enter your old password"
              type="password"
              image="/icons/password.svg"
              imageW={16}
              imageH={16}
              name="password"
              textStyle="md:text-md text-[16px] "
              register={register}
              label="Old Password"
              
            />
            <Input
              placeH="Enter your old password"
              type="password"
              image="/icons/password.svg"
              textStyle="md:text-md text-[16px] "
              imageW={16}
              imageH={16}
              name="password"
              style="mt-4"
              register={register}
              label="New Password"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

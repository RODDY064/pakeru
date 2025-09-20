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
          <p className="font-avenir font-[500]  text-lg">MY PROFILE</p>
          <p className="text-blue-600 font-avenir font-[500]  cursor-pointer">
            EDIT
          </p>
        </div>
        <div className="flex items-center justify-between mt-10">
          <p className="font-avenir font-[500]  text-sm text-black/50">
            PERSONAL DETAILS
          </p>
        </div>
        <div className="my-2 mt-4 flex gap-3 items-end">
          <div className="size-20 rounded-full border border-black/20 flex-none "></div>
          <div className="md:w-[50%] mb-2 flex justify-between ">
            <div>
              <p className="font-avenir text-xl font-medium ">
                {capitalize(session?.user?.firstname) + " " + capitalize(session?.user?.lastname)}
              </p>
              <p className="font-avenir text-md font-[500] text-black/50">
                {session?.user?.username}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <p className="font-avenir font-[500]  text-sm mt-8 text-black/50">
            SHIPPING ADDRESS
          </p>
          <div className="mt-4">
            <p className="font-avenir font-[500]  text-md text-black/60">
              Region: <span className="text-black">Ashanti Region</span>
            </p>
            <p className="font-avenir font-[500]  text-md text-black/60">
              Ghana Post Address:{" "}
              <span className="text-black">AD-748-4930</span>
            </p>
          </div>
        </div>
        <div className="mt-10">
          <div className="flex items-end justify-between">
            <p className="font-avenir font-[500]  text-sm mt-8 text-black/50">
              CHANGE PASSWORD
            </p>
            <div className="py-2 px-3 bg-black text-white text-sm mt-2 cursor-pointer">
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
              textStyle="md:text-md"
              register={register}
              label="Old Password"
            />
            <Input
              placeH="Enter your old password"
              type="password"
              image="/icons/password.svg"
              textStyle="md:text-md"
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

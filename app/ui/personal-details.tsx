"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Input from "./input";
import { useForm } from "react-hook-form";
import CardSvg from "./cardSvg";
import Image from "next/image";
import { useBoundStore } from "@/store/store";
import { capitalize } from "@/libs/functions";
import { useSession } from "next-auth/react";
import { useApiClient } from "@/libs/useApiClient";
import Link from "next/link";

export default function PersonalDetails() {
  const { data: session } = useSession();
  const { register } = useForm();
  const { get } = useApiClient();

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-center justify-center ">
      <div className="w-full md:w-[60%] bg-white rounded-2xl border border-black/10 p-6 md:p-10 ">
        <div className="w-full flex items-center justify-between">
          <p className="font-avenir font-[500] text-sm md:text-lg">
            MY PROFILE
          </p>
          {/* <p className="text-blue-600 font-avenir font-[500] text-sm md:text-lg  cursor-pointer">
            EDIT
          </p> */}
        </div>
        <div className="flex items-center justify-between mt-6 md:mt-10">
          <p className="font-avenir font-[500] text-[13px] md:text-sm text-black/50">
            PERSONAL DETAILS
          </p>
        </div>
        <div className="my-2 mt-4 flex gap-3 items-end">
          <Avatar
            firstname={session?.user.firstname}
            lastname={session?.user.lastname}
            userId={session?.user._id as string}
          />
          <div className="md:w-[50%]  md:mb-2 flex justify-between ">
            <div className="">
              <p className="font-avenir text-[15px] md:text-xl font-medium ">
                {capitalize(session?.user?.firstname) +
                  " " +
                  capitalize(session?.user?.lastname)}
              </p>
              <p className="font-avenir text-[13px]  md:text-md font-[500] text-black/50">
                {session?.user?.username}
              </p>
            </div>
          </div>
        </div>
        {/* <div className="mt-10">
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
        </div> */}
        <div className="my-10">
          <div className="flex items-center justify-center w-full">
            <Link href="/change-password">
              <div className="py-3 px-4  bg-black text-white text-md font-avenir rounded-md md:mt-2 cursor-pointer">
                Change password
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const avatarColors = [
  { bg: "bg-red-100", text: "text-red-500", border: "border-red-500" },
  { bg: "bg-blue-100", text: "text-blue-500", border: "border-blue-500" },
  { bg: "bg-green-100", text: "text-green-500", border: "border-green-500" },
  {
    bg: "bg-yellow-100",
    text: "text-yellow-500",
    border: "border-yellow-500",
  },
  {
    bg: "bg-purple-100",
    text: "text-purple-500",
    border: "border-purple-500",
  },
  { bg: "bg-pink-100", text: "text-pink-500", border: "border-pink-500" },
  {
    bg: "bg-indigo-100",
    text: "text-indigo-500",
    border: "border-indigo-500",
  },
  {
    bg: "bg-orange-100",
    text: "text-orange-500",
    border: "border-orange-500",
  },
  { bg: "bg-teal-100", text: "text-teal-500", border: "border-teal-500" },
  { bg: "bg-amber-100", text: "text-amber-500", border: "border-amber-500" },
];

function Avatar({
  firstname,
  lastname,
  userId, // unique user identifier
}: {
  firstname?: string;
  lastname?: string;
  userId: string;
}) {
  const [color, setColor] = useState(avatarColors[0]);

  useEffect(() => {
    if (!userId) return;

    // Try to load stored color
    const stored = localStorage.getItem(`avatarColor:${userId}`);
    if (stored) {
      setColor(JSON.parse(stored));
    } else {
      // Assign a random one
      const randomColor =
        avatarColors[Math.floor(Math.random() * avatarColors.length)];
      setColor(randomColor);
      localStorage.setItem(
        `avatarColor:${userId}`,
        JSON.stringify(randomColor)
      );
    }
  }, [userId]);

  return (
    <div
      className={`size-12 md:size-20 rounded-full border flex-none flex items-center justify-center ${color.bg} ${color.border}`}
    >
      <p
        className={`font-avenir font-bold text-lg md:text-xl xl:text-2xl ${color.text}`}
      >
        {firstname?.charAt(0).toUpperCase()}
        {lastname?.charAt(0).toUpperCase()}
      </p>
    </div>
  );
}

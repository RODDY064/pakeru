"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useState } from "react";


export default async function DynamicHelps({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  // find the one helps with the name
  const { name } = await params;

  return (
    <div className="w-full min-h-dvh px-8 pt-12 m flex flex-col items-center-safe mb-24">
      <h1 className=" font-avenir text-xl md:text-2xl xl:text-3xl w-[95%] md:w-[70%] lg:w-[60%] ">
        {name}
      </h1>
    </div>
  );
}


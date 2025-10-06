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

// function useIsMobile(breakpoint = 768) {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < breakpoint);
//     check();
//     let resizeTimeout: ReturnType<typeof setTimeout>;
//     const handleResize = () => {
//       clearTimeout(resizeTimeout);
//       resizeTimeout = setTimeout(check, 100);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       clearTimeout(resizeTimeout);
//     };
//   }, [breakpoint]);

//   return isMobile;
// }

//  const [openIndex, setOpenIndex] = useState<number | null>(null);
//   const isMobile = useIsMobile();
//   const [questionHeights, setQuestionHeights] = useState<number[]>([]);
//   const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

//   // Measure the height of each question container
//   useEffect(() => {
//     const measureHeights = () => {
//       const heights = questionRefs.current.map((ref) =>
//         ref ? ref.offsetHeight : isMobile ? 60 : 80
//       );
//       setQuestionHeights(heights);
//     };

//     measureHeights();
//     window.addEventListener("resize", measureHeights);
//     return () => window.removeEventListener("resize", measureHeights);
//   }, [isMobile]);

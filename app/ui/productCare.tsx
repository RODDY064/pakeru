"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { useMemo, useState } from "react";

export default function ProductCare({
  onToggle,
  care,
  instructions,
}: {
  onToggle?: () => void;
  care?: string;
  instructions?: string[];
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const productCareData = useMemo(
    () => [
      {
        title: "Product Care",
        description: care || "No product care information available.",
      },
      {
        title: "Wash Instructions",
        description:
          instructions && instructions.length > 0
            ? instructions
            : ["No wash instructions available."],
      },
    ],
    [care, instructions]
  );
  

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onToggle) {
      onToggle();
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    handleToggle()
  };

  return (
    <div className="h-fit">
      {productCareData.map((item, index) => (
        <div key={index} className="w-full">
          <motion.div
            className={`overflow-hidden  border-black/10 cursor-pointer ${
              index === 0 ? "border-y" : "border-b"
            }`}
            initial="close"
            animate={expandedIndex === index ? "open" : "close"}
            variants={{
              open: { height: "auto" },
              close: { height: "3.5rem" }, 
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => toggleExpand(index)}
          >
            <div className="h-14 flex items-center justify-between">
              <p className="font-avenir text-md">{item.title}</p>
              <motion.div
                animate={{ rotate: expandedIndex === index ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-center w-6 h-6"
              >
                <div className="absolute w-[12px] h-[1.5px] bg-black" />
                <div className="absolute h-[12px] w-[1.5px] bg-black" />
              </motion.div>
            </div>
            <AnimatePresence>
              <motion.div
                className="mt-2 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {typeof item.description === "string" ? (
                  <p className="font-avenir text-sm">{item.description}</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {item.description.map((desc, idx) => (
                      <li key={idx} className="font-avenir text-sm">
                        {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

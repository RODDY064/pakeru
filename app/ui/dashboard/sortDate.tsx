import { useBoundStore } from "@/store/store";
import Image from "next/image";
import { useState } from "react";

export default function SortDateToggle() {
  const [sortDate, setSortDate] = useState<"ascending" | "descending">("descending");

  

  const toggleSort = () => {
    setSortDate((prev) => (prev === "descending" ? "ascending" : "descending"));
  };

  return (
    <div
      onClick={toggleSort}
      className="w-[150px] flex gap-2 items-center cursor-pointer">
      <p className="font-avenir font-[500] text-md">Date</p>
      <div className="flex flex-col gap-[2px]">
        <Image
          src="icons/arrow.svg"
          width={10}
          height={10}
          alt="arrow-up"
          className={`rotate-180 ${sortDate === "ascending" ? "opacity-100" : "opacity-30"}`}
        />
        <Image
          src="icons/arrow.svg"
          width={10}
          height={10}
          alt="arrow-down"
          className={`${sortDate === "descending" ? "opacity-100" : "opacity-30"}`}
        />
      </div>
    </div>
  );
}

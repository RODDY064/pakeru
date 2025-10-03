"use client"

import { cn } from "@/libs/cn";


type StatCardProps = {
  label: string;
  value: number | string;
  highlight?: boolean;
};


export default  function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        "w-full flex py-3  border-r max-sm:border-t items-center gap-1 border-black/10  px-5  last:border-r-0",
        { "col-span-2": highlight }
      )}>
      <p className="font-avenir font-[500] text-sm md:text-md md:mt-[2px] text-black/60">
        {label} :
      </p>
      <div className="pt-[5px]" />
      <p className="font-avenir font-semibold text-sm  mx-1  text-black/70">
        {value} {label === "Product Sells Rate" ? "%" : ""}
      </p>
    </div>
  );
}


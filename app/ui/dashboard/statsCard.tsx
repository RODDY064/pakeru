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
        "w-full flex items-start border-r max-sm:border-t border-black/10 py-2.5 px-4 lg:px-5 xl:px-10 flex-col last:border-r-0",
        { "col-span-2": highlight }
      )}>
      <p className="font-avenir font-[500] text-sm md:text-md md:mt-[2px] text-black/60">
        {label}
      </p>
      <div className="w-full border-[0.5px] border-dashed border-black/50 mt-1" />
      <p className="font-avenir font-semibold md:text-xl mx-1 mt-2 text-black/70">
        {value} {label === "Product Sells Rate" ? "%" : ""}
      </p>
    </div>
  );
}


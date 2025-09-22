import { cn } from "@/libs/cn";
import React from "react";

export default function ProductSkeleton({
  type,
}: {
  type: "large" | "medium" | "small";
}) {
  const sizeConfig = {
    large: {
      container: "w-full h-[300px] md:h-[400px]  xl:h-[55vh]",
    },
    medium: {
      container: "w-[250px] md:w-[300px] h-[300px] md:h-[400px]",
    },
    small: {
      container: "w-[200px] md:w-[250px] h-[300px]",
    },
  };

  const config = sizeConfig[type];

  return (
    <div
      className={cn("relative overflow-hidden rounded-sm   ", config.container)}
    >
      <div className="w-full h-[85%]  bg-[#f2f2f2] rounded-sm animate-pulse" />
      <div className="w-[60%]  bg-[#f2f2f2]  h-3 mt-4 rounded-full animate-pulse"></div>
      <div className="w-[80%]  bg-[#f2f2f2]  h-3 mt-2 rounded-full animate-pulse"></div>
    </div>
  );
}

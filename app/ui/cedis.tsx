import { cn } from "@/libs/cn";
import Image from "next/image";
import React from "react";

export default function Cedis({
  size,
  className,
  cedisStyle
}: {
  size?: number;
  className?: string;
  cedisStyle?: string;
}) {
  return (
    <span className={cn("flex items-center", className)}>
      <span className="mt-[3px]">GH</span>{" "}
      <Image
        src="/icons/cedis.png"
        width={size ?? 13}
        height={size ?? 16}
        alt="cedis"
        className={cn("opacity-50",cedisStyle)}
      />
    </span>
  );
}

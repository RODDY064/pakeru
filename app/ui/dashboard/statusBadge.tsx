type StatusBadgeProps = {
  status: string;
  statuses: string[]; // order matters: [green, yellow, red...]
  className?: string;
};

const colorClasses = [
  "border-green-500/50 text-green-600 bg-green-50", // first
  "border-yellow-500/50 text-yellow-600 bg-yellow-50", // second
  "border-red-500/50 text-red-600 bg-red-50", // third
  "border-gray-400 text-gray-600 bg-gray-100", // fallback
];

import { cn } from "@/libs/cn";
import React from "react";

export default function StatusBadge({
  status,
  statuses,
  className,
}: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase();
  const normalizedStatuses = statuses?.map((s) => s.toLowerCase());

  const index = normalizedStatuses.indexOf(normalizedStatus);
  const style = colorClasses[index] ?? colorClasses[colorClasses.length - 1];

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          `appearance-none min-w-[90px] flex items-center font-avenir justify-center py-1 px-2 text-sm border rounded-lg font-medium capitalize ${style}`,
          className
        )}>
        {status}
      </div>
    </div>
  );
}

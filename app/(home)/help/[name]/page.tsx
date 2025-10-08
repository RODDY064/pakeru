import React, { Suspense } from "react";
import HelpContent from "./helpConponent";

export default async function DynamicHelp({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return (
    <Suspense
      fallback={
        <div className="w-[85%] md:w-[70%] py-12 md:py-24 flex flex-col">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          </div>
        </div>
      }>
      <HelpContent name={name} />
    </Suspense>
  );
}

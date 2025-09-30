"use client";

import Image from "next/image";
import React, { useRef } from "react";
import Pagination from "./pagination";
import { cn } from "@/libs/cn";

export type Column = {
  label: string | React.ReactNode;
  width?: string;
  style?: string;
  render: (row: any) => React.ReactNode;
};

type tableProps = {
  header: React.ReactNode;
  columns: Column[];
  data: any[];
  tableName: string;
  tabelState: "idle" | "loading" | "success" | "failed";
  reload: () => void;
  columnClick?: (row: any) => void;
  columnStyle?: string;
  dateKey: string;
  isFilterd: boolean;
};

export default function Table({
  header,
  columns,
  data,
  tabelState,
  tableName,
  reload,
  columnClick,
  columnStyle,
  dateKey,
  isFilterd = false,
}: tableProps) {
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  const handleHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget?.scrollLeft;
    }
  };

  const scrollTable = (turn: "right" | "left") => {
    const container = headerScrollRef.current || contentScrollRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;
      const totalWidth = container.scrollWidth;

      if (turn === "right") {
        const remainingWidth = totalWidth - currentScroll - containerWidth;
        const scrollAmount = Math.min(containerWidth * 0.8, remainingWidth);

        // Scroll both header and content
        if (headerScrollRef.current) {
          headerScrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
      } else {
        const scrollAmount = Math.min(containerWidth * 0.8, currentScroll);

        // Scroll both header and content
        if (headerScrollRef.current) {
          headerScrollRef.current.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
        }
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }
  };

  function getMonthYearLabel(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function groupDataByMonth(data: any[]) {
    return data.reduce((groups: Record<string, any[]>, item) => {
      const rawDate = item[dateKey]; // ✅ dynamic key
      if (!rawDate) return groups;

      const label = getMonthYearLabel(rawDate);
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);

      return groups;
    }, {});
  }

  return (
    <div className="mt-4 w-full h-[96%] bg-white border border-black/15 rounded-2xl overflow-hidden flex flex-col">
      <div className="flex lg:flex-row flex-col gap-4 lg:gap-auto lg:items-center justify-between border-b border-black/15 px-4 py-4 font-avenir">
        {header}
      </div>
      {/* table  */}
      <div className="flex flex-col min-h-0  flex-1 relative">
        {/* table row names */}
        <div className="absolute px-6 py-3 flex justify-between items-center w-full z-10 2xl:hidden pointer-events-none">
          <div
            onClick={() => scrollTable("left")}
            className="cursor-pointer pointer-events-auto"
          >
            <Image
              src="/icons/double-arrow.svg"
              width={24}
              height={24}
              alt="double-arrow-left"
              className="rotate-180"
            />
          </div>
          <div
            onClick={() => scrollTable("right")}
            className="cursor-pointer pointer-events-auto"
          >
            <Image
              src="/icons/double-arrow.svg"
              width={24}
              height={24}
              alt="double-arrow-right"
            />
          </div>
        </div>
        <div className="w-full min-h-32 2xl:min-h-10 pb-6 xl:py-4 bg-[#f2f2f2] border-b border-black/10 flex flex-col justify-end">
          <div className="w-full h-[1px] bg-black/30 my-4 2xl:hidden" />
          <div
            ref={headerScrollRef}
            onScroll={handleHeaderScroll}
            className="overflow-x-auto scrollbar-hide px-4 scroll-table"
          >
            <div className="flex min-w-fit">
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className={`${col.width ?? "flex-1"} truncate font-avenir ${
                    col.style ?? ""
                  }`}
                >
                  {typeof col.label === "string" ? (
                    <p>{col.label}</p>
                  ) : (
                    col.label
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* table data */}
        <div
          ref={contentScrollRef}
          onScroll={handleContentScroll}
          className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide"
        >
          <div className="min-w-fit">
            {tabelState === "idle" && (
              <div className="w-full h-[300px] flex items-center justify-center">
                <p className="text-black/40 font-avenir">
                  Waiting to load {tableName}
                </p>
              </div>
            )}

            {tabelState === "loading" && (
              <div className="w-full min-h-[300px] flex items-center justify-center gap-2">
                <Image
                  src="/icons/loader.svg"
                  width={28}
                  height={28}
                  alt="loading"
                />
                <p className="font-avenir pt-[3px] text-lg text-black/50 ">
                  Loading {tableName.toLowerCase()}
                </p>
              </div>
            )}
            {tabelState === "failed" && (
              <div className="w-full min-h-[300px] flex items-center justify-center gap-2  flex-col">
                <p className="font-avenir pt-[3px] text-lg  text-red-500 ">
                  Something went wrong
                </p>
                <p
                  onClick={reload}
                  className="px-10 py-2 cursor-pointer bg-black text-center text-lg mt-4 font-avenir text-white"
                >
                  Refresh to load {tableName.toLowerCase()}
                </p>
              </div>
            )}
            {tabelState === "success" && (
              <>
                {data.length === 0 ? (
                  <>
                    {isFilterd ? (
                      <div className="py-10 text-center text-black/50 font-avenir w-full h-[300px] flex items-center justify-center gap-2  flex-col">
                        <div className="flex flex-col  items-center justify-center h-full text-gray-500">
                          <Image
                            src="/icons/search.svg"
                            width={32}
                            height={32}
                            alt="search"
                            className="mb-4 opacity-30"
                          />
                          <p className="text-lg font-avenir font-[400]">
                              No {tableName.toLowerCase()}  match your filter
                          </p>
                          <p className="text-sm mt-1 font-avenir font-[400] text-black/30">
                             Try adjusting the filter options
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-black/50 font-avenir w-full h-[300px] flex items-center justify-center gap-2  flex-col">
                        No {tableName} found
                      </div>
                    )}
                  </>
                ) : (
                  Object.entries(groupDataByMonth(data)).map(
                    ([month, rows]) => (
                      <React.Fragment key={month}>
                        <div className="bg-[#f9f9f9] sticky top-0 z-50 py-3 text-center px-4 border-b border-black/10">
                          <p className="font-avenir text-md font-[300] text-black/70">
                            {month}
                          </p>
                        </div>

                        {rows.map((row, idx) => (
                          <div
                            onClick={() => columnClick?.(row)}
                            key={row._id ?? idx}
                            className={cn(
                              "py-6 px-4 cursor-pointer flex items-center border-b border-black/15 font-avenir",
                              columnStyle
                            )}
                          >
                            {columns.map((col, cidx) => (
                              <div
                                key={cidx}
                                className={`${col.width ?? "flex-1"} `}
                              >
                                {col.render(row)}
                              </div>
                            ))}
                          </div>
                        ))}
                      </React.Fragment>
                    )
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Pagination Refresh={reload} />
    </div>
  );
}

"use client";

import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";
interface PaginationProps {
  showPageSize?: boolean;
  maxVisiblePages?: number;
  Refresh?: () => void;
  dataKey?: string;
}

export default function Pagination({
  showPageSize = true,
  Refresh,
}: PaginationProps) {
  const [visiblePages, setVisiblePage] = useState<(string | number)[]>([]);

  const { pagination, setPage, setSize, next, prev, computed } =
    useBoundStore();

  const { totalPages } = computed();

  useEffect(() => {
    // console.log(pagination, "pagination");
    const pages = getVisiblePages();
    setVisiblePage(pages);
  }, [pagination]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      setPage(page);
    },
    [setPage]
  );

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const { page } = pagination;
    const pages: (number | string)[] = [];

    if (totalPages <= 0) return pages;

    // If total pages <= 5 → just show all
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first 2
    pages.push(1, 2);

    if (page === 1) {
      // page 1
      pages.push("...", totalPages);
    } else if (page === 2) {
      // page 2
      pages.push(3, "...", totalPages);
    } else if (page === 3) {
      // page 3
      pages.push("...", 3, 4, 5, "...", totalPages);
    } else if (page > 3 && page < totalPages - 3) {
      // middle zone
      pages.push("...", page, page + 1, "...", totalPages);
    } else {
      // near the end
      pages.push("...", totalPages - 2, totalPages - 1, totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      handlePageChange(page);
    }
  };

  // Page size options
  const pageSizeOptions = [2, 5, 7, 10, 15, 20, 25, 50];

  return (
    <div className="w-full h-fit flex items-center justify-between pt-4 px-10 gap-4 border-t border-black/10">
      <p className="font-avenir font-[500] text-md text-black/50">
        Showing: {pagination.page}/{totalPages}{" "}
      </p>

      <div className="flex items-center gap-4 ">
        <div
          onClick={Refresh}
          className="h-12 px-6 bg-blue-50 border border-blue-600 cursor-pointer items-center flex rounded-xl justify-center "
        >
          <p className="px-6 font-avenir font-[500] text-[#083f9d] ">Refresh</p>
        </div>
        {showPageSize && (
          <div className="h-12 border border-black/15 items-center flex rounded-xl">
            <p className="px-6 font-avenir font-[500] text-md text-black/50">
              Page Size
            </p>
            <div className="px-3 pl-4 border-l border-black/15 h-full flex items-center justify-center">
              <div className="flex items-center gap-2 cursor-pointer">
                <select
                  value={pagination.size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="font-avenir font-[500] text-md appearance-none h-full focus:outline-none cursor-pointer"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <Image
                  src="/icons/arrow.svg"
                  width={13}
                  height={16}
                  alt="arrow"
                  className="opacity-50"
                />
              </div>
            </div>
          </div>
        )}
        <div className="h-12 border  border-black/15 flex overflow-hidden rounded-xl items-center justify-center cursor-pointer">
          <div
            onClick={prev}
            className="flex items-center  hover:bg-black/10  justify-center px-4 gap-2 border-r h-full border-black/15"
          >
            <Image
              src="/icons/arrow.svg"
              width={13}
              height={16}
              alt="arrow"
              className="opacity-50 rotate-90"
            />
            <p className="text-black/70 font-avenir font-[500] text-md">
              Previous
            </p>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              {visiblePages.map((page, index) => {
                if (page === "...") {
                  return (
                    <div
                      key={`ellipsis-${index}`}
                      className="h-7.5 rounded-md flex items-center justify-center"
                    >
                      <Image
                        src="/icons/dots.svg"
                        width={15}
                        height={15}
                        alt="dots"
                        className="rotate-90"
                      />
                    </div>
                  );
                }

                const isCurrentPage = page === pagination.page;

                return (
                  <button
                    key={page}
                    className={`size-7.5 rounded-md border border-black/25 flex items-center justify-center transition-all cursor-pointer  ${
                      isCurrentPage ? "bg-black/30 " : "bg-black/5 "
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    <p className="font-avenir text-sm font-[500]">{page}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            onClick={next}
            className="flex hover:bg-black/10 h-full items-center justify-center px-4 border-l border-black/15 gap-2"
          >
            <p>Next</p>
            <Image
              src="/icons/arrow.svg"
              width={13}
              height={16}
              alt="arrow"
              className="opacity-50 rotate-270"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

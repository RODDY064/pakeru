"use client";

import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";
interface PaginationProps {
  showPageSize?: boolean;
  maxVisiblePages?: number;
  loadFunction?: string;
  dataKey?: string;
}

export default function Pagination({ showPageSize = true }: PaginationProps) {
  const [visiblePages, setVisiblePage] = useState<(string | number)[]>([]);

  const {
    pagination,
    setCurrentPage,
    setItemsPerPage,
    goToNextPage,
    goToPrevPage,
  } = useBoundStore();

  useEffect(() => {
    // console.log(pagination, "pagination");
    const pages = getVisiblePages();
    setVisiblePage(pages);
  }, [pagination]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const handleNextPage = async () => {
    goToNextPage();
  };

  const handlePrevPage = async () => {
    await goToPrevPage();
  };

  // Calculate visible page numbers
  const getVisiblePages = (maxVisiblePages: number = 3) => {
  const { totalPages, currentPage } = pagination;
  const pages: (number | string)[] = [];

  if (totalPages <= 0) return pages;

  // If total pages is small, just show all
  if (totalPages <= maxVisiblePages + 2) { 
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  const half = Math.floor(maxVisiblePages / 2);
  let windowStart = Math.max(2, currentPage - half);
  let windowEnd = Math.min(totalPages - 1, currentPage + half);

  // Adjust if near the start
  if (currentPage <= half + 1) {
    windowStart = 2;
    windowEnd = maxVisiblePages;
  }

  // Adjust if near the end
  if (currentPage >= totalPages - half) {
    windowStart = totalPages - maxVisiblePages + 1;
    windowEnd = totalPages - 1;
  }

  // Always show first page
  pages.push(1);

  // Left ellipsis
  if (windowStart > 2) {
    pages.push("...");
  }

  // Middle window
  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  // Right ellipsis
  if (windowEnd < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
};


  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      handlePageChange(page);
    }
  };

  // Page size options
  const pageSizeOptions = [2,5, 7, 10, 15, 20, 25, 50];

  return (
    <div className="w-full h-fit flex items-center justify-end pt-4 px-10 gap-4 border-t border-black/10">
      {showPageSize && (
        <div className="h-12 border border-black/15 items-center flex rounded-xl">
          <p className="px-6 font-avenir font-[500] text-md text-black/50">
            Page Size
          </p>
          <div className="px-3 pl-4 border-l border-black/15 h-full flex items-center justify-center">
            <div className="flex items-center gap-2 cursor-pointer">
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
        onClick={handlePrevPage}
        className="flex items-center  hover:bg-black/10  justify-center px-4 gap-2 border-r h-full border-black/15">
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

              const isCurrentPage = page === pagination.currentPage;

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
          {/* <div className="flex items-center gap-2">
            
            <div
            onClick={()=>  handlePageChange(1)}
             className="size-7.5 rounded-md bg-black/5 border border-black/25 flex items-center justify-center">
              <p className="font-avenir text-sm font-[500]">1</p>
            </div>
            <div
            onClick={()=>  handlePageChange(2)}
             className="size-7.5 rounded-md bg-black/30 border border-black/25 flex items-center justify-center">
              <p className="font-avenir text-sm font-[500]">2</p>
            </div>
            <div
            onClick={()=>  handlePageChange(3)}
             className="size-7.5 rounded-md bg-black/5 border border-black/25 flex items-center justify-center">
              <p className="font-avenir text-sm font-[500]">3</p>
            </div>
            <div className="h-7.5 rounded-md flex items-center justify-center">
              <Image
                src="/icons/dots.svg"
                width={15}
                height={15}
                alt="dots"
                className="rotate-90"
              />
            </div>
          </div> */}
        </div>
        <div
          onClick={handleNextPage}
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
  );
}

//  return (
//     <div className="w-full h-fit flex items-center justify-end pt-4 px-10 gap-4 border-t border-black/10">
//       {/* Page Size Selector */}
//       {showPageSize && (
//         <div className="h-12 border border-black/15 items-center flex rounded-xl">
//           <p className="px-6 font-avenir font-[500] text-md text-black/50">
//             Page Size
//           </p>
//           <div className="px-3 pl-4 border-l border-black/15 h-full flex items-center justify-center">
//             <div className="flex items-center gap-2 cursor-pointer">
//               <select
//                 className="font-avenir font-[500] text-md appearance-none h-full focus:outline-none cursor-pointer bg-transparent"
//                 value={pagination.itemsPerPage}
//                 onChange={(e) => handlePageSizeChange(Number(e.target.value))}
//                 disabled={isLoading}
//               >
//                 {pageSizeOptions.map(size => (
//                   <option key={size} value={size}>{size}</option>
//                 ))}
//               </select>
//               <Image
//                 src="/icons/arrow.svg"
//                 width={13}
//                 height={16}
//                 alt="arrow"
//                 className="opacity-50"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Pagination Controls */}
//       <div className="h-12 border border-black/15 flex rounded-xl items-center justify-center">
//         {/* Previous Button */}
//         <button
//           className={`flex items-center justify-center px-4 gap-2 border-r h-full border-black/15 transition-opacity ${
//             !pagination.hasPrevPage || isLoading
//               ? 'opacity-50 cursor-not-allowed'
//               : 'cursor-pointer hover:bg-black/5'
//           }`}
//           onClick={handlePrevPage}
//           disabled={!pagination.hasPrevPage || isLoading}
//         >
//           <Image
//             src="/icons/arrow.svg"
//             width={13}
//             height={16}
//             alt="arrow"
//             className="opacity-50 rotate-90"
//           />
//           <p className="text-black/70 font-avenir font-[500] text-md">
//             Previous
//           </p>
//         </button>

//         {/* Page Numbers */}
//         <div className="px-4 py-4">
//           <div className="flex items-center gap-2">
//             {visiblePages.map((page, index) => {
//               if (page === '...') {
//                 return (
//                   <div key={`ellipsis-${index}`} className="h-7.5 rounded-md flex items-center justify-center">
//                     <Image
//                       src="/icons/dots.svg"
//                       width={15}
//                       height={15}
//                       alt="dots"
//                       className="rotate-90"
//                     />
//                   </div>
//                 );
//               }

//               const isCurrentPage = page === pagination.currentPage;

//               return (
//                 <button
//                   key={page}
//                   className={`size-7.5 rounded-md border border-black/25 flex items-center justify-center transition-all ${
//                     isCurrentPage
//                       ? 'bg-black/30 text-white'
//                       : 'bg-black/5 hover:bg-black/10 cursor-pointer'
//                   } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                   onClick={() => handlePageClick(page)}
//                   disabled={isLoading}
//                 >
//                   <p className="font-avenir text-sm font-[500]">{page}</p>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Next Button */}
//         <button
//           className={`flex h-full items-center justify-center px-4 border-l border-black/15 gap-2 transition-opacity ${
//             !pagination.hasNextPage || isLoading
//               ? 'opacity-50 cursor-not-allowed'
//               : 'cursor-pointer hover:bg-black/5'
//           }`}
//           onClick={handleNextPage}
//           disabled={!pagination.hasNextPage || isLoading}
//         >
//           <p className="text-black/70 font-avenir font-[500] text-md">Next</p>
//           <Image
//             src="/icons/arrow.svg"
//             width={13}
//             height={16}
//             alt="arrow"
//             className="opacity-50 -rotate-90"
//           />
//         </button>
//       </div>

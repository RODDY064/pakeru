"use client";

import { ProductData } from "@/store/dashbaord/products";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React from "react";
import Button from "./button";
import { useRouter } from "next/navigation";
import { BookmarkType } from "@/store/cart";

export default function MyBookmarks() {
  const { bookMarks } = useBoundStore();
  const router = useRouter();

  return (
    <div>
      <p className="font-avenir text-xl md:text-3xl font-semibold  ">Products you've saved</p>
      <div className="mt-10 flex flex-col md:flex-row items-center gap-4">
        {bookMarks.length === 0 ? (
          <div className="w-full mt-10 flex items-center justify-center flex-col gap-4">
            <p className="font-avenir text-lg text-black/70 text-center text-balance">
              You haven’t saved any products yet
            </p>
            <Button word="GO TO SHOP" action={() => router.push("/shop")} />
          </div>
        ) : (
          <>
            {bookMarks.map((bookmark) => (
              <MybookCard key={bookmark._id} bookmark={bookmark} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const MybookCard = ({ bookmark }: { bookmark: BookmarkType }) => {
  const { addBookmarksToCart, removeBookmark, bookMarks } = useBoundStore();

  return (
    <div className="w-[250px] lg:w-[260px]  xl:w-[300px] h-[380px] xl:h-[450px] bg-white border border-black/20 rounded-md overflow-hidden flex flex-col">
      <div className="w-full h-[70%] bg-[#f2f2f2] flex-shrink-0 relative border-b border-black/20">
        <Image
          src={bookmark?.mainImage?.url}
          fill
          alt="hero"
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="w-full py-3 border-b border-black/10  px-3 flex-shrink-0">
        <p className="font-avenir font-normal text-black/70">
          {bookmark?.name ?? "Uname Products"}
        </p>
        <p className="font-avenir font-normal text-black/50">
          GHS {bookmark?.price ?? "N/A"}
        </p>
      </div>
      <div className="w-full flex flex-1 items-stretch">
        <div
          onClick={() => {
            if ("bookmarkId" in bookmark && bookmark.bookmarkId !== undefined) {
              addBookmarksToCart([bookmark.bookmarkId]);
            }
          }}
          className="w-1/2 cursor-pointer border-r flex items-center justify-center border-black/10 gap-2"
        >
          <div className="mt-[3.2px]">
            <p className="text-xs font-[400] font-avenir">ADD TO CART</p>
          </div>
          <Image src="/icons/bag.svg" width={16} height={16} alt="bookmark" />
        </div>
        <div
          onClick={() => {
            if ("bookmarkId" in bookmark && bookmark.bookmarkId !== undefined) {
              removeBookmark(bookmark.bookmarkId);
            }
          }}
          className="w-1/2    flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <div className="mt-[3.2px]">
            <p className="text-xs font-[400] font-avenir">REMOVE</p>
          </div>
          <Image src="/icons/cancel.svg" width={12} height={12} alt="cancel" />
        </div>
      </div>
    </div>
  );
};

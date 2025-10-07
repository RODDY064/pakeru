import React from "react";
import { helps } from "../data";
import Image from "next/image";

type Faq = {
  question: string;
  answer: string[];
};

type HelpSection = {
  label: string;
  faqs?: Faq[];
};

export default async function DynamicHelp({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  const decodedName = decodeURIComponent(name as string);

  const section = (helps as HelpSection[]).find(
    (h) => h.label.toLowerCase() === decodedName.toLowerCase()
  );

  if (section) {
    return (
      <div className="flex flex-col items-center w-[85%] md:w-[70%] pt-16 justify-center h-full text-gray-500">
        <div className=" mb-4">
          <Image
            src="/icons/search.svg"
            width={32}
            height={32}
            alt="search"
            className="opacity-30"
          />
        </div>
        <p className="font-avenir font-[400] text-lg">No help topics found</p>
        <p className="mt-2 font-avenir font-[300] text-black/40 text-center text-md">
          We couldn’t find any help topics matching your request. <br />
          Try exploring another topic or return to the{" "}
        </p>
      </div>
    );
  }

  return (
    <div className="w-[85%] md:w-[70%] py-12 md:py-24 flex flex-col ">
      <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold mb-6 font-avenir">
        {decodedName}?
      </h1>
      <ul className="space-y-2 list-disc pl-4">
        <li className="text-[16px] md:text-[20px] font-[300] font-avenir">
          You can search by product name or code in our site’s search bar to
          quickly locate items.
        </li>
        <li className="text-[16px] md:text-[20px] font-[300] font-avenir">
          Browse through our collections to discover individual product pages, complete with visuals, product details, available colors, and size options.
        </li>
      </ul>
    </div>
  );
}


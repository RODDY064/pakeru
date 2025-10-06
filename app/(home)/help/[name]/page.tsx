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

  const section = (helps as HelpSection[]).find((h) => h.label.toLowerCase() === decodedName.toLowerCase());

  if (!section) {
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
    <div className="w-[85%] md:w-[70%] py-24 flex flex-col ">
      <h1 className="text-2xl font-semibold mb-6 font-avenir">{decodedName}?</h1>
      <div className="space-y-10">
        {section?.faqs?.map((faq, idx) => (
          <div key={idx}>
            <h2 className="text-lg font-medium mb-2">{faq?.question}</h2>
            <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
              {faq.answer.map((ans, i) => (
                <li key={i}>{ans}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

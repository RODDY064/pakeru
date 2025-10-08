"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

 export default function HelpContent({ name }: {  name: string }) {
 const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");

  const decodedName = decodeURIComponent(name);
  const normalizedSlug = decodedName.toLowerCase().replace(/-/g, " ");

  const section = (helps as HelpSection[]).find(
    (h) => h.label.toLowerCase().replace(/\s*&\s*/g, " ").trim() === normalizedSlug
  );


  if (!section) {
    return (
      <div className="flex flex-col items-center w-[85%] md:w-[70%] pt-16 justify-center h-full text-gray-500">
        <div className="mb-4">
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
          We couldn't find any help topics matching your request. <br />
          Try exploring another topic or return to the{" "}
          <a href="/help" className="underline text-blue-600">
            Help Center
          </a>
          .
        </p>
      </div>
    );
  }

  // Filter FAQs based on search query
  const filteredFaqs = searchQuery
    ? section.faqs?.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.some((ans) =>
            ans.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : section.faqs;

  return (
    <div className="w-[85%] md:w-[70%] py-12 md:py-24 flex flex-col">
      <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold mb-8 font-avenir">
        {section.label}
      </h1>

      {searchQuery && (
        <p className="text-sm text-black/50 font-avenir mb-6">
          Showing results for "{searchQuery}"
        </p>
      )}

      {filteredFaqs && filteredFaqs.length > 0 ? (
        filteredFaqs.map((faq, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-md md:text-xl font-medium font-avenir text-black mb-3">
              {faq.question}
            </h2>
            <ul className="space-y-2 list-disc pl-6">
              {faq.answer.map((ans, j) => (
                <li
                  key={j}
                  className="text-[15px] md:text-[18px] font-[300] font-avenir text-black/80 leading-relaxed"
                >
                  {ans}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p className="text-black/60 font-avenir">
          No FAQs match your search.
        </p>
      )}
    </div>
  );
}

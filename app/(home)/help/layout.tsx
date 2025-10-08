"use client";

import Image from "next/image";
import React, { useState } from "react";
import Contacts from "@/app/ui/contacts";
import { helps } from "./data";
import { useRouter } from "next/navigation";

export default function HelpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [search, setSearch] = useState("");
  const router = useRouter(); 

const handleSearch = () => {
      const query = search.trim().toLowerCase();
    if (!query) return;

    let matchedSection = null;

    for (const section of helps) {
      // Check section label
      if (section.label.toLowerCase().includes(query)) {
        matchedSection = section.label;
        break;
      }

      // Check helps array (quick questions)
      const helpsMatch = section.helps.some((help) =>
        help.toLowerCase().includes(query)
      );
      if (helpsMatch) {
        matchedSection = section.label;
        break;
      }

      // Check FAQ questions and answers
      const faqMatch = section.faqs.some(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.some((ans) => ans.toLowerCase().includes(query))
      );
      if (faqMatch) {
        matchedSection = section.label;
        break;
      }
    }

    if (matchedSection) {
      const sectionSlug = matchedSection.toLowerCase().replace(/[\s&,]+/g, "-");
      router.push(`/help/${sectionSlug}?q=${encodeURIComponent(query)}`);
      setSearch("");
  
    } else {
      router.push('/help/not-found');
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col pt-32 md:pt-[12rem] items-center">
      <h1 className="font-avenir text-xl md:text-3xl">GET HELP</h1>
      <div className="w-full flex flex-col items-center">
        <div className="w-[80%] md:w-[60%] xl:w-[30%] h-10 md:h-14 border flex items-center border-black/50 focus-within:border-black mt-4 rounded-xl md:rounded-2xl p-2 px-3 md:p-4 md:px-5 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What can we help you with?"
             onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full  focus:outline-none font-avenir md:text-md text-sm text-black/70"
          />
          <div  className="flex flex-none w-12  justify-end  cursor-pointer">
            <Image
              onClick={handleSearch}
              src="/icons/search.svg"
              width={16}
              height={16}
              alt="search"
            />
          </div>
        </div>
      </div>
      {children}
      <Contacts />
    </div>
  );
}

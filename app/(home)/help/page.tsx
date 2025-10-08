import Link from "next/link";
import React from "react";
import { helps } from "./data";


export default function Help() {
  return (
    <div className="w-full mt-16 flex flex-col items-center">
      <div className="w-[85%] md:w-[75%]">
        <div className="border-b border-black/30 pb-4">
          <h2 className="font-avenir text-xl md:text-2xl">Quick Assists</h2>
          <p className="font-avenir tex-md md:text-lg text-black/50">
            Answers to our most frequently asked questions are just one click away.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 xl:gap-6">
          {helps.map((help, index) => {
            const sectionSlug = help.label.toLowerCase().replace(/[\s&]+/g, "-");
            return (
              <div key={index}>
                <label className="font-semibold text-[16px] md:text-xl font-avenir">
                  {help.label}
                </label>
                <ul className="flex flex-col mt-2 gap-1 text-sm md:text-[18px]">
                  {help.faqs.slice(0, 3).map((faq, faqIndex) => (
                    <Link
                      key={faqIndex}
                      href={`/help/${sectionSlug}?q=${encodeURIComponent(faq.question)}`}>
                      <li className="font-avenir font-[300] text-black/70 text-[18px] cursor-pointer text-md hover:text-black">
                        {faq.question}
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
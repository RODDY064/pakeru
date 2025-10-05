import Link from "next/link";
import React from "react";

const helps = [
  {
    label: "Ordering & Shopping",
    helps: [
      "How do I find Pakeru products online?",
      "How do I order a product?",
      "Can I place orders without creating an account?",
    ],
    faqs:[]
  },
  {
    label: "Payment Methods",
    helps: [
      "How do I find Pakeru products online?",
      "How do I order a product?",
      "Can I place orders without creating an account?",
    ],
    faqs:[]
  },
  {
    label: "Shipping & Delivery",
    helps: [
      "Where does Pakeru deliver?",
      "How do I order a product?",
      "Can I place orders without creating an account?",
    ],
    faqs:[]
  },
];

export default function Help() {
  return (
    <div className="w-full mt-16 flex flex-col items-center">
      <div className="w-[85%] md:w-[70%]">
        <div className="border-b border-black/30 pb-4">
          <h2 className="font-avenir  text-2xl">Quick Assists</h2>
          <p className="font-avenir tex-md md:text-lg text-black/50">
            Answers to our most frequently asked questions are just one click
            away.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 xl:gap-6">
          {helps.map((help, index) => (
            <div key={index}>
              <label className="font-semibold text-xl font-avenir">
                {help.label}
              </label>
              <ul className="flex flex-col mt-4 ">
                {help.helps.map((item, index) => (
                  <Link key={index} href={`/help/${item}`}>
                    <li className="font-avenir text-black/60 cursor-pointer text-md hover:text-black">
                      {item}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

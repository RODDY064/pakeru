"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

const Faqs: FAQ[] = [
  {
    question: "What is www.thepakeru.com?",
    answer:
      "www.thepakeru.com is an online store offering a variety of products/services for purchase over the internet. Browse our catalog to find products designed to meet your needs.",
  },
  {
    question: "How do I place an order on www.thepakeru.com?",
    answer:
      "To place an order, browse our website, select the products you want, add them to your cart, and proceed to checkout. You’ll need to provide your shipping and payment details to complete the purchase.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit cards, debit cards, PayPal, and other secure payment methods. All transactions are processed securely.",
  },
  {
    question: "How much does shipping cost, and how long does it take?",
    answer:
      "Shipping costs depend on your location and the selected shipping method. Standard delivery typically takes 3-7 business days. You can view exact costs and estimated delivery times at checkout.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes, once your order is shipped, you’ll receive a tracking number via email, which you can use to monitor your package’s status on our website or through the courier’s tracking system.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for unused and undamaged products. Contact our customer support team to initiate a return, and ensure items are returned in their original packaging.",
  },
  {
    question: "Is it safe to shop on www.thepakeru.com?",
    answer:
      "Absolutely. Our website uses secure encryption (HTTPS) and complies with industry standards like PCI-DSS to protect your personal and payment information. We also have a clear privacy policy outlining how we handle your data.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to select countries. International shipping rates and times vary, and you can check availability at checkout.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach us via email at support@thepakeru.com, phone at [insert number], or through our website’s live chat feature. Our team is available 9 AM–5 PM GMT to assist you.",
  },
  {
    question: "What should I do if I receive a damaged or incorrect item?",
    answer:
      "If you receive a damaged or incorrect item, contact our customer support within 7 days of delivery. Provide your order number and photos of the issue, and we’ll arrange a replacement or refund.",
  },
];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(check, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [breakpoint]);

  return isMobile;
}

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const [questionHeights, setQuestionHeights] = useState<number[]>([]);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Measure the height of each question container
  useEffect(() => {
    const measureHeights = () => {
      const heights = questionRefs.current.map((ref) =>
        ref ? ref.offsetHeight : isMobile ? 60 : 80
      );
      setQuestionHeights(heights);
    };

    measureHeights();
    window.addEventListener("resize", measureHeights);
    return () => window.removeEventListener("resize", measureHeights);
  }, [isMobile]);

  return (
    <div className="w-full min-h-dvh px-8 pt-[35%] sm:pt-[25%] md:pt-32 xl:pt-42  flex flex-col items-center-safe mb-24">
      <h1 className=" font-avenir text-[24px] md:text-[32px] xl:text-[38px] 2xl:text-[60px] font-semibold w-[95%] md:w-[70%] lg:w-[60%] ">
        FAQs
      </h1>

      <div className="mt-6 w-full flex flex-col items-center gap-4">
        {Faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div
              key={index}
              layout
              role="button"
              tabIndex={0}
              animate={{
                height: isOpen
                  ? "auto"
                  : questionHeights[index] || (isMobile ? 60 : 80),
              }}
              initial={{
                height: questionHeights[index] || (isMobile ? 60 : 80),
              }}
              className="w-[98%] md:w-[70%] lg:w-[60%] h-[90px] md:min-h-[80px]  overflow-hidden bg-[#f2f2f2] rounded-3xl md:rounded-[36px] border border-black/10 cursor-pointer"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <motion.div
                transition={{ type: "tween" }}
                className="overflow-hidden"
              >
                <div
                  ref={(el) => {
                    questionRefs.current[index] = el;
                  }}
                  className="flex items-center  justify-between  min-h-20 px-4 py-6 md:px-6 md:py-6 ">
                  <h2 className="font-avenir text-[18px]  md:text-[20px] ">
                    {faq.question}
                  </h2>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex items-center justify-center w-5 h-5"
                  >
                    <div className="w-[16px] md:w-[20px] h-[2px] bg-black rounded" />
                    <div className="w-[2px] h-[16px] md:h-[20px]  bg-black rounded absolute" />
                  </motion.div>
                </div>

                {/* Collapsible answer */}
                <AnimatePresence initial={false}>
                  <motion.div
                    className={`overflow-hidden pb-10  px-4 md:px-6 w-[90%] b`}
                  >
                    <p className="font-avenir text-[17px] text-black/70">
                      {faq.answer}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

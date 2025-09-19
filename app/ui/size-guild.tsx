"use client";

import React, { useMemo, useState } from "react";
import Icon from "./Icon";
import { useBoundStore } from "@/store/store";
import { AnimatePresence, motion, cubicBezier } from "motion/react";
import Image from "next/image";
import { Sizes } from "@/libs/sizeguilde";

type SizeType =
  | { gender: "women"; type: "pants" | "tops" | "skirts" }
  | { gender: "men"; type: "pants" | "tops" };

// images

// /sizes/men-tops.jpg
// /sizes/men-pants.jpg
// /size/woman-skirts.jpg
// /sizes/woman-tops.jpg

const guideImages: Record<string, string> = {
  men_tops: "/sizes/men-tops.jpg",
  men_pants: "/sizes/men-pants.jpg",
  women_tops: "/sizes/woman-tops.jpg",
  women_skirts: "/sizes/woman-skirts.jpg",
  women_pants: "/sizes/woman-skirts.jpg",
};

export default function SizeGuild({
  gender = "men",
  type = "pants",
}: SizeType) {
  const { sizeGuild, setSizeGuild } = useBoundStore();

  // States for country & size
  const [selectedCountry, setSelectedCountry] = useState(Sizes[0].country);
  const [selectedSize, setSelectedSize] = useState(Sizes[0].size[0].name);

  // Get current size data
  const currentMeasurements = useMemo(() => {
    const countryObj = Sizes.find((c) => c.country === selectedCountry);
    return (
      countryObj?.size.find((s) => s.name === selectedSize)?.measurement ?? []
    );
  }, [selectedCountry, selectedSize]);

  const filteredMeasurements = useMemo(() => {
    return currentMeasurements.filter(({ label }) => {
      if (type === "pants" || type === "skirts") {
        return label === "WAIST" || label === "HIPS";
      }
      return true;
    });
  }, [currentMeasurements, type]);

  return (
    <div
      className={`fixed  bg-black/80 z-[99]  h-full left-0 right-0 ${
        sizeGuild
          ? "pointer-events-auto  bg-black/80"
          : "pointer-events-none  bg-transparent"
      }`}
    >
      <AnimatePresence>
        <div className="flex  h-full justify-end">
          <motion.div
            variants={container}
            animate={sizeGuild ? "open" : "close"}
            initial="close"
            exit="close"
            key="desktop"
            className="w-full lg:w-[50%] xl:w-[45%] h-full bg-white pt-12 "
          >
            <div className="flex pb-8 items-center justify-between px-10 md:px-12   border-b border-black/20 ">
              <div className="relative">
                <p className="font-avenir text-md">SIZE GUIDE</p>
              </div>
              <div>
                <Icon name="close" onToggle={setSizeGuild} />
              </div>
            </div>
            <div className="py-12 px-6 md:px-16 overflow-scroll h-full">
              <div className="relative flex  items-center">
                <select
                  className="w-full h-10 px-4 text-sm appearance-none border-[1px] focus:border-[1.5px] border-black/30 focus:border-black/60 focus:outline-none rounded-md font-avenir font-[300]"
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedSize(
                      Sizes.find((c) => c.country === e.target.value)?.size[0]
                        .name || ""
                    );
                  }}
                >
                  {Sizes.map((c) => (
                    <option key={c.country}>{c.country}</option>
                  ))}
                </select>
                <div className="absolute right-4">
                  <Image
                    src="/icons/arrow.svg"
                    width={16}
                    height={16}
                    alt="arrow"
                  />
                </div>
              </div>
              <div className="relative flex  items-center mt-6">
                <select
                  className="w-full h-10 text-sm px-4 appearance-none border-[1px] focus:border-[1.5px] border-black/30 focus:border-black/60 focus:outline-none rounded-md font-avenir font-[300]"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {Sizes.find((c) => c.country === selectedCountry)?.size.map(
                    (s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    )
                  )}
                </select>
                <div className="absolute right-4">
                  <Image
                    src="/icons/arrow.svg"
                    width={16}
                    height={16}
                    alt="arrow"
                  />
                </div>
              </div>
              <div className="mt-10 w-full min-h-24 border rounded-md border-black/10">
                <div className="w-full py-4 bg-[#f2f2f2] border-b border-black/10 px-4">
                  <p className="font-avenir font-[500] text-md text-black/50">
                    Measurement
                  </p>
                </div>
                <div
                  className={`grid max-sm:grid-cols-1  ${
                    filteredMeasurements.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-5"
                  }`}>
                  {filteredMeasurements.map(({ label, value }) => (
                    <div key={label} className="py-2 md:py-4">
                      <p className="font-avenir font-[400] text-sm text-black/50 px-4">
                        {label}
                      </p>
                      <div className="w-full h-[1px] bg-black/10 my-2 md:my-3" />
                      <p className="mt-6 px-4 font-avenir text-sm">{value}</p>
                      {label !== "HIPS" && (
                        <div className="w-full h-[1px] bg-black/10 my-2 md:hidden" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <p className="font-avenir font-[500] text-md text-black/70">
                  HOW TO MEASURE
                </p>
                <p className="mt-6 font-avenir font-[500] text-black/60">
                  In order to select the correct clothing size, we recommend you
                  take the following measurements using a soft tape measure. If
                  necessary, ask someone else to help.
                </p>
                <div className="flex items-center justify-center w-full mt-4">
                  <Image
                    src={guideImages[`${gender}_${type}`]}
                    width={500}
                    height={200}
                    alt={`${gender} ${type} size guide`}
                    className="object-contain"
                  />
                </div>
                <div className="mt-4 mb-20">
                  {gender === "men" && type === "tops" && (
                    <>
                      <div>
                        <p className="font-avenir font-[500] text-lg">
                          1. Shoulder width
                        </p>
                        <p className="my-3 text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure straight across from the tip of
                          one shoulder to the other, just above your shoulder
                          blades
                        </p>
                      </div>
                      <div className="mt-10">
                        <p className="font-avenir font-[500] text-lg">
                          2. Chest
                        </p>
                        <p className="my-3 text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure across your back, under your
                          arms and over your breastbone at its widest point,
                          taking care to keep the tape measure horizontal. It
                          should sit snugly against your body, but should not be
                          pulled too tight
                        </p>
                      </div>
                      <div className="mt-10">
                        <p className="font-avenir font-[500] text-lg">
                          3. Waist
                        </p>
                        <p className="my-3 text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure around your natural waistline,
                          at the narrowest point of your waist. The tape measure
                          should sit snugly against your body, but should not be
                          pulled too tight
                        </p>
                      </div>
                      <div className="mt-10">
                        <p className="font-avenir font-[500] text-lg">
                          4. Sleeve Length
                        </p>
                        <p className="my-3 text-md font-avenir font-[500] text-black/70">
                          Keeping your arm straight by your side, measure from
                          the tip of your shoulder to the base of your thumb
                        </p>
                      </div>
                    </>
                  )}
                  {gender === "men" && type === "pants" && (
                    <>
                      <div>
                        <p className="font-avenir font-[500] text-lg">
                          1. Waist
                        </p>
                        <p className="my-3 text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure around your natural waistline,
                          at the narrowest point of your waist. The tape measure
                          should sit snugly against your body, but should not be
                          pulled too tight.
                        </p>
                      </div>
                      <div>
                        <p className="font-avenir font-[500] text-lg">
                          2. Hips
                        </p>
                        <p className="my-3 text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure across your hipbone, around the fullest point of your hips.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}

export const overlay = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

// Optimized animation variants
const easingShow = cubicBezier(0.4, 0, 0.2, 1);

const container = {
  open: {
    x: 0,
    transition: {
      ease: easingShow,
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
  close: {
    x: 900,
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

const list = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      ease: easingShow,
    },
  },
  close: {
    opacity: 0,
    y: 20,
  },
};

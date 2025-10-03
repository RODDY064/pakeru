"use client";

import React, { useMemo, useState } from "react";
import Icon from "./Icon";
import { useBoundStore } from "@/store/store";
import { AnimatePresence, motion, cubicBezier } from "motion/react";
import Image from "next/image";
import { Sizes, ClothTypeName } from "@/libs/sizeguilde";
type SizeType = {
  gender: "men" | "women" | "unisex";
  type: "pants" | "tops" | "skirts";
  key: string;
};

const clothTypeToInfo: Record<ClothTypeName, SizeType> = {
  [ClothTypeName.MenShirts]: { gender: "men", type: "tops", key: "men_tops" },
  [ClothTypeName.MenTshirts]: { gender: "men", type: "tops", key: "men_tops" },
  [ClothTypeName.Polo]: { gender: "men", type: "tops", key: "men_tops" },
  [ClothTypeName.MenJeans]: { gender: "men", type: "pants", key: "men_pants" },
  [ClothTypeName.MenPants]: { gender: "men", type: "pants", key: "men_pants" },
  [ClothTypeName.MenCargoPants]: {
    gender: "men",
    type: "pants",
    key: "men_pants",
  },
  [ClothTypeName.MenCargoShorts]: {
    gender: "men",
    type: "pants",
    key: "men_pants",
  },
  [ClothTypeName.MenBaggyJeans]: {
    gender: "men",
    type: "pants",
    key: "men_pants",
  },

  [ClothTypeName.CropTopShortSleeve]: {
    gender: "women",
    type: "tops",
    key: "women_tops",
  },
  [ClothTypeName.CropTopLongSleeve]: {
    gender: "women",
    type: "tops",
    key: "women_tops",
  },
  [ClothTypeName.PleatedSkirt]: {
    gender: "women",
    type: "skirts",
    key: "women_skirts",
  },
  [ClothTypeName.WomenBaggyJeans]: {
    gender: "women",
    type: "pants",
    key: "women_pants",
  },
  [ClothTypeName.WomenCargoPants]: {
    gender: "women",
    type: "pants",
    key: "women_pants",
  },
};

// your guide images remain the same
const guideImages: Record<string, string> = {
  men_tops: "/sizes/men-tops.jpg",
  men_pants: "/sizes/men-pants.jpg",
  women_tops: "/sizes/woman-tops.jpg",
  women_pants: "/sizes/woman-skirts.jpg",
  women_skirts: "/sizes/woman-skirts.jpg",

  // Fallback for unisex
  unisex_tops: "/sizes/men-tops.jpg",
  unisex_pants: "/sizes/men-pants.jpg",
  unisex_skirts: "/sizes/woman-skirts.jpg",
};

export default function SizeGuild({ clothType }: { clothType: ClothTypeName }) {
  const { sizeGuild, setSizeGuild } = useBoundStore();

  const info = clothTypeToInfo[clothType];
  if (!info) {
    console.warn(`No info found for clothType: ${clothType}`);
    return null;
  }

  const { gender, type, key: categoryKey } = info;

  // States for country & size
  const [selectedCountry, setSelectedCountry] = useState(Sizes[0].country);
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstCountry = Sizes[0];
    const ct = firstCountry.clothTypes.find((c) => c.type === clothType);
    return ct?.size[0]?.name || "";
  });

  // Get current size data
  const currentSizes = useMemo(() => {
    const countryObj = Sizes.find((c) => c.country === selectedCountry);
    const ct = countryObj?.clothTypes.find((c) => c.type === clothType);
    return ct?.size || [];
  }, [selectedCountry, clothType]);

  // Get current size data
  const currentMeasurements = useMemo(() => {
    const countryObj = Sizes.find((c) => c.country === selectedCountry);
    const ct = countryObj?.clothTypes.find((c) => c.type === clothType);
    const sizeEntry = ct?.size.find((s) => s.name === selectedSize);
    return sizeEntry?.measurement || [];
  }, [selectedCountry, selectedSize, clothType]);

  const filteredMeasurements = useMemo(() => {
    return currentMeasurements.filter(({ label }) => {
      if (type === "pants" || type === "skirts") {
        return label === "WAIST" || label === "HIPS";
      }
      return true;
    });
  }, [currentMeasurements, type]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    const countryObj = Sizes.find((c) => c.country === newCountry);
    const ct = countryObj?.clothTypes.find((c) => c.type === clothType);
    setSelectedSize(ct?.size[0]?.name || "");
  };

  return (
    <div
      className={`fixed w-full  bg-black/80 z-[99]   h-full left-0 right-0 ${
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
                  onChange={handleCountryChange}
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
                  {currentSizes.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
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
              <div className="mt-10 w-full min-h-24 border rounded-md border-black/10">
                <div className="w-full py-4 bg-[#f2f2f2] border-b border-black/10 px-4">
                  <p className="font-avenir font-[500] text-sm md:text-md text-black/50">
                    Measurement
                  </p>
                </div>
                <div
                  className={`grid max-sm:grid-cols-1  items-stretch ${
                    filteredMeasurements.length === 2
                      ? "grid-cols-2"
                      : filteredMeasurements.length === 3
                      ? "grid-cols-3"
                      : filteredMeasurements.length === 4
                      ? "grid-cols-4"
                      : "grid-cols-5"
                  }`}
                >
                  {filteredMeasurements.map((item) => (
                    <div
                      key={item.label}
                      className="py-2 md:py-4 flex flex-col justify-between h-full"
                    >
                      <p className="font-avenir font-[400] text-sm text-black/50 px-4">
                        {item.label}
                      </p>
                      <div className="w-full h-[1px] bg-black/10 my-2 md:my-3" />
                      <p className="mt-6 px-4 font-avenir text-sm">
                        {`${item.valueCm} cm - ${item.valueIn} inc`}
                      </p>
                      {item.label !== "HIPS" && (
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
                    src={guideImages[categoryKey] || guideImages.men_tops}
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
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure straight across from the tip of
                          one shoulder to the other, just above your shoulder
                          blades
                        </p>
                      </div>
                      <div className="mt-10">
                        <p className="font-avenir font-[500] text-lg">
                          2. Chest
                        </p>
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
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
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
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
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
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
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
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
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure across your hipbone, around the
                          fullest point of your hips.
                        </p>
                      </div>
                    </>
                  )}
                  {gender === "women" &&
                    (type === "skirts" || type === "pants") && (
                      <>
                        <div>
                          <p className="font-avenir font-[500] text-lg">
                            1. Bust
                          </p>
                          <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                            Wearing a bra, pass the tape measure straight across
                            your back, under your arms and over the fullest
                            point of your bust.
                          </p>
                        </div>
                        <div>
                          <p className="font-avenir font-[500] text-lg">
                            2. Waist
                          </p>
                          <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                            Pass the tape measure around your natural waistline,
                            at the narrowest point of your waist. The tape
                            measure should sit snugly against your body, but
                            should not be pulled too tight.
                          </p>
                        </div>
                        <div>
                          <p className="font-avenir font-[500] text-lg">
                            3. Hips
                          </p>
                          <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                            Pass the tape measure around your natural waistline,
                            at the narrowest point of your waist. The tape
                            measure should sit snugly against your body, but
                            should not be pulled too tight.
                          </p>
                        </div>
                        <div>
                          <p className="font-avenir font-[500] text-lg">
                            3. Dress Length
                          </p>
                          <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                            Standing up straight, barefoot and with both feet
                            together, measure from the middle of the most
                            prominent bone at the base of your nape downwards,
                            as far as the length indicated in the product
                            details.
                          </p>
                        </div>
                      </>
                    )}
                  {gender === "women" && type === "tops" && (
                    <>
                      <div>
                        <p className="font-avenir font-[500] text-lg">
                          1. Bust
                        </p>
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                          Wearing a bra, pass the tape measure straight across
                          your back, under your arms and over the fullest point
                          of your bust.
                        </p>
                      </div>
                      <div>
                        <p className="font-avenir font-[500] text-lg">
                          2. Waist
                        </p>
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure around your natural waistline, at the narrowest point of your
                          waist. The tape measure should sit snugly against your
                          body, but should not be pulled too tight. 
                        </p>
                      </div>
                      <div>
                        <p className="font-avenir font-[500] text-lg">
                          3. Hips
                        </p>
                        <p className="my-3 text-sm md:text-md font-avenir font-[500] text-black/70">
                          Pass the tape measure across your hipbone, around the
                          fullest point of your hips
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

// 1. Bust
// Wearing a bra, pass the tape measure straight across your back, under your arms and over the fullest point of your bust.

// 2. Waist
// Pass the tape measure around your natural waistline, at the narrowest point of your waist. The tape measure should sit snugly against your body, but should not be pulled too tight.

// 3. Hips
// Pass the tape measure across your hipbone, around the fullest point of your hips.

// 4. Dress Length
// Standing up straight, barefoot and with both feet together, measure from the middle of the most prominent bone at the base of your nape downwards, as far as the length indicated in the product details.

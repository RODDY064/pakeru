"use client";

"use client";

import React, { useMemo, useState } from "react";
import Icon from "./Icon";
import { useBoundStore } from "@/store/store";
import { AnimatePresence, motion, cubicBezier } from "motion/react";
import Image from "next/image";
import { MEASUREMENT_CONFIG, MeasurementGroupName, Sizes } from "@/libs/sizeguilde";

const guideImages: Record<string, string> = {
  men_shirts: "/sizes/men-shirts.jpg",
  men_tops: "/sizes/men-tshirts.jpeg",
  men_others:"/sizes/men-others.jpg",
  men_pants:"/sizes/men-pants.jpg",
  women_tops: "/sizes/woman-tops.jpg",
  women_pants: "/sizes/woman-skirts.jpg",
  women_skirts: "/sizes/woman-skirts.jpg",
  unisex_tops: "/sizes/men-shirts.jpg",
  unisex_pants: "/sizes/men-pants.jpg",
};


const getMeasurementCategory = (groupName: MeasurementGroupName) => {
  const entry = Object.values(MEASUREMENT_CONFIG).find(
    config => config.group === groupName
  );
  
  return entry?.category ?? { key: "unisex_tops", gender: "unisex", type: "tops" };
};

export default function SizeGuild({
  groupName,
}: {
  groupName: MeasurementGroupName;
}) {
  const { sizeGuild, setSizeGuild } = useBoundStore();

  console.log(groupName, 'type')

  const { key, gender, type } = getMeasurementCategory(groupName);
   const imageSrc = guideImages[key];



  console.log(imageSrc,'img')

  const [selectedCountry, setSelectedCountry] = useState(Sizes[0].country);
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstCountry = Sizes[0];
    const group = firstCountry.measureGroups.find((g) => g.group === groupName);
    return group?.size[0]?.name || "";
  });

  const currentSizes = useMemo(() => {
    const countryObj = Sizes.find((c) => c.country === selectedCountry);
    const group = countryObj?.measureGroups.find((g) => g.group === groupName);
    return group?.size || [];
  }, [selectedCountry, groupName]);

  const currentMeasurements = useMemo(() => {
    const countryObj = Sizes.find((c) => c.country === selectedCountry);
    const group = countryObj?.measureGroups.find((g) => g.group === groupName);
    const sizeEntry = group?.size.find((s) => s.name === selectedSize);
    return sizeEntry?.measurement || [];
  }, [selectedCountry, selectedSize, groupName]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);

    const countryObj = Sizes.find((c) => c.country === newCountry);
    const group = countryObj?.measureGroups.find((g) => g.group === groupName);

    setSelectedSize(group?.size?.[0]?.name || "");
  };

  return (
    <div
      className={`fixed w-full bg-black/80 z-[99] h-full left-0 right-0 ${
        sizeGuild
          ? "pointer-events-auto bg-black/80"
          : "pointer-events-none bg-transparent"
      }`}
    >
      <AnimatePresence>
        <div className="flex h-full justify-end">
          <motion.div
            variants={container}
            animate={sizeGuild ? "open" : "close"}
            initial="close"
            exit="close"
            key="desktop"
            className="w-full lg:w-[50%] xl:w-[45%] h-full bg-white pt-12"
          >
            <div className="flex pb-8 items-center justify-between px-10 md:px-12 border-b border-black/20">
              <div className="relative">
                <p className="font-avenir text-md">SIZE GUIDE</p>
              </div>
              <div>
                <Icon name="close" onToggle={setSizeGuild} />
              </div>
            </div>
            
            <div className="py-12 px-6 md:px-16 overflow-scroll h-full">
              {/* Country Selector */}
              <div className="relative flex items-center">
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

              {/* Size Selector */}
              <div className="relative flex items-center mt-6">
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

              {/* Measurements Table */}
              <div className="mt-10 w-full min-h-24 border rounded-md border-black/10">
                <div className="w-full py-4 bg-[#f2f2f2] border-b border-black/10 px-4">
                  <p className="font-avenir font-[500] text-sm md:text-md text-black/50">
                    Measurement
                  </p>
                </div>
                <div
                  className={`grid max-sm:grid-cols-1 items-stretch ${
                    currentMeasurements.length === 2
                      ? "grid-cols-2"
                      : currentMeasurements.length === 3
                      ? "grid-cols-3"
                      : currentMeasurements.length === 4
                      ? "grid-cols-4"
                      : "grid-cols-5"
                  }`}
                >
                  {currentMeasurements.map((item) => (
                    <div
                      key={item.label}
                      className="py-2 md:py-4 flex flex-col justify-between h-full"
                    >
                      <p className="font-avenir font-[400] text-sm text-black/50 px-4">
                        {item.label}
                      </p>
                      <div className="w-full h-[1px] bg-black/10 my-2 md:my-3" />
                      <p className="mt-6 px-4 font-avenir text-sm">
                        {`${item.valueCm} cm - ${item.valueIn}"`}
                      </p>
                      {item.label !== "HIPS" && (
                        <div className="w-full h-[1px] bg-black/10 my-2 md:hidden" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Measure Section */}
              <div className="mt-10">
                <p className="font-avenir font-[500] text-md text-black/70">
                  HOW TO MEASURE
                </p>
                <p className="mt-6 font-avenir font-[500] text-black/60">
                  In order to select the correct clothing size, we recommend you
                  take the following measurements using a soft tape measure. If
                  necessary, ask someone else to help.
                </p>
                {imageSrc && (
                  <div className="flex items-center justify-center w-full mt-4">
                    <Image
                      src={imageSrc}
                      width={500}
                      height={200}
                      alt={`${groupName} size guide`}
                      className="object-contain"
                    />
                  </div>
                )}
                <MeasurementInstructions gender={gender} type={type} />
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}

const MeasurementInstructions = ({
  gender,
  type,
}: {
  gender: string;
  type: string;
}) => {
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div>
      <p className="font-avenir font-[500] text-base">{title}</p>
      <p className="mt-2 text-sm md:text-base font-avenir font-[400] text-black/70 leading-relaxed">
        {children}
      </p>
    </div>
  );

  const menTops = (
    <>
      <Section title="1. Shoulder width">
        Pass the tape measure straight across from the tip of one shoulder to
        the other, just above your shoulder blades.
      </Section>
      <Section title="2. Chest">
        Pass the tape measure across your back, under your arms and over your
        breastbone at its widest point, taking care to keep the tape measure
        horizontal. It should sit snugly against your body, but should not be
        pulled too tight.
      </Section>
      <Section title="3. Waist">
        Pass the tape measure around your natural waistline, at the narrowest
        point of your waist. The tape measure should sit snugly against your
        body, but should not be pulled too tight.
      </Section>
      <Section title="4. Sleeve Length">
        Keeping your arm straight by your side, measure from the tip of your
        shoulder to the base of your thumb.
      </Section>
    </>
  );

  const menOthers = (
    <>
      <Section title="1. Shoulder width">
        Pass the tape measure straight across from the tip of one shoulder to
        the other, just above your shoulder blades.
      </Section>
      <Section title="2. Chest">
        Pass the tape measure across your back, under your arms and over your
        breastbone at its widest point, taking care to keep the tape measure
        horizontal.
      </Section>
      <Section title="3. Waist">
        Pass the tape measure around your natural waistline, at the narrowest
        point of your waist.
      </Section>
      <Section title="4. Hips">
        Pass the tape measure across your hipbone, around the fullest point of
        your hips.
      </Section>
      <Section title="5. Sleeve Length">
        Keeping your arm straight by your side, measure from the tip of your
        shoulder to the base of your thumb.
      </Section>
    </>
  );

  const menPants = (
    <>
      <Section title="1. Waist">
        Pass the tape measure around your natural waistline, at the narrowest
        point of your waist. The tape measure should sit snugly against your
        body, but should not be pulled too tight.
      </Section>
      <Section title="2. Hips">
        Pass the tape measure across your hipbone, around the fullest point of
        your hips.
      </Section>
    </>
  );

  const womenCommon = (
    <>
      <Section title="1. Bust">
        Wearing a bra, pass the tape measure straight across your back, under
        your arms and over the fullest point of your bust.
      </Section>
      <Section title="2. Waist">
        Pass the tape measure around your natural waistline, at the narrowest
        point of your waist. The tape measure should sit snugly against your
        body, but should not be pulled too tight.
      </Section>
      <Section title="3. Hips">
        Pass the tape measure across your hipbone, around the fullest point of
        your hips.
      </Section>
    </>
  );

  const womenSkirtsExtra = (
    <Section title="4. Skirt Length">
     Standing up straight, barefoot and with both feet together, measure from the back of your natural waistline downwards,
      as far as the length indicated in the product details.
    </Section>
  );

  // Select based on gender/type
  const getContent = () => {
    if (gender === "men" && type === "tops") return menTops;
    if (gender === "men" && type === "others") return menOthers;
    if (gender === "men" && type === "pants") return menPants;
    if (gender === "women" && type === "tops") return womenCommon;
    if (gender === "women" && type === "pants") return womenCommon;
    if (gender === "women" && type === "skirts")
      return (
        <>
          {womenCommon}
          {womenSkirtsExtra}
        </>
      );
    return null;
  };

  return <div className="mt-6 mb-20 space-y-8">{getContent()}</div>;
};




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


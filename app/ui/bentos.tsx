"use client";
import { useGSAP } from "@gsap/react";
import React, { useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import Image from "next/image";
import SVGMorph from "./svgMorph";
import { useBoundStore } from "@/store/store";
gsap.registerPlugin(ScrollTrigger);

export default function Bentos() {
  const [splits, setSplits] = useState<boolean>(true);
  const { galleries } = useBoundStore();

  return (
    <div className="w-full my-24 text-black flex flex-col items-center bg-[#f2f2f2] overflow-hidden">
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 py-24 px-4 gap-1 xl:gap-1 w-full splitParentTrigger">
        <div className="flex flex-col gap-2">
          <div className="w-full flex-nowrap flex-none h-[400px] xl:h-[550px]  items-center justify-center">
            <SVGMorph
              render={[
                <div className="text-black w-full h-full  relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src={galleries[0]?.image?.url as string ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[0]?.title}
                    className="object-cover "
                  />
                </div>,
              ]}
              rounded={64}
              items={1}
              className="px-2 absolute"
              name={galleries[0]?.title}
            />
          </div>
          <div className="w-full  h-[200px] xl:h-[270px]   items-center justify-center">
            <SVGMorph
              rounded={46}
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src={(galleries[1]?.image?.url as string) ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[1]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src={(galleries[2]?.image?.url as string) ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[2]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
              ]}
              split={splits}
              items={2}
              className="w-full h-full mt-2"
              gap={16}
              name={[galleries[1]?.title, galleries[2]?.title]}
            />
          </div>
          <div className="w-full  h-[200px] xl:h-[300px]   items-center justify-center">
            <SVGMorph
              rounded={46}
              split={true}
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src={(galleries[3]?.image?.url as string) ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[3]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
              ]}
              items={1}
              reverse={true}
              className="w-full h-full mt-3"
              gap={16}
              name={galleries[3]?.title}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 xl:gap-3 md:hidden lg:flex  max-sm:mt-3">
          <div className="flex gap-2 xl:gap-3 w-full">
            <div className="w-full  h-[200px] xl:h-[270px] flex items-center justify-center">
              <SVGMorph
                rounded={46}
                split={splits}
                reverse={false}
                render={[
                  <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                    <Image
                      src={(galleries[4]?.image?.url as string) ?? "/images/image-fallback.png"}
                      fill
                      alt={galleries[4]?.title}
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>,
                  <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                    <Image
                      src={(galleries[5]?.image?.url as string) ?? "/images/image-fallback.png"}
                      fill
                      alt={galleries[5]?.title}
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>,
                ]}
                items={2}
                className="w-full h-full "
                gap={16}
                 name={[galleries[4]?.title, galleries[5]?.title]}
              />
            </div>
          </div>
          <div className="w-full flex-nowrap flex-none h-[600px] xl:h-[860px]   flex items-center justify-center">
            <SVGMorph
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src={(galleries[6]?.image?.url as string) ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[6]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
              ]}
              rounded={64}
              items={1}
              split={splits}
              direction="column"
              className="px-0 mx-3"
              name={galleries[6]?.title}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-full flex-nowrap flex-none h-[400px] xl:h-[550px]  items-center justify-center">
            <SVGMorph
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src={(galleries[7]?.image?.url as string) ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[7]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
              ]}
              rounded={64}
              items={1}
              className="px-2"
               name={galleries[7]?.title}
            />
          </div>
          <div className="w-full  h-[200px] xl:h-[270px]   items-center justify-center">
            <SVGMorph
              rounded={46}
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                     src={(galleries[8]?.image?.url as string) ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[8]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src={(galleries[9]?.image?.url as string) ?? "/images/image-fallback.png"}
                      fill
                      alt={galleries[9]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
              ]}
              items={2}
              split={splits}
              className="w-full h-full mt-2"
              gap={16}
              name={[galleries[8]?.title, galleries[9]?.title]}
            />
          </div>
          <div className="w-full  h-[200px] xl:h-[300px]   items-center justify-center">
            <SVGMorph
              rounded={46}
              split={splits}
              items={1}
              reverse={true}
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                     src={(galleries[10]?.image?.url as string) ?? "/images/image-fallback.png"}
                    fill
                    alt={galleries[10]?.title}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>,
              ]}
              className="w-full h-full mt-3"
              gap={16}
              name={galleries[10]?.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

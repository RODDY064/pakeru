"use client";
import { useGSAP } from "@gsap/react";
import React, { useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import Image from "next/image";
import SVGMorph from "./svgMorph";
gsap.registerPlugin(ScrollTrigger);

export default function Bentos() {
  const [splits, setSplits] = useState<boolean>(true);

  return (
    <div className="w-full my-24 text-black flex flex-col items-center bg-[#f2f2f2] overflow-hidden">
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 py-24 px-4 gap-1 xl:gap-1 w-full splitParentTrigger">
        <div className="flex flex-col gap-2">
          <div className="w-full flex-nowrap flex-none h-[400px] xl:h-[550px]  items-center justify-center">
            <SVGMorph
              render={[
                <div className="text-black w-full h-full  relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento 2.webp"
                    fill
                    alt="image"
                    className="object-cover "
                  />
                </div>,
              ]}
              rounded={64}
              items={1}
              className="px-2 absolute bot"
            />
          </div>
          <div className="w-full  h-[200px] xl:h-[270px]   items-center justify-center">
            <SVGMorph
              rounded={46}
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento 7.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>,
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento 5.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>,
              ]}
              split={splits}
              items={2}
              className="w-full h-full mt-2"
              gap={16}
            />
          </div>
          <div className="w-full  h-[200px] xl:h-[300px]   items-center justify-center">
            <SVGMorph
              rounded={46}
              split={true}
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento 10.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>,
              ]}
              items={1}
              reverse={true}
              className="w-full h-full mt-3"
              gap={16}
              name="Aegis"
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
                      src="/bentos/bento 8.webp"
                      fill
                      alt="image"
                      className="object-cover"
                    />
                  </div>,
                  <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                    <Image
                      src="/bentos/bento 9.webp"
                      fill
                      alt="image"
                      className="object-cover"
                    />
                  </div>,
                ]}
                items={2}
                className="w-full h-full "
                gap={16}
              />
            </div>
          </div>
          <div className="w-full flex-nowrap flex-none h-[600px] xl:h-[860px]   flex items-center justify-center">
            <SVGMorph
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>
              ]}
              rounded={64}
              items={1}
              split={splits}
              direction="column"
              className="px-0 mx-3"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-full flex-nowrap flex-none h-[400px] xl:h-[550px]  items-center justify-center">
            <SVGMorph
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento 4.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>,
              ]}
              rounded={64}
              items={1}
              className="px-2 "
              name="Vierra Crop"
            />
          </div>
          <div className="w-full  h-[200px] xl:h-[270px]   items-center justify-center">
            <SVGMorph
              rounded={46}
              render={[
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento 8.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>,
                <div className="text-black w-full h-full relative overflow-hidden rounded-[64px] p-6">
                  <Image
                    src="/bentos/bento 11.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>,
              ]}
              items={2}
              split={splits}
              className="w-full h-full mt-2"
              gap={16}
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
                    src="/bentos/bento 12.webp"
                    fill
                    alt="image"
                    className="object-cover"
                  />
                </div>,
              ]}
              className="w-full h-full mt-3"
              gap={16}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

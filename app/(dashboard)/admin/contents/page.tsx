"use client";

import EditContent from "@/app/ui/dashboard/editContent";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect } from "react";

export default function Contents() {
  const { toggleContentModal, galleries, hero } = useBoundStore();

  return (
    <>
      <div className="min-h-dvh sm:px-4 xl:px-8   xl:ml-[20%] pb-24 sm:pb-10 pt-20   md:pt-26">
        <div className="w-full h-full flex flex-col items-center  xl:block">
          <div className="w-[94%] md:w-[90%] xl:w-[90%]">
            <p className="font-avenir font-medium text-md ">HERO IMAGE</p>
            {hero?._id ? (
              <>
                <div
                  onClick={() => toggleContentModal(true, "hero", hero._id)}
                  className="w-full h-[400px] sm:h-[500px] md:h-[700px] bg-black/5 mt-4 border border-dashed border-black/30 flex items-center justify-center rounded-[36px] cursor-pointer relative overflow-hidden"
                >
                  <Image
                    src={hero.hero[0].image.url as string}
                    fill
                    className="object-cover"
                    alt={hero.title + " " + "hero"}
                  />
                  <div className="absolute bottom-4 right-4 size-12 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer ">
                    <div className="relative flex items-center justify-center">
                      <div className="w-[20px] h-[1px] bg-white"></div>
                      <div className="w-[1px] h-[20px] bg-white absolute"></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  onClick={() => toggleContentModal(true, "hero")}
                  className="w-full h-[400px] sm:h-[500px] md:h-[700px] bg-black/5 mt-4 border border-dashed border-black/30 flex items-center justify-center rounded-[36px] cursor-pointer relative overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-16 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                      <Image
                        src="/icons/plus-w.svg"
                        width={30}
                        height={30}
                        alt="Add"
                        className="invert opacity-60"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 size-12 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer ">
                    <div className="relative flex items-center justify-center">
                      <div className="w-[20px] h-[1px] bg-white"></div>
                      <div className="w-[1px] h-[20px] bg-white absolute"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="w-[94%] md:w-[90%] xl:w-[90%] my-10">
            <p className="font-avenir font-medium text-md ">GALLERY</p>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 mt-4 gap-3  w-full">
              <div className="flex flex-col gap-3">
                {/* Gallery 1 */}
                <div
                  onClick={() =>
                    toggleContentModal(true, "gallery", galleries[0]._id)
                  }
                  className="w-full flex-nowrap cursor-pointer flex-none h-[350px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px] overflow-hidden"
                >
                  {galleries[0]?.image.url ? (
                    <>
                      <Image
                        src={galleries[0]?.image?.url as string}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        alt={galleries[0]?.title}
                      />
                      <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <div className="w-[16px] h-[1px] bg-white"></div>
                          <div className="w-[1px] h-[16px] bg-white absolute"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-4">
                        <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                          <Image
                            src="/icons/plus-w.svg"
                            width={30}
                            height={30}
                            alt="Add"
                            className="invert opacity-60"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <div className="w-[16px] h-[1px] bg-white"></div>
                          <div className="w-[1px] h-[16px] bg-white absolute"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Gallery 2 */}
                <div
                  onClick={() =>
                    toggleContentModal(true, "gallery", galleries[1]._id)
                  }
                  className="w-full  h-[150px]  justify-center flex items-center gap-2"
                >
                  <div className="w-full h-full  overflow-hidden  bg-black/5 flex items-center cursor-pointer justify-center  border border-dashed border-black/30 rounded-[26px] relative">
                    {galleries[1]?.image.url ? (
                      <>
                        <Image
                          src={galleries[1]?.image?.url as string}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[1]?.title}
                        />
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-4">
                          <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                            <Image
                              src="/icons/plus-w.svg"
                              width={30}
                              height={30}
                              alt="Add"
                              className="invert opacity-60"
                            />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Gallery 3 */}
                  <div
                    onClick={() =>
                      toggleContentModal(true, "gallery", galleries[2]._id)
                    }
                    className="w-full h-full overflow-hidden cursor-pointer items-center justify-center  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] relative"
                  >
                    {galleries[2]?.image.url ? (
                      <>
                        <Image
                          src={galleries[2]?.image?.url as string}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[2]?.title}
                        />
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-4">
                          <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                            <Image
                              src="/icons/plus-w.svg"
                              width={30}
                              height={30}
                              alt="Add"
                              className="invert opacity-60"
                            />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Gallery 4 */}

                <div className="w-full  h-[200px] overflow-hidden relative flex items-center cursor-pointer justify-center     bg-black/5 border border-dashed border-black/30 rounded-[32px]">
                  {galleries[3]?.image.url ? (
                    <>
                      <Image
                        src={galleries[3]?.image?.url as string}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        alt={galleries[3]?.title}
                      />
                      <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <div className="w-[16px] h-[1px] bg-white"></div>
                          <div className="w-[1px] h-[16px] bg-white absolute"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-4">
                        <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                          <Image
                            src="/icons/plus-w.svg"
                            width={30}
                            height={30}
                            alt="Add"
                            className="invert opacity-60"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <div className="w-[16px] h-[1px] bg-white"></div>
                          <div className="w-[1px] h-[16px] bg-white absolute"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-full  h-[150px]  justify-center flex items-center gap-2">
                  {/* Gallery 4 */}
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] overflow-hidden relative cursor-pointer items-center justify-center">
                    {galleries[4]?.image.url ? (
                      <>
                        <Image
                          src={galleries[4]?.image?.url as string}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[4]?.title}
                        />
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-4">
                          <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                            <Image
                              src="/icons/plus-w.svg"
                              width={30}
                              height={30}
                              alt="Add"
                              className="invert opacity-60"
                            />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Gallery 5 */}
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] overflow-hidden relative cursor-pointer items-center justify-center">
                    {galleries[5]?.image.url ? (
                      <>
                        <Image
                          src={galleries[5]?.image?.url as string}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[5]?.title}
                        />
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-4">
                          <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                            <Image
                              src="/icons/plus-w.svg"
                              width={30}
                              height={30}
                              alt="Add"
                              className="invert opacity-60"
                            />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className="w-full flex-nowrap flex-none h-[560px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center 
              rounded-[36px] overflow-hidden cursor-pointer relative">
                {galleries[5]?.image.url ? (
                      <>
                        <Image
                          src={galleries[6]?.image?.url as string}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[6]?.title}
                        />
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-4">
                          <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                            <Image
                              src="/icons/plus-w.svg"
                              width={30}
                              height={30}
                              alt="Add"
                              className="invert opacity-60"
                            />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 size-3 z-50  md:size-10 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <div className="w-[16px] h-[1px] bg-white"></div>
                            <div className="w-[1px] h-[16px] bg-white absolute"></div>
                          </div>
                        </div>
                      </>
                    )}

              </div>
              </div>
              <div className="flex flex-col gap-3">
                <div
                  className="w-full flex-nowrap flex-none h-[350px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center 
              rounded-[36px]"
                ></div>
                <div className="w-full  h-[150px]  justify-center flex items-center gap-2">
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px]"></div>
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px]"></div>
                </div>
                <div className="w-full  h-[200px]   items-center justify-center bg-black/5 flex border border-dashed border-black/30 rounded-[32px]"></div>
              </div>
            </div>
          </div>
          {/* <div className="w-[94%] md:w-[90%] xl:w-[90%] my-10">
            <p className="font-avenir font-medium text-md ">SLIDDER</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {sliders.map((slider) => (
                <div key={slider._id} 
                onClick={()=>toggleContentModal(true,'slider',slider._id)}
                className="w-full flex-nowrap flex-none h-[350px] bg-black/5 flex cursor-pointer border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
                      <Image
                        src="/icons/plus-w.svg"
                        width={30}
                        height={30}
                        alt="Add"
                        className="invert opacity-60"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 size-8 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                    hello
                  </div>
                </div>
              ))}
         
            </div>
          </div> */}
        </div>
      </div>
      <EditContent />
    </>
  );
}

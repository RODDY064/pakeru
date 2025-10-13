"use client";

import EditContent from "@/app/ui/dashboard/editContent";
import { fetchContent } from "@/libs/data-fetcher";
import { initializeStore, useBoundStore } from "@/store/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function Contents() {
  const { toggleContentModal, galleries, hero } = useBoundStore();
  const [shouldRefresh, setShouldRefresh] = useState(false);
  
  useEffect(() => {
    if (shouldRefresh) {
      const fetchData = async () => {
        const content = await fetchContent()
        initializeStore(undefined, undefined, 0,content)
      };
      fetchData();
    }
  }, [shouldRefresh]);

  


  

  return (
    <>
      <div className="min-h-dvh sm:px-4 xl:px-8   xl:ml-[20%] pb-24 sm:pb-10 pt-4">
        <div className="w-full h-full flex flex-col items-center  xl:block">
          {shouldRefresh && (
            <div className="w-full flex items-center  my-4  gap-2 ">
              <div className=" p-3  bg-yellow-100 border border-yellow-800/20 rounded-xl text-yellow-800 text-sm">
                Content updated. Refreshing the page to see changes.
              </div>
              {/* <div className="py-2 h-12 px-6 bg-red-50 border flex items-center border-red-500  cursor-pointer rounded-xl">
                <p className="text-red-600">Refresh</p>
              </div> */}
            </div>
          )}
          <div className="w-[94%] md:w-[90%] xl:w-[90%]">
            <p className="font-avenir font-medium text-md ">HERO IMAGE</p>
            {hero?._id ? (
              <>
                <div
                  onClick={() => toggleContentModal(true, "hero", hero._id)}
                  className="w-full h-[400px] sm:h-[500px] md:h-[700px] bg-black/5 mt-4 border border-dashed border-black/30 flex items-center justify-center rounded-[36px] cursor-pointer relative overflow-hidden"
                >
                  <Image
                    src={
                      (hero.hero[0].image.url as string) ??
                      "/images/image-fallback.png"
                    }
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
                    toggleContentModal(true, "gallery", galleries[0]?._id)
                  }
                  className="w-full flex-nowrap cursor-pointer flex-none h-[350px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px] overflow-hidden"
                >
                  {galleries[0]?.image.url ? (
                    <>
                      <Image
                        src={
                          (galleries[0]?.image?.url as string) ??
                          "/images/image-fallback.png"
                        }
                        fill
                        sizes="100vw"
                        className="object-cover"
                        alt={galleries[0]?.name}
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

                <div className="w-full  h-[150px]  justify-center flex items-center gap-2">
                  {/* Gallery 2 */}
                  <div
                    onClick={() =>
                      toggleContentModal(true, "gallery", galleries[1]?._id)
                    }
                    className="w-full h-full  overflow-hidden  bg-black/5 flex items-center cursor-pointer justify-center  border border-dashed border-black/30 rounded-[26px] relative"
                  >
                    {galleries[1]?.image.url ? (
                      <>
                        <Image
                          src={
                            (galleries[1]?.image?.url as string) ??
                            "/images/image-fallback.png"
                          }
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[1]?.name}
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
                      toggleContentModal(true, "gallery", galleries[2]?._id)
                    }
                    className="w-full h-full overflow-hidden cursor-pointer items-center justify-center  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] relative"
                  >
                    {galleries[2]?.image.url ? (
                      <>
                        <Image
                          src={
                            (galleries[2]?.image?.url as string) ??
                            "/images/image-fallback.png"
                          }
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[2]?.name}
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

                <div
                  onClick={() =>
                    toggleContentModal(true, "gallery", galleries[3]?._id)
                  }
                  className="w-full  h-[200px] overflow-hidden relative flex items-center cursor-pointer justify-center     bg-black/5 border border-dashed border-black/30 rounded-[32px]"
                >
                  {galleries[3]?.image.url ? (
                    <>
                      <Image
                        src={
                          (galleries[3]?.image?.url as string) ??
                          "/images/image-fallback.png"
                        }
                        fill
                        sizes="100vw"
                        className="object-cover"
                        alt={galleries[3]?.name}
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
                  <div
                    onClick={() =>
                      toggleContentModal(true, "gallery", galleries[4]?._id)
                    }
                    className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] overflow-hidden relative cursor-pointer items-center justify-center"
                  >
                    {galleries[4]?.image.url ? (
                      <>
                        <Image
                          src={
                            (galleries[4]?.image?.url as string) ??
                            "/images/image-fallback.png"
                          }
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[4]?.name}
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
                  <div
                    onClick={() =>
                      toggleContentModal(true, "gallery", galleries[5]?._id)
                    }
                    className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] overflow-hidden relative cursor-pointer items-center justify-center"
                  >
                    {galleries[5]?.image.url ? (
                      <>
                        <Image
                          src={
                            (galleries[5]?.image?.url as string) ??
                            "/images/image-fallback.png"
                          }
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[5]?.name}
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
                  onClick={() =>
                    toggleContentModal(true, "gallery", galleries[6]?._id)
                  }
                  className="w-full flex-nowrap flex-none h-[560px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center 
              rounded-[36px] overflow-hidden cursor-pointer relative"
                >
                  {galleries[6]?.image.url ? (
                    <>
                      <Image
                        src={
                          (galleries[6]?.image?.url as string) ??
                          "/images/image-fallback.png"
                        }
                        fill
                        sizes="100vw"
                        className="object-cover"
                        alt={galleries[6]?.name}
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
                  onClick={() =>
                    toggleContentModal(true, "gallery", galleries[7]?._id)
                  }
                  className="w-full flex-nowrap flex-none h-[350px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center 
              rounded-[36px] overflow-hidden relative cursor-pointer"
                >
                  {galleries[7]?.image.url ? (
                    <>
                      <Image
                        src={
                          (galleries[7]?.image?.url as string) ??
                          "/images/image-fallback.png"
                        }
                        fill
                        sizes="100vw"
                        className="object-cover"
                        alt={galleries[7]?.name}
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
                <div className="w-full  h-[150px]  justify-center flex items-center gap-2">
                  <div
                    onClick={() =>
                      toggleContentModal(true, "gallery", galleries[8]?._id)
                    }
                    className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] relative overflow-hidden cursor-pointer"
                  >
                    {galleries[8]?.image.url ? (
                      <>
                        <Image
                          src={
                            (galleries[8]?.image?.url as string) ??
                            "/images/image-fallback.png"
                          }
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[8]?.name}
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
                        <div className="relative w-full h-full justify-center flex flex-col items-center gap-4">
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
                  <div
                    onClick={() =>
                      toggleContentModal(true, "gallery", galleries[9]?._id)
                    }
                    className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px] relative overflow-hidden cursor-pointer"
                  >
                    {galleries[9]?.image.url ? (
                      <>
                        <Image
                          src={
                            (galleries[9]?.image?.url as string) ??
                            "/images/image-fallback.png"
                          }
                          fill
                          sizes="100vw"
                          className="object-cover"
                          alt={galleries[9]?.name}
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
                        <div className="relative w-full h-full flex flex-col justify-center items-center gap-4">
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
                  onClick={() =>
                    toggleContentModal(true, "gallery", galleries[10]?._id)
                  }
                  className="w-full  h-[200px] cursor-pointer relative overflow-hidden  items-center justify-center bg-black/5 flex border border-dashed border-black/30 rounded-[32px]">
                  {galleries[10]?.image.url ? (
                    <>
                      <Image
                        src={
                          (galleries[10]?.image?.url as string) ??
                          "/images/image-fallback.png"
                        }
                        fill
                        sizes="100vw"
                        className="object-cover"
                        alt={galleries[10]?.name}
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
                      <div className=" flex flex-col items-center gap-4">
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
            </div>
          </div>
        </div>
      </div>
      <EditContent setShouldRefresh={setShouldRefresh} />
    </>
  );
}

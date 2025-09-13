import Image from "next/image";
import React from "react";
import Hero from "../../../public/images/12.png";

export default function Contents() {
  return (
    <>
      <div className="min-h-dvh sm:px-4 xl:px-8   xl:ml-[20%] pb-24 sm:pb-10 pt-20   md:pt-26">
        <div className="w-full h-full flex flex-col items-center  xl:block">
          <div className="w-[94%] md:w-[90%] xl:w-[90%]">
            <p className="font-avenir font-medium text-md ">HERO IMAGE</p>
            <div className="w-full h-[400px] sm:h-[500px] md:h-[700px] bg-black/5 mt-4 border border-dashed border-black/30 flex items-center justify-center rounded-[36px] cursor-pointer relative overflow-hidden">
              <Image
                src={Hero}
                fill
                className="object-cover"
                alt="hero image"
              />
              {/* <div className="flex flex-col items-center gap-4">
             <div className="size-16 rounded-full border border-dashed border-black/30 bg-black/10 flex items-center justify-center ">
              <Image
                src="/icons/plus-w.svg"
                width={30}
                height={30}
                alt="Add"
                className="invert opacity-60"
              />        
            </div>
           </div> */}
              <div className="absolute bottom-4 right-4 size-12 z-50  md:size-16 bg-black rounded-full text-white flex items-center justify-center cursor-pointer">
                hello
              </div>
            </div>
          </div>
          <div className="w-[94%] md:w-[90%] xl:w-[90%] my-10">
            <p className="font-avenir font-medium text-md ">GALLERY</p>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 mt-4 gap-3  w-full">
              <div className="flex flex-col gap-3">
                <div className="w-full flex-nowrap flex-none h-[350px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
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
                <div className="w-full  h-[150px]  justify-center flex items-center gap-2">
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px]"></div>
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px]"></div>
                </div>
                <div className="w-full  h-[200px]   items-center justify-center bg-black/5 flex border border-dashed border-black/30 rounded-[32px]"></div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-full  h-[150px]  justify-center flex items-center gap-2">
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px]"></div>
                  <div className="w-full h-full  bg-black/5 flex border border-dashed border-black/30 rounded-[26px]"></div>
                </div>
                <div
                  className="w-full flex-nowrap flex-none h-[560px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center 
              rounded-[36px]"
                ></div>
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
        </div>
      </div>
      <EditContent />
    </>
  );
}

const EditContent = () => {
  return (
    <div className="fixed w-full h-full bg-black/80 top-0 left-0 z-[99]">
      <div className="w-full h-full flex justify-end">
        <div className="w-[40%] bg-white h-full">
          <div className="flex items-center justify-between pt-8 pb-4 px-10 border-b border-black/20">
            <div className="flex items-center gap-4">
              <p className="font-avenir text-lg font-normal pt-1">
                Edit Content
              </p>
            </div>
            <div className="flex  gap-1 cursor-pointer">
              <div className="relative flex items-center justify-center">
                <div className="w-[16px] h-[1px] rotate-45 bg-black"></div>
                <div className="w-[16px] h-[1px] rotate-[-45deg] bg-black absolute "></div>
              </div>
              <p className="capitalize font-avenir font-[400] text-sm mt-1">
                CLOSE
              </p>
            </div>
          </div>
          <div className="h-full overflow-scroll pb-24 px-10 pt-12">
            <div className="w-full flex-nowrap flex-none h-[400px] bg-black/5 flex border border-dashed border-black/30  items-center justify-center relative rounded-[36px]">
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
          </div>
        </div>
      </div>
    </div>
  );
};

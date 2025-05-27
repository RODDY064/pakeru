"use client"

import { cn } from '@/libs/cn';
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'


  const colorMap: { [key: number]: string } = {
    1: "bg-black",
    2: "bg-amber-600",
    4: "bg-stone-500",
    5: "bg-green-500",
  };



export default function CartCard() {
const parRef = useRef<HTMLDivElement>(null);
  const [imgHeight, setImgHeight] = useState<number | null>(null);
  const imgRef = useRef(null);

 
   useEffect(() => {
    const updateHeight = () => {
      if (parRef.current) {
        setImgHeight(parRef.current.offsetHeight);
      }
    };

    updateHeight(); // Run on mount

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);



  return (
    <div className='border-b-2  pb-6 border-black/4'>
        <div 
        ref={parRef}
        className='flex gap-3 items-start  h-fit '>
        <div 
        ref={imgRef}
        style={{ height: imgHeight ? `${imgHeight}px` : "auto" }}
        className='w-[120px] h-full  flex-none md:w-[200px] md:h-full  rounded-[1px] overflow-hidden mt-[4px] relative border-[0.5px] border-black/10'>
            <Image src="/images/im.jpeg" fill className='object-cover' alt='image'/>
        </div>
        <div className=''>
            <p className='font-manrop text-lg font-bold'>MEN'S PORL NEAL NEA WAR WAER RUU WEAR</p>
            <p className=' font-manrop text-lg md:text-xl font-black text-black/50 mt-1'>GHS 250</p>
            <div className="flex gap-1 mt-2">
                        {[1, 2, 4, 5].map((item) => (
                          <div
                            key={item}
                            className={cn(
                              "size-[15px] hover:border border-black/70 rounded-full p-[1.5px] cursor-pointer flex items-center justify-center",
                              {
                                border: item === 1,
                              }
                            )}
                          >
                            <div
                              className={cn("w-full h-full rounded-full", colorMap[item])}
                            ></div>
                          </div>
                        ))}
            </div>
            <div className='grid-cols-4 mt-3 gap-1 w-[190px] hidden md:grid '>
                {["xs","sm","m","l","xl","2xl"].map((item)=>(
                    <div key={item} className='w-11 h-7 flex items-center justify-center rounded-[3px]  hover:bg-black hover:text-white border-[0.5px] border-black/10 cursor-pointer bg-gray-100'>
                     <p className='font-manrop text-xs'> {item.toLocaleUpperCase()}</p>
                    </div>
                ))}
            </div>
            <div className='mt-4 '>
                <div className=' max-sm:w-[120px] md:w-[150px] h-8 md:h-8 border-[0.5px] rounded-[4px] border-gray-400 grid  grid-cols-3 overflow-hidden'>
                <div className='w-full h-full flex items-center justify-center border-r-[0.5px] cursor-pointer'>
                    <Image src="/icons/minus.svg" width={18} height={18} alt='plus'/>
                </div>
                <div className='w-full h-full flex items-center justify-center'>
                    <p className='font-manrop font-black text-md'>2</p>
                </div>
                <div className='w-full h-full flex items-center justify-center border-l-[0.5px] cursor-pointer'>
                    <Image src="/icons/plus.svg" width={18} height={18} alt='plus'/>
                </div>
    
                    
                </div>
            </div>
        </div>
       
    </div>
    <div className='grid-cols-6  mt-6 gap-1 w-full  md:hidden grid '>
                {["xs","sm","m","l","xl","2xl"].map((item)=>(
                    <div key={item} className='w-full md:w-11 h-7 flex items-center justify-center rounded-[3px]  hover:bg-black hover:text-white border-[0.5px] border-black/10 cursor-pointer bg-gray-100'>
                     <p className='font-manrop text-xs'> {item.toLocaleUpperCase()}</p>
                    </div>
                ))}
            </div>
    </div>
  )
}

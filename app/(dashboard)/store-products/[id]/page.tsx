import Image from 'next/image'
import React from 'react'

export default function ProductView() {
  return (
    <div className='px-4 xl:px-8  xl:ml-[15%]  pt-24 pb-32'>
        <div className='flex items-center gap-2'>
            <Image src="/icons/arrow.svg" width={20} height={20} alt='arrow' className='rotate-90 cursor-pointer'/>
             <div className='flex flex-col '>
             <div className='flex items-center gap-1'>
               <p className="font-avenir text-2xl font-bold mt-[5px]">Studio Fit Jacket</p>
             <div className=' mx-4 flex items-center gap-2'>
                {/* <p className='font-avenir font-[500] text-sm py-1 bg-yellow-100 px-6 rounded-lg border border-yellow-500/40 text-yellow-500'>Pending</p> */}
                 <p className='font-avenir font-[500] text-sm py-1 bg-gray-100 px-6 rounded-lg border border-gray-500/40 text-gray-500'>Inactive</p>
             </div>
             </div>
             </div>
        </div>
        <p className='ml-6 font-avenir font-[500] text-md text-black/30'>January 8, 2025 at 9:45 am</p>
         </div>
  )
}

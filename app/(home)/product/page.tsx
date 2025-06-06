import Filter from '@/app/ui/filter'
import ProductCon from '@/app/ui/productCon'
import React from 'react'

export default function Product() {
  return (
    <div className="w-full min-h-screen  flex flex-col items-center text-black bg-black home-main  transition-all">
        <div className='w-full h-full  bg-white flex overflow-hidden gap-4 pt-24'>
            {/* <Filter/> */}
            <ProductCon/>
        </div>
    </div>
  )
}

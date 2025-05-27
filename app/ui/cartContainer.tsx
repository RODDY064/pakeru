import React from 'react'
import CartCard from './cartCard'

export default function CartContainer() {
  return (
    <div className='w-full h-full '>
        <div className='w-full flex flex-col gap-2 pb-4 overflow-y-scroll cart-con'>
            {[1,2,3,4,5,6,7].map((item=>(
                <CartCard key={item}/>
            )))

            }
        </div>
    </div>
  )
}

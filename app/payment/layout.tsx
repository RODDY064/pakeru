import React from 'react'
import PaymentNav from '../ui/dashboard/paymentNav'



export default function PaymentLayout({ children}:{ children:React.ReactNode}) {


  return (
     <div className="w-full min-h-dvh flex flex-col items-center bg-[#f2f2f2] pb-20">
      <PaymentNav/>
      {children}
    </div>
  )
}

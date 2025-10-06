
import Image from 'next/image';
import React from 'react'

export default function  Contacts (){
  return (
    <div className="w-[85%] md:w-[70%] mt-24 border-t border-black/10 flex flex-col items-center">
    <div className="grid md:grid-cols-3 grid-cols-1 gap-10 lg:gap-24 p-10">
      <div className="flex flex-col items-center ">
        <Image
          src="/icons/chats.svg"
          width={52}
          height={52}
          alt="chat"
          className="hidden md:flex"
        />
        <Image
          src="/icons/chats.svg"
          width={36}
          height={36}
          alt="chat"
          className="md:hidden"
        />
        <p className="font-avenir mt-1 text-md font-semibold ">Chat with us</p>
        <p className="text-center mt-2 font-avenir max-sm:text-sm">
          Products & Orders: <br />7 am - 10 pm 7 days a week
        </p>
      </div>
      <div className="flex flex-col items-center ">
        <Image
          src="/icons/phone.svg"
          width={52}
          height={52}
          alt="phone"
          className="hidden md:flex"
        />
        <Image
          src="/icons/phone.svg"
          width={36}
          height={36}
          alt="phone"
          className="md:hidden"
        />
        <p className="font-avenir mt-1 text-md font-semibold ">Call us</p>
        <p className="text-center mt-2 font-avenir">+233 55 698 6761</p>
        <p className="text-center mt-2 font-avenir max-sm:text-sm">
          Products & Orders: <br />7 am - 10 pm 7 days a week
        </p>
      </div>
      <div className="flex flex-col items-center ">
        <Image
          src="/icons/location.svg"
          width={52}
          height={52}
          alt="location"
          className="hidden md:flex"
        />
        <Image
          src="/icons/location.svg"
          width={36}
          height={36}
          alt="location"
          className="md:hidden"
        />
        <p className="font-avenir mt-1 text-md font-semibold  ">Our location</p>
        <p className="text-center mt-2 font-avenir max-sm:text-sm">
          Asokore Mampong <br />
          Kumasi, Ashanti
        </p>
      </div>
    </div>
  </div>
  )
};

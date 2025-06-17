"use client"
import { useGSAP } from '@gsap/react'
import React from 'react'
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from 'gsap';
import Image from 'next/image';

export default function Video() {
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);


    gsap.to(".video-div", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".video-div",
        start: "top center", 
        end: "bottom 900px", 
        scrub: 1,
      },
    });
  }, []);

  return (
    <div className="my-24 text-black flex flex-col items-center">
      <div className='w-[80%] h-[600px] md:h-[700px] lg:h-[98vh] relative video-div'>
        <Image src="/images/shop.jpg" fill className='object-cover' alt='shop'/>
      </div>
    </div>
  );
}

"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import React from "react";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function SliderButton() {
  useGSAP(() => {

    gsap.timeline({
      scrollTrigger: {
        trigger: "body", // or a specific element you want to track
        start: "top top",
        end: "bottom bottom",
        scrub: 1, 
        onUpdate: (self) => {
          const progress = self.progress;
          const scrollY = window.scrollY;
          
    
          const threshold = 580;
          
          if (scrollY > threshold) {
            // Show and expand button
            gsap.to(".navButton", {
              opacity: 1,
              scale: 1,
              width: "auto",
              duration: 0.4,
              ease: "power1.out"
            });
            gsap.to('.drag-text',{
                opacity:1,
                delay:0.2
            })
          } 
        }
      }
    });

    // Alternative approach with direct ScrollTrigger
    // ScrollTrigger.create({
    //   trigger: "body",
    //   start: "580px top",
    //   end: "bottom bottom",
    //     markers:true,
    //   onEnter: () => {
    //     gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } })
    //       .to(".navButton", { opacity: 1, scale: 1.1, duration: 0.3 })
    //       .to(".navButton", { scale: 1, duration: 0.2 }, "-=0.1")
    //       .to(".navButton", { width: "35%", duration: 0.4 }, "<");
    //   },
    //   onLeave: () => {
    //     gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } })
    //       .to(".navButton", { opacity: 0, scale: 0.9, duration: 0.3 })
    //       .to(".navButton", { width: "5%", duration: 0.4 }, "<+=0.2")
    //       .to(".navButton", { scale: 1, duration: 0.2 }, "<");
    //   },
    //   onEnterBack: () => {
    //     gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } })
    //       .to(".navButton", { opacity: 1, scale: 1.1, duration: 0.3 })
    //       .to(".navButton", { scale: 1, duration: 0.2 }, "-=0.1")
    //       .to(".navButton", { width: "35%", duration: 0.4 }, "<");
    //   },
    //   onLeaveBack: () => {
    //     gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } })
    //       .to(".navButton", { opacity: 0, scale: 0.9, duration: 0.3 })
    //       .to(".navButton", { width: "5%", duration: 0.4 }, "<+=0.2")
    //       .to(".navButton", { scale: 1, duration: 0.2 }, "<");
    //   }
    // });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="w-[5%] h-20 rounded-full bg-black navButton  items-center text-white justify-center opacity-0 lg:flex hidden px-4">
       <div className="flex items-center justify-between w-full">
        <div className="size-14 hover:border-white/50  cursor-pointer flex items-center justify-center border rounded-full prev flex-none ">
       
          <Image
            src="/icons/arrow-w.svg"
            width={18}
            height={18}
            alt="arrow"
            className="rotate-90 group-hover/sc:hidden"
          />
        </div>
        <p className="font-manrop drag-text opacity-0 flex-none flex mx-4 text-center">Drag the slider or click the buttons to slide</p>
        <div className="size-14 cursor-pointer flex items-center justify-center border rounded-full next hover:border-white/50 flex-none ">
        
          <Image
            src="/icons/arrow-w.svg"
            width={18}
            height={18}
            alt="arrow"
            className="rotate-270 "
          />
          
    
        </div> 
       </div>
    </div>
  );
}


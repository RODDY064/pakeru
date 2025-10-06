"use client";
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../../public/lottie/pakeru.json";
import { useBoundStore } from "@/store/store";
import { cn } from "@/libs/cn";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Loader() {
  const { routeChange, setRouteChange } = useBoundStore();

  useGSAP(() => {
    if (routeChange) {
      const tl = gsap.timeline();

      // Snap show - instant visibility
      tl.set(".loader-container", {
        visibility: "visible",
        pointerEvents: "auto",
        opacity: 1,
      })

        .fromTo(
          ".curtain",
          { opacity:0.4 },
          {
            opacity:1,
            duration: 0.6,
            ease: "power2.out",
          }
        )

        .to(".loader-container", {
          opacity: 1,
          duration: 2,
        })

          .to(
        ".curtain",
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "-=0.3"
      )

        .to(".loader-container", {
          opacity: 0,
          duration: 0.1,
          ease: "power2.in",
        })

        .set(".loader-container", {
          visibility: "hidden",
          pointerEvents: "none",
        })
        .call(() => {
          setRouteChange();
        });
    }
  }, [routeChange]);

  return (
    <div
      className={cn(
        "loader-container w-full fixed  top-0  h-full  flex flex-col items-center  z-[999] invisible",
        routeChange ? "pointer-events-auto" : "pointer-events-none"
      )}>
      <div className="absolute w-full h-full flex-none bg-white curtain"></div>
      <div className="w-full h-full flex flex-col items-center justify-center  flex-none">
        <div className="size-20 relative z-10">
        <Lottie
          animationData={loaderAnimation}
          loop={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <p className="mt-4 text-gray-600 text-sm font-avenir font-[400] animate-pulse">
        Loading...
      </p>
      </div>

    </div>
  );
}

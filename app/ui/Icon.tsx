"use client";

import { useBoundStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useEffect, useRef } from "react";

type MenuIconProps = {
  name: string; // e.g. "menu", "cart", etc
  onToggle: (name?: string) => void;
  stroke?: "black" | "white";
  style?:string
};

export default function Icon({ name, onToggle, stroke , style }: MenuIconProps) {
  const menuRef = useRef<SVGSVGElement | null>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const tl = useRef<GSAPTimeline | null>(null);

  const { modal, modalDisplay } = useBoundStore();

  // Only these names allow animation
  const animatableNames = ["menu"];

  const isActive = modal && modalDisplay === name;
  const canAnimate = animatableNames.includes(name);

  // Setup GSAP animation for animatable icons only
  useGSAP(() => {
    if (!menuRef.current) return;

    const first = menuRef.current.querySelector("#first");
    const middle = menuRef.current.querySelector("#middle");
    const last = menuRef.current.querySelector("#last");

    // For non-animatable icons, use gsap.set() when active
    if (!canAnimate) {
      gsap.set(first, {
        y: 4.5,
        rotate: 45,
        transformOrigin: "center",
      });
      gsap.set(last, {
        y: -4.5,
        rotate: -45,
        transformOrigin: "center",
      });
      gsap.set(middle, {
        scaleX: 0,
        transformOrigin: "center",
      });
      return;
    }

    // For animatable icons, setup timeline (don't use gsap.set)
    tl.current = gsap.timeline({ paused: true });

    tl.current
      .to(middle, {
        duration: 0.2,
        scaleX: 0,
        transformOrigin: "center",
        ease: "power2.inOut",
      })
      .to(
        first,
        {
          y: 4.5,
          rotate: 45,
          transformOrigin: "center",
          ease: "power2.inOut",
        },
        "<"
      )
      .to(
        last,
        {
          y: -4.5,
          rotate: -45,
          transformOrigin: "center",
          ease: "power2.inOut",
        },
        "<"
      );
  }, [canAnimate]);

  const handleToggle = () => {
    if (!canAnimate) {
      onToggle(name); // Skip animation
      return;
    }

    // Animate label
    if (labelRef.current) {
      const direction = isActive ? 1 : -1;

      gsap.to(labelRef.current, {
        y: 10 * direction,
        opacity: 0,
        duration: 0.15,
        ease: "power1.in",
        onComplete: () => {
          gsap.fromTo(
            labelRef.current!,
            { y: -10 * direction, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, ease: "power1.out" }
          );
          onToggle(name);
        },
      });
    } else {
      onToggle(name);
    }

    // Animate icon toggle
    if (isActive) {
      tl.current?.reverse();
    } else {
      tl.current?.play();
    }
  };

  // Sync icon state with `modalDisplay` for animatable types
  useEffect(() => {
    if (!canAnimate) return;

    if (isActive) {
      tl.current?.play();
    } else {
      tl.current?.reverse();
    }
  }, [isActive, canAnimate]);

  return (
    <div
      onClick={handleToggle}
      className={`cursor-pointer flex gap-2 items-center ${style}`}
      role="button"
      aria-pressed={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}>
      <svg
        ref={menuRef}
        id="menu"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="first"
          d="M2.30005 7.39014H21.7001"
          stroke={stroke ?? "black"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="middle"
          d="M2.30005 12H21.7001"
          stroke={stroke ?? "black"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="last"
          d="M2.30005 16.6104H7.59005H21.7001"
          stroke={stroke ?? "black"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative h-[18px] overflow-hidden">
        <span
          ref={labelRef}
          className="block font-avenir font-medium text-sm pt-[0.5px]">
          {isActive ? "CLOSE" : name.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

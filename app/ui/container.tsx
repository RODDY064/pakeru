"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import Nav from "./nav";
import { useBoundStore } from "@/store/store";
import CartModal from "./Modal";
import Modal from "./Modal";

export default function Container({ children }: { children: React.ReactNode }) {
  const { setScrollAmount, setScrollRef } = useBoundStore();

    useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setScrollAmount(self.scroll());
      },
    });
  });

  return (
    <main>
      <Nav />
      <Modal/>
      {children}
    </main>
  );
}

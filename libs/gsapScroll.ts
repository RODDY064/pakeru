import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollToPlugin);

export function useGsapSlider({
  sliderRef,
  prevRef,
  nextRef,
  cardRef,
  speed = 0.5,
}: {
  sliderRef: React.RefObject<HTMLDivElement>;
  prevRef: React.RefObject<HTMLButtonElement>;
  nextRef: React.RefObject<HTMLButtonElement>;
  cardRef: React.RefObject<HTMLDivElement>;
  speed?: number;
}) {
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useGSAP(() => {
    if (
      !sliderRef.current ||
      !prevRef.current ||
      !nextRef.current ||
      !cardRef.current)
      return;

    const slider = sliderRef.current;
    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    const card = cardRef.current;

    let scrollAmount = 0;

    const updateScrollAmount = () => {
      const cardStyles = getComputedStyle(card);
      const cardWidth = card.offsetWidth;
      const marginRight = parseInt(cardStyles.marginRight) || 0;
      scrollAmount = cardWidth + marginRight;
    };

    updateScrollAmount();

    const updateFlags = () => {
      setIsStart(slider.scrollLeft <= 0);
      setIsEnd(
        Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth
      );
    };

    const scrollNext = () => {
      const targetScroll = Math.min(
        slider.scrollLeft + scrollAmount,
        slider.scrollWidth - slider.clientWidth
      );
      gsap.to(slider, {
        scrollTo: { x: targetScroll },
        duration: speed,
        ease: "cubic-bezier(.46,.22,.38,.95)",
        onUpdate: updateFlags,
      });
    };

    const scrollPrev = () => {
      const targetScroll = Math.max(slider.scrollLeft - scrollAmount, 0);
      gsap.to(slider, {
        scrollTo: { x: targetScroll },
        duration: speed,
        ease: "cubic-bezier(.46,.22,.38,.95)",
        onUpdate: updateFlags,
      });
    };

    prevBtn.addEventListener("click", scrollPrev);
    nextBtn.addEventListener("click", scrollNext);
    slider.addEventListener("scroll", updateFlags);
    window.addEventListener("resize", updateScrollAmount);

    // Initial check
    updateFlags();

    return () => {
      prevBtn.removeEventListener("click", scrollPrev);
      nextBtn.removeEventListener("click", scrollNext);
      slider.removeEventListener("scroll", updateFlags);
      window.removeEventListener("resize", updateScrollAmount);
    };
  }, [sliderRef, prevRef, nextRef, cardRef, speed]);

  return { isStart, isEnd };
}

import { useState, useRef, useEffect } from "react";
import { useBoundStore } from "@/store/store";
import { animationControls } from "motion/react";

type Timeout = ReturnType<typeof setTimeout> | null;

export const useSearchAndHoverControls = (
  searchControls: typeof animationControls,
  hoverControls: typeof animationControls
) => {
  const [isHover, setIsHover] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Track focus state
  const [isTyping, setIsTyping] = useState(false); // Track typing state

  const { setNavSearch } = useBoundStore();

  const hoverTimeout = useRef<Timeout>(null);
  const hoverOutTimeout = useRef<Timeout>(null);
  const searchTimeout = useRef<Timeout>(null);
  const searchOutTimeout = useRef<Timeout>(null);
  const typingTimeout = useRef<Timeout>(null);

  // Clear all timers utility
  const clearAllTimers = () => {
    [
      hoverTimeout,
      hoverOutTimeout,
      searchTimeout,
      searchOutTimeout,
      typingTimeout,
    ].forEach((ref) => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  };

  const handleHoverStart = () => {
    // Cancel search animation & reset search states immediately on hover start
    if (isSearching || isSearchFocused || isTyping) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (searchOutTimeout.current) clearTimeout(searchOutTimeout.current);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);

      setIsSearching(false);
      setIsSearchFocused(false);
      setIsTyping(false);
      searchControls().start("hide");
    }

    // Clear hover timers
    if (hoverOutTimeout.current) clearTimeout(hoverOutTimeout.current);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    hoverTimeout.current = setTimeout(() => {
      setIsHover(true);
      hoverControls().start("show");
    }, 150);
  };

  const handleHoverEnd = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    hoverOutTimeout.current = setTimeout(() => {
      setIsHover(false);
      hoverControls().start("hide");
    }, 200);
  };

  const handleSearchFocus = () => {
    // Cancel hover animation & reset hover states immediately on search focus
    if (isHover) {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (hoverOutTimeout.current) clearTimeout(hoverOutTimeout.current);

      setIsHover(false);
      hoverControls().start("hide");
    }

    setIsSearchFocused(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setIsSearching(true);
      searchControls().start("show");
    }, 150);
  };

  const handleSearchBlur = (e: { relatedTarget: any }) => {
    const nextFocus = e.relatedTarget;

    // If focus moves to a related element, don't close the curtain
    if (nextFocus) {
      const isInsideCurtain = nextFocus.closest(".nav-curtain");
      if (isInsideCurtain) {
        return;
      }
    }

    setIsSearchFocused(false);
    setNavSearch("");

    // Only hide search animation if not typing
    if (!isTyping) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchOutTimeout.current = setTimeout(() => {
        setIsSearching(false);
        searchControls().start("hide");
      }, 200);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setIsTyping(true);
    setNavSearch(value);

    if (isHover) {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (hoverOutTimeout.current) clearTimeout(hoverOutTimeout.current);

      setIsHover(false);
      hoverControls().start("hide");
    }

    // Reset typing timeout
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);

      // If input is not focused when typing ends, hide search animation
      if (!isSearchFocused) {
        searchOutTimeout.current = setTimeout(() => {
          setIsSearching(false);
          searchControls().start("hide");
        }, 200);
      }
    }, 1000);
  };

  // 🛡️ Cleanup timers on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  return {
    isHover,
    isSearching,
    handleHoverStart,
    handleHoverEnd,
    handleSearchFocus,
    handleSearchBlur,
    handleSearchInputChange,
  };
};

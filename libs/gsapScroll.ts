import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollToPlugin);

interface SliderMetrics {
  itemWidth: number;
  sliderWidth: number;
  scrollWidth: number;
  totalItems: number;
  visibleItems: number;
  totalPages: number;
}

interface SliderState {
  isStart: boolean;
  isEnd: boolean;
  currentPage: number;
  visibleRange: { start: number; end: number };
}

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
  const [state, setState] = useState<SliderState>({
    isStart: true,
    isEnd: false,
    currentPage: 0,
    visibleRange: { start: 0, end: 0 },
  });

  const [metrics, setMetrics] = useState<SliderMetrics>({
    itemWidth: 0,
    sliderWidth: 0,
    scrollWidth: 0,
    totalItems: 0,
    visibleItems: 1,
    totalPages: 0,
  });

  const [isReady, setIsReady] = useState(false);

  const animationRef = useRef<gsap.core.Tween | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initRetryRef = useRef<number>(0);
  const maxRetries = 10;

  // Core metric calculation - the foundation of everything
  const calculateMetrics = useCallback((): SliderMetrics | null => {
    if (!sliderRef.current || !cardRef.current) return null;

    const slider = sliderRef.current;
    const card = cardRef.current;

    // Get actual rendered dimensions
    const cardStyles = getComputedStyle(card);
    const cardWidth = card.offsetWidth;
    const marginRight = parseInt(cardStyles.marginRight) || 0;
    
    if (cardWidth === 0) return null;

    const itemWidth = cardWidth + marginRight;
    const sliderWidth = slider.clientWidth;
    
    // Count actual items in the slider, not based on scrollWidth
    const allItems = slider.children;
    const totalItems = allItems.length;
    
    if (itemWidth === 0 || totalItems === 0) return null;

    // How many complete items can we see at once?
    const visibleItems = Math.max(1, Math.floor(sliderWidth / itemWidth));
    
    // Pages are based on how we group visible items
    // If we have 10 items and show 3 at a time: pages = ceil(10/3) = 4 pages
    const totalPages = Math.max(1, Math.ceil(totalItems / visibleItems));

    return {
      itemWidth,
      sliderWidth,
      scrollWidth: totalItems * itemWidth, // Calculated, not measured
      totalItems,
      visibleItems,
      totalPages,
    };
  }, [sliderRef, cardRef]);

  // State calculation based on current scroll position
  const calculateState = useCallback((currentMetrics: SliderMetrics): SliderState => {
    if (!sliderRef.current) {
      return {
        isStart: true,
        isEnd: false,
        currentPage: 0,
        visibleRange: { start: 0, end: 0 },
      };
    }

    const slider = sliderRef.current;
    const { itemWidth, totalItems, visibleItems, totalPages } = currentMetrics;
    
    const tolerance = 2;
    const scrollLeft = slider.scrollLeft;

    // Boundary detection
    const maxScroll = Math.max(0, (totalItems - visibleItems) * itemWidth);
    const isStart = scrollLeft <= tolerance;
    const isEnd = scrollLeft >= maxScroll - tolerance;

    // Which items are currently visible?
    const firstVisibleIndex = Math.max(0, Math.floor(scrollLeft / itemWidth));
    const lastVisibleIndex = Math.min(
      firstVisibleIndex + visibleItems - 1,
      totalItems - 1
    );

    // Current page calculation - which "group" of items are we showing?
    const currentPage = Math.max(0, Math.min(
      Math.floor(firstVisibleIndex / visibleItems),
      totalPages - 1
    ));

    return {
      isStart,
      isEnd,
      currentPage,
      visibleRange: {
        start: firstVisibleIndex,
        end: lastVisibleIndex,
      },
    };
  }, [sliderRef]);

  const handleScroll = useCallback(() => {
    if (!isReady) return;
    
    const newState = calculateState(metrics);
    setState(newState);
  }, [isReady, metrics, calculateState]);

  const animateToPosition = useCallback((targetScroll: number) => {
    if (!sliderRef.current) return;

    if (animationRef.current) {
      animationRef.current.kill();
    }

    const slider = sliderRef.current;
    const maxScroll = Math.max(0, (metrics.totalItems - metrics.visibleItems) * metrics.itemWidth);
    const clampedTarget = Math.max(0, Math.min(targetScroll, maxScroll));

    animationRef.current = gsap.to(slider, {
      scrollTo: { x: clampedTarget },
      duration: speed,
      ease: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      onUpdate: handleScroll,
      onComplete: handleScroll,
    });
  }, [sliderRef, speed, handleScroll, metrics]);

  // Navigation - move by visible page groups
  const scrollNext = useCallback(() => {
    if (!isReady || state.isEnd) return;
    
    const nextPageStartIndex = (state.currentPage + 1) * metrics.visibleItems;
    const targetScroll = nextPageStartIndex * metrics.itemWidth;
    animateToPosition(targetScroll);
  }, [isReady, state.isEnd, state.currentPage, metrics, animateToPosition]);

  const scrollPrev = useCallback(() => {
    if (!isReady || state.isStart) return;
    
    const prevPageStartIndex = (state.currentPage - 1) * metrics.visibleItems;
    const targetScroll = prevPageStartIndex * metrics.itemWidth;
    animateToPosition(targetScroll);
  }, [isReady, state.isStart, state.currentPage, metrics, animateToPosition]);

  const goToPage = useCallback((pageIndex: number) => {
    if (!isReady || pageIndex < 0 || pageIndex >= metrics.totalPages) return;
    
    const targetIndex = pageIndex * metrics.visibleItems;
    const targetScroll = targetIndex * metrics.itemWidth;
    animateToPosition(targetScroll);
  }, [isReady, metrics, animateToPosition]);

  const goToIndex = useCallback((index: number) => {
    if (!isReady || index < 0 || index >= metrics.totalItems) return;
    
    const targetScroll = index * metrics.itemWidth;
    animateToPosition(targetScroll);
  }, [isReady, metrics, animateToPosition]);

  const initialize = useCallback(() => {
    const newMetrics = calculateMetrics();
    
    if (!newMetrics) {
      if (initRetryRef.current < maxRetries) {
        initRetryRef.current++;
        const delay = Math.min(50 * Math.pow(1.5, initRetryRef.current), 500);
        setTimeout(initialize, delay);
      }
      return false;
    }

    setMetrics(newMetrics);
    const newState = calculateState(newMetrics);
    setState(newState);
    setIsReady(true);
    initRetryRef.current = 0;
    
    return true;
  }, [calculateMetrics, calculateState]);

  const setupResizeObserver = useCallback(() => {
    if (!sliderRef.current || !cardRef.current) return;

    resizeObserverRef.current = new ResizeObserver(() => {
      if (isReady) {
        const newMetrics = calculateMetrics();
        if (newMetrics) {
          setMetrics(newMetrics);
          const newState = calculateState(newMetrics);
          setState(newState);
        }
      }
    });

    resizeObserverRef.current.observe(sliderRef.current);
    resizeObserverRef.current.observe(cardRef.current);
  }, [sliderRef, cardRef, isReady, calculateMetrics, calculateState]);

  useGSAP(() => {
    if (!sliderRef.current || !prevRef.current || !nextRef.current || !cardRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      initialize();
      setupResizeObserver();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [sliderRef, prevRef, nextRef, cardRef]);

  useEffect(() => {
    if (!isReady || !prevRef.current || !nextRef.current || !sliderRef.current) {
      return;
    }

    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    const slider = sliderRef.current;

    prevBtn.addEventListener("click", scrollPrev);
    nextBtn.addEventListener("click", scrollNext);
    slider.addEventListener("scroll", handleScroll, { passive: true });

    Object.assign(slider, { goToPage, goToIndex });

    return () => {
      prevBtn.removeEventListener("click", scrollPrev);
      nextBtn.removeEventListener("click", scrollNext);
      slider.removeEventListener("scroll", handleScroll);
      
      delete (slider as any).goToPage;
      delete (slider as any).goToIndex;
    };
  }, [isReady, prevRef, nextRef, sliderRef, scrollPrev, scrollNext, handleScroll, goToPage, goToIndex]);

  const reinitialize = useCallback(() => {
    setIsReady(false);
    initRetryRef.current = 0;
    
    if (animationRef.current) {
      animationRef.current.kill();
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    setTimeout(() => {
      initialize();
      setupResizeObserver();
    }, 100);
  }, [initialize, setupResizeObserver]);

  const itemsArray = Array.from({ length: metrics.totalItems }, (_, i) => i);

  return {
    // Navigation state
    isStart: state.isStart,
    isEnd: state.isEnd,
    
    // Item information
    totalItems: metrics.totalItems,
    itemsArray,
    
    // Pagination information
    visibleItems: metrics.visibleItems,
    currentPage: state.currentPage,
    totalPages: metrics.totalPages,
    visibleRange: state.visibleRange,
    
    // Navigation functions
    goToPage,
    goToIndex,
    
    // Control
    isInitialized: isReady,
    reinitialize,
  };
}
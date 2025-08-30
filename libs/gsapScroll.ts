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
  // State management
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

  // Refs for cleanup and animation control
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initRetryRef = useRef<number>(0);
  const maxRetries = 10;

  // Memoized metric calculations
  const calculateMetrics = useCallback((): SliderMetrics | null => {
    if (!sliderRef.current || !cardRef.current) return null;

    const slider = sliderRef.current;
    const card = cardRef.current;

    // Get computed styles once
    const cardStyles = getComputedStyle(card);
    const cardWidth = card.offsetWidth;
    const marginRight = parseInt(cardStyles.marginRight) || 0;
    
    if (cardWidth === 0) return null; // Not ready yet

    const itemWidth = cardWidth + marginRight;
    const sliderWidth = slider.clientWidth;
    const scrollWidth = slider.scrollWidth;

    if (itemWidth === 0 || scrollWidth === 0) return null;

    const totalItems = Math.round(scrollWidth / itemWidth);
    const visibleItems = Math.max(1, Math.floor(sliderWidth / itemWidth));
    const totalPages = Math.max(1, Math.ceil(totalItems / visibleItems));

    return {
      itemWidth,
      sliderWidth,
      scrollWidth,
      totalItems,
      visibleItems,
      totalPages,
    };
  }, [sliderRef, cardRef]);

  // Memoized state calculations
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
    const clientWidth = slider.clientWidth;
    const scrollWidth = slider.scrollWidth;

    // Calculate visibility flags
    const isStart = scrollLeft <= tolerance;
    const isEnd = Math.ceil(scrollLeft + clientWidth) >= (scrollWidth - tolerance);

    // Calculate visible range
    const firstVisibleIndex = Math.floor(scrollLeft / itemWidth);
    const lastVisibleIndex = Math.min(
      firstVisibleIndex + visibleItems - 1,
      totalItems - 1
    );

    // Calculate current page
    const currentPage = Math.max(0, Math.min(
      Math.floor(firstVisibleIndex / visibleItems),
      totalPages - 1
    ));

    return {
      isStart,
      isEnd,
      currentPage,
      visibleRange: {
        start: Math.max(0, firstVisibleIndex),
        end: Math.max(0, lastVisibleIndex),
      },
    };
  }, [sliderRef]);

  // Optimized scroll handler with debouncing
  const handleScroll = useCallback(() => {
    if (!isReady) return;
    
    const newState = calculateState(metrics);
    setState(newState);
  }, [isReady, metrics, calculateState]);

  // Animation control with better performance
  const animateToPosition = useCallback((targetScroll: number) => {
    if (!sliderRef.current) return;

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    const slider = sliderRef.current;
    const clampedTarget = Math.max(0, Math.min(
      targetScroll,
      slider.scrollWidth - slider.clientWidth
    ));

    animationRef.current = gsap.to(slider, {
      scrollTo: { x: clampedTarget },
      duration: speed,
      ease: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Apple's preferred easing
      onUpdate: handleScroll,
      onComplete: handleScroll,
    });
  }, [sliderRef, speed, handleScroll]);

  // Navigation functions
  const scrollNext = useCallback(() => {
    if (!isReady || state.isEnd) return;
    
    const targetScroll = sliderRef.current!.scrollLeft + (metrics.itemWidth * metrics.visibleItems);
    animateToPosition(targetScroll);
  }, [isReady, state.isEnd, sliderRef, metrics, animateToPosition]);

  const scrollPrev = useCallback(() => {
    if (!isReady || state.isStart) return;
    
    const targetScroll = sliderRef.current!.scrollLeft - (metrics.itemWidth * metrics.visibleItems);
    animateToPosition(targetScroll);
  }, [isReady, state.isStart, sliderRef, metrics, animateToPosition]);

  const goToPage = useCallback((pageIndex: number) => {
    if (!isReady || pageIndex < 0 || pageIndex >= metrics.totalPages) return;
    
    const targetScroll = pageIndex * metrics.itemWidth * metrics.visibleItems;
    animateToPosition(targetScroll);
  }, [isReady, metrics, animateToPosition]);

  const goToIndex = useCallback((index: number) => {
    if (!isReady || index < 0 || index >= metrics.totalItems) return;
    
    const targetScroll = index * metrics.itemWidth;
    animateToPosition(targetScroll);
  }, [isReady, metrics, animateToPosition]);

  // Initialization with retry mechanism
  const initialize = useCallback(() => {
    const newMetrics = calculateMetrics();
    
    if (!newMetrics) {
      // Retry with exponential backoff
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

  // ResizeObserver for responsive updates
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

  // Main GSAP effect
  useGSAP(() => {
    if (!sliderRef.current || !prevRef.current || !nextRef.current || !cardRef.current) {
      return;
    }

    // Wait for next tick to ensure DOM is ready
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

  // Event listeners setup - separate effect to ensure proper timing
  useEffect(() => {
    if (!isReady || !prevRef.current || !nextRef.current || !sliderRef.current) {
      return;
    }

    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    const slider = sliderRef.current;

    // Add event listeners
    prevBtn.addEventListener("click", scrollPrev);
    nextBtn.addEventListener("click", scrollNext);
    slider.addEventListener("scroll", handleScroll, { passive: true });

    // Expose functions on slider element for external access
    Object.assign(slider, { goToPage, goToIndex });

    return () => {
      prevBtn.removeEventListener("click", scrollPrev);
      nextBtn.removeEventListener("click", scrollNext);
      slider.removeEventListener("scroll", handleScroll);
      
      // Clean up exposed functions
      delete (slider as any).goToPage;
      delete (slider as any).goToIndex;
    };
  }, [isReady, prevRef, nextRef, sliderRef, scrollPrev, scrollNext, handleScroll, goToPage, goToIndex]);

  // Manual reinitialize function
  const reinitialize = useCallback(() => {
    setIsReady(false);
    initRetryRef.current = 0;
    
    // Clean up
    if (animationRef.current) {
      animationRef.current.kill();
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // Reset and reinitialize
    setTimeout(() => {
      initialize();
      setupResizeObserver();
    }, 100);
  }, [initialize, setupResizeObserver]);

  // Derived values for convenience
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
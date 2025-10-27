import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollToPlugin);

interface SliderMetrics {
  itemWidth: number;
  sliderWidth: number;
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
    totalItems: 0,
    visibleItems: 1,
    totalPages: 0,
  });

  const [isReady, setIsReady] = useState(false);
  
  // Use refs to always access latest values (prevents stale closures)
  const metricsRef = useRef(metrics);
  const stateRef = useRef(state);
  const isReadyRef = useRef(false);
  
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  // Sync refs with state
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  // Calculate metrics - simplified and more reliable
  const calculateMetrics = useCallback((): SliderMetrics | null => {
    if (!sliderRef.current || !cardRef.current) return null;

    const slider = sliderRef.current;
    const card = cardRef.current;

    // Wait for actual layout
    const cardRect = card.getBoundingClientRect();
    if (cardRect.width === 0) return null;

    const cardStyles = getComputedStyle(card);
    const marginRight = parseFloat(cardStyles.marginRight) || 0;
    const itemWidth = cardRect.width + marginRight;
    
    const sliderWidth = slider.clientWidth;
    const totalItems = slider.children.length;
    
    if (itemWidth === 0 || totalItems === 0 || sliderWidth === 0) return null;

    const visibleItems = Math.max(1, Math.floor(sliderWidth / itemWidth));
    const totalPages = Math.max(1, Math.ceil(totalItems / visibleItems));

    return {
      itemWidth,
      sliderWidth,
      totalItems,
      visibleItems,
      totalPages,
    };
  }, [sliderRef, cardRef]);

  // Calculate state from scroll position
  const calculateState = useCallback((currentMetrics: SliderMetrics, scrollLeft: number): SliderState => {
    const { itemWidth, totalItems, visibleItems, totalPages } = currentMetrics;
    
    const tolerance = 2;
    const maxScroll = Math.max(0, (totalItems - visibleItems) * itemWidth);
    
    const isStart = scrollLeft <= tolerance;
    const isEnd = scrollLeft >= maxScroll - tolerance;

    const firstVisibleIndex = Math.max(0, Math.floor(scrollLeft / itemWidth));
    const lastVisibleIndex = Math.min(firstVisibleIndex + visibleItems - 1, totalItems - 1);

    // Calculate current page
    const scrolledItems = Math.round(scrollLeft / itemWidth);
    const currentPage = Math.min(
      Math.floor(scrolledItems / visibleItems),
      totalPages - 1
    );

    return {
      isStart,
      isEnd,
      currentPage: Math.max(0, currentPage),
      visibleRange: {
        start: firstVisibleIndex,
        end: lastVisibleIndex,
      },
    };
  }, []);

  // Handle scroll updates - only when not animating
  const handleScroll = useCallback(() => {
    if (!isReadyRef.current || !sliderRef.current || isAnimatingRef.current) return;
    
    const scrollLeft = sliderRef.current.scrollLeft;
    const newState = calculateState(metricsRef.current, scrollLeft);
    setState(newState);
  }, [sliderRef, calculateState]);

  // Animate to position - single source of truth
  const animateToPosition = useCallback((targetScroll: number) => {
    if (!sliderRef.current || !isReadyRef.current) return;

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    const slider = sliderRef.current;
    const { itemWidth, totalItems, visibleItems } = metricsRef.current;
    const maxScroll = Math.max(0, (totalItems - visibleItems) * itemWidth);
    const clampedTarget = Math.max(0, Math.min(targetScroll, maxScroll));

    isAnimatingRef.current = true;

    animationRef.current = gsap.to(slider, {
      scrollTo: { x: clampedTarget, autoKill: false },
      duration: speed,
      ease: "power2.inOut",
      onUpdate: () => {
        if (slider) {
          const scrollLeft = slider.scrollLeft;
          const newState = calculateState(metricsRef.current, scrollLeft);
          setState(newState);
        }
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        if (slider) {
          const scrollLeft = slider.scrollLeft;
          const newState = calculateState(metricsRef.current, scrollLeft);
          setState(newState);
        }
      },
    });
  }, [sliderRef, speed, calculateState]);

  // Navigation functions using refs for latest values
  const scrollNext = useCallback(() => {
    if (!isReadyRef.current || stateRef.current.isEnd) return;
    
    const { currentPage } = stateRef.current;
    const { totalPages, visibleItems, itemWidth, totalItems } = metricsRef.current;
    
    const nextPage = Math.min(currentPage + 1, totalPages - 1);
    const targetIndex = nextPage * visibleItems;
    const maxStartIndex = Math.max(0, totalItems - visibleItems);
    const clampedIndex = Math.min(targetIndex, maxStartIndex);
    
    animateToPosition(clampedIndex * itemWidth);
  }, [animateToPosition]);

  const scrollPrev = useCallback(() => {
    if (!isReadyRef.current || stateRef.current.isStart) return;
    
    const { currentPage } = stateRef.current;
    const { visibleItems, itemWidth } = metricsRef.current;
    
    const prevPage = Math.max(currentPage - 1, 0);
    const targetIndex = prevPage * visibleItems;
    
    animateToPosition(targetIndex * itemWidth);
  }, [animateToPosition]);

  const goToPage = useCallback((pageIndex: number) => {
    if (!isReadyRef.current) return;
    
    const { totalPages, visibleItems, itemWidth, totalItems } = metricsRef.current;
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    
    const targetIndex = pageIndex * visibleItems;
    const maxStartIndex = Math.max(0, totalItems - visibleItems);
    const clampedIndex = Math.min(targetIndex, maxStartIndex);
    
    animateToPosition(clampedIndex * itemWidth);
  }, [animateToPosition]);

  const goToIndex = useCallback((index: number) => {
    if (!isReadyRef.current) return;
    
    const { totalItems, itemWidth } = metricsRef.current;
    if (index < 0 || index >= totalItems) return;
    
    animateToPosition(index * itemWidth);
  }, [animateToPosition]);

  // Initialize - wait for proper layout
  const initialize = useCallback(() => {
    const attempt = () => {
      const newMetrics = calculateMetrics();
      
      if (!newMetrics || !sliderRef.current) {
        return false;
      }

      const scrollLeft = sliderRef.current.scrollLeft;
      const newState = calculateState(newMetrics, scrollLeft);
      
      setMetrics(newMetrics);
      setState(newState);
      setIsReady(true);
      
      return true;
    };

    // Try immediately
    if (attempt()) return;

    // If failed, wait for next frame and retry
    requestAnimationFrame(() => {
      if (!attempt()) {
        // Last resort - wait a bit longer
        setTimeout(attempt, 50);
      }
    });
  }, [calculateMetrics, calculateState, sliderRef]);

  // Setup observers
  const setupObservers = useCallback(() => {
    if (!sliderRef.current || !cardRef.current) return;

    // Resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      if (!isReadyRef.current) return;
      
      const newMetrics = calculateMetrics();
      if (newMetrics && sliderRef.current) {
        const scrollLeft = sliderRef.current.scrollLeft;
        const newState = calculateState(newMetrics, scrollLeft);
        setMetrics(newMetrics);
        setState(newState);
      }
    });

    resizeObserverRef.current.observe(sliderRef.current);
    resizeObserverRef.current.observe(cardRef.current);

    // Mutation observer
    mutationObserverRef.current = new MutationObserver((mutations) => {
      const hasChildChanges = mutations.some(
        (m) => m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)
      );
      
      if (hasChildChanges) {
        // Reset and reinitialize
        setIsReady(false);
        isReadyRef.current = false;
        requestAnimationFrame(() => initialize());
      }
    });

    mutationObserverRef.current.observe(sliderRef.current, {
      childList: true,
    });
  }, [sliderRef, cardRef, calculateMetrics, calculateState, initialize]);

  // Main initialization effect - with dependency array to re-run on ref changes
  useGSAP(() => {
    if (!sliderRef.current || !prevRef.current || !nextRef.current || !cardRef.current) {
      return;
    }

    // Ensure we cleanup previous state
    setIsReady(false);
    isReadyRef.current = false;

    initialize();
    setupObservers();

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [sliderRef.current, prevRef.current, nextRef.current, cardRef.current, initialize, setupObservers]);

  // Event listeners effect
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

    // Expose methods
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
    isReadyRef.current = false;
    
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    requestAnimationFrame(() => initialize());
  }, [initialize]);

  return {
    isStart: state.isStart,
    isEnd: state.isEnd,
    totalItems: metrics.totalItems,
    itemsArray: Array.from({ length: metrics.totalItems }, (_, i) => i),
    visibleItems: metrics.visibleItems,
    currentPage: state.currentPage,
    totalPages: metrics.totalPages,
    visibleRange: state.visibleRange,
    goToPage,
    goToIndex,
    isInitialized: isReady,
    reinitialize,
  };
}
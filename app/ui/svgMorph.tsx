"use client";
import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";
import { cn } from "@/libs/cn";

gsap.registerPlugin(MorphSVGPlugin);

interface SVGMorphProps {
  rounded?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  items?: number;
  direction?: "row" | "column";
  gap?: number;
  className?: string;
  render: React.ReactNode[];
  split?: boolean;
  reverse?: boolean;
}

function getApplePath(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, Math.min(w, h) / 2);
  return `
    M${x + radius},${y}
    L${x + w - radius},${y}
    Q${x + w},${y} ${x + w},${y + radius}
    L${x + w},${y + h - radius}
    Q${x + w},${y + h} ${x + w - radius},${y + h}
    L${x + radius},${y + h}
    Q${x},${y + h} ${x},${y + h - radius}
    L${x},${y + radius}
    Q${x},${y} ${x + radius},${y}
    Z
  `;
}

export default function SVGMorph({
  rounded = 16,
  fill = "#ffff",
  stroke = "rgba(0, 0, 0, 0.1)",
  strokeWidth = 1,
  items = 2,
  direction = "row",
  gap = 12,
  className = "",
  render,
  split = false,
  reverse = false,
}: SVGMorphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const splitOccuringtime = useRef<NodeJS.Timeout | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const contentWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeItems = items;

  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setSize({ width, height });
        setReady(true);
      }
    });

    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  const totalGap = (items - 1) * gap;
  const boxWidth =
    direction === "row" ? (size.width - totalGap) / items : size.width;
  const boxHeight =
    direction === "column" ? (size.height - totalGap) / items : size.height;

  const oneBlobPath = getApplePath(
    strokeWidth / 2,
    strokeWidth / 2,
    size.width - strokeWidth,
    size.height - strokeWidth,
    rounded
  );

  const multiBlobPaths = [...Array(items)].map((_, i) => {
    const x =
      direction === "row"
        ? i * (boxWidth + gap) + strokeWidth / 2
        : strokeWidth / 2;
    const y =
      direction === "column"
        ? i * (boxHeight + gap) + strokeWidth / 2
        : strokeWidth / 2;
    return getApplePath(
      x,
      y,
      boxWidth - strokeWidth,
      boxHeight - strokeWidth,
      rounded
    );
  });

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    if (!ready || !svgRef.current) return;

    const tl = gsap.timeline({ paused: true });
    timelineRef.current = tl;

    // Move groups (optional motion)
    groupRefs.current.forEach((g, i) => {
      if (g) {
        tl.to(
          g,
          {
            x: direction === "row" ? (i === 0 ? -2 : 2) : 0,
            y: direction === "column" ? (i === 0 ? -2 : 2) : 0,
            ease: "cubic-bezier(0.33, 0.01, 0, 1)",
          },
          0
        );
      }
    });

    // Animate all paths
    pathRefs.current.forEach((p, i) => {
      if (!p) return;

      tl.to(
        p,
        {
          strokeOpacity: 0,
          duration: 0.2,
          ease: "power2.inOut",
        },
        0 // start of timeline
      );

      tl.to(
        p,
        {
          morphSVG: multiBlobPaths[i],
          ease: "cubic-bezier(0.33, 0.01, 0, 1)",
          duration: 1.2,
        },
        0 // overlap with fade
      );

      tl.to(
        p,
        {
          strokeOpacity: 1,
          duration: 0.3,
          ease: "power2.out",
        },
        1.2 // end of morph
      );
    });

    return () => tl.kill();
  }, [ready, oneBlobPath, multiBlobPaths.join("|")]);

  useEffect(() => {
    if (!timelineRef.current || !ready) return;

    if (splitOccuringtime.current) clearTimeout(splitOccuringtime.current);

    // Clear any previous timeout
    if (splitOccuringtime.current) {
      clearTimeout(splitOccuringtime.current);
    }

    const tl = timelineRef.current;
    const directionProgress = split ? (reverse ? 0 : 1) : reverse ? 1 : 0;

    let hasShownContent = false;

    requestAnimationFrame(() => {
      gsap.to(tl, {
        progress: directionProgress,
        duration: 1.2,
        ease: "cubic-bezier(0.33, 0.01, 0, 1)",
        onStart: () => {},
        onUpdate: () => {
          if (!tl) return;
          const p = tl.progress();
          if (!hasShownContent && p > 0.4) {
            hasShownContent = true;
          }
        },
      });
    });

    setShowLoader(true);
    splitOccuringtime.current = setTimeout(() => {
      setShowLoader(false);
    }, 800);

    return () => {
      if (splitOccuringtime.current) clearTimeout(splitOccuringtime.current);
    };
  }, [split, reverse, ready]);

  useEffect(() => {
    contentWrapperRefs.current.forEach((el, i) => {
      if (el) {
        gsap.to(el, {
          opacity: showLoader ? 0 : 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });
  }, [showLoader]);

  return (
    <div className={`relative w-full h-full ${className}  overflow-hidden `}>
      {!split && !reverse ? (
        <div
          ref={(el) => {
            contentRefs.current[0] = el;
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden p-2"
          style={{ borderRadius: rounded }}
        >
          {render[0]}
        </div>
      ) : (
        <>
          {[...Array(activeItems)].map((_, i) => {
            const x = direction === "row" ? i * (boxWidth + gap) : 0;
            const y = direction === "column" ? i * (boxHeight + gap) : 0;
            return (
              <div
                key={i}
                ref={(el) => {
                  contentRefs.current[i] = el;
                }}
                className="absolute flex items-center justify-center p-2 overflow-hidden pointer-events-none"
                style={{
                  left: x,
                  top: y,
                  width: boxWidth,
                  height: boxHeight,
                  willChange: "opacity",
                }}
              >
                {
                  <>
                    {showLoader && <div className="text-center absolute"></div>}
                    <div
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center renderBox"
                      )}>
                      {render[i]}
                    </div>
                  </>
                }
              </div>
            );
          })}
        </>
      )}

      {/* SVG Layer */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="px-2"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="xMidYMid meet" >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 24 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>

        {[...Array(items)].map((_, i) => (
          <g
            key={i}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            filter="url(#goo)"
          >
            <path
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={oneBlobPath}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

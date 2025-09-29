"use client";
import React, { useRef, useLayoutEffect, useState } from "react";
import { cn } from "@/libs/cn";
import Image from "next/image";

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
  name?: string | string[];
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
  name,
}: SVGMorphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeItems = Math.min(items, render.length);

  // Observe SVG size
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setSize({ width, height });
      }
    });

    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate dimensions
  const totalGap = (activeItems - 1) * gap;
  const boxWidth =
    direction === "row" ? (size.width - totalGap) / activeItems : size.width;
  const boxHeight =
    direction === "column" ? (size.height - totalGap) / activeItems : size.height;

  // Define paths
  const oneBlobPath = getApplePath(
    strokeWidth / 2,
    strokeWidth / 2,
    size.width - strokeWidth,
    size.height - strokeWidth,
    rounded
  );

  const multiBlobPaths = [...Array(activeItems)].map((_, i) => {
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

  // Determine which path to use based on split and reverse props
  const pathToUse = split && !reverse ? multiBlobPaths : [oneBlobPath];

  return (
    <div
      style={{ minHeight: "100px", minWidth: "100px" }}
      className={`relative w-full h-full ${className} overflow-hidden`}
    >
      {/* Content Layer */}
      {!split || reverse ? (
        <div
          ref={(el) => {
            contentRefs.current[0] = el;
          }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden p-2"
          style={{ borderRadius: rounded }}
        >
          <div className="text-center absolute z-20 bottom-0 right-0 rounded-4xl w-full h-full flex">
            <div className="relative top-10 left-10">
              <p className="font-avenir text-lg capitalize">{name}</p>
            </div>
            <div className="size-12 absolute z-9 bottom-6 right-8 flex items-center justify-center">
              <div className="size-10 bg-black/5 rounded-full cursor-pointer flex items-center justify-center">
                <Image
                  src="/icons/bag.svg"
                  width={24}
                  height={24}
                  alt="shopping bag"
                />
              </div>
            </div>
          </div>
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
                className="absolute flex items-center justify-center p-2 overflow-hidden"
                style={{
                  left: x,
                  top: y,
                  width: boxWidth,
                  height: boxHeight,
                }}
              >
                <div className={cn("w-full h-full flex flex-col items-center justify-center")}>
                  {render[i]}
                  <div className="text-center absolute z-20 bottom-1.5 w-full h-full right-1.5 rounded-4xl flex items-center justify-center">
                    <div
                      className={`size-12 absolute ${
                        activeItems !== 2 ? "left-10 top-10" : "left-4 top-8"
                      }`}
                    >
                      <div className="relative top-0 left-0">
                        <p className="font-avenir text-lg capitalize px-3">{Array.isArray(name) ? name[i] : ""}</p>
                      </div>
                    </div>
                    <div className="size-12 absolute z-90 bottom-3 right-3 flex items-center justify-center">
                      <div className="size-10 bg-black/5 rounded-full cursor-pointer flex items-center justify-center">
                        <Image
                          src="/icons/bag.svg"
                          width={24}
                          height={24}
                          alt="shopping bag"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
        className="px"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
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

        {[...Array(split && !reverse ? activeItems : 1)].map((_, i) => (
          <g
            key={i}
            filter="url(#goo)"
          >
            <path
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={pathToUse[i] || oneBlobPath}
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
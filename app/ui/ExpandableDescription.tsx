import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useRef, useCallback, useLayoutEffect } from "react";
interface ExpandableDescriptionProps {
  description: string;
  maxLines?: number;
  className?: string;
}

export default function ExpandableDescription({
  description,
  maxLines = 6,
  className = "",
}: ExpandableDescriptionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize stripped description to avoid recomputation
  const strippedDescription = useMemo(() => stripHtml(description), [description]);

  

  // Update height when expanded state or content changes
  const updateHeight = useCallback(() => {
    if (ref.current) {
      const lineHeight = parseFloat(getComputedStyle(ref.current).lineHeight) || 24; 
      setHeight(
        isExpanded ? ref.current.scrollHeight : maxLines * lineHeight
      );
    }
  }, [isExpanded, maxLines]);

  // Handle initial height and window resize
  useLayoutEffect(() => {
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [updateHeight, strippedDescription]);


  // Calculate if expansion is needed
  const lines = strippedDescription
    .split("\n")
    .filter((line) => line.trim() !== "");
  const needsExpansion =
    lines.length > maxLines || strippedDescription.length > 200;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={false}
        animate={{ height }}
        ref={ref}
        transition={{ duration: 0.3, ease: "easeInOut" }} 
        className="overflow-hidden relative"
      >
        <div
          className={`my-4 font-avenir text-[16px] font-[300] leading-relaxed whitespace-pre-line ${isExpanded ? "":"line-clamp-5"}`}
          // Prevent text selection during animation
          style={{ userSelect: isExpanded ? "auto" : "none" }}>
          {strippedDescription || "No description available"}
        </div>

        {/* Fade overlay when collapsed */}
        <AnimatePresence>
          {!isExpanded && needsExpansion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {needsExpansion && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-avenir text-[14px] font-[500] text-blue-600 hover:text-blue-700 mt-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse description" : "Expand description"}
        >
          {isExpanded ? "See Less" : "See More"}
        </motion.button>
      )}
    </div>
  );
}

export function stripHtml(html: string): string {
  if (!html) return "";

  try {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    const blockElements = tmp.querySelectorAll(
      "p, div, br, h1, h2, h3, h4, h5, h6, li"
    );
    blockElements.forEach((el) => {
      if (el.tagName === "BR") {
        el.replaceWith("\n");
      } else {
        el.insertAdjacentText("afterend", "\n");
      }
    });

    return tmp.textContent?.trim() || "";
  } catch (error) {
    console.error("Error stripping HTML:", error);
    return html; // Fallback to raw input
  }
}
import React from "react";
import { motion } from "motion/react";

interface CurvedDividerProps {
  theme?: "dark" | "light";
  direction: "dark-to-light" | "light-to-dark";
  topColorClass: string; // e.g. "bg-zinc-950" or "bg-white"
  bottomColorClass: string; // e.g. "bg-white" or "bg-zinc-950"
  bottomFillHex: string; // e.g. "#ffffff" or "#09090b"
  glowColor?: "emerald" | "teal" | "blue" | "purple";
}

export const CurvedDivider: React.FC<CurvedDividerProps> = ({
  direction,
  topColorClass,
  bottomColorClass,
  bottomFillHex,
  glowColor = "emerald",
}) => {
  // Select gradient colors based on glowColor prop
  const getGradientColors = () => {
    switch (glowColor) {
      case "teal":
        return { start: "#0ea5e9", mid: "#14b8a6", end: "#059669" };
      case "blue":
        return { start: "#3b82f6", mid: "#06b6d4", end: "#10b981" };
      case "purple":
        return { start: "#8b5cf6", mid: "#d946ef", end: "#14b8a6" };
      case "emerald":
      default:
        return { start: "#10b981", mid: "#34d399", end: "#06b6d4" };
    }
  };

  const colors = getGradientColors();
  const gradientId = `curve-grad-${direction}-${glowColor}`;
  const glowFilterId = `curve-glow-${direction}-${glowColor}`;

  // Bezier curve path for organic wave shape matching the user's hand-drawn style
  const pathData =
    direction === "dark-to-light"
      ? "M0,90 C360,115 540,15 720,15 C900,15 1080,115 1440,90"
      : "M0,30 C360,5 540,105 720,105 C900,105 1080,5 1440,30";

  // Filled shape path data (enclosing the bottom area)
  const fillPathData =
    direction === "dark-to-light"
      ? `${pathData} L1440,120 L0,120 Z`
      : `${pathData} L1440,120 L0,120 Z`;

  return (
    <div className={`w-full h-16 sm:h-24 md:h-28 relative overflow-hidden ${topColorClass} select-none pointer-events-none`}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glowing Gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor={colors.mid} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>

          {/* SVG Glow Filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background glow matching the curve path */}
        <path
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="12"
          opacity="0.15"
          filter={`url(#${glowFilterId})`}
        />

        {/* Precise thin glowing center path */}
        <motion.path
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.5"
          filter={`url(#${glowFilterId})`}
        />

        {/* Background color fill for the bottom section */}
        <path
          d={fillPathData}
          fill={bottomFillHex}
          stroke={bottomFillHex}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default CurvedDivider;

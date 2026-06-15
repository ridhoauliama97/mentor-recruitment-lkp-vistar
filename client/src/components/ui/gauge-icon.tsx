import { forwardRef, useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";

const GaugeIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = async () => {
      await animate(
        ".needle",
        { rotate: [0, 45, 0] },
        { duration: 0.6, ease: "easeInOut" },
      );
    };

    const stop = () => {
      animate(".needle", { rotate: 0 }, { duration: 0.2, ease: "easeOut" });
    };

    useImperativeHandle(ref, () => {
      return {
        startAnimation: start,
        stopAnimation: stop,
      };
    });

    return (
      <motion.svg
        ref={scope}
        onHoverStart={start}
        onHoverEnd={stop}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
      >
        <path d="M12 15m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
        <path d="M12 15l-3 -7" />
        <motion.g className="needle" style={{ originX: 12, originY: 15 }}>
          <path d="M12 15l4 -3" />
        </motion.g>
        <path d="M5.5 10.5l2 -1.5" />
        <path d="M18.5 10.5l-2 -1.5" />
      </motion.svg>
    );
  },
);

GaugeIcon.displayName = "GaugeIcon";

export default GaugeIcon;

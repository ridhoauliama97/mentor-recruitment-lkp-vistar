import { forwardRef, useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";

const MessageCircleIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = async () => {
      await animate(
        ".chat-dot",
        { scale: [1, 1.4, 1] },
        { duration: 0.5, ease: "easeInOut" },
      );
    };

    const stop = () => {
      animate(".chat-dot", { scale: 1 }, { duration: 0.2 });
    };

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <motion.circle className="chat-dot" cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
        <motion.circle className="chat-dot" cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
        <motion.circle className="chat-dot" cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      </motion.svg>
    );
  },
);

MessageCircleIcon.displayName = "MessageCircleIcon";

export default MessageCircleIcon;

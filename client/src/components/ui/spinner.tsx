import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 40,
};

const strokeMap = {
  sm: 2,
  md: 2.5,
  lg: 3,
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  const dim = sizeMap[size];
  const sw = strokeMap[size];

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        opacity={0.2}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

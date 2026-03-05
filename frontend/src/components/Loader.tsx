"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  wrapperClassName?: string;
}

const sizes = {
  sm: {
    outer: "w-5 h-5 border-[1.5px]",
    inner: "w-3 h-3 border-[1.5px]",
    wrapper: "h-10",
  },
  md: {
    outer: "w-8 h-8 border-2",
    inner: "w-4 h-4 border-2",
    wrapper: "h-32",
  },
  lg: {
    outer: "w-12 h-12 border-[2.5px]",
    inner: "w-6 h-6 border-[2.5px]",
    wrapper: "h-48",
  },
};

export default function Loader({ size = "md", className = "", wrapperClassName = "" }: LoaderProps) {
  const { outer, inner, wrapper } = sizes[size];

  return (
    <div className={`flex items-center justify-center ${wrapper} ${wrapperClassName}`}>
      <div className={`relative flex items-center justify-center ${className}`}>
        <motion.span
          className={`absolute rounded-full border-border border-t-primary ${outer}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className={`absolute rounded-full border-border border-b-primary ${inner}`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

/** Full-screen loading state */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background/80 backdrop-blur-sm fixed inset-0 z-50">
      <Loader size="lg" />
    </div>
  );
}

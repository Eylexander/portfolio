"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { ring: "w-5 h-5 border-2", wrapper: "h-16" },
  md: { ring: "w-8 h-8 border-2", wrapper: "h-32" },
  lg: { ring: "w-12 h-12 border-[3px]", wrapper: "h-48" },
};

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  const { ring, wrapper } = sizes[size];

  return (
    <div className={`flex items-center justify-center ${wrapper} ${className}`}>
      <motion.span
        className={`inline-block rounded-full border-border border-t-primary ${ring}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/** Full-screen loading state */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

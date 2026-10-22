"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const noopSubscribe = () => () => {};

export default function CustomCursor() {
  // Only show on devices with a fine pointer (like a mouse); false on the server
  const isVisible = useSyncExternalStore(
    noopSubscribe,
    () => window.matchMedia("(pointer: fine)").matches,
    () => false
  );
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Outer ring spring: slower, smooth follow
  const cursorXOuter = useSpring(cursorX, { damping: 25, stiffness: 300, mass: 0.5 });
  const cursorYOuter = useSpring(cursorY, { damping: 25, stiffness: 300, mass: 0.5 });

  useEffect(() => {
    if (!isVisible) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button");

      setIsHovering(!!isClickable);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isVisible, cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className={`fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[10000] flex items-center justify-center transition-colors duration-300 ${
          isHovering
            ? "bg-primary/20 backdrop-blur-[0.5px] border border-primary/40 shadow-lg shadow-primary/20"
            : "border border-primary/50 bg-primary/5"
        }`}
        style={{
          x: cursorXOuter,
          y: cursorYOuter,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.4 : isClicking ? 0.85 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}

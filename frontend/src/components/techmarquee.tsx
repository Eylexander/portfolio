'use client';

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "@/src/i18n/navigation";

type TechStackItem = {
  name: string;
  Icon: React.ComponentType<any>;
  url: string;
};

export default function TechMarquee({ stack }: { stack: TechStackItem[] }) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!marqueeRef.current || !contentRef.current) return;

    // Clear any existing animations first
    gsap.killTweensOf(contentRef.current);

    // Safely cast the content element to HTMLDivElement
    const marqueeContent = contentRef.current as HTMLDivElement;
    const originalItems = Array.from(marqueeContent.children) as HTMLElement[];

    // Calculate the total width of all items
    let totalWidth = 0;
    originalItems.forEach(item => {
      totalWidth += item.offsetWidth;
    });

    // Clone the items for a perfect loop
    originalItems.forEach(item => {
      const clone = item.cloneNode(true) as HTMLElement;
      marqueeContent.appendChild(clone);
    });

    // Set initial position
    gsap.set(marqueeContent, { x: 0 });

    const pixelsPerSecond = 50; // Adjust speed as needed
    const duration = totalWidth / pixelsPerSecond;

    // Create the infinite seamless loop animation
    gsap.to(marqueeContent, {
      x: -totalWidth,
      duration: duration,
      ease: "none", // Linear movement
      repeat: -1,
      onRepeat: function () {
        gsap.set(marqueeContent, { x: 0 });
      }
    });
  }, { scope: marqueeRef, dependencies: [] });

  return (
    <div className="overflow-hidden w-full relative my-8" ref={marqueeRef}>
      <div className="marquee-container">
        <div className="marquee-content" ref={contentRef}>
          {stack.map((item, index) => (
            <Link
              href={item.url}
              key={index}
              className="marquee-item transition-all hover:text-zinc-300"
              target="_blank"
            >
              <item.Icon className="w-12 h-12" />
              <span className="ml-2 text-zinc-400">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
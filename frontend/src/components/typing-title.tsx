'use client'

import React, { useState, useEffect } from "react";

interface TypingTitleProps {
  text: string;
  className?: string;
  typingSpeed?: number;
    initialDelayMs?: number;
    finalDelayMs?: number;
}

export default function TypingTitle({ 
  text, 
  className = "", 
  typingSpeed = 150,
  initialDelayMs = 500,
    finalDelayMs = 1800,
}: TypingTitleProps) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);
    
    const indices = Array.from({ length: text.length }, (_, i) => i);
    let currentIndex = 0;
    let initialDelay: NodeJS.Timeout;

    const typingInterval = setInterval(() => {
        if (currentIndex === 0) {
            initialDelay = setTimeout(() => {
            setDisplayText("_");
        }, initialDelayMs);
        }
        if (currentIndex < indices.length) {
          const newDisplayText = text.substring(0, currentIndex + 1);
          if (currentIndex === indices.length - 1) {
            setDisplayText(newDisplayText);
          }else {
          setDisplayText(newDisplayText + "_");
        }
          currentIndex++;
        } else {
            setDisplayText(text);
          clearInterval(typingInterval);
          setIsComplete(true);
        }
    }, typingSpeed);
    
    return () => {
      clearTimeout(typingInterval);
      if (initialDelay) {
        clearInterval(initialDelay);
      }
    };
  }, [text, typingSpeed]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <h1 
          className={`
            py-3.5 px-0.5 z-10 text-4xl text-transparent bg-white 
            font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text 
            ${isComplete ? 'transition-all duration-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''} 
            ${className}
          `}
        >
          {displayText}
        </h1>
      </div>
    </div>
  );
}

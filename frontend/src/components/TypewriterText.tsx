"use client";

import { useEffect, useState } from "react";

interface TypewriterTextProps {
  words: string[];
  /** Typing speed in ms per character */
  speed?: number;
  /** Pause duration in ms before deleting */
  pause?: number;
  className?: string;
}

export default function TypewriterText({
  words,
  speed = 75,
  pause = 2200,
  className = "",
}: TypewriterTextProps) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;
    const current = words[index % words.length];

    if (waiting) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const next = current.slice(0, text.length + 1);
          setText(next);
          if (next === current) {
            setWaiting(true);
            setTimeout(() => {
              setWaiting(false);
              setIsDeleting(true);
            }, pause);
          }
        } else {
          const next = current.slice(0, text.length - 1);
          setText(next);
          if (next === "") {
            setIsDeleting(false);
            setIndex((i) => (i + 1) % words.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [text, isDeleting, waiting, index, words, speed, pause]);

  return (
    <span className={className}>
      {text}
      <span className="inline-block w-[2px] h-[1em] bg-primary ml-[2px] align-middle animate-[cursor-blink_1s_step-end_infinite]" />
    </span>
  );
}

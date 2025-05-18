"use client";

import useTypewriter from '../hooks/typeWriter';

interface TypewriterProps {
  text: string;
  speed: number;
  className?: string;
}

const Typewriter = ({ text, speed, className }: TypewriterProps) => {
  const displayText = useTypewriter(text, speed);

  return <div className={`${className}`}>{displayText}</div>;
};

export default Typewriter;
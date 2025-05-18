"use client";

import  { useState, useEffect } from 'react';

const useTypewriter = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState('');

  console.log('Page loaded')
  
  useEffect(() => {
    console.log('useEffect triggered')
    setDisplayText(text.substring(0, 1));
    let i = 1;
    
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);
    
    return () => {
      console.log('useEffect finished')
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return displayText;
};

export default useTypewriter;
'use client';

import React from 'react';
import { useTrail, a } from '@react-spring/web';

type Direction = 
  | 'top-left' 
  | 'top' 
  | 'top-right' 
  | 'right' 
  | 'bottom-right' 
  | 'bottom' 
  | 'bottom-left' 
  | 'left'
  | 'center-expand' 
  | 'center-fade';

interface TrailProps {
  children: React.ReactNode;
  open?: boolean;
  delay?: number;
  fromDirection?: Direction;
  distance?: number;
  mass?: number;
  tension?: number;
  friction?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

const Trail: React.FC<TrailProps> = ({ 
  children, 
  open = true, 
  delay = 0,
  fromDirection = 'bottom-left',
  distance = 20,
  mass = 5,
  tension = 2000,
  friction = 200,
  staggerChildren = true,
  staggerDelay = 35,
}) => {
  const items = React.Children.toArray(children);
  
  // Determine the direction vectors based on the fromDirection
  const getDirectionVectors = (direction: Direction): { x: number; y: number } => {
    switch (direction) {
      case 'top-left':
        return { x: -distance, y: -distance };
      case 'top':
        return { x: 0, y: -distance };
      case 'top-right':
        return { x: distance, y: -distance };
      case 'right':
        return { x: distance, y: 0 };
      case 'bottom-right':
        return { x: distance, y: distance };
      case 'bottom':
        return { x: 0, y: distance };
      case 'bottom-left':
        return { x: -distance, y: distance };
      case 'left':
        return { x: -distance, y: 0 };
      case 'center-expand':
        return { x: 0, y: 0 }; // Will use scale instead
      case 'center-fade':
        return { x: 0, y: 0 }; // Will only fade in
      default:
        return { x: -distance, y: distance }; // Default to bottom-left
    }
  };

  const { x: fromX, y: fromY } = getDirectionVectors(fromDirection);

  // Configure trail animation
  const trail = useTrail(items.length, {
    config: { mass, tension, friction },
    opacity: open ? 1 : 0,
    x: open ? 0 : fromX,
    y: open ? 0 : fromY,
    scale: open || fromDirection !== 'center-expand' ? 1 : 0.8,
    from: { 
      opacity: 0, 
      x: fromX, 
      y: fromY, 
      scale: fromDirection === 'center-expand' ? 0.8 : 1
    },
    delay: staggerChildren ? (key: string) => delay + (Number(key) * staggerDelay) : delay,
  });

  return (
    <>
      {trail.map((styles, index) => (
        <a.div key={index} style={styles as any}>
          {items[index]}
        </a.div>
      ))}
    </>
  );
};

export default Trail;
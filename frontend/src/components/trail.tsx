'use client';

import React from 'react';
import { useTrail, animated } from '@react-spring/web';

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
                return { x: 0, y: 0 };
            case 'center-fade':
                return { x: 0, y: 0 };
            default:
                return { x: 0, y: distance };
        }
    };

    const { x: fromX, y: fromY } = getDirectionVectors(fromDirection);

    const trail = useTrail(items.length, {
        config: { mass, tension, friction },
        opacity: 1,
        x: 0,
        y: 0,
        scale: fromDirection !== 'center-expand' ? 1 : 0.8,
        from: {
            opacity: 0,
            x: fromX,
            y: fromY,
            scale: fromDirection === 'center-expand' ? 0.8 : 1
        },
    });

    return (
        <>
            {trail.map((props, i) => (
                <animated.div key={i} style={props} className="item">
                    {items[i]}
                </animated.div>
            ))}
        </>
    );
};

export default Trail;
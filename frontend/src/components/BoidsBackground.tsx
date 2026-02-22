"use client";

import { useEffect, useRef } from "react";

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function BoidsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    // Set initial size
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const boids: Boid[] = [];
    const numBoids = 120;
    const visualRange = 90;
    const minDistance = 28;
    const speedLimit = 3.2;
    const minSpeed = 1.2;

    // Initialize boids spread across the canvas
    for (let i = 0; i < numBoids; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (speedLimit - minSpeed);
        boids.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
        });
    }

    const mouse = { x: -1000, y: -1000 };

    const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    };

    const handleTouchEnd = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    function drawBoid(boid: Boid) {
      if (!ctx) return;
      
      const angle = Math.atan2(boid.vy, boid.vx);
      const size = 4; 

      ctx.save();
      ctx.translate(boid.x, boid.y);
      ctx.rotate(angle);
      
      ctx.beginPath();
      // More aerodynamic shape
      ctx.moveTo(size * 2, 0);
      ctx.lineTo(-size, -size);
      ctx.lineTo(-size, size);
      ctx.closePath();
      
      // Read theme live from DOM — no effect restart needed on toggle
      const isDark = document.documentElement.classList.contains("dark");

      // Dynamic opacity based on speed
      const speed = Math.sqrt(boid.vx ** 2 + boid.vy ** 2);
      const opacity = Math.min(speed / speedLimit, 1) * 0.5 + 0.2;

      ctx.fillStyle = isDark
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(60, 40, 80, ${opacity * 1.4})`;

      // Glow only in dark mode — always reset first to avoid bleed
      ctx.shadowBlur = isDark ? 4 : 0;
      ctx.shadowColor = isDark ? "rgba(200, 180, 255, 0.5)" : "transparent";

      ctx.fill();
      ctx.restore();
    }

    function update() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        for (const boid of boids) {
            let centerX = 0, centerY = 0, numNeighbors = 0;
            let avgVX = 0, avgVY = 0;
            let avoidX = 0, avoidY = 0;

            for (const other of boids) {
                if (other === boid) continue;

                // Shortest toroidal distance
                let dx = other.x - boid.x;
                let dy = other.y - boid.y;
                if (dx >  width  / 2) dx -= width;
                if (dx < -width  / 2) dx += width;
                if (dy >  height / 2) dy -= height;
                if (dy < -height / 2) dy += height;

                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist >= visualRange) continue;

                numNeighbors++;
                centerX += other.x;
                centerY += other.y;
                avgVX   += other.vx;
                avgVY   += other.vy;

                if (dist < minDistance && dist > 0) {
                    // Push away along toroidal direction
                    avoidX -= dx / dist * (minDistance - dist);
                    avoidY -= dy / dist * (minDistance - dist);
                }
            }

            if (numNeighbors > 0) {
                centerX /= numNeighbors;
                centerY /= numNeighbors;
                avgVX   /= numNeighbors;
                avgVY   /= numNeighbors;

                // Cohesion — weakened so the flock doesn't over-contract
                boid.vx += (centerX - boid.x) * 0.002;
                boid.vy += (centerY - boid.y) * 0.002;

                // Alignment
                boid.vx += (avgVX - boid.vx) * 0.04;
                boid.vy += (avgVY - boid.vy) * 0.04;
            }

            // Separation
            boid.vx += avoidX * 0.06;
            boid.vy += avoidY * 0.06;

            // Wander — small random nudge each frame to break lock-in
            boid.vx += (Math.random() - 0.5) * 0.12;
            boid.vy += (Math.random() - 0.5) * 0.12;

            // Mouse repulsion
            const mdx = boid.x - mouse.x;
            const mdy = boid.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 150 && mdist > 0) {
                const force = (150 - mdist) / 150;
                boid.vx += (mdx / mdist) * force * 1.5;
                boid.vy += (mdy / mdist) * force * 1.5;
            }

            // Speed clamp — enforce both min and max
            const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
            if (speed > speedLimit) {
                boid.vx = (boid.vx / speed) * speedLimit;
                boid.vy = (boid.vy / speed) * speedLimit;
            } else if (speed < minSpeed && speed > 0) {
                boid.vx = (boid.vx / speed) * minSpeed;
                boid.vy = (boid.vy / speed) * minSpeed;
            }

            // Move
            boid.x += boid.vx;
            boid.y += boid.vy;

            // Toroidal wrap — boids reappear on the opposite side
            if (boid.x < 0)      boid.x += width;
            if (boid.x > width)  boid.x -= width;
            if (boid.y < 0)      boid.y += height;
            if (boid.y > height) boid.y -= height;

            drawBoid(boid);
        }

        animationFrameId = requestAnimationFrame(update);
    }

    update();

    return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("touchcancel", handleTouchEnd);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-60"
    />
  );
}

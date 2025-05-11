"use client";

import React, { useRef, useEffect, useState } from "react";
import { useMousePosition } from "@/util/mouse";

interface GalaxyProps {
	className?: string;
	quantity?: number;
	staticity?: number;
	ease?: number;
	refresh?: boolean;
	colorful?: boolean;
	
	enableNebula?: boolean;
	nebulaFrequency?: number;
	nebulaColors?: string[];
	nebulaIntensity?: number;
	nebulaFadeDuration?: number;
}

export default function Galaxy({
	className = "",
	quantity = 100,
	staticity = 50,
	ease = 30,
	refresh = false,
	colorful = false,
	
	enableNebula = true,
	nebulaFrequency = 3000,
	nebulaColors,
	nebulaIntensity = 1.0,
	nebulaFadeDuration = 1.0,
}: GalaxyProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const context = useRef<CanvasRenderingContext2D | null>(null);
	const circles = useRef<any[]>([]);
	const nebulousFlashes = useRef<any[]>([]);
	const mousePosition = useMousePosition();
	const mouse = useRef<{ x: number; y: number; prevX: number; prevY: number }>({ 
		x: 0, 
		y: 0,
		prevX: 0,
		prevY: 0
	});
	const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
	const animationFrameId = useRef<number>(0);
	const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

	// Color palette for nebulae
	const defaultNebulaColors = [
		"rgba(64, 0, 255, 0.3)",    // Deep Blue
		"rgba(138, 43, 226, 0.3)",  // Purple
		"rgba(255, 0, 255, 0.3)",   // Pink
		"rgba(0, 255, 127, 0.3)",   // Green
		"rgba(0, 191, 255, 0.3)",   // Cyan
	];
	
	// Use custom colors if provided, otherwise use defaults
	const activeNebulaColors = nebulaColors || defaultNebulaColors;

	// Flash timer setup
	const [flashTimer, setFlashTimer] = useState<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			context.current = canvasRef.current.getContext("2d");
		}
		initCanvas();
		animate();
		
		// Create random nebulous flashes if enabled
		let timer: NodeJS.Timeout | null = null;
		
		if (enableNebula) {
			timer = setInterval(() => {
				// 30% chance of forcing a cluster even for automatic flashes
				const shouldCluster = Math.random() > 0.7;
				
				if (shouldCluster) {
					// For clustered flashes, create a central flash with satellites
					// Generate center-biased coordinates for clusters
					const centerBiasX = (Math.random() + Math.random() + Math.random()) / 3;
					const centerBiasY = (Math.random() + Math.random() + Math.random()) / 3;
					
					// Apply stronger center bias (80%) for clusters
					const x = (0.8 * centerBiasX + 0.2 * Math.random()) * canvasSize.current.w;
					const y = (0.8 * centerBiasY + 0.2 * Math.random()) * canvasSize.current.h;
					
					createNebulousFlash(x, y, true);
				} else {
					// Normal single flash (might still cluster based on internal logic)
					createRandomNebulousFlash();
				}
			}, nebulaFrequency * (0.7 + Math.random() * 0.6)); // Random variance of ±30%
			
			setFlashTimer(timer);
		}
		
		window.addEventListener("resize", initCanvas);

		return () => {
			window.removeEventListener("resize", initCanvas);
			cancelAnimationFrame(animationFrameId.current);
			if (timer) clearInterval(timer);
		};
	}, []);

	useEffect(() => {
		onMouseMove();
	}, [mousePosition.x, mousePosition.y]);

	useEffect(() => {
		initCanvas();
	}, [refresh]);

	const initCanvas = () => {
		resizeCanvas();
		drawParticles();
	};

	const onMouseMove = () => {
		if (canvasRef.current) {
			const rect = canvasRef.current.getBoundingClientRect();
			const { w, h } = canvasSize.current;
			
			// Store previous mouse position for movement calculation
			mouse.current.prevX = mouse.current.x;
			mouse.current.prevY = mouse.current.y;
			
			const x = mousePosition.x - rect.left - w / 2;
			const y = mousePosition.y - rect.top - h / 2;
			
			const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
			if (inside) {
				mouse.current.x = x;
				mouse.current.y = y;
			}
		}
	};

	type Circle = {
		x: number;
		y: number;
		translateX: number;
		translateY: number;
		size: number;
		alpha: number;
		targetAlpha: number;
		dx: number;
		dy: number;
		magnetism: number;
		color: string;
	};

	type NebulousFlash = {
		x: number;
		y: number;
		size: number;
		color: string;
		opacity: number;
		maxOpacity: number;
		growthRate: number;
		fadeRate: number;
		active: boolean;
	};

	const resizeCanvas = () => {
		if (canvasContainerRef.current && canvasRef.current && context.current) {
			circles.current.length = 0;
			canvasSize.current.w = canvasContainerRef.current.offsetWidth;
			canvasSize.current.h = canvasContainerRef.current.offsetHeight;
			canvasRef.current.width = canvasSize.current.w * dpr;
			canvasRef.current.height = canvasSize.current.h * dpr;
			canvasRef.current.style.width = `${canvasSize.current.w}px`;
			canvasRef.current.style.height = `${canvasSize.current.h}px`;
			context.current.scale(dpr, dpr);
		}
	};

	const circleParams = (): Circle => {
		const x = Math.floor(Math.random() * canvasSize.current.w);
		const y = Math.floor(Math.random() * canvasSize.current.h);
		const translateX = 0;
		const translateY = 0;
		const size = Math.floor(Math.random() * 2) + 0.1;
		const alpha = 0;
		const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
		const dx = (Math.random() - 0.5) * 0.2;
		const dy = (Math.random() - 0.5) * 0.2;
		const magnetism = 0.1 + Math.random() * 4;
		const color = colorful
			? `hsl(${Math.random() * 360}, 100%, 70%)`
			: "rgba(255, 255, 255, 1)";
		return {
			x,
			y,
			translateX,
			translateY,
			size,
			alpha,
			targetAlpha,
			dx,
			dy,
			magnetism,
			color,
		};
	};

	const drawCircle = (circle: Circle, update = false) => {
		if (context.current) {
			const { x, y, translateX, translateY, size, alpha, color } = circle;
			context.current.translate(translateX, translateY);
			context.current.beginPath();
			context.current.arc(x, y, size, 0, 2 * Math.PI);
			context.current.fillStyle = colorful
					? color.replace('hsl', 'hsla').replace(')', `, ${alpha})`) // Fix for applying alpha to HSL colors
					: `rgba(255, 255, 255, ${alpha})`;
			context.current.fill();
			context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

			if (!update) {
				circles.current.push(circle);
			}
		}
	};

	const clearContext = () => {
		if (context.current) {
			context.current.clearRect(
				0,
				0,
				canvasSize.current.w,
				canvasSize.current.h,
			);
		}
	};

	const drawParticles = () => {
		clearContext();
		const particleCount = quantity;
		for (let i = 0; i < particleCount; i++) {
			const circle = circleParams();
			drawCircle(circle);
		}
	};

	const createNebulousFlash = (x: number, y: number, isClustered: boolean = false, parentColor?: string) => {
		if (!enableNebula) return; // Skip if nebula effects are disabled
		
		// Find an inactive flash or create a new one
		const existingInactiveIndex = nebulousFlashes.current.findIndex(
			flash => !flash.active
		);
		
		// If part of a cluster, vary the size more
		const sizeVariance = isClustered ? 
			Math.random() * 70 + 30 : // 30-100 for clusters (more varied sizes)
			Math.random() * 100 + 50; // 50-150 for individual flashes
		
		// Calculate opacity based on size (smaller flashes can be more opaque)
		const opacityFactor = isClustered ? 
			1.1 + (0.3 * Math.random()) : // Higher opacity for clusters
			1.0;
		
		// Color selection - if it's part of a cluster, use parent color or create a very similar one
		let color;
		if (isClustered && parentColor) {
			// Use the parent color with very slight variation
			// Extract the base color components from rgba format
			const rgbaMatch = parentColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
			if (rgbaMatch) {
				const r = parseInt(rgbaMatch[1], 10);
				const g = parseInt(rgbaMatch[2], 10);
				const b = parseInt(rgbaMatch[3], 10);
				const a = parseFloat(rgbaMatch[4]);
				
				// Create a very slight variation (±5%) to the color while keeping alpha the same
				const variation = 0.05; // 5% max variation
				const newR = Math.max(0, Math.min(255, r + r * (Math.random() * variation * 2 - variation)));
				const newG = Math.max(0, Math.min(255, g + g * (Math.random() * variation * 2 - variation)));
				const newB = Math.max(0, Math.min(255, b + b * (Math.random() * variation * 2 - variation)));
				
				color = `rgba(${Math.floor(newR)}, ${Math.floor(newG)}, ${Math.floor(newB)}, ${a})`;
			} else {
				// Fallback if regex fails
				color = parentColor;
			}
		} else {
			// Main flash gets a random color from the palette
			color = activeNebulaColors[Math.floor(Math.random() * activeNebulaColors.length)];
		}
		
		const flash: NebulousFlash = {
			x,
			y,
			size: sizeVariance,
			color: color,
			opacity: 0,
			maxOpacity: (Math.random() * 0.4 + 0.1) * nebulaIntensity * opacityFactor,
			growthRate: Math.random() * 3 + 1,
			fadeRate: (Math.random() * 0.008 + 0.004) / nebulaFadeDuration, // Adjustable fadeRate to control how long nebulas stay visible
			active: true,
		};
		
		if (existingInactiveIndex >= 0) {
			nebulousFlashes.current[existingInactiveIndex] = flash;
		} else {
			nebulousFlashes.current.push(flash);
		}
		
		// If not already part of cluster, potentially create a cluster around this flash
		if (!isClustered && Math.random() > 0.6) { // 40% chance of creating a cluster
			const clusterSize = Math.floor(Math.random() * 4) + 2; // 2-5 additional flashes in cluster
			
			for (let i = 0; i < clusterSize; i++) {
				// Create satellite flashes around the main one with some random offset
				const angle = Math.random() * Math.PI * 2; // Random angle around the circle
				const distance = Math.random() * 120 + 30; // Random distance 30-150px from center
				
				const clusterX = x + Math.cos(angle) * distance;
				const clusterY = y + Math.sin(angle) * distance;
				
				// Only create if within canvas
				if (clusterX > 0 && clusterX < canvasSize.current.w && 
					clusterY > 0 && clusterY < canvasSize.current.h) {
					// Pass true to indicate this is part of a cluster and pass the parent color
					setTimeout(() => {
						createNebulousFlash(clusterX, clusterY, true, flash.color);
					}, Math.random() * 500); // Stagger the appearance for a more natural effect
				}
			}
		}
	};

	const createRandomNebulousFlash = () => {
		// Use gaussian-like distribution to concentrate flashes more toward the center
		// First generate uniform random values
		const rx = Math.random();
		const ry = Math.random();
		
		// Transform to center-weighted distribution (simple approximation of bell curve)
		// Mix uniform and center-biased distribution (75% center-biased, 25% uniform)
		const centerBiasFactor = 0.75;
		
		// Create center-biased values using avg of multiple random numbers
		const centerBiasX = (Math.random() + Math.random() + Math.random()) / 3;
		const centerBiasY = (Math.random() + Math.random() + Math.random()) / 3;
		
		// Combine uniform and center-biased
		const x = (centerBiasFactor * centerBiasX + (1 - centerBiasFactor) * rx) * canvasSize.current.w;
		const y = (centerBiasFactor * centerBiasY + (1 - centerBiasFactor) * ry) * canvasSize.current.h;
		
		createNebulousFlash(x, y, false); // Not clustered by default
	};

	const drawNebulousFlash = (flash: NebulousFlash) => {
		if (!context.current || !flash.active) return;
		
		// Create gradient for the nebulous glow
		const gradient = context.current.createRadialGradient(
			flash.x, flash.y, 0,
			flash.x, flash.y, flash.size
		);
		
		// Extract the base color from rgba
		const baseColor = flash.color.substring(0, flash.color.lastIndexOf(','));
		
		gradient.addColorStop(0, baseColor + `, ${flash.opacity})`);
		gradient.addColorStop(0.7, baseColor + `, ${flash.opacity * 0.3})`);
		gradient.addColorStop(1, baseColor + `, 0)`);
		
		context.current.beginPath();
		context.current.fillStyle = gradient;
		context.current.arc(flash.x, flash.y, flash.size, 0, Math.PI * 2);
		context.current.fill();
	};

	const remapValue = (
		value: number,
		start1: number,
		end1: number,
		start2: number,
		end2: number,
	): number => {
		const remapped =
			((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
		return remapped > 0 ? remapped : 0;
	};

	const animate = () => {
		clearContext();
		
		// Update and draw nebulous flashes
		nebulousFlashes.current.forEach((flash, i) => {
			if (!flash.active) return;
			
			if (flash.opacity < flash.maxOpacity && flash.size < 150) {
				flash.opacity += 0.01;
				flash.size += flash.growthRate;
			} else {
				flash.opacity -= flash.fadeRate;
				
				// When completely faded, mark as inactive
				if (flash.opacity <= 0) {
					flash.active = false;
				}
			}
			
			drawNebulousFlash(flash);
		});
		
		circles.current.forEach((circle: Circle, i: number) => {
			// Handle the alpha value
			const edge = [
				circle.x + circle.translateX - circle.size, // distance from left edge
				canvasSize.current.w - circle.x - circle.translateX - circle.size, // distance from right edge
				circle.y + circle.translateY - circle.size, // distance from top edge
				canvasSize.current.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
			];
			const closestEdge = edge.reduce((a, b) => Math.min(a, b));
			const remapClosestEdge = parseFloat(
				remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
			);
			if (remapClosestEdge > 1) {
				circle.alpha += 0.02;
				if (circle.alpha > circle.targetAlpha) {
					circle.alpha = circle.targetAlpha;
				}
			} else {
				circle.alpha = circle.targetAlpha * remapClosestEdge;
			}
			circle.x += circle.dx;
			circle.y += circle.dy;
			circle.translateX +=
				(mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
				ease;
			circle.translateY +=
				(mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
				ease;
			// circle gets out of the canvas
			if (
				circle.x < -circle.size ||
				circle.x > canvasSize.current.w + circle.size ||
				circle.y < -circle.size ||
				circle.y > canvasSize.current.h + circle.size
			) {
				// remove the circle from the array
				circles.current.splice(i, 1);
				// create a new circle
				const newCircle = circleParams();
				drawCircle(newCircle);
				// update the circle position
			} else {
				drawCircle(
					{
						...circle,
						x: circle.x,
						y: circle.y,
						translateX: circle.translateX,
						translateY: circle.translateY,
						alpha: circle.alpha,
						color: circle.color,
					},
					true,
				);
			}
		});
		
		animationFrameId.current = window.requestAnimationFrame(animate);
	};

	return (
		<div className={className} ref={canvasContainerRef} aria-hidden="true">
			<canvas ref={canvasRef} />
		</div>
	);
}

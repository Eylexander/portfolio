const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx}",
		"./mdx-components.tsx",
		"content/**/*.mdx",
	],

	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						"code::before": {
							content: '""',
						},
						"code::after": {
							content: '""',
						},
					},
				},
				quoteless: {
					css: {
						"blockquote p:first-of-type::before": { content: "none" },
						"blockquote p:first-of-type::after": { content: "none" },
					},
				},
			},
			fontFamily: {
				sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
				display: ["var(--font-calsans)"],
			},
			backgroundImage: {
				"gradient-radial":
					"radial-gradient(50% 50% at 50% 50%, var(--tw-gradient-stops))",
			},
			animation: {
				"fade-in": "fade-in 2s ease-in-out forwards",
				"title-alt": "text-outline 4s ease-out forwards, title-alt 2s ease-out forwards",
				"fade-left": "fade-left 3s ease-in-out forwards",
				"fade-right": "fade-right 3s ease-in-out forwards",
				"title-reveal": "title-reveal 1.5s ease-out forwards var(--delay, 0s)",
				"typing": "typing 3s steps(10, end) forwards, blink 1s step-end infinite",
				"typing-complete": "cursor-disappear 0.5s ease-in-out forwards 3s",
				"blink": "blink 1s step-end infinite",
			},
			keyframes: {
				"fade-in": {
					"0%": {
						opacity: "0%",
					},
					"75%": {
						opacity: "0%",
					},
					"100%": {
						opacity: "100%",
					},
				},
				"fade-left": {
					"0%": {
						transform: "translateX(100%)",
						opacity: "0%",
					},

					"30%": {
						transform: "translateX(0%)",
						opacity: "100%",
					},
					"100%": {
						opacity: "0%",
					},
				},
				"fade-right": {
					"0%": {
						transform: "translateX(-100%)",
						opacity: "0%",
					},

					"30%": {
						transform: "translateX(0%)",
						opacity: "100%",
					},
					"100%": {
						opacity: "0%",
					},
				},
				"title-alt": {
					"0%": {
						"line-height": "0%",
						"letter-spacing": "0.4em",
						opacity: "0",
					},
					"25%": {
						"line-height": "0%",
						opacity: "0%",
					},
					"80%": {
						opacity: "100%",
					},

					"100%": {
						"line-height": "100%",
						opacity: "100%",
					},
				},
				"text-outline": {
					"0%": {
						"-webkit-text-stroke": "1px rgba(253,251,212,0.3)",
					},
					"100%": {
						"-webkit-text-stroke": "0px rgba(253,251,212,0.3)",
						},
				},
				"title-reveal": {
					"0%": {
						transform: "scale(0.5)",
						filter: "blur(4px)",
						opacity: "0",
					},
					"1%": {
						opacity: "0",
					},
					"50%": {
						opacity: "0.5",
						filter: "blur(2px)",
					},
					"100%": {
						transform: "scale(1)",
						filter: "blur(0)",
						opacity: "1",
					},
				},
				"typing": {
					"0%": {
						width: "0",
					},
					"100%": {
						width: "100%",
					},
				},
				"blink": {
					"0%, 100%": {
						opacity: 1,
						textShadow: "0 0 5px rgba(255,255,255,0.8)",
					},
					"50%": {
						opacity: 0.2,
						textShadow: "0 0 2px rgba(255,255,255,0.4)",
					},
				},
				"cursor-disappear": {
					"0%": {
						"border-right": "2px solid white",
					},
					"100%": {
						"border-right": "2px solid transparent",
					},
				},
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("tailwindcss-debug-screens"),
	],
};

import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0d12",
                surface: "#111827",
                "surface-2": "#1a2234",
                border: "#1f2937",
                accent: "#00d084",
                "accent-dim": "#00a86b",
                positive: "#22c55e",
                negative: "#ef4444",
                "text-primary": "#f9fafb",
                "text-muted": "#6b7280",
                "text-faint": "#374151",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.4s ease-out forwards",
                "slide-up": "slide-up 0.5s ease-out forwards",
                "slide-up-delay": "slide-up 0.5s ease-out 0.1s forwards",
                "slide-up-delay-2": "slide-up 0.5s ease-out 0.2s forwards",
                shimmer: "shimmer 1.5s infinite linear",
            },
            backgroundImage: {
                "chart-gradient":
                    "linear-gradient(180deg, rgba(0,208,132,0.3) 0%, rgba(0,208,132,0) 100%)",
            },
        },
    },
    plugins: [],
};

export default config;

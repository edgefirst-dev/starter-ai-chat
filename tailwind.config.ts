import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
	content: ["./app/**/*.{ts,tsx}"],
	darkMode: ["selector", "class"],
	theme: {
		colors: {
			transparent: colors.transparent,
			inherit: colors.inherit,
			current: colors.current,
			inline: "var(--color-inline)",
			black: colors.black,
			white: colors.white,
			accent: colors.green,
			neutral: colors.neutral,
			success: colors.green,
			warning: colors.amber,
			danger: colors.red,
			info: colors.cyan,
		},
		extend: {
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

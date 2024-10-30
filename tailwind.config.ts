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
			colors: {},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

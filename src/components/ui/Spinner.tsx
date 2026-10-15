/* === Imports ================================================================================== */
/* --- Types --- */
import type { CSSProperties } from "react"

/* === Contracts ================================================================================ */
/**
 * Properties for the {@link Spinner} component.
 *
 * @property size - Diameter of the spinner circle in pixels.
 * @property overlayStrength - Strength of the dark overlay behind the spinner.
 * @property mode - Rendering modes.
 *                  "container" fills nearest positioned parent,
 *                  "fullscreen" fills entire viewport.
 * @property className - Additional class names for customization.
 */
export interface SpinnerProps {
	size?: number
	overlayStrength?: "none" | "light" | "medium" | "hard"
	mode?: "container" | "fullscreen"
	className?: string
}

/* === Main Component =========================================================================== */
/**
 * A reusable loading indicator with optional overlay.
 * Supports container-bound and full-screen modes.
 * Fully accessible and safe for concurrent rendering.
 *
 * @component
 * @param props - See {@link SpinnerProps} for details.
 * @returns {React.ReactElement} Loading spinner.
 */
export default function Spinner({
	size = 40, // 40px size by default.
	overlayStrength = "medium", // Medium overlay opacity level by default.
	mode = "container", // Fills nearest positioned parent by default.
	className = "", // Blank by default.
}: SpinnerProps): React.ReactElement {
	/* --- States ------------------------------------------------------------------------------- */
	/**
	 * Maps overlay strength to Tailwind opacity utility classes.
	 * Ensures compile-time exhaustiveness via union type.
	 */
	const overlayOpacityClass = {
		none: "bg-opacity-0",
		light: "bg-opacity-30",
		medium: "bg-opacity-60",
		hard: "bg-opacity-90",
	}[overlayStrength]

	/**
	 * Determines positioning strategy based on rendering mode.
	 *
	 * NOTE(DESIGN):
	 * Using fixed for fullscreen ensures it covers the entire viewport regardless of parent styles,
	 * while absolute allows it to be contained within a specific section of the UI when needed.
	 * Navbar has z-50, so z-60 ensures the spinner overlay appears above it in fullscreen mode
	 * while z-40 keeps it below it in container mode.
	 */
	const positioningClass =
		mode === "fullscreen" ? "fixed z-60" : "absolute z-40"

	// Inline styles for the spinner size with strict types.
	const spinnerStyle: CSSProperties = {
		width: `${size}px`,
		height: `${size}px`,
	}

	/* --- Render ------------------------------------------------------------------------------- */
	return (
		<div
			role="status"
			aria-live="polite" // Indicates a live loading region.
			className={`
                ${positioningClass} inset-0
                flex items-center justify-center
                bg-black ${overlayOpacityClass}
                ${className}
            `}
		>
			<div
				className="animate-spin rounded-full border-8 border-white border-t-transparent"
				style={spinnerStyle}
				aria-label="Loading"
			></div>
		</div>
	)
}

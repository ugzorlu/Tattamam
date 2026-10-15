/* =============================================================================
              Instruction Mode Toggle for Recipe Detail Page
============================================================================= */
/**
 * @fileoverview
 * Segmented control for switching between recipe instruction display modes.
 *
 * PURPOSE:
 * Allows users to choose how recipe instructions are presented — traditional
 * narrative form, a mixed approach, or precise measurements only.
 *
 * NOTE(ARCHITECTURE):
 * Client component because of the managing the animated slider position
 * and active mode state.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useRef, useEffect, useCallback } from "react"

/* === Contracts ============================================================ */
/** The three instruction display modes from the Stitch design. */
export type InstructionMode = "traditional" | "mixed" | "precise"

interface ModeToggleProps {
	/** Callback fired when the user selects a different mode. */
	readonly onModeChange: (mode: InstructionMode) => void
	/** Currently selected instruction mode. */
	readonly mode: InstructionMode
}

/* === Constants ============================================================ */
const MODES: readonly {
	readonly key: InstructionMode
	readonly label: string
}[] = [
	{ key: "traditional", label: "Hızlı" },
	{ key: "mixed", label: "Detaylı" },
	{ key: "precise", label: "Tam Ölçülü" },
] as const

/* === Main Component ======================================================= */
export default function ModeToggle({ onModeChange, mode }: ModeToggleProps) {
	/* ─── References ─────────────────────────────────────────────────────── */
	const containerRef = useRef<HTMLDivElement>(null)

	/* ─── States ─────────────────────────────────────────────────────────── */
	const activeIndex = MODES.findIndex(({ key }) => key === mode)
	const [sliderStyle, setSliderStyle] = useState<{
		width: number
		left: number
	}>({ width: 80, left: 96 })

	/* ─── Helpers ────────────────────────────────────────────────────────── */
	/**
	 * Measures the active button element and positions the slider pill over it.
	 */
	const updateSliderPosition = useCallback(() => {
		if (!containerRef.current) return

		const buttons =
			containerRef.current.querySelectorAll<HTMLButtonElement>(
				"[data-mode-btn]",
			)
		const activeButton = buttons[activeIndex]
		if (!activeButton) return

		const containerRect = containerRef.current.getBoundingClientRect()
		const buttonRect = activeButton.getBoundingClientRect()

		setSliderStyle({
			width: buttonRect.width,
			left: buttonRect.left - containerRect.left,
		})
	}, [activeIndex])

	/* ─── Effects ────────────────────────────────────────────────────────── */
	/* Recalculate slider position when activeIndex changes or on mount. */
	useEffect(() => {
		updateSliderPosition()
	}, [updateSliderPosition])

	/* Recalculate on window resize for responsive accuracy. */
	useEffect(() => {
		window.addEventListener("resize", updateSliderPosition)
		return () => window.removeEventListener("resize", updateSliderPosition)
	}, [updateSliderPosition])

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const modePickerTextClass = [
		"text-primary text-center tracking-widest font-bold",
		"text-headline-sm lg:text-headline-md",
		"font-headline-sm lg:font-headline-md",
		"uppercase animate-pulse",
	].join(" ")

	const modeContainerClass = [
		"flex relative w-fit p-3",
		"border border-outline-variant/30 rounded-full",
		"bg-surface-container-lowest",
	].join(" ")

	const modeButtonContainerClass = [
		"absolute top-1 bottom-1 bg-primary rounded-full",
		"transition-all duration-300",
	].join(" ")

	const modeLabelClass = [
		"relative z-10 px-8 py-2 text-label-md font-label-md",
		"transition-colors duration-200 cursor-pointer",
	].join(" ")

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className="flex flex-col items-center gap-2 w-full md:w-auto">
			<h2 className={modePickerTextClass}>Tarzınızı seçin</h2>
			<h2 className={modePickerTextClass}>Anlatımı değiştirin</h2>
			<div ref={containerRef} className={modeContainerClass}>
				{/* Animated slider pill */}
				<div
					className={modeButtonContainerClass}
					style={{
						width: `${sliderStyle.width}px`,
						left: `${sliderStyle.left}px`,
					}}
				/>

				{/* Mode buttons */}
				{MODES.map((mode, index) => (
					<button
						key={mode.key}
						className={`${modeLabelClass} ${
							activeIndex === index
								? "text-white"
								: "text-on-surface-variant"
						}`}
						data-mode-btn
						type="button"
						onClick={() => onModeChange(mode.key)}
					>
						{mode.label}
					</button>
				))}
			</div>
		</div>
	)
}

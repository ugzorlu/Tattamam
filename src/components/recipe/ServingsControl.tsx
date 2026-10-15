/* =============================================================================
                     Recipe Detail — Servings Control
============================================================================= */
/**
 * @fileoverview
 * Interactive serving size control with a tactile slider and dropdown select.
 *
 * PURPOSE:
 * Allows users to adjust the number of servings for a recipe. The selected
 * value drives ingredient quantity scaling in the parent component.
 *
 * NOTE(DESIGN):
 * Implements the "Customization Sliders" component from DESIGN.md — a thick,
 * tactile slider track in Oatmeal with a Coral "thumb" handle. The slider
 * and dropdown are synced bidirectionally.
 *
 * NOTE(ARCHITECTURE):
 * This is a client component (`'use client'`) because it manages interactive
 * state (slider position, dropdown selection). It communicates the current
 * serving count upward via the `onServingsChange` callback.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useCallback } from "react"

/* --- Types --- */
import { type ChangeEvent, type SVGProps } from "react"

/* === Contracts ============================================================ */
interface ServingsControlProps {
	/** Initial serving count coming from the recipe DTO. */
	readonly initialServings: number
	/** Notifies parent when user changes the serving count. */
	readonly onServingsChange: (servings: number) => void
}

/* === Constants ============================================================ */
const SERVING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

/** Range input boundaries. */
const SLIDER_MIN = 1
const SLIDER_MAX = 7

type FaceLevel = "subtle" | "visible" | "laughing"

const FACE_MOUTHS: Readonly<Record<FaceLevel, string>> = {
	subtle: "M8.5 14.25c1.1 1.1 2.1 1.55 3.5 1.55s2.4-.45 3.5-1.55",
	visible: "M7.75 13.75c1.35 2.15 2.85 3.05 4.25 3.05s2.9-.9 4.25-3.05",
	laughing:
		"M7.25 13.25c1.45 3.15 3.2 4.35 4.75 4.35s3.3-1.2 4.75-4.35" +
		"c-2.85.8-6.65.8-9.5 0Z",
}

/* === Helpers ============================================================== */
/**
 * Converts the selected serving count into one shared face expression.
 *
 * NOTE(ARCHITECTURE):
 * Pure O(1) mapping. Keeps the client component fast without memoization,
 * while every rendered face shares the same level and only the existing CSS
 * handles active-state animation.
 */
function getFaceLevel(servings: number): FaceLevel {
	if (servings <= 1) return "subtle"
	if (servings === 2) return "visible"
	return "laughing"
}

/* === Subcomponents ======================================================== */

/**
 * Compact local SVG face icon with three expressions for the serving scale.
 * Keeping the paths local avoids a font request and extra network work.
 *
 * NOTE(ARCHITECTURE):
 * Static SVG markup is bundled with this client component.
 * Avoids runtime font loading, icon-library resolution, and image requests.
 */
function ServingFace({
	level,
	...props
}: SVGProps<SVGSVGElement> & { readonly level: FaceLevel }) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="12" cy="12" r="8.5" stroke="currentColor" />
			<circle cx="9" cy="10" fill="currentColor" r=".75" />
			<circle cx="15" cy="10" fill="currentColor" r=".75" />
			<path
				d={FACE_MOUTHS[level]}
				fill={level === "laughing" ? "currentColor" : "none"}
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="1.5"
			/>
		</svg>
	)
}

/**
 * Reusable decorative ornamental wave used as a section divider
 * in the Stitch design.
 */
function WaveDivider({ flipped = false }: { readonly flipped?: boolean }) {
	const base = "w-12 h-4 opacity-60 flex-shrink-0"
	const svgClass = base + (flipped ? " scale-x-[-1]" : "")

	return (
		<svg
			className={svgClass}
			fill="none"
			viewBox="0 0 100 20"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M0 10C20 10 30 2 50 10C70 18 80 10 100 10"
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="2"
			/>
		</svg>
	)
}

/* === Main Component ======================================================= */
export default function ServingsControl({
	initialServings,
	onServingsChange,
}: ServingsControlProps) {
	// Local state for the currently selected serving count.
	const [servings, setServings] = useState<number>(initialServings)

	// All three slots intentionally use the same expression for this tier.
	const faceLevel = getFaceLevel(servings)

	/* --- Visual Feedback --- */
	/**
	 * Computes the slider track fill percentage for the gradient background.
	 *
	 * NOTE(ARCHITECTURE):
	 * Ensures visual feedback even at minimum value (1 serving)
	 * by applying a minimum threshold. Maps the serving range [1–8] to a fill
	 * gradient from Coral (#a43c12) to Oatmeal (#efefd7).
	 *
	 * @param value - The current serving count (1–8).
	 * @returns CSS linear-gradient string positioned at the calculated fill %.
	 */
	const getSliderBackground = useCallback((value: number): string => {
		const percent = Math.max(
			12, // Minimum fill percentage to ensure visual feedback at value 1
			((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100,
		)

		return `linear-gradient(to right, #a43c12 ${percent}%, #efefd7 ${percent}%)`
	}, [])

	/* --- State Management --- */
	/**
	 * Centralized serving count update handler.
	 *
	 * NOTE(ARCHITECTURE):
	 * Atomically updates internal state and triggers parent callback to
	 * maintain data consistency. All input events (slider, select) route
	 * through this function for single source of truth.
	 *
	 * @param value - The new serving count to apply (1–8).
	 */
	const updateServings = useCallback(
		(value: number) => {
			setServings(value)
			onServingsChange(value)
		},
		[onServingsChange],
	)

	/* ─── Event Handlers ─────────────────────────────────────────────────── */
	/**
	 * Handles slider input changes and syncs to shared state.
	 * Coerces input value to a number & updates through centralized handler.
	 *
	 * @param e - The HTML input change event from the range slider.
	 */
	const handleSliderChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			updateServings(Number(e.target.value))
		},
		[updateServings],
	)

	/**
	 * Handles dropdown select changes and syncs to shared state.
	 * Validates input to prevent accidental empty values before updating.
	 *
	 * @param e - The HTML select change event from serving options dropdown.
	 */
	const handleSelectChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			if (e.target.value) updateServings(Number(e.target.value))
		},
		[updateServings],
	)

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const headerContainerClass = [
		"flex items-center justify-center gap-4 mb-4 text-primary",
	].join(" ")

	const headerTextClass =
		"text-label-sm font-label-sm uppercase font-bold tracking-wider"

	const guideClass =
		"text-center text-on-surface-variant font-label-sm text-label-sm mb-4"

	const servingsContainerClass = [
		"w-8 shrink-0",
		"text-center font-headline-md text-headline-md text-primary",
	].join(" ")

	const extraPlusClass = "text-label-sm font-label-sm self-center"

	const dropdownClass = [
		"w-full bg-surface border border-outline px-4 py-2",
		"rounded-lg text-body-md transition-all",
		"focus:ring-2 focus:ring-primary focus:border-transparent",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className="mb-2 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
			{/* Header with decorative waves and section title */}
			<div className={headerContainerClass}>
				<WaveDivider />
				<span className={headerTextClass}>PORSİYON SAYISI</span>
				<WaveDivider flipped />
			</div>

			<p className={guideClass}>sürükleyerek değiştirin</p>

			{/* Slider row: input, numeric value, and icons */}
			<div className="flex items-center gap-2 mb-4">
				<div className="flex-1 min-w-0">
					<input
						aria-label="Porsiyon sayısı"
						className="custom-slider"
						id="servingsSlider"
						max={SLIDER_MAX}
						min={SLIDER_MIN}
						step={1}
						style={{ background: getSliderBackground(servings) }}
						type="range"
						value={servings}
						onChange={handleSliderChange}
					/>
				</div>
				<span className={servingsContainerClass}>{servings}</span>
				<div className="flex gap-1 text-primary w-24 shrink-0">
					{Array.from({ length: 3 }).map((_, i) => {
						const active = i < servings

						return (
							<span
								key={i}
								className={"icon"}
								style={{ "--i": i } as React.CSSProperties}
								data-active={active}
							>
								<ServingFace
									className="size-6 text-secondary"
									level={faceLevel}
								/>
							</span>
						)
					})}

					{servings > 3 && <span className={extraPlusClass}>+</span>}
				</div>
			</div>

			<p className={guideClass}>veya listeden seçin</p>

			{/* Dropdown select alternative for precise counts */}
			<select
				aria-label="Porsiyon seçimi"
				className={dropdownClass}
				id="servingsSelect"
				value={servings}
				onChange={handleSelectChange}
			>
				<option value="">Özel Porsiyon Seçin</option>
				{SERVING_OPTIONS.map((n) => (
					<option key={n} value={n}>
						{n} Porsiyon
					</option>
				))}
			</select>
		</div>
	)
}

/* =============================================================================
                 	 Recipe Detail — Ingredients Checklist
============================================================================= */
/**
 * @fileoverview
 * Interactive ingredient checklist with quantity scaling and section grouping.
 *
 * PURPOSE:
 * Renders the ingredient list for a recipe, grouped by `sectionName` with
 * decorative wave dividers. Quantities dynamically scale based on the
 * current serving size relative to the recipe's base serving size.
 *
 * NOTE(ARCHITECTURE):
 * This is a client component (`'use client'`) because it manages checkbox
 * toggle state. Quantity scaling is computed on the fly from the
 * `servingsMultiplier` prop to avoid unnecessary re-renders.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useMemo, useCallback } from "react"

/* --- Types --- */
import type { RecipeIngredientDto } from "@/lib/dto"
import type { InstructionMode } from "@/components/recipe/ModeToggle"

/* === Contracts ============================================================ */
interface IngredientsChecklistProps {
	/** Full ingredient list from the recipe DTO. */
	readonly ingredients: readonly RecipeIngredientDto[]
	/** Ratio of current servings to base (e.g. 2 servings / 4 base = 0.5). */
	readonly servingsMultiplier: number
	/** The current instruction mode. */
	readonly mode: InstructionMode
}

/* === Helpers ============================================================== */
/**
 * Formats a scaled quantity for precise display with numeric precision.
 *
 * Multiplies a base quantity by a scaling factor, rounds to 2 decimal places
 * to avoid floating-point display artifacts (e.g. "1.5000000001" → "1.5"),
 * and strips unnecessary trailing zeros.
 *
 * @param baseQuantity - The original quantity value from the recipe (e.g., 2.5)
 * @param multiplier - The serving adjustment factor (e.g., 0.5 for half recipe)
 * @returns Formatted string suitable for precise ingredient measurements
 *
 * @example
 * formatExactQuantity(2.5, 0.5) // "1.25"
 * formatExactQuantity(3, 2) // "6"
 */
function formatExactQuantity(baseQuantity: number, multiplier: number): string {
	const scaled = baseQuantity * multiplier

	/* Round to 2 decimal places to avoid IEEE 754 noise. */
	const rounded = Math.round(scaled * 1000) / 1000

	/* Remove unnecessary trailing zeros. */
	return rounded.toFixed(3).replace(/\.?0+$/, "")
	// if (Number.isInteger(rounded)) return rounded.toString()
	// return rounded.toFixed(rounded < 10 ? 1 : 0)
}

/**
 * Formats a scaled quantity into Turkish fraction words for quick measurements.
 *
 * Converts quantities into Turkish fraction terminology.
 * Separates integer and fractional parts, translates fractions to Turkish
 * words (e.g., 0.25 → "Çeyrek"), and combines them. Unmatched fractions are
 * rounded to the nearest equivalent.
 *
 * @param baseQuantity - The original quantity value from the recipe (e.g., 0.5)
 * @param multiplier - The serving adjustment factor (e.g., 2 for double recipe)
 * @returns Formatted string with Turkish fraction terminology.
 *
 * @example
 * formatTraditionalQuantity(2, 0.5) // "Yarım" (0.5 as integer 1)
 * formatTraditionalQuantity(3, 1.5) // "Dört buçuk" (3 * 1.5 = 4.5)
 * formatTraditionalQuantity(1, 1.25) // "Bir tam ve bir çeyrek"
 */
function formatTraditionalQuantity(
	baseQuantity: number,
	multiplier: number,
): string {
	const scaled = baseQuantity * multiplier
	const rounded = Math.round(scaled * 100) / 100
	const integer = Math.floor(rounded)
	const fractional = Math.round((rounded - integer) * 100) / 100

	// Map fractional parts to Turkish words
	const fractionMap: Record<number, string> = {
		0: "",
		0.25: "Çeyrek",
		0.5: "Yarım",
		0.75: "Üç çeyrek",
	}

	// Find the closest fraction (with rounding to nearest 0.25)
	const closestFraction = Math.round(fractional * 4) / 4
	const fractionWord = fractionMap[closestFraction] ?? ""

	// Build the final string
	if (integer === 0) {
		return fractionWord || "Sıfır"
	}

	if (fractionWord === "") {
		// Only integer part: "Bir", "İki", etc.
		const numberWords: Record<number, string> = {
			1: "Bir",
			2: "İki",
			3: "Üç",
			4: "Dört",
			5: "Beş",
			6: "Altı",
			7: "Yedi",
			8: "Sekiz",
			9: "Dokuz",
			10: "On",
			12: "On iki",
			16: "On altı",
			20: "Yirmi",
			24: "Yirmi dört",
			30: "Otuz",
			40: "Kırk",
		}
		return numberWords[integer] ?? integer.toString()
	}

	if (closestFraction === 0.5) {
		// Special case for "Buçuk" (half): "Bir buçuk", "İki buçuk"
		const integerWords: Record<number, string> = {
			1: "Bir",
			2: "İki",
			3: "Üç",
			4: "Dört",
			5: "Beş",
			6: "Altı",
			7: "Yedi",
			8: "Sekiz",
			9: "Dokuz",
			10: "On",
			12: "On iki",
			16: "On altı",
			20: "Yirmi",
			24: "Yirmi dört",
			30: "Otuz",
			40: "Kırk",
		}
		return `${integerWords[integer] ?? integer.toString()} buçuk`
	}

	// General case: "Bir tam ve bir çeyrek", "İki tam ve üç çeyrek"
	const integerWords: Record<number, string> = {
		1: "Bir",
		2: "İki",
		3: "Üç",
		4: "Dört",
		5: "Beş",
		6: "Altı",
		7: "Yedi",
		8: "Sekiz",
		9: "Dokuz",
		10: "On",
		12: "On iki",
		16: "On altı",
		20: "Yirmi",
		24: "Yirmi dört",
		30: "Otuz",
		40: "Kırk",
	}
	const integerWord = integerWords[integer] ?? integer.toString()
	return `${integerWord} tam ve ${fractionWord.toLowerCase()}`
}

/**
 * Groups ingredients by their section name while preserving display order.
 *
 * Organizes ingredients into a Map keyed by `sectionName` (or `null` for
 * unsectioned ingredients).
 * Iterates through the ingredient list once, using the Map's insertion order to
 * maintain the original sequence for proper rendering with decorative dividers.
 *
 * @param ingredients - Array of recipe ingredient objects with `sectionName`.
 * @returns Map w/ section names as keys, ingredient arrays as values; in order.
 *
 * @example
 * groupBySectionName([
 *   { id: 1, name: "Flour", sectionName: "Dry" },
 *   { id: 2, name: "Milk", sectionName: "Wet" },
 *   { id: 3, name: "Salt", sectionName: "Dry" }
 * ])
 * // Map {
 * //   "Dry" => [{ id: 1, ... }, { id: 3, ... }],
 * //   "Wet" => [{ id: 2, ... }]
 * // }
 */
function groupBySectionName(
	ingredients: readonly RecipeIngredientDto[],
): Map<string | null, RecipeIngredientDto[]> {
	const groups = new Map<string | null, RecipeIngredientDto[]>()

	const orderedIngredients = [...ingredients].sort(
		(first, second) => first.displayOrder - second.displayOrder,
	)

	for (const ingredient of orderedIngredients) {
		const section = ingredient.sectionName
		const existing = groups.get(section)
		if (existing) {
			existing.push(ingredient)
		} else {
			groups.set(section, [ingredient])
		}
	}

	return groups
}

/**
 * Organizes ingredients into primary items and their alternatives.
 *
 * Separates ingredients into:
 * - Primary ingredients: those with alternativeToId === null
 * - Alternatives: those with alternativeToId !== null,
 * 	 grouped by their parent ID
 *
 * @param ingredients - Array of recipe ingredient objects.
 * @returns Object containing primary ingredients array and alternatives map
 * 			grouped by parent ID.
 */
function organizeWithAlternatives(ingredients: readonly RecipeIngredientDto[]) {
	const primaryIngredients: RecipeIngredientDto[] = []
	const alternativesMap = new Map<number, RecipeIngredientDto[]>()

	for (const ingredient of ingredients) {
		if (ingredient.alternativeToId === null) {
			primaryIngredients.push(ingredient)
			continue
		}

		const parentId = ingredient.alternativeToId
		const existing = alternativesMap.get(parentId)

		if (existing) {
			existing.push(ingredient)
		} else {
			alternativesMap.set(parentId, [ingredient])
		}
	}

	return { primaryIngredients, alternativesMap }
}

/* === Sub-components ======================================================= */
function WaveDivider({ flipped = false }: { readonly flipped?: boolean }) {
	return (
		<svg
			className={[
				"w-12 h-4 opacity-60 shrink-0",
				flipped && "scale-x-[-1]",
			]
				.filter(Boolean)
				.join(" ")}
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
export default function IngredientsChecklist({
	ingredients,
	servingsMultiplier,
	mode,
}: IngredientsChecklistProps) {
	/** Set of ingredient IDs that are currently checked. */
	const [checked, setChecked] = useState<Set<number>>(() => {
		/* Initialize primary ingredients as checked, alternatives as unchecked */
		const { primaryIngredients } = organizeWithAlternatives(ingredients)
		const initialChecked = new Set(primaryIngredients.map((ing) => ing.id))
		return initialChecked
	})

	const toggleIngredient = useCallback((id: number) => {
		setChecked((prev) => {
			const next = new Set(prev)
			if (next.has(id)) {
				next.delete(id)
			} else {
				next.add(id)
			}
			return next
		})
	}, [])

	/** Organize ingredients into primary and alternatives. */
	const { primaryIngredients, alternativesMap } = useMemo(
		() => organizeWithAlternatives(ingredients),
		[ingredients],
	)

	/** Group primary ingredients by section for decorative dividers. */
	const sections = useMemo(
		() => groupBySectionName(primaryIngredients),
		[primaryIngredients],
	)

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const sectionHeaderClasses = [
		"flex items-center justify-center gap-4",
		"mt-6 mb-4 text-primary",
	].join(" ")
	const sectionLabelClasses = [
		"text-label-sm font-label-sm uppercase",
		"font-bold tracking-wider whitespace-nowrap",
	].join(" ")
	const ingredientTextClasses = [
		"text-body-md text-on-surface",
		"group-hover:text-primary transition-colors",
	].join(" ")
	const alternativesListClasses = [
		"ml-8 mt-3 flex flex-col gap-4",
		"border-l-2 border-outline-variant pl-4",
	].join(" ")
	const alternativeTextClasses = [
		"text-body-md text-on-surface",
		"group-hover:text-primary transition-colors italic",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<ul className="flex flex-col gap-4">
			{Array.from(sections.entries()).map(
				([sectionName, sectionIngredients]) => (
					<li key={sectionName ?? "__default"}>
						{/* Section header with decorative waves */}
						{sectionName !== null && (
							<div className={sectionHeaderClasses}>
								<WaveDivider />
								<span className={sectionLabelClasses}>
									{sectionName}
								</span>
								<WaveDivider flipped />
							</div>
						)}

						{/* Hint text for the first section */}
						{/* {sectionName !== null && (
							<span
								className="block mb-4
								text-center text-on-surface-variant
								font-label-sm text-label-sm"
							>
								alternatifini görmek için kutucuğa tıklayın
							</span>
						)} */}

						{/* Ingredient items */}
						<ul className="flex flex-col gap-4">
							{sectionIngredients.map((ingredient) => {
								const isCore =
									sectionName.includes("ANA MALZEMELER")

								const alternatives =
									alternativesMap.get(ingredient.id) || []
								const hasAlternatives = alternatives.length > 0

								const isChecked = checked.has(ingredient.id)

								return (
									<li key={ingredient.id}>
										<div className="flex items-start gap-3 group">
											<input
												aria-label={`${ingredient.name} seçimi`}
												checked={isChecked}
												disabled={
													isCore && !hasAlternatives
												}
												// BUG: rounded-full does not work.
												className="
												w-5 h-5 mt-0.5
												rounded-full
												shrink-0
												cursor-pointer
												transition-all 
												form-checkbox
												accent-secondary"
												type="checkbox"
												onChange={() =>
													toggleIngredient(
														ingredient.id,
													)
												}
											/>
											<span
												className={
													!isChecked
														? `${ingredientTextClasses} line-through opacity-60`
														: ingredientTextClasses
												}
											>
												<span className="font-bold">
													{ingredient.name}
												</span>
												{"  "}
												<span>
													{mode === "traditional" ? (
														<>
															{formatTraditionalQuantity(
																ingredient.traditionalQuantity,
																servingsMultiplier,
															)}{" "}
															{
																ingredient.traditionalUnit
															}
														</>
													) : mode === "precise" &&
													  ingredient.exactQuantity !==
															null ? (
														<>
															{formatExactQuantity(
																ingredient.exactQuantity,
																servingsMultiplier,
															)}{" "}
															{
																ingredient.exactUnit
															}
														</>
													) : (
														<>
															{formatTraditionalQuantity(
																ingredient.traditionalQuantity,
																servingsMultiplier,
															)}{" "}
															{
																ingredient.traditionalUnit
															}
															{ingredient.exactQuantity !==
																null &&
																ingredient.exactUnit !==
																	null && (
																	<span className="font-normal opacity-70">
																		{" "}
																		(
																		{formatExactQuantity(
																			ingredient.exactQuantity,
																			servingsMultiplier,
																		)}{" "}
																		{
																			ingredient.exactUnit
																		}
																		)
																	</span>
																)}
														</>
													)}
												</span>{" "}
												{ingredient.notes && (
													<span className="text-on-surface-variant">
														{" "}
														({ingredient.notes})
													</span>
												)}
											</span>
										</div>

										{/* Show alternatives when primary is unchecked */}
										{alternatives.length > 0 && (
											<ul
												className={
													alternativesListClasses
												}
											>
												{alternatives.map(
													(alternative) => (
														<li
															key={alternative.id}
															className="flex items-start gap-3 group"
														>
															<span
																className={
																	alternativeTextClasses
																}
															>
																<span className="font-extralight">
																	{
																		"Alternatif: "
																	}
																</span>
																<span className="font-bold">
																	{
																		alternative.name
																	}
																</span>
																{"  "}
																<span>
																	{mode ===
																	"traditional" ? (
																		<>
																			{formatTraditionalQuantity(
																				alternative.traditionalQuantity,
																				servingsMultiplier,
																			)}{" "}
																			{
																				alternative.traditionalUnit
																			}
																		</>
																	) : mode ===
																			"precise" &&
																	  alternative.exactQuantity !==
																			null ? (
																		<>
																			{formatExactQuantity(
																				alternative.exactQuantity,
																				servingsMultiplier,
																			)}{" "}
																			{
																				alternative.exactUnit
																			}
																		</>
																	) : (
																		<>
																			{formatTraditionalQuantity(
																				alternative.traditionalQuantity,
																				servingsMultiplier,
																			)}{" "}
																			{
																				alternative.traditionalUnit
																			}
																			{alternative.exactQuantity !==
																				null &&
																				alternative.exactUnit !==
																					null && (
																					<span className="font-normal opacity-70">
																						{" "}
																						(
																						{formatExactQuantity(
																							alternative.exactQuantity,
																							servingsMultiplier,
																						)}{" "}
																						{
																							alternative.exactUnit
																						}

																						)
																					</span>
																				)}
																		</>
																	)}
																</span>{" "}
																{alternative.notes && (
																	<span className="text-on-surface-variant">
																		{" "}
																		(
																		{
																			alternative.notes
																		}
																		)
																	</span>
																)}
															</span>
														</li>
													),
												)}
											</ul>
										)}
									</li>
								)
							})}
						</ul>
					</li>
				),
			)}
		</ul>
	)
}

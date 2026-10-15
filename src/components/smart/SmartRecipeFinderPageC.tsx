/* =============================================================================
                   Smart Recipe Founder Page Client
============================================================================= */
/**
 * @fileoverview Interactive ingredient selection and autocomplete interface.
 * Suggestions are fetched from the smart recipe server action.
 *
 * FLOW:
 * User types ingredient → Debounced search → Matching tags returned →
 * User selects tag → Tag added to selection list → Units fetched for tag →
 * User adjusts quantity/unit → User submits selection for recipe search.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useEffect, useRef, useState } from "react"

/* --- Actions --- */
import {
	findIngredientTagByNameAction,
	getIngredientUnitsAction,
	searchIngredientTagsAction,
	searchSmartRecipesAction,
} from "@/app/actions/smart"

/* --- Components --- */
import SmartRecipeCard from "@/components/smart/SmartRecipeCard"

/* --- Assets --- */
import {
	CheckIcon,
	MagnifyingGlassIcon,
	MinusIcon,
	PlusIcon,
	MagnifyingGlassCircleIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline"

/* --- Types --- */
import type { KeyboardEvent, ReactElement } from "react"
import type {
	SmartIngredientTagDto,
	SmartRecipeSearchResultDto,
} from "@/lib/dto"

/* === Contracts ============================================================ */
/** Optional recipe ingredient names shown as quick-pick chips. */
interface SmartRecipeFinderPageCProps {
	readonly relatedIngredients?: readonly string[]
}

/** Client-side ingredient selection with quantity and unit controls. */
interface SelectedIngredient extends SmartIngredientTagDto {
	quantity: string
	unit: string
}

/** Named Tailwind classes used by the page's repeated interface elements. */
interface SmartRecipePageClasses {
	readonly section: string
	readonly searchWrapper: string
	readonly searchInput: string
	readonly loadingIndicator: string
	readonly suggestions: string
	readonly suggestion: (isActive: boolean) => string
	readonly noSuggestions: string
	readonly popularIngredient: string
	readonly selectedIngredient: string
	readonly stepper: string
	readonly stepperButton: string
	readonly quantityInput: string
	readonly unitSelect: string
	readonly removeButton: string
	readonly searchButton: string
	readonly results: string
}

/* === Constants ============================================================ */
const INGREDIENT_UNITS = ["adet", "gr.", "kg.", "su bardağı", "yemek kaşığı"]

/** Curated popular ingredients displayed beneath the search field. */
const POPULAR_INGREDIENTS = ["Patates", "Domates", "Soğan", "Mantar", "Süt"]

/**
 * Checks whether a measurement uses the larger quantity step.
 *
 * @param unit Selected unit label.
 * @returns True for abbreviated gram and milliliter units.
 */
function isFineMeasureUnit(unit: string): boolean {
	return ["gr.", "ml."].includes(unit.trim().toLocaleLowerCase("tr"))
}

/**
 * Gets the initial quantity used for a measurement unit.
 *
 * @param unit Selected unit label.
 * @returns The unit-specific initial quantity as an integer string.
 */
function getDefaultQuantity(unit: string): string {
	return isFineMeasureUnit(unit) ? "100" : "1"
}

/** Shared and state-dependent styles for major smart finder controls. */
const PAGE_CLASSES: SmartRecipePageClasses = {
	section: "rounded-xl bg-surface-container p-4 shadow-sm",
	searchWrapper: [
		"flex items-center gap-2 rounded-xl",
		"bg-surface-container-lowest px-3 py-3 ring-1",
		"ring-outline/20 focus-within:ring-primary",
	].join(" "),
	searchInput: [
		"min-w-0 flex-1 bg-transparent text-body-md",
		"text-on-surface placeholder:text-outline focus:outline-none",
	].join(" "),
	loadingIndicator: [
		"size-4 animate-spin rounded-full border-2",
		"border-primary border-r-transparent",
	].join(" "),
	suggestions: [
		"absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg",
		"bg-surface-container-lowest py-1 shadow-lg ring-1 ring-outline/20",
	].join(" "),
	suggestion: (isActive: boolean) =>
		[
			"flex cursor-pointer items-center justify-between px-3 py-2",
			"text-body-md",
			isActive ? "bg-secondary-container" : "hover:bg-surface-container",
			"text-on-surface",
		].join(" "),
	noSuggestions: [
		"absolute z-20 mt-1 w-full rounded-lg",
		"bg-surface-container-lowest p-3 text-body-sm",
		"text-on-surface-variant shadow-lg",
	].join(" "),
	popularIngredient: [
		"rounded-full bg-surface-container-high px-3 py-1.5",
		"text-label-sm text-on-surface hover:bg-secondary-container",
		"cursor-pointer",
	].join(" "),
	selectedIngredient: [
		"flex flex-wrap items-center justify-between gap-3 rounded-lg",
		"bg-surface-container-lowest p-3 shadow-xs",
	].join(" "),
	stepper: "flex items-center rounded-lg bg-surface-container-low p-1",
	stepperButton: [
		"grid size-8 place-items-center rounded-md",
		"bg-surface-container-lowest cursor-pointer",
	].join(" "),
	quantityInput: "w-12 md:w-16 bg-transparent text-center text-label-md",
	unitSelect: [
		"max-w-36 rounded-lg bg-surface-container-low px-2 py-2",
		"text-label-sm text-on-surface cursor-pointer",
	].join(" "),
	removeButton: [
		"grid size-9 place-items-center",
		"text-outline hover:text-error cursor-pointer",
	].join(" "),
	searchButton: [
		"mt-5 flex w-full items-center justify-center gap-2 rounded-lg",
		"bg-primary px-4 py-3 text-label-md font-semibold text-on-primary",
		"disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
	].join(" "),
	results: "grid gap-3 sm:grid-cols-2",
}

/* === Main Component ======================================================= */
/**
 * Renders the complete searchable ingredient selection experience.
 *
 * The component coordinates debounced tag search, popular ingredient picks,
 * dynamic unit options, integer quantities, and accessible keyboard control.
 *
 * @returns An interactive ingredient search and selection interface.
 */
export default function SmartRecipeFinderPageC({
	relatedIngredients,
}: SmartRecipeFinderPageCProps = {}): ReactElement {
	const ingredientChoices = relatedIngredients?.length
		? relatedIngredients
		: POPULAR_INGREDIENTS
	const ingredientHeading = relatedIngredients?.length
		? "Tarifteki malzemeler"
		: "En çok eklenenler"

	/* ─── References ─────────────────────────────────────────────────────── */
	const unitRequests = useRef(new Set<number>())

	/* ─── States ─────────────────────────────────────────────────────────── */
	const [searchText, setSearchText] = useState("")
	const [suggestions, setSuggestions] = useState<SmartIngredientTagDto[]>([])
	const [selected, setSelected] = useState<SelectedIngredient[]>([])
	const [recipeResults, setRecipeResults] = useState<
		SmartRecipeSearchResultDto[]
	>([])
	const [unitOptions, setUnitOptions] = useState<Record<number, string[]>>({})
	const [activeIndex, setActiveIndex] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [isSearchingRecipes, setIsSearchingRecipes] = useState(false)
	const [hasSearchedRecipes, setHasSearchedRecipes] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	/* ─── Effects ────────────────────────────────────────────────────────── */
	/**
	 * Retrieves matching tags after the user pauses typing.
	 *
	 * Queries shorter than three characters are ignored. Cleanup cancels the
	 * pending debounce and prevents stale requests from replacing newer results.
	 *
	 * @returns A cleanup callback that cancels or invalidates this lookup.
	 */
	useEffect(() => {
		const query = searchText.trim()
		if (query.length < 3) return

		let isCurrent = true
		const timer = window.setTimeout(async () => {
			setIsLoading(true)
			try {
				const matches = await searchIngredientTagsAction(query)
				if (isCurrent) {
					setSuggestions(matches)
					setActiveIndex(0)
				}
			} catch {
				if (isCurrent) setSuggestions([])
			} finally {
				if (isCurrent) setIsLoading(false)
			}
		}, 250)

		return () => {
			isCurrent = false
			window.clearTimeout(timer)
		}
	}, [searchText])

	/* ─── Helper Functions ───────────────────────────────────────────────── */
	/**
	 * Adds a tag once, starts its unit lookup, and resets autocomplete state.
	 *
	 * @param tag Ingredient tag selected by the user.
	 * @returns Nothing; updates component state and starts an asynchronous query.
	 */
	function addIngredient(tag: SmartIngredientTagDto): void {
		setSelected((current) => {
			if (current.some((item) => item.id === tag.id)) return current
			return [...current, { ...tag, quantity: "1", unit: "adet" }]
		})
		void loadIngredientUnits(tag.id, tag.name)
		setSearchText("")
		setSuggestions([])
		setIsOpen(false)
	}

	/**
	 * Resolves a curated quick-pick label and adds its matching tag.
	 *
	 * @param name Exact ingredient name shown in the popular list.
	 * @returns A promise resolved after the tag lookup and selection update.
	 */
	async function addPopularIngredient(name: string): Promise<void> {
		const tag = await findIngredientTagByNameAction(name)
		if (tag) addIngredient(tag)
	}

	/** Searches recipes using the current ingredient selections. */
	async function searchRecipes(): Promise<void> {
		const searchIngredients = selected.flatMap((item) => {
			const quantity = Number.parseInt(item.quantity, 10)
			if (!Number.isFinite(quantity) || quantity < 1) return []
			return [{ name: item.name, unit: item.unit, quantity }]
		})

		setHasSearchedRecipes(true)
		setIsSearchingRecipes(true)
		try {
			const matches = await searchSmartRecipesAction(searchIngredients)
			setRecipeResults(matches)
		} catch {
			setRecipeResults([])
		} finally {
			setIsSearchingRecipes(false)
		}
	}

	/**
	 * Loads distinct database units, falling back when none are available.
	 *
	 * @param id Tag ID whose selected row receives the available units.
	 * @param name Ingredient name used to find recipe ingredient units.
	 * @returns A promise resolved when unit options and default state are updated.
	 */
	async function loadIngredientUnits(
		id: number,
		name: string,
	): Promise<void> {
		if (unitOptions[id] || unitRequests.current.has(id)) return
		unitRequests.current.add(id)

		try {
			const units = await getIngredientUnitsAction(undefined, name)
			const options = units.length > 0 ? units : INGREDIENT_UNITS
			const selectedUnit = options.includes(
				selected.find((item) => item.id === id)?.unit ?? "",
			)
				? (selected.find((item) => item.id === id)?.unit ?? options[0])
				: options[0]
			setUnitOptions((current) => ({ ...current, [id]: options }))
			setSelected((current) =>
				current.map((item) =>
					item.id === id
						? {
								...item,
								unit: selectedUnit,
								quantity:
									item.quantity === "1" &&
									isFineMeasureUnit(selectedUnit)
										? "100"
										: item.quantity,
							}
						: item,
				),
			)
		} catch {
			setUnitOptions((current) => ({
				...current,
				[id]: INGREDIENT_UNITS,
			}))
		} finally {
			unitRequests.current.delete(id)
		}
	}

	/** Adds the currently highlighted autocomplete suggestion, if present. */
	function completeSuggestion(): void {
		const match = suggestions[activeIndex]
		if (match) addIngredient(match)
	}

	/**
	 * Applies the unit-specific integer step while enforcing a minimum of one.
	 *
	 * @param id Selected ingredient ID.
	 * @param direction Step direction, either negative or positive one.
	 */
	function updateQuantity(id: number, direction: -1 | 1): void {
		setSelected((current) =>
			current.map((item) => {
				if (item.id !== id) return item
				const step = isFineMeasureUnit(item.unit) ? 50 : 1
				const currentValue = Number.parseInt(item.quantity, 10) || 1
				const nextValue = Math.max(1, currentValue + direction * step)
				return {
					...item,
					quantity: String(Math.trunc(nextValue)),
				}
			}),
		)
	}

	/**
	 * Changes an ingredient's unit and resets its unit-specific quantity.
	 *
	 * @param id Selected ingredient ID.
	 * @param unit Newly selected measurement unit.
	 */
	function updateUnit(id: number, unit: string): void {
		setSelected((current) =>
			current.map((item) => {
				if (item.id !== id) return item
				return {
					...item,
					unit,
					quantity: getDefaultQuantity(unit),
				}
			}),
		)
	}

	/**
	 * Restores the positive integer default after an invalid quantity edit.
	 *
	 * @param id Selected ingredient ID.
	 */
	function normalizeQuantity(id: number): void {
		setSelected((current) =>
			current.map((item) => {
				if (item.id !== id) return item
				const value = Number(item.quantity)
				return {
					...item,
					quantity:
						Number.isFinite(value) && value >= 1
							? String(Math.trunc(value))
							: getDefaultQuantity(item.unit),
				}
			}),
		)
	}

	/**
	 * Handles arrow navigation and completion in the suggestion list.
	 *
	 * @param event Keyboard event from the ingredient search input.
	 */
	function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		if (event.key === "ArrowDown" && suggestions.length > 0) {
			event.preventDefault()
			setIsOpen(true)
			setActiveIndex((index) => (index + 1) % suggestions.length)
			return
		}

		if (event.key === "ArrowUp" && suggestions.length > 0) {
			event.preventDefault()
			setActiveIndex(
				(index) =>
					(index - 1 + suggestions.length) % suggestions.length,
			)
			return
		}

		const shouldComplete = ["Enter", "Tab", " "].includes(event.key)
		if (shouldComplete && suggestions[activeIndex]) {
			event.preventDefault()
			completeSuggestion()
		}
	}

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			{/* Ingredient search and selection */}
			<section className={PAGE_CLASSES.section}>
				{/* --- Ingredient Search --- */}
				<label
					className="mb-2 block text-label-sm text-on-surface-variant"
					htmlFor="ingredient-search"
				>
					Malzeme Ekle
				</label>
				<div className="relative">
					<div className={PAGE_CLASSES.searchWrapper}>
						<MagnifyingGlassIcon
							aria-hidden="true"
							className="size-5 shrink-0 text-outline"
						/>
						<input
							aria-activedescendant={
								suggestions[activeIndex]
									? `ingredient-option-${suggestions[activeIndex].id}`
									: undefined
							}
							aria-autocomplete="list"
							aria-controls="ingredient-suggestions"
							aria-expanded={isOpen && suggestions.length > 0}
							className={PAGE_CLASSES.searchInput}
							autoComplete="off"
							id="ingredient-search"
							onBlur={() => {
								window.setTimeout(() => setIsOpen(false), 120)
							}}
							onChange={(event) => {
								const value = event.target.value
								setSearchText(value)
								setSuggestions([])
								setActiveIndex(0)
								setIsLoading(value.trim().length >= 3)
								setIsOpen(true)
							}}
							onFocus={() => setIsOpen(true)}
							onKeyDown={handleSearchKeyDown}
							placeholder="Malzeme ara (örn. Patlıcan, Pirinç...)"
							role="combobox"
							value={searchText}
						/>
						{isLoading && (
							<span
								aria-label="Aranıyor"
								className={PAGE_CLASSES.loadingIndicator}
							/>
						)}
					</div>

					{/* Live matches remain attached to search control. */}
					{isOpen && suggestions.length > 0 && (
						<ul
							className={PAGE_CLASSES.suggestions}
							id="ingredient-suggestions"
							role="listbox"
						>
							{suggestions.map((tag, index) => (
								<li
									aria-selected={index === activeIndex}
									className={PAGE_CLASSES.suggestion(
										index === activeIndex,
									)}
									id={`ingredient-option-${tag.id}`}
									key={tag.id}
									onMouseDown={(event) =>
										event.preventDefault()
									}
									onClick={() => addIngredient(tag)}
									role="option"
								>
									<span className="flex items-center gap-2">
										{tag.emoji && (
											<span className="text-lg">
												{tag.emoji}
											</span>
										)}
										{tag.name}
									</span>
									{index === activeIndex && (
										<CheckIcon
											aria-hidden="true"
											className="size-4 text-primary"
										/>
									)}
								</li>
							))}
						</ul>
					)}
					{isOpen &&
						searchText.trim().length >= 3 &&
						!isLoading &&
						suggestions.length === 0 && (
							<p className={PAGE_CLASSES.noSuggestions}>
								Eşleşen malzeme bulunamadı.
							</p>
						)}
				</div>

				{/* --- Ingredients --- */}
				<div className="mt-4">
					<p className="mb-2 text-label-sm text-on-surface-variant">
						{ingredientHeading}
					</p>
					<div className="flex flex-wrap gap-2">
						{ingredientChoices.map((name) => (
							<button
								className={PAGE_CLASSES.popularIngredient}
								key={name}
								onClick={() => {
									void addPopularIngredient(name)
								}}
								type="button"
							>
								{name}
							</button>
						))}
					</div>
				</div>

				{/* --- Selected Ingredients & Quantity Controls --- */}
				<div className="mt-6 flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<p className="text-label-md text-on-surface">
							Seçilen Malzemeler ({selected.length})
						</p>
						{selected.length > 0 && (
							<button
								className="text-label-sm font-semibold text-primary cursor-pointer"
								onClick={() => {
									setSelected([])
									setRecipeResults([])
									setHasSearchedRecipes(false)
								}}
								type="button"
							>
								Temizle
							</button>
						)}
					</div>

					{selected.length === 0 ? (
						<p
							className={
								"rounded-lg bg-surface-container-low p-4 " +
								"text-body-sm text-on-surface-variant"
							}
						>
							Malzemeleri yukarıdaki alanda arayarak veya en çok
							eklenenlerden seçerek listene ekleyebilirsin.
						</p>
					) : (
						selected.map((item) => (
							<div
								className={PAGE_CLASSES.selectedIngredient}
								key={item.id}
							>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										{item.emoji && (
											<span
												aria-hidden="true"
												className="text-xl"
											>
												{item.emoji}
											</span>
										)}
										<p className="truncate text-body-md font-semibold text-on-surface">
											{item.name}
										</p>
									</div>
									<p className="text-label-sm text-on-surface-variant/40">
										{item.group ?? "Malzeme"}
									</p>
								</div>

								{/* Quantity and unit controls. */}
								<div className="flex items-center gap-2">
									<div className={PAGE_CLASSES.stepper}>
										<button
											aria-label={`${item.name} miktarını azalt`}
											className={
												PAGE_CLASSES.stepperButton
											}
											onClick={() =>
												updateQuantity(item.id, -1)
											}
											type="button"
										>
											<MinusIcon
												aria-hidden="true"
												className="size-4"
											/>
										</button>
										<input
											aria-label={`${item.name} miktarı`}
											className={
												PAGE_CLASSES.quantityInput
											}
											type="number"
											min="1"
											step="1"
											onBlur={() =>
												normalizeQuantity(item.id)
											}
											onChange={(event) => {
												const value = event.target.value
												if (/^\d*$/.test(value)) {
													setSelected((current) =>
														current.map((entry) =>
															entry.id === item.id
																? {
																		...entry,
																		quantity:
																			value,
																	}
																: entry,
														),
													)
												}
											}}
											value={item.quantity}
										/>
										<button
											aria-label={`${item.name} miktarını artır`}
											className={
												PAGE_CLASSES.stepperButton
											}
											onClick={() =>
												updateQuantity(item.id, 1)
											}
											type="button"
										>
											<PlusIcon
												aria-hidden="true"
												className="size-4"
											/>
										</button>
									</div>
									<select
										aria-label={`${item.name} ölçü birimi`}
										className={PAGE_CLASSES.unitSelect}
										onChange={(event) => {
											updateUnit(
												item.id,
												event.target.value,
											)
										}}
										value={item.unit}
									>
										{(
											unitOptions[item.id] ??
											INGREDIENT_UNITS
										).map((unit) => (
											<option key={unit} value={unit}>
												{unit}
											</option>
										))}
									</select>
									<button
										aria-label={`${item.name} malzemesini kaldır`}
										className={PAGE_CLASSES.removeButton}
										onClick={() => {
											setSelected((current) =>
												current.filter(
													(ingredient) =>
														ingredient.id !==
														item.id,
												),
											)
										}}
										type="button"
									>
										<XMarkIcon
											aria-hidden="true"
											className="size-5"
										/>
									</button>
								</div>
							</div>
						))
					)}
				</div>

				<button
					className={PAGE_CLASSES.searchButton}
					disabled={selected.length === 0 || isSearchingRecipes}
					onClick={() => void searchRecipes()}
					type="button"
				>
					<MagnifyingGlassCircleIcon
						aria-hidden="true"
						className="size-5"
					/>
					<span>
						{isSearchingRecipes
							? "Tarifler aranıyor..."
							: `Tarif Bul (${selected.length} malzemeyle)`}
					</span>
				</button>
			</section>

			{/* Ranked recipe matches with calculated serving limits. */}
			{hasSearchedRecipes && (
				<section
					aria-live="polite"
					className="flex flex-col gap-3 mb-2"
				>
					<div
						className={[
							"flex flex-col md:flex-row md:items-end",
							"justify-between gap-stack-sm",
						].join(" ")}
					>
						<h2 className="text-headline-md font-headline-md">
							Eşleşen Tarifler
						</h2>
						<div
							className={[
								"flex items-center gap-1 text-on-surface-variant",
								"font-body-md italic",
							].join(" ")}
						>
							<span className="font-bold text-on-surface">
								{recipeResults.length}
							</span>
							<span className="text-on-surface"> tarif</span>
						</div>
					</div>

					{isSearchingRecipes ? (
						<p className="text-body-md text-on-surface-variant">
							Seçtiğin malzemelere uygun tarifler aranıyor.
						</p>
					) : recipeResults.length > 0 ? (
						<div className={PAGE_CLASSES.results}>
							{recipeResults.map((recipe) => (
								<SmartRecipeCard
									key={recipe.id}
									recipe={recipe}
								/>
							))}
						</div>
					) : (
						<p className="text-body-md text-on-surface-variant">
							Bu miktarlarla eşleşen tarif bulunamadı.
						</p>
					)}
				</section>
			)}
		</>
	)
}

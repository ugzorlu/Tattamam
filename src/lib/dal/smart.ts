/* =============================================================================
                       Data Access Layer: Smart Recipes
============================================================================= */
/**
 * @fileoverview Database queries for the smart recipe ingredient finder.
 * Smart ingredient matches return only tag fields used by the client.
 */

/* === Imports ============================================================== */
/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"

/* --- Utilities --- */
import { logger } from "@/lib/logging"

/* --- Types --- */
import type {
	SmartIngredientTagDto,
	SmartRecipeSearchIngredientDto,
	SmartRecipeSearchResultDto,
} from "@/lib/dto"

/* === Constants ============================================================ */
/** Maximum number of matching ingredient tags returned per query. */
const MAX_INGREDIENT_SUGGESTIONS = 5

/* === Queries ============================================================== */
/**
 * Finds recipe-linked tags whose names contain the supplied search text.
 *
 * @param searchText User-entered ingredient text.
 * @returns Matching kind-1 ingredient tags for smart feature controls.
 */
export async function searchIngredientTags(
	searchText: string,
): Promise<SmartIngredientTagDto[]> {
	const query = searchText.trim()
	if (query.length < 3) return []

	try {
		const tags = await prisma.tag.findMany({
			where: {
				kind: 1,
				name: { contains: query },
				recipeTags: { some: {} },
			},
			orderBy: { name: "asc" },
			take: MAX_INGREDIENT_SUGGESTIONS,
			select: {
				id: true,
				name: true,
				group: true,
				emoji: true,
			},
		})

		return tags
	} catch (error) {
		logger.warn({ err: error }, "Ingredient tag search failed")
		return []
	}
}

/**
 * Finds an exact tag match for one of the curated quick-pick ingredients.
 *
 * @param ingredientName Ingredient name displayed by a quick-pick button.
 * @returns The matching smart ingredient tag, or null when it is unavailable.
 */
export async function findIngredientTagByName(
	ingredientName: string,
): Promise<SmartIngredientTagDto | null> {
	const name = ingredientName.trim()
	if (!name) return null

	try {
		return await prisma.tag.findFirst({
			where: {
				kind: 1,
				name,
				recipeTags: { some: {} },
			},
			select: {
				id: true,
				name: true,
				group: true,
				emoji: true,
			},
		})
	} catch (error) {
		logger.warn({ err: error }, "Quick-pick tag lookup failed")
		return null
	}
}

/**
 * Finds distinct units for a recipe or names containing the keyword.
 *
 * @param recipeId Optional recipe whose ingredient units should be loaded.
 * @param ingredientName Optional exact name to search across recipes.
 * @returns Distinct traditional and exact unit labels.
 */
export async function getIngredientUnits(
	recipeId?: number,
	ingredientName?: string,
): Promise<string[]> {
	const name = ingredientName?.trim()
	if (!recipeId && !name) return []

	const filters = [
		recipeId ? { recipeId } : undefined,
		name ? { name } : undefined,
	].filter((filter) => filter !== undefined)
	const where = filters.length > 1 ? { OR: filters } : filters[0]

	try {
		const ingredients = await prisma.recipeIngredient.findMany({
			where,
			select: {
				traditionalUnit: true,
				exactUnit: true,
			},
		})
		const units = ingredients.flatMap((ingredient) => [
			ingredient.traditionalUnit,
			ingredient.exactUnit,
		])

		return [
			...new Set(
				units
					.filter((unit) => Boolean(unit))
					.map((unit) => normalizeUnit(unit)),
			),
		].sort((first, second) => first.localeCompare(second, "tr"))
	} catch (error) {
		logger.warn({ err: error }, "Ingredient unit lookup failed")
		return []
	}
}

/**
 * Searches recipes using ingredient keywords, selected units, and amounts.
 *
 * For each matching recipe, the smallest available-to-required ratio
 * determines its maximum whole-serving count. Results rank by matched
 * ingredient count, then by the achievable serving count.
 *
 * @param selectedIngredients User-selected names, units, and available amounts.
 * @returns Ranked recipe cards with match and maximum-serving metrics.
 */
export async function searchSmartRecipes(
	selectedIngredients: readonly SmartRecipeSearchIngredientDto[],
): Promise<SmartRecipeSearchResultDto[]> {
	const ingredients = selectedIngredients.filter(
		(item) =>
			item.name.trim() &&
			item.unit.trim() &&
			Number.isFinite(item.quantity) &&
			item.quantity > 0,
	)
	if (ingredients.length === 0) return []

	const ingredientNames = [
		...new Set(ingredients.map((item) => item.name.trim())),
	]
	const ingredientNameFilters = ingredientNames.map((name) => ({
		name: { contains: name },
	}))
	const selectedByName = new Map(
		ingredients.map((item) => [item.name.trim(), item]),
	)

	try {
		const recipes = await prisma.recipe.findMany({
			where: {
				ingredients: {
					some: { OR: ingredientNameFilters },
				},
			},
			select: {
				id: true,
				title: true,
				slug: true,
				imageUrl: true,
				prepTimeMinutes: true,
				cookTimeMinutes: true,
				budgetLevel: true,
				difficultyLevel: true,
				servingsBase: true,
				ingredients: {
					where: { OR: ingredientNameFilters },
					select: {
						name: true,
						traditionalQuantity: true,
						traditionalUnit: true,
						exactQuantity: true,
						exactUnit: true,
					},
				},
				recipeTags: {
					where: {
						tag: { OR: ingredientNameFilters },
					},
					select: { tag: { select: { name: true } } },
				},
			},
		})

		const results: SmartRecipeSearchResultDto[] = []
		for (const recipe of recipes) {
			const matchedNames = new Set<string>()
			let maxServings = Number.POSITIVE_INFINITY

			for (const ingredientName of ingredientNames) {
				const selection = selectedByName.get(ingredientName)
				if (!selection) continue

				const selectedUnit = normalizeUnit(selection.unit)
				const normalizedName = ingredientName.toLocaleLowerCase("tr")
				const matchingRows = recipe.ingredients.filter((row) =>
					row.name.toLocaleLowerCase("tr").includes(normalizedName),
				)
				const exactNameRows = matchingRows.filter(
					(row) =>
						row.name.toLocaleLowerCase("tr") === normalizedName,
				)
				const candidateRows = [
					...exactNameRows,
					...matchingRows.filter(
						(row) => !exactNameRows.includes(row),
					),
				]
				const exactRow = candidateRows.find(
					(row) =>
						row.exactUnit &&
						normalizeUnit(row.exactUnit) === selectedUnit &&
						row.exactQuantity !== null &&
						Number(row.exactQuantity) > 0,
				)
				const traditionalRow = candidateRows.find(
					(row) =>
						normalizeUnit(row.traditionalUnit) === selectedUnit &&
						Number(row.traditionalQuantity) > 0,
				)
				const requiredQuantity = exactRow
					? Number(exactRow.exactQuantity)
					: traditionalRow
						? Number(traditionalRow.traditionalQuantity)
						: null

				const matchedRow = exactRow ?? traditionalRow
				if (requiredQuantity === null || !matchedRow) continue
				matchedNames.add(matchedRow.name)
				const portions = Math.floor(
					(selection.quantity / requiredQuantity) *
						recipe.servingsBase,
				)
				maxServings = Math.min(maxServings, portions)
			}

			if (matchedNames.size === 0) continue
			const matchedTagNames = new Set(
				recipe.recipeTags.map((recipeTag) => recipeTag.tag.name),
			)
			results.push({
				id: recipe.id,
				title: recipe.title,
				slug: recipe.slug,
				imageUrl: recipe.imageUrl,
				prepTimeMinutes: recipe.prepTimeMinutes,
				cookTimeMinutes: recipe.cookTimeMinutes,
				budgetLevel: recipe.budgetLevel,
				difficultyLevel: recipe.difficultyLevel,
				matchedIngredientCount: matchedNames.size,
				matchedIngredientNames: [...matchedNames],
				matchedTagCount: matchedTagNames.size,
				maxServings,
			})
		}

		return results.sort(
			(first, second) =>
				second.matchedIngredientCount - first.matchedIngredientCount ||
				second.matchedTagCount - first.matchedTagCount ||
				second.maxServings - first.maxServings,
		)
	} catch (error) {
		logger.warn({ err: error }, "Smart recipe search failed")
		return []
	}
}

/**
 * Maps equivalent unit labels to shared canonical values.
 *
 * @param unit Unit label from the selected ingredient or recipe record.
 * @returns Normalized canonical label used for measurement comparisons.
 */
function normalizeUnit(unit: string): string {
	const normalized = unit.trim().toLocaleLowerCase("tr").replace(/\s+/g, " ")
	const unitAliases: Readonly<Record<string, string>> = {
		"adet küçük boy": "adet",
		"adet orta boy": "adet",
		"adet büyük boy": "adet",
		"çay bardağı": "bardak",
		"su bardağı": "bardak",
		"çay kaşığı": "kaşık",
		"tatlı kaşığı": "kaşık",
		"yemek kaşığı": "kaşık",
		"silme yemek kaşığı": "kaşık",
		"tepeleme yemek kaşığı": "kaşık",
		"küçük kase": "kase",
		"büyük kase": "kase",
	}

	return unitAliases[normalized] ?? normalized
}

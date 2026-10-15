/* =============================================================================
                       Smart Recipe Finder Actions
============================================================================= */
/**
 * @fileoverview Server actions for ingredient autocomplete suggestions.
 * This boundary keeps database access on the server and returns DTOs only.
 */

"use server"

/* === Imports ============================================================== */
import {
	findIngredientTagByName,
	getIngredientUnits,
	searchIngredientTags,
	searchSmartRecipes,
} from "@/lib/dal/smart"
import type {
	SmartIngredientTagDto,
	SmartRecipeSearchIngredientDto,
	SmartRecipeSearchResultDto,
} from "@/lib/dto"

/* === Actions ============================================================== */
/**
 * Searches recipe-linked ingredient tags for autocomplete.
 *
 * @param searchText Current ingredient input value.
 * @returns Matching ingredient tags as serializable DTOs.
 */
export async function searchIngredientTagsAction(
	searchText: string,
): Promise<SmartIngredientTagDto[]> {
	return searchIngredientTags(searchText)
}

/**
 * Resolves a curated quick-pick name to a valid ingredient tag.
 *
 * @param ingredientName Exact name shown by the quick-pick button.
 * @returns Matching tag data or null when no tag exists.
 */
export async function findIngredientTagByNameAction(
	ingredientName: string,
): Promise<SmartIngredientTagDto | null> {
	return findIngredientTagByName(ingredientName)
}

/**
 * Loads distinct units for a selected ingredient or recipe.
 *
 * @param recipeId Optional recipe identifier.
 * @param ingredientName Optional keyword matched within ingredient names.
 * @returns Available unit labels normalized to canonical values.
 */
export async function getIngredientUnitsAction(
	recipeId?: number,
	ingredientName?: string,
): Promise<string[]> {
	return getIngredientUnits(recipeId, ingredientName)
}

/**
 * Finds recipes that fit the submitted ingredient quantities and units.
 *
 * @param ingredients Selected ingredient constraints from the finder UI.
 * @returns Recipes ranked by matched ingredient count and available portions.
 */
export async function searchSmartRecipesAction(
	ingredients: readonly SmartRecipeSearchIngredientDto[],
): Promise<SmartRecipeSearchResultDto[]> {
	return searchSmartRecipes(ingredients)
}

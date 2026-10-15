/* =============================================================================
                     	   		Category Actions
============================================================================= */
/**
 * @fileoverview
 * Server actions for recipe pagination operations.
 *
 * FLOW:
 * ~ Client components dispatch these actions to fetch recipe data
 * asynchronously.
 * ~ Results are streamed back and merged into UI state.
 *
 * USE CASES:
 * - Load recipes by category with skip/take pagination parameters.
 * - Fetch all recipes with skip/take pagination parameters.
 *
 * NOTE(ARCHITECTURE):
 * Server actions are required because recipe data is fetched from the database
 * and may involve sensitive information or require server-side processing.
 * Uses DAL functions for db access and returns DTOs for client consumption.
 */

"use server"

/* === Imports ============================================================== */
/* --- Server Infrastructure --- */
import { searchRecipesByCategory, getAllRecipes } from "@/lib/dal/search"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* === Actions ============================================================== */
export async function searchRecipesByCategoryAction(
	categorySlug: string,
	take: number,
	skip: number,
): Promise<RecipeCardDto[]> {
	const result = await searchRecipesByCategory(categorySlug, take, skip)

	return result.recipes
}

export async function getAllRecipesAction(
	take: number,
	skip: number,
): Promise<RecipeCardDto[]> {
	const result = await getAllRecipes(take, skip)

	return result.recipes
}

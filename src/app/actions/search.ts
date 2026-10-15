/* =============================================================================
                       		Recipe Search Actions
============================================================================= */
/**
 * @fileoverview
 * Server action for recipe search operations.
 *
 * FLOW:
 * Client components send search parameters to this action. The action queries
 * the database and returns matching recipe data.
 *
 * USE CASES:
 * - Search recipes by category with pagination.
 * - Search recipes by keyword with pagination.
 *
 * NOTE(ARCHITECTURE):
 * Server actions are required because recipe data is fetched from the database
 * and may involve sensitive information or require server-side processing.
 * Uses DAL functions for db access and returns DTOs for client consumption.
 */

"use server"

/* === Imports ============================================================== */
/* --- Server Infrastructure --- */
import { searchRecipesByKeyword } from "@/lib/dal/search"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* === Actions ============================================================== */
export async function searchRecipesByKeywordAction(
	keyword: string,
	take: number,
	skip: number,
): Promise<RecipeCardDto[]> {
	const result = await searchRecipesByKeyword(keyword, take, skip)

	return result.recipes
}

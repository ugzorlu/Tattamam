/* ======================================================================
                 Data Access Layer for single recipes
========================================================================= */
/**
 * @fileoverview
 * Data access functions for recipe data.
 *
 * PURPOSE:
 * Provides persistence-layer queries for fetching complete recipe
 * data (ingredients, steps, tips, categories, tags) and managing
 * per-visitor like state and per-user favorite lists.
 *
 * USE CASES:
 * – Recipe detail page server component
 * – FloatingActionPanel (like / favorite checks)
 *
 * FLOW:
 * ~ Accepts a recipe slug or IDs as input.
 * ~ Queries the database via Prisma with eager-loaded relations.
 * ~ Maps Prisma models to serialization-safe DTOs (Decimal → number).
 * ~ Returns null/false when no matching record is found.
 *
 * CACHING ARCHITECTURE (two-layer):
 * 1. `getRecipeBySlug` — React `cache()` for request-level dedup.
 *    Ensures generateMetadata and the page component share one DB
 *    round-trip within a single server request.
 * 2. `getCachedRecipeBySlug` — Next.js `'use cache'` for cross-
 *    request data caching. Serves recipe data from the in-process
 *    (or disk) cache for the `cacheLife('days')` TTL. Any call with
 *    the same slug hits the cache instead of the database.
 *
 * NOTE(ARCHITECTURE):
 * DTO mapping occurs at the DAL boundary so server components
 * receive clean, serializable types without hydration mismatches.
 */

/* === Imports ======================================================= */
/* --- Externals --- */
import { cache } from "react"
import { cacheLife, cacheTag } from "next/cache"

/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"

/* --- Helpers --- */
import { getVisitorIdentity } from "@/lib/identity"
import { logger } from "@/lib/logging"

/* --- Types --- */
import type { RecipeCardDto, RecipeDetailDto } from "@/lib/dto"

/* === Internal Query Functions ===================================== */
/*
 * NOTE(DESIGN):
 * `fetchRecipeBySlug` is the raw Prisma query, intentionally kept
 * package-private. Public callers use either `getRecipeBySlug`
 * (request-scoped React cache) or `getCachedRecipeBySlug` (cross-
 * request Next.js cache). Both delegate here to avoid duplication.
 */

/**
 * Executes the Prisma query for a single recipe by URL slug.
 *
 * Performs a `findUnique` with all required eager-loaded relations.
 * DTO mapping converts non-serializable Prisma types (e.g. Decimal)
 * to JSON-safe primitives at this boundary.
 *
 * @param slug - URL-safe recipe identifier (e.g. "zeytinyagli-dolma").
 * @returns Fully-hydrated {@link RecipeDetailDto}, or `null` on miss.
 */
async function fetchRecipeBySlug(
	slug: string,
): Promise<RecipeDetailDto | null> {
	// const start = performance.now()

	// logger.info(`[RECIPE DB] PID=${process.pid} ` + `MISS → fetching "${slug}"`)

	try {
		const recipe = await prisma.recipe.findUnique({
			where: { slug },
			select: {
				id: true,
				title: true,
				alternativeTitle: true,
				slug: true,
				description: true,
				imageUrl: true,
				servingsBase: true,
				prepTimeMinutes: true,
				cookTimeMinutes: true,
				likeCount: true,
				budgetLevel: true,
				difficultyLevel: true,
				createdAt: true,
				updatedAt: true,
				ingredients: { orderBy: { id: "asc" } },
				steps: { orderBy: { stepNumber: "asc" } },
				tips: { orderBy: { displayOrder: "asc" } },
				categories: { orderBy: { id: "asc" } },
				recipeTags: {
					include: { tag: true },
					orderBy: { importance: "desc" },
				},
			},
		})

		// logger.info(
		// 	`[RECIPE DB] PID=${process.pid} ` +
		// 		`"${slug}" → ` +
		// 		`${(performance.now() - start).toFixed(2)} ms`,
		// )

		if (!recipe) return null

		return {
			id: recipe.id,
			title: recipe.title,
			alternativeTitle: recipe.alternativeTitle,
			slug: recipe.slug,
			description: recipe.description,
			imageUrl: recipe.imageUrl,
			servingsBase: recipe.servingsBase,
			prepTimeMinutes: recipe.prepTimeMinutes,
			cookTimeMinutes: recipe.cookTimeMinutes,
			likeCount: recipe.likeCount,
			budgetLevel: recipe.budgetLevel,
			difficultyLevel: recipe.difficultyLevel,
			createdAt: recipe.createdAt,
			updatedAt: recipe.updatedAt,

			ingredients: recipe.ingredients.map((ing) => ({
				id: ing.id,
				name: ing.name,
				/*
				 * NOTE(SERIALIZATION): Prisma Decimal → number. Safe for
				 * recipe quantities within IEEE 754 range.
				 */
				traditionalQuantity: Number(ing.traditionalQuantity),
				traditionalUnit: ing.traditionalUnit,
				exactQuantity: Number(ing.exactQuantity ?? null),
				exactUnit: ing.exactUnit,
				notes: ing.notes,
				sectionName: ing.sectionName,
				displayOrder: ing.displayOrder,
				alternativeToId: ing.alternativeToId
					? Number(ing.alternativeToId)
					: null,
			})),

			steps: recipe.steps.map((step) => ({
				id: step.id,
				stepNumber: step.stepNumber,
				traditionalInstruction: step.traditionalInstruction,
				exactInstruction: step.exactInstruction,
				mixedInstruction: step.mixedInstruction,
				durationMinutes: step.durationMinutes,
				sectionName: step.sectionName,
			})),

			tips: recipe.tips.map((tip) => ({
				id: tip.id,
				content: tip.content,
				displayOrder: tip.displayOrder,
			})),

			categories: recipe.categories.map((cat) => ({
				id: cat.id,
				name: cat.name,
				slug: cat.slug,
				description: cat.description,
			})),

			tags: recipe.recipeTags.map(({ tag, kind, importance }) => ({
				id: tag.id,
				name: tag.name,
				slug: tag.slug,
				kind,
				importance,
			})),
		}
	} catch (e) {
		logger.warn({ err: e }, "Prisma error during recipe fetch:")
		return null
	}
}

/* === Public Query Functions ======================================= */
/**
 * Fetches a single recipe by its URL-safe slug.
 *
 * Wrapped with React's `cache()` to deduplicate identical calls
 * within a single server request. This ensures `generateMetadata`
 * and the main page component share one DB round-trip rather than
 * issuing two separate queries for the same slug.
 *
 * NOTE(SCOPE):
 * This deduplication is request-scoped only — a new request starts
 * with a fresh cache. For cross-request caching use
 * {@link getCachedRecipeBySlug}.
 *
 * @param slug - URL-safe recipe identifier.
 * @returns Fully-hydrated recipe DTO, or `null` on miss/error.
 */
export const getRecipeBySlug = cache(
	async (slug: string): Promise<RecipeDetailDto | null> => {
		return fetchRecipeBySlug(slug)
	},
)

/**
 * Cached public accessor for recipe data.
 *
 * Uses Next.js `'use cache'` to serve recipe content from the
 * application-level cache instead of hitting the database on every
 * request. The cache entry lives for one day and is keyed by the
 * recipe's URL slug via the automatically-derived function argument
 * cache key.
 *
 * CACHE STRATEGY:
 * – cacheLife("days") uses Next.js' built-in "days" profile:
 *   5 min client stale time,
 *   1 day server revalidation interval,
 *   1 week maximum expiration.
 * – `cacheTag("recipe-${slug}")` → enables targeted on-demand
 *   invalidation via `revalidateTag("recipe-${slug}")` when recipe
 *   content is updated in the admin interface.
 *
 * NOTE(DYNAMIC DATA):
 * This function must NOT read `cookies()`, `headers()`, or any other
 * request-scoped dynamic API. Per-visitor state (like/favorite) is
 * resolved separately by UserStateProvider outside the cache scope.
 *
 * @param slug - URL-safe recipe identifier.
 * @returns Fully-hydrated recipe DTO, or `null` on miss/error.
 */
export async function getCachedRecipeBySlug(
	slug: string,
): Promise<RecipeDetailDto | null> {
	"use cache"
	cacheLife("days")
	cacheTag(`recipe-${slug}`)

	return fetchRecipeBySlug(slug)
}

/* === Internal Similar Recipe Query ================================ */
/**
 * Executes the Prisma query for recipes sharing tags with a given
 * source recipe and returns them ranked by shared-tag count.
 *
 * NOTE(DESIGN):
 * Kept package-private; callers use {@link getCachedSimilarRecipes}.
 *
 * @param recipeId - Source recipe ID used as the comparison anchor.
 * @param tagIds   - Tag IDs belonging to the source recipe.
 * @returns Up to 10 {@link RecipeCardDto} objects ordered by
 *          shared-tag count descending.
 */
async function fetchSimilarRecipes(
	recipeId: number,
	tagIds: readonly number[],
): Promise<RecipeCardDto[]> {
	if (recipeId <= 0 || tagIds.length === 0) {
		return []
	}

	try {
		const uniqueTagIds = [...new Set(tagIds)]
		const recipes = await prisma.recipe.findMany({
			where: {
				id: { not: recipeId },
				recipeTags: { some: { tagId: { in: uniqueTagIds } } },
			},
			select: {
				id: true,
				title: true,
				slug: true,
				imageUrl: true,
				prepTimeMinutes: true,
				cookTimeMinutes: true,
				likeCount: true,
				budgetLevel: true,
				difficultyLevel: true,
				createdAt: true,
				updatedAt: true,
				recipeTags: {
					select: { tagId: true },
				},
			},
		})

		const rankedRecipes = recipes
			.map((recipe) => {
				const sharedTagCount = recipe.recipeTags.reduce((count, rt) => {
					return count + (uniqueTagIds.includes(rt.tagId) ? 1 : 0)
				}, 0)

				return { recipe, sharedTagCount }
			})
			.filter((entry) => entry.sharedTagCount > 0)
			.sort((left, right) => {
				if (right.sharedTagCount !== left.sharedTagCount) {
					return right.sharedTagCount - left.sharedTagCount
				}

				if (right.recipe.likeCount !== left.recipe.likeCount) {
					return right.recipe.likeCount - left.recipe.likeCount
				}

				return (
					right.recipe.createdAt.getTime() -
					left.recipe.createdAt.getTime()
				)
			})
			.slice(0, 10)

		return rankedRecipes.map(({ recipe }) => ({
			id: recipe.id,
			title: recipe.title,
			slug: recipe.slug,
			imageUrl: recipe.imageUrl,
			prepTimeMinutes: recipe.prepTimeMinutes,
			cookTimeMinutes: recipe.cookTimeMinutes,
			likeCount: recipe.likeCount,
			budgetLevel: recipe.budgetLevel,
			difficultyLevel: recipe.difficultyLevel,
			createdAt: recipe.createdAt,
			updatedAt: recipe.updatedAt,
		}))
	} catch (e) {
		logger.warn({ err: e }, "Prisma error during similar recipe fetch:")
		return []
	}
}

/**
 * Cached public accessor for similar recipe data.
 *
 * Uses Next.js `'use cache'` to serve the ranked list of related
 * recipes from the application-level cache. The cache entry is keyed
 * by `recipeId` (tag composition is stable per recipe) and lives for
 * one day.
 *
 * CACHE STRATEGY:
 * – `cacheLife("days")` → ~24 h TTL.
 * – `cacheTag("similar-${recipeId}")` → targeted on-demand
 *   invalidation when a recipe's tags change.
 *
 * NOTE(DYNAMIC DATA):
 * Visitor like state for each card is resolved separately by
 * {@link getLikedRecipeIds} in SimilarRecipesSection, which runs
 * outside this cached scope.
 *
 * @param recipeId - Source recipe ID.
 * @param tagIds   - Tag IDs belonging to the source recipe.
 * @returns Up to 10 {@link RecipeCardDto} objects ordered by
 *          shared-tag count descending.
 */
export async function getCachedSimilarRecipes(
	recipeId: number,
	tagIds: readonly number[],
): Promise<RecipeCardDto[]> {
	"use cache"
	cacheLife("days")
	cacheTag(`similar-${recipeId}`)

	return fetchSimilarRecipes(recipeId, tagIds)
}

/**
 * Non-cached variant of the similar-recipes query.
 *
 * @deprecated Prefer {@link getCachedSimilarRecipes} for page-level
 * consumption. Retained for compatibility during migration.
 *
 * @param recipeId - Source recipe identifier.
 * @param tagIds   - Tag identifiers belonging to the source recipe.
 * @returns Promise resolving to up to 10 recipe cards ordered by
 *          shared-tag count descending.
 */
export async function getSimilarRecipes(
	recipeId: number,
	tagIds: readonly number[],
): Promise<RecipeCardDto[]> {
	return fetchSimilarRecipes(recipeId, tagIds)
}

/* === Like Functions ============================================== */
/**
 * Checks if the current visitor has already liked a recipe.
 *
 * Uses the visitor's fingerprint cookie as the unique key. Returns
 * false if no fingerprint is present (first visit, no cookie yet).
 *
 * NOTE(DYNAMIC):
 * Reads `cookies()` and `headers()` via `getVisitorIdentity()`.
 * Must NOT be called inside a `'use cache'` scope.
 *
 * @param recipeId - Database recipe ID.
 * @returns true if the visitor's like record exists.
 */
export async function hasLikedRecipe(recipeId: number): Promise<boolean> {
	const identity = await getVisitorIdentity()
	if (!identity.fingerprint) return false

	const existing = await prisma.recipeLike.findUnique({
		where: {
			recipe_visitor: {
				recipeId,
				ipHash: identity.ipHash,
				fingerprint: identity.fingerprint,
			},
		},
	})

	return !!existing
}

/* === Favorite Functions =========================================== */
/**
 * Checks whether a recipe is in a user's favorite list.
 *
 * NOTE(DYNAMIC):
 * Requires an authenticated `userId` derived from `getServerSession`.
 * Must NOT be called inside a `'use cache'` scope.
 *
 * @param recipeId - Database recipe ID.
 * @param userId   - Authenticated user's database ID.
 * @returns true if the recipe is favorited by this user.
 */
export async function isFavoritedByUser(
	recipeId: number,
	userId: number,
): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			favoriteRecipes: {
				where: { id: recipeId },
				select: { id: true },
			},
		},
	})
	return (user?.favoriteRecipes.length ?? 0) > 0
}

/**
 * Adds a recipe to a user's favorite list.
 *
 * Uses Prisma's many-to-many `connect` to create the relation
 * without touching other favorites.
 *
 * @param recipeId - Database recipe ID.
 * @param userId   - Authenticated user's database ID.
 */
export async function addFavorite(
	recipeId: number,
	userId: number,
): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			favoriteRecipes: {
				connect: { id: recipeId },
			},
		},
	})
}

/**
 * Removes a recipe from a user's favorite list.
 *
 * Uses Prisma's many-to-many `disconnect` to delete the relation
 * without affecting other favorites.
 *
 * @param recipeId - Database recipe ID.
 * @param userId   - Authenticated user's database ID.
 */
export async function removeFavorite(
	recipeId: number,
	userId: number,
): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			favoriteRecipes: {
				disconnect: { id: recipeId },
			},
		},
	})
}

// async function fetchTestData(slug: string): Promise<number> {
// 	log(`[TEST DB] FETCH "${slug}"`)

// 	const result = await prisma.recipe.findUnique({
// 		where: { slug },
// 		select: { id: true },
// 	})

// 	return result?.id ?? -1
// }

// export async function testRecipeCache(slug: string): Promise<number> {
// 	"use cache"

// 	return fetchTestData(slug)
// }

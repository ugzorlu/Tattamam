/* === Imports ============================================================== */
/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"

/* --- Authentication --- */
import { getServerSession } from "next-auth/next"

/* --- Server Infrastructure --- */
import { authOptions } from "@/lib/auth"

/* --- Utilities --- */
import { getVisitorIdentity } from "@/lib/identity"
import { logger } from "@/lib/logging"

/* --- Types --- */
import type { RecipeCardDto, InnovativeRecipeDto } from "@/lib/dto"

/* === Query Functions ====================================================== */
/**
 * Fetches trending recipes for the homepage carousel section.
 *
 * @returns Array of maximum of 10 trending recipes sorted sorted by like count.
 */
export async function getTrendingRecipes(): Promise<RecipeCardDto[]> {
	try {
		const recipes = await prisma.recipe.findMany({
			take: 10,
			orderBy: { likeCount: "desc" },
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
			},
			where: {
				likeCount: { gt: 0 },
			},
		})

		return recipes.map((recipe) => ({
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
		logger.warn({ err: e }, "Prisma edge error during prerender")
		return []
	}
}

/**
 * Fetches classical recipes for the homepage carousel section.
 *
 * @returns Array of classical recipes sorted by like count.
 */
export async function getClassicalRecipes(): Promise<RecipeCardDto[]> {
	try {
		const recipes = await prisma.recipe.findMany({
			orderBy: { likeCount: "desc" },
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
			},
			where: {
				OR: [
					{ id: 3 },
					{ id: 18 },
					{ id: 49 },
					{ id: 65 },
					{ id: 92 },
					{ id: 106 },
					{ id: 111 },
					{ id: 133 },
					{ id: 139 },
					{ id: 142 },
				],
			},
		})

		return recipes.map((recipe) => ({
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
		logger.warn({ err: e }, "Prisma edge error during prerender")
		return []
	}
}

/**
 * Fetches innovative recipes for the homepage grid section.
 *
 * @returns Array of innovative recipes sorted by oldest added.
 */
export async function getInnovativeRecipes(): Promise<InnovativeRecipeDto[]> {
	try {
		const recipes = await prisma.recipe.findMany({
			take: 6,
			where: {
				OR: [
					{ id: 77 },
					{ id: 11 },
					{ id: 55 },
					{ id: 104 },
					{ id: 123 },
					{ id: 121 },
				],
			},
			orderBy: { likeCount: "desc" },
			select: {
				id: true,
				title: true,
				slug: true,
				description: true,
				imageUrl: true,
				recipeTags: {
					include: { tag: true },
					orderBy: { importance: "desc" },
				},
				difficultyLevel: true,
			},
		})

		return recipes.map((recipe) => ({
			id: recipe.id,
			title: recipe.title,
			slug: recipe.slug,
			description: recipe.description,
			imageUrl: recipe.imageUrl,
			tags: recipe.recipeTags.map(({ tag, kind, importance }) => ({
				id: tag.id,
				name: tag.name,
				slug: tag.slug,
				kind,
				importance,
			})),
			difficultyLevel: recipe.difficultyLevel,
		}))
	} catch (e) {
		logger.warn({ err: e }, "Prisma edge error during prerender")
		return []
	}
}

/**
 * Fetches recipe IDs liked by the current visitor using browser
 * fingerprinting and IP hash.
 *
 * BEHAVIOR:
 * - Identifies visitors via IP hash + browser fingerprint
 * (no authentication required).
 * - Performs O(1) lookups using returned Set.
 * - Returns empty Set if visitor cannot be identified.
 *
 * @param recipeIds - Array of recipe IDs to check likes for.
 * @returns Promise resolving to Set of recipe IDs liked by
 * 		the current visitor.
 *
 * @example
 * const trendingIds = [1, 2, 3, 4, 5];
 * const likedIds = await getLikedRecipeIds(trendingIds);
 * if (likedIds.has(1)) console.log("Recipe 1 is liked");
 *
 * @throws May silently fail and return empty Set if database
 * 		errors occur; check logs for warnings.
 */
export async function getLikedRecipeIds(
	recipeIds: number[],
): Promise<Set<number>> {
	if (recipeIds.length === 0) {
		return new Set()
	}

	const identity = await getVisitorIdentity()

	if (!identity.fingerprint) {
		return new Set()
	}

	const likes = await prisma.recipeLike.findMany({
		where: {
			recipeId: {
				in: recipeIds,
			},
			ipHash: identity.ipHash,
			fingerprint: identity.fingerprint,
		},
		select: {
			recipeId: true,
		},
	})

	return new Set(likes.map((like) => like.recipeId))
}

/**
 * Fetches recipe IDs favorited by the currently authenticated user.
 *
 * BEHAVIOR:
 * - Requires active user session (authentication).
 * - Queries UserFavorites relationship for personalized data.
 * - Performs O(1) lookups using returned Set.
 * - Returns empty Set if user is not authenticated.
 *
 * @param recipeIds - Array of recipe IDs to check favorites for.
 * @returns Promise resolving to Set of recipe IDs favorited
 * 		by the authenticated user.
 *
 * @example
 * const innovativeIds = [5, 8, 11];
 * const favoritedIds = await getFavoritedRecipeIds(
 *   innovativeIds
 * );
 * if (favoritedIds.has(5)) {
 *   console.log("Recipe 5 is in user favorites");
 * }
 *
 * @throws May silently fail and return empty Set if database
 * 		errors occur; check logs for warnings.
 */
export async function getFavoritedRecipeIds(
	recipeIds: number[],
): Promise<Set<number>> {
	if (recipeIds.length === 0) {
		return new Set()
	}

	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return new Set()
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: {
			favoriteRecipes: {
				where: {
					id: {
						in: recipeIds,
					},
				},
				select: {
					id: true,
				},
			},
		},
	})

	if (!user) {
		return new Set()
	}

	return new Set(user.favoriteRecipes.map((recipe) => recipe.id))
}

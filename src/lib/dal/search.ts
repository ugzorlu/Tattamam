/* =============================================================================
                  	  Data Access Layer: Recipe Search
============================================================================= */
/**
 * @fileoverview
 * Recipe search queries for free-text search and category/tag filtering.
 *
 * USE CASES:
 * Category filtering, tag filtering, free-text search, all-recipes listing with
 * pagination and metadata (total count, more pages indicators).
 */

/* === Imports ============================================================== */
/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"

/* --- Utilities --- */
import { logger } from "@/lib/logging"

/* --- Types --- */
import type { CategoryDto, RecipeCardDto } from "@/lib/dto"

/* === Constants ============================================================ */
/**
 * Hard cap on the number of recipes included in JSON-LD structured data.
 *
 * Prevents unbounded database reads on very large categories while still
 * providing Google crawlers with a comprehensive recipe catalog.
 * Adjust upward only after profiling query performance on the largest
 * categories in production.
 */
const MAX_SEO_RECIPES = 200

/* === Contracts ============================================================ */
/**
 * Minimal recipe projection used exclusively for SEO structured data.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally omits all fields that are not required by JSON-LD schema.org
 * `Recipe` nodes (e.g. `likeCount`, `budgetLevel`, `difficultyLevel`).
 * This keeps the SEO fetch lean and decoupled from UI concerns.
 *
 * @see {@link getAllRecipesByCategory}
 */
export interface SeoRecipeItem {
	/** Database primary key. */
	readonly id: number
	/** Recipe display title. */
	readonly title: string
	/** URL-friendly slug used to build absolute recipe URLs. */
	readonly slug: string
	/** Absolute URL of the primary recipe image, or `null` if unavailable. */
	readonly imageUrl: string | null
	/**
	 * Preparation time in minutes.
	 * Used to generate ISO 8601 `prepTime` in the Recipe schema node.
	 */
	readonly prepTimeMinutes: number | null
	/**
	 * Cook/bake time in minutes.
	 * Used to generate ISO 8601 `cookTime` in the Recipe schema node.
	 */
	readonly cookTimeMinutes: number | null
}

export type SearchRecipesByCategoryResult = {
	category: CategoryDto
	recipes: RecipeCardDto[]

	/** Total recipe count in the database. */
	totalCount: number

	/** Indicates whether additional pages exist. */
	// hasMore: boolean
}

/**
 * Represents a keyword-based recipe search result.
 *
 * Used for free-text search operations across recipe
 * metadata such as title, description, tags, and related fields.
 */
export interface SearchRecipesByKeywordResult {
	/**
	 * The original search query string used to retrieve results.
	 */
	query: string

	/**
	 * Matched tag display name when the keyword resolves to a tag.
	 *
	 * Returns `null` when the keyword does not map to a tag record.
	 */
	tag: string | null

	/**
	 * Array of recipes matching the search criteria.
	 */
	recipes: RecipeCardDto[]

	/** Total recipe count in the database. */
	totalCount: number

	/** Indicates whether additional pages exist. */
	hasMore: boolean
}

/**
 * Paginated recipe query result.
 */
export interface GetAllRecipesResult {
	/** Recipes for the current page. */
	recipes: RecipeCardDto[]

	/** Total recipe count in the database. */
	totalCount: number

	/** Indicates whether additional pages exist. */
	// hasMore: boolean
}

type RecipeSearchRow = {
	id: number
	title: string
	slug: string
	imageUrl: string | null
	prepTimeMinutes: number | null
	cookTimeMinutes: number | null
	likeCount: number
	budgetLevel: number
	difficultyLevel: number
	createdAt: Date
	updatedAt: Date | null
}

/* === Helpers ============================================================== */
function mapRecipeToCardDto(recipe: RecipeSearchRow): RecipeCardDto {
	return {
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
	}
}

/**
 * Resolves the best matching tag name for the normalized search keyword.
 *
 * The lookup purposely performs one lightweight additional Prisma query so the
 * returned `tag` field can contain the canonical tag name rather than the raw
 * user input. Exact slug/name matches are preferred over partial contains
 * matches, and the result falls back to `null` when no tag can be inferred.
 *
 * @param keyword - Normalized keyword entered by the user.
 * @returns {Promise<string | null>} Best matched tag display name or `null`.
 */
function parseSearchKeywords(keyword: string): string[] {
	return Array.from(
		new Set(
			keyword
				.split(",")
				.map((part) => part.trim())
				.filter((part) => part.length > 0),
		),
	)
}

async function resolveMatchedTagName(
	keywords: string[],
): Promise<string | null> {
	if (keywords.length === 0) {
		return null
	}

	const candidateTags = await prisma.tag.findMany({
		where: {
			OR: keywords.flatMap((keyword) => [
				{ name: { equals: keyword } },
				{ slug: { equals: keyword } },
				{ name: { contains: keyword } },
				{ slug: { contains: keyword } },
			]),
		},
		select: {
			name: true,
			slug: true,
		},
		take: 10,
	})

	if (candidateTags.length === 0) {
		return null
	}

	const rankedTag = candidateTags
		.map((tag) => ({
			...tag,
			score: getTagMatchScore(tag.name, tag.slug, keywords),
		}))
		.sort((left, right) => {
			if (right.score !== left.score) {
				return right.score - left.score
			}

			if (left.name.length !== right.name.length) {
				return left.name.length - right.name.length
			}

			return left.name.localeCompare(right.name)
		})[0]

	return rankedTag?.name ?? null
}

/**
 * Calculates a simple ranking score for a candidate tag match.
 *
 * Higher scores represent more exact and more relevant matches so the
 * returned tag name is deterministic even when the keyword overlaps multiple
 * tags. This keeps the extra lookup cheap and avoids a more expensive full-text
 * ranking pipeline.
 *
 * @param tagName - Full tag name from the database.
 * @param tagSlug - Tag slug from the database.
 * @param keyword - Normalized keyword entered by the user.
 * @returns {number} Relative priority score for tag ranking.
 */
function getTagMatchScore(
	tagName: string,
	tagSlug: string,
	keywords: string[],
): number {
	return keywords.reduce((bestScore, keyword) => {
		const normalizedKeyword = keyword.toLowerCase()
		const normalizedTagName = tagName.toLowerCase()
		const normalizedTagSlug = tagSlug.toLowerCase()

		if (
			normalizedTagName === normalizedKeyword ||
			normalizedTagSlug === normalizedKeyword
		) {
			return Math.max(bestScore, 100)
		}

		if (normalizedTagName.includes(normalizedKeyword)) {
			return Math.max(bestScore, 80)
		}

		if (normalizedTagSlug.includes(normalizedKeyword)) {
			return Math.max(bestScore, 70)
		}

		return bestScore
	}, 0)
}

/* === Queries ============================================================== */
/**
 * Searches and retrieves recipes that belong to a specific category.
 *
 * NOTE(ARCHITECTURE):
 * Results are sorted by popularity (descending `likeCount`) with `id` as a
 * stable, unique tiebreaker. The compound sort guarantees that every
 * independent paginated query returns records in the exact same order,
 * preventing duplicated or skipped recipes when multiple records share the
 * same `likeCount` value. Without a unique secondary sort key,
 * the database is free to return rows within a tied group in arbitrary order.
 * Across two separate queries (one per "Load More" click) the engine may
 * choose a different order, so `skip` offsets no longer map to distinct
 * slices of the result set.
 *
 * @param categorySlug - Unique slug of the category to filter by.
 * @param take - Maximum number of recipes to return (default: 6).
 * @param skip - Number of recipes to skip for pagination (default: 0).
 * @returns Category data and an array of recipes as `RecipeCardDto` values.
 */
export async function searchRecipesByCategory(
	categorySlug: string,
	take: number = 6,
	skip: number = 0,
): Promise<SearchRecipesByCategoryResult> {
	try {
		const category = await prisma.category.findUnique({
			where: {
				slug: categorySlug,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
			},
		})

		const whereClause = {
			categories: {
				some: {
					slug: categorySlug,
				},
			},
		}

		const [recipes, totalCount] = await prisma.$transaction([
			prisma.recipe.findMany({
				where: whereClause,
				take,
				skip,
				/*
				 * Compound sort for stable, deterministic pagination.
				 *
				 * `likeCount` alone is non-unique, so rows within a tied group
				 * can arrive in any order on each query. Adding `id` as a
				 * secondary sort key makes the total order unique and stable,
				 * ensuring that `skip`-based offsets always reference the same
				 * slice regardless of how many times the query is re-executed.
				 */
				orderBy: [{ likeCount: "desc" }, { id: "asc" }],
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
			}),
			prisma.recipe.count({
				where: whereClause,
			}),
		])

		return {
			category: {
				id: category.id,
				name: category.name,
				slug: category.slug,
				description: category.description,
			},
			recipes: recipes.map(mapRecipeToCardDto),
			totalCount,
		}
	} catch (e) {
		logger.error(
			{ err: e },
			`Error searching recipes by category ${categorySlug}:`,
		)
		return {
			category: null,
			recipes: [],
			totalCount: 0,
		}
	}
}

/**
 * Retrieves all recipes for a given category, selecting only the minimal
 * fields required for JSON-LD structured data.
 *
 * PURPOSE:
 * Feeds {@link CategoryJsonLdSchema} with a comprehensive recipe list so
 * Google crawlers can discover the full category catalog from a single page
 * request, without affecting the UI which only receives the first page.
 *
 * NOTE(ARCHITECTURE):
 * - Use this ONLY in server-side SEO paths. Never pass the result to a
 *   Client Component — it is not part of the hydration payload.
 * - Results are capped at {@link MAX_SEO_RECIPES} to prevent unbounded reads.
 * - Sorted identically to {@link searchRecipesByCategory} (likeCount desc,
 *   id asc) so the most popular recipes surface first in the schema.
 *
 * @async
 * @param categorySlug - Unique slug of the category to filter by.
 * @param maxItems - Upper bound on returned items (default: MAX_SEO_RECIPES).
 * @returns {Promise<SeoRecipeItem[]>} Minimal recipe projections for JSON-LD.
 */
export async function getAllRecipesByCategory(
	categorySlug: string,
	maxItems: number = MAX_SEO_RECIPES,
): Promise<SeoRecipeItem[]> {
	try {
		const recipes = await prisma.recipe.findMany({
			where: {
				categories: {
					some: { slug: categorySlug },
				},
			},
			take: maxItems,
			/*
			 * Compound sort mirrors searchRecipesByCategory so the most
			 * popular recipes are listed first in the JSON-LD ItemList.
			 */
			orderBy: [{ likeCount: "desc" }, { id: "asc" }],
			select: {
				id: true,
				title: true,
				slug: true,
				imageUrl: true,
				prepTimeMinutes: true,
				cookTimeMinutes: true,
			},
		})

		return recipes
	} catch (e) {
		logger.error(
			{ err: e },
			`Error fetching SEO recipes for category ${categorySlug}:`,
		)
		return []
	}
}

/**
 * Retrieves recipes ordered by like count together with pagination metadata.
 *
 * @param take - Number of recipes to retrieve.
 * @param skip - Number of recipes to skip.
 *
 * @returns Current page recipes and total recipe count.
 *
 * @example
 * ```ts
 * const result = await getAllRecipes(12, 24)
 *
 * console.log(result.recipes)
 * console.log(result.totalCount)
 * console.log(result.hasMore)
 * ```
 */
export async function getAllRecipes(
	take?: number,
	skip?: number,
): Promise<GetAllRecipesResult> {
	try {
		const [recipes, totalCount] = await prisma.$transaction([
			prisma.recipe.findMany({
				...(take !== undefined && { take }),
				...(skip !== undefined && { skip }),
				orderBy: { id: "desc" },
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
			}),
			prisma.recipe.count(),
		])

		return {
			recipes: recipes.map((recipe) => ({
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
			})),
			totalCount,
			// hasMore: skip + recipes.length < totalCount,
		}
	} catch (error) {
		logger.error({ err: error }, "Failed to retrieve recipes.")

		return {
			recipes: [],
			totalCount: 0,
			// hasMore: false,
		}
	}
}

/**
 * Performs a comprehensive free-text keyword search across recipe metadata.
 *
 * Scans multiple text fields and related models for a case-insensitive partial
 * match, including:
 * - Recipe titles (`title`, `alternativeTitle`)
 * - Recipe descriptions
 * - Associated tags (resolved through the explicit `RecipeTag` join model)
 *
 * Search results are paginated and consistently ordered by popularity
 * (`likeCount` descending), falling back to `id` ascending to guarantee
 * stable pagination offsets.
 *
 * @param keyword - The raw, free-text search term entered by the user.
 * @param take - Maximum number of matched recipes to retrieve (default 6).
 * @param skip - Number of matched recipes to offset for pagination (default 0).
 * @returns A `SearchRecipesByKeywordResult` resolving the search intent and
 * 			matching recipes.
 */
export async function searchRecipesByKeyword(
	keyword: string,
	take: number = 6,
	skip: number = 0,
): Promise<SearchRecipesByKeywordResult> {
	try {
		const normalizedKeyword = keyword.trim()
		const searchTerms = parseSearchKeywords(normalizedKeyword)

		if (searchTerms.length === 0) {
			return {
				query: keyword,
				tag: null,
				recipes: [],
				totalCount: 0,
				hasMore: false,
			}
		}

		const matchedTagName = await resolveMatchedTagName(searchTerms)
		const searchConditions = searchTerms.flatMap((term) => [
			{
				recipeTags: {
					some: {
						tag: {
							OR: [
								{ name: { contains: term } },
								{ slug: { contains: term } },
							],
						},
					},
				},
			},
			{ title: { contains: term } },
			{ alternativeTitle: { contains: term } },
			{ description: { contains: term } },
		])

		const [recipes, totalCount] = await prisma.$transaction([
			prisma.recipe.findMany({
				where: {
					OR: searchConditions,
				},
				take,
				skip,
				orderBy: [{ likeCount: "desc" }, { id: "asc" }],
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
			}),
			prisma.recipe.count({
				where: {
					OR: searchConditions,
				},
			}),
		])

		return {
			query: keyword,
			tag: matchedTagName,
			recipes: recipes.map(mapRecipeToCardDto),
			totalCount,
			hasMore: skip + recipes.length < totalCount,
		}
	} catch (error) {
		logger.error(
			{ err: error },
			`Error searching recipes by keyword "${keyword}":`,
		)

		return {
			query: keyword,
			tag: null,
			recipes: [],
			totalCount: 0,
			hasMore: false,
		}
	}
}

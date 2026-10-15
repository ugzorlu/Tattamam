/* =============================================================================
         	Data Access Layer for taxonomy-related read models
============================================================================= */
/**
 * @fileoverview
 * Lightweight taxonomy queries for categories and tags.
 *
 * PURPOSE:
 * Provides serialization-safe, presentation-layer DTOs for sitemap
 * generation and other cross-route metadata consumers.
 *
 * NOTE(ARCHITECTURE):
 * These read models intentionally mirror the Prisma schema surface area
 * without leaking ORM-specific response shapes into the app router.
 *
 * Each category and tag entry in the sitemap carries a `latestRecipeDate`
 * that reflects when the newest recipe in that group was last modified.
 * This is resolved in a single Prisma query per model by projecting the
 * first row of the related `recipes` relation ordered by `updatedAt DESC`
 * (falling back to `createdAt` when `updatedAt` is null). The approach
 * avoids a separate aggregation query per taxonomy item and keeps the DAL
 * as a single source of truth for sitemap freshness hints.
 */

/* === Imports ============================================================== */
/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"
import { logger } from "@/lib/logging"

/* --- Types --- */
import type { CategoryDto, TagDto } from "@/lib/dto"

/* === Contracts ============================================================ */
/**
 * Result contract for retrieving all categories.
 *
 * Used by sitemap generation and other presentation-layer consumers that
 * require a lightweight category list.
 */
export interface GetAllCategoriesResult {
	readonly categories: readonly CategoryDto[]
}

/**
 * Result contract for retrieving all tags.
 *
 * Used by sitemap generation and other presentation-layer consumers that
 * require a lightweight tag list for route generation and metadata.
 */
export interface GetAllTagsResult {
	readonly tags: readonly TagDto[]
}

/* --- Sitemap-specific extensions --- */
/**
 * Extends {@link CategoryDto} with the most recent recipe modification date
 * for the category, resolved at query time.
 *
 * NOTE(ARCHITECTURE):
 * `latestRecipeDate` is `null` when a category contains no published recipes.
 * Callers should fall back to a sensible default (e.g. the build timestamp)
 * in that case so the sitemap entry is still emitted.
 */
export interface CategorySitemapEntry extends CategoryDto {
	/**
	 * The effective `lastModified` date for the category sitemap entry.
	 *
	 * Resolves to the `updatedAt` of the newest recipe in the category when
	 * available, otherwise falls back to that recipe's `createdAt`. Returns
	 * `null` if the category has no associated recipes.
	 */
	readonly latestRecipeDate: Date | null
}

/**
 * Extends {@link TagDto} with the most recent recipe modification date
 * for the tag, resolved at query time.
 *
 * NOTE(ARCHITECTURE):
 * `latestRecipeDate` is `null` when a tag has no associated recipes.
 * Callers should fall back to a sensible default (e.g. the build timestamp)
 * in that case.
 */
export interface TagSitemapEntry extends TagDto {
	/**
	 * The effective `lastModified` date for the tag sitemap entry.
	 *
	 * Resolves to the `updatedAt` of the newest recipe carrying this tag when
	 * available, otherwise falls back to that recipe's `createdAt`. Returns
	 * `null` if the tag is not associated with any recipe.
	 */
	readonly latestRecipeDate: Date | null
}

/**
 * Result contract for {@link getAllCategories} when called from the sitemap.
 *
 * Replaces the plain {@link GetAllCategoriesResult} with sitemap-enriched
 * entries that carry per-category freshness timestamps.
 */
export interface GetAllCategoriesSitemapResult {
	readonly categories: readonly CategorySitemapEntry[]
}

/**
 * Result contract for {@link getAllTags} when called from the sitemap.
 *
 * Replaces the plain {@link GetAllTagsResult} with sitemap-enriched
 * entries that carry per-tag freshness timestamps.
 */
export interface GetAllTagsSitemapResult {
	readonly tags: readonly TagSitemapEntry[]
}

/**
 * Retrieves all categories as lightweight DTOs.
 *
 * @returns A typed result containing all categories ordered by name.
 */
export async function getAllCategories(): Promise<GetAllCategoriesResult> {
	try {
		const categories = await prisma.category.findMany({
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
			},
		})

		return {
			categories: categories.map((category) => ({
				id: category.id,
				name: category.name,
				slug: category.slug,
				description: category.description,
			})),
		}
	} catch (error) {
		logger.error({ err: error }, "Failed to retrieve categories.")

		return {
			categories: [],
		}
	}
}

/**
 * Retrieves all categories enriched with the modification date of their
 * most recently updated recipe, for use in sitemap generation.
 *
 * NOTE(ARCHITECTURE):
 * Each category row is joined with a single-row projection of its newest
 * recipe (ordered by `updatedAt DESC`, `createdAt DESC`) so the sitemap
 * can emit accurate `lastModified` hints without issuing one extra query
 * per category.
 *
 * --- Performance ---
 * Prisma resolves the nested `recipes` relation as a correlated sub-select
 * (one per category row) rather than a `GROUP BY` aggregate. This is
 * acceptable for the expected taxonomy size (tens to low hundreds of
 * categories). If the category count grows significantly, consider replacing
 * this with a raw `SELECT … JOIN` using `prisma.$queryRaw`.
 *
 * @returns A result containing categories with their `latestRecipeDate`
 * 			field populated from the database.
 */
export async function getAllCategoriesForSitemap(): Promise<GetAllCategoriesSitemapResult> {
	try {
		const categories = await prisma.category.findMany({
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
				/**
				 * Fetch only the single most recently touched recipe for this
				 * category. `updatedAt DESC` surfaces edited recipes first;
				 * `createdAt DESC` acts as a stable fallback when `updatedAt`
				 * is null (i.e. the recipe has never been edited).
				 */
				recipes: {
					orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
					take: 1,
					select: {
						updatedAt: true,
						createdAt: true,
					},
				},
			},
		})

		return {
			categories: categories.map((category) => {
				/** Most recent recipe row, if any recipes exist in the category. */
				const newestRecipe = category.recipes[0] ?? null

				/**
				 * Prefer `updatedAt` (captures edits) over `createdAt` (captures
				 * initial publish). Falls back to `null` when the category is empty.
				 */
				const latestRecipeDate: Date | null =
					newestRecipe?.updatedAt ?? newestRecipe?.createdAt ?? null

				return {
					id: category.id,
					name: category.name,
					slug: category.slug,
					description: category.description,
					latestRecipeDate,
				}
			}),
		}
	} catch (error) {
		logger.error({ err: error }, "Failed to retrieve categories for sitemap.")

		return {
			categories: [],
		}
	}
}

/**
 * Retrieves all tags as lightweight DTOs.
 *
 * @returns A typed result containing all tags ordered by name.
 */
export async function getAllTags(): Promise<GetAllTagsResult> {
	try {
		const tags = await prisma.tag.findMany({
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				slug: true,
			},
			where: {
				id: {
					// Returns records where id is less than 1000 for exclusion.
					lte: 1000,
				},
			},
		})

		return {
			tags: tags.map((tag) => ({
				id: tag.id,
				name: tag.name,
				slug: tag.slug,
			})),
		}
	} catch (error) {
		logger.error({ err: error }, "Failed to retrieve tags.")

		return {
			tags: [],
		}
	}
}

/**
 * Retrieves all tags enriched with the modification date of their
 * most recently updated recipe, for use in sitemap generation.
 *
 * Tags are resolved through the explicit `RecipeTag` join model. The nested
 * `recipeTags.recipe` projection fetches only the single newest recipe row
 * (ordered by `updatedAt DESC`, `createdAt DESC`) per tag so the sitemap
 * can emit accurate `lastModified` hints in a single round trip.
 *
 * NOTE(ARCHITECTURE):
 * --- Filter ---
 * The `id <= 1000` guard mirrors the filter applied in {@link getAllTags} to
 * exclude auto-generated or system-level tags that should not appear in the
 * public sitemap.
 *
 * --- Performace ---
 * Same correlated-sub-select caveat as {@link getAllCategoriesForSitemap}.
 * Acceptable for the expected tag corpus size; revisit with `$queryRaw` if
 * the tag table grows into the thousands.
 *
 * @returns A result containing tags with their `latestRecipeDate` field
 * 			populated from the database.
 */
export async function getAllTagsForSitemap(): Promise<GetAllTagsSitemapResult> {
	try {
		const tags = await prisma.tag.findMany({
			where: {
				id: {
					// Mirrors the exclusion guard used in getAllTags.
					lte: 1000,
				},
			},
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				slug: true,
				/**
				 * Traverse Tag → RecipeTag → Recipe to obtain the timestamp of
				 * the most recently modified recipe that carries this tag.
				 * `take: 1` with a descending date sort gives the newest row
				 * without a GROUP BY or sub-query.
				 */
				recipeTags: {
					orderBy: [
						{ recipe: { updatedAt: "desc" } },
						{ recipe: { createdAt: "desc" } },
					],
					take: 1,
					select: {
						recipe: {
							select: {
								updatedAt: true,
								createdAt: true,
							},
						},
					},
				},
			},
		})

		return {
			tags: tags.map((tag) => {
				/** Most recent recipe row linked to this tag, if any. */
				const newestRecipe = tag.recipeTags[0]?.recipe ?? null

				/**
				 * Prefer `updatedAt` (captures edits) over `createdAt` (captures
				 * initial publish). Falls back to `null` when the tag has no
				 * associated recipes.
				 */
				const latestRecipeDate: Date | null =
					newestRecipe?.updatedAt ?? newestRecipe?.createdAt ?? null

				return {
					id: tag.id,
					name: tag.name,
					slug: tag.slug,
					latestRecipeDate,
				}
			}),
		}
	} catch (error) {
		logger.error({ err: error }, "Failed to retrieve tags for sitemap.")

		return {
			tags: [],
		}
	}
}

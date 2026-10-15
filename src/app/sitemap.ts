/* =============================================================================
                   	Dynamic sitemap.xml File Generator
============================================================================= */
/**
 * @fileoverview
 * Dynamic sitemap.xml file generator for the Next.js App Router.
 *
 * PURPOSE:
 * Builds canonical route metadata for static content, recipe detail pages,
 * category hubs, and tag hubs so search engines can crawl the site efficiently.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally aggregates read-model data from the DAL rather than reaching
 * into Prisma directly from the route layer.
 *
 * Freshness Strategy
 * Category and tag hub pages use the `latestRecipeDate` resolved by the DAL
 * — the `updatedAt` (or `createdAt` when never edited) of the most recently
 * modified recipe in each group. This gives search engines an accurate
 * freshness signal rather than a static build timestamp, which would cause
 * crawlers to re-index pages even when their content has not changed.
 *
 * Fallback Behavior
 * When a category or tag contains no recipes, `latestRecipeDate` is `null`.
 * In that case the sitemap entry falls back to {@link SITEMAP_FALLBACK_DATE},
 * a module-level constant set to the current build time which ensures the entry
 * is still emitted (good for discovery) while avoiding misleading freshness
 * hints.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { MetadataRoute } from "next"
import { connection } from "next/server"

/* --- Server Infrastructure --- */
import {
	getAllCategoriesForSitemap,
	getAllTagsForSitemap,
} from "@/lib/dal/taxonomy"
import { getAllRecipes } from "@/lib/dal/search"

/* --- Types --- */
import type {
	GetAllCategoriesSitemapResult,
	GetAllTagsSitemapResult,
} from "@/lib/dal/taxonomy"
import type { GetAllRecipesResult } from "@/lib/dal/search"

/* === Constants ============================================================ */
/**
 * Fallback `lastModified` date used for taxonomy pages that have no
 * associated recipes yet.
 *
 * NOTE(ARCHITECTURE):
 * Evaluated once at module load time (i.e. at build/request time in Next.js
 * ISR). Using a constant rather than inline `new Date()` calls inside the
 * `.map()` keeps the output deterministic within a single sitemap generation
 * run and makes the fallback intent explicit.
 */
const SITEMAP_FALLBACK_DATE = new Date()

/* === Main Function ======================================================== */
/**
 * Generates the published sitemap for the application.
 *
 * Emits four groups of entries:
 * 1. **Static routes** — homepage and top-level content hubs.
 * 2. **Recipe detail pages** — one entry per recipe, dated by `updatedAt`
 *    falling back to `createdAt`.
 * 3. **Tag hub pages** — one entry per tag, dated by the most recently
 *    modified recipe that carries the tag.
 * 4. **Category hub pages** — one entry per category, dated by the most
 *    recently modified recipe in the category.
 *
 * @returns A fully-typed sitemap entry list for static and dynamic routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Defers generation until a request, so recipe values are read live.
	await connection()

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

	/**
	 * Root navigation routes that do not require database lookups.
	 * `""` maps to the homepage while the remaining entries represent
	 * top-level content hubs.
	 */
	const staticRoutes = ["", "/kategori"].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
		priority: route === "" ? 1.0 : 0.8,
	}))

	/**
	 * Recipe detail pages. Uses the latest available timestamp to keep
	 * search-engine refresh hints accurate when a recipe was edited.
	 */
	const recipesResult: GetAllRecipesResult = await getAllRecipes()
	const recipeRoutes = recipesResult.recipes.map((recipe) => ({
		url: `${baseUrl}/tarif/${recipe.slug}/`,
		lastModified: new Date(recipe.updatedAt ?? recipe.createdAt),
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}))

	/**
	 * Tag index pages generated from the taxonomy table.
	 *
	 * `lastModified` is derived from the most recently updated recipe that
	 * carries each tag. Falls back to {@link SITEMAP_FALLBACK_DATE} for tags
	 * with no associated recipes so the entry is still included in the sitemap.
	 */
	const tagsResult: GetAllTagsSitemapResult = await getAllTagsForSitemap()
	const tagRoutes = tagsResult.tags.map((tag) => ({
		url: `${baseUrl}/etiket/${tag.slug}/`,
		lastModified: tag.latestRecipeDate ?? SITEMAP_FALLBACK_DATE,
		changeFrequency: "weekly" as const,
		priority: 0.6,
	}))

	/**
	 * Category index pages generated from the taxonomy table.
	 *
	 * `lastModified` is derived from the most recently updated recipe that
	 * belongs to each category. Falls back to {@link SITEMAP_FALLBACK_DATE}
	 * for empty categories so the entry is still included in the sitemap.
	 */
	const categoriesResult: GetAllCategoriesSitemapResult =
		await getAllCategoriesForSitemap()
	const categoryRoutes = categoriesResult.categories.map((category) => ({
		url: `${baseUrl}/kategori/${category.slug}/`,
		lastModified: category.latestRecipeDate ?? SITEMAP_FALLBACK_DATE,
		changeFrequency: "weekly" as const,
		priority: 0.3,
	}))

	return [...staticRoutes, ...recipeRoutes, ...tagRoutes, ...categoryRoutes]
}

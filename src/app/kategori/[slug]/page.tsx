/* =============================================================================
                     	   		Category Page
============================================================================= */
/**
 * @fileoverview
 * Server-side entry point for the dynamic category page route.
 *
 * PURPOSE:
 * Renders the category page for a given category slug.
 *
 * FLOW:
 * ~ Receives dynamic route parameter [slug] from Next.js.
 * ~ Fires two parallel DB fetches via {@link Promise.all}:
 *     1. {@link searchRecipesByCategory} (take: 6) — first page for the UI.
 *     2. {@link getAllRecipesByCategory} (up to MAX_SEO_RECIPES) — full
 *        catalog for Google bots; never touches the client bundle.
 * ~ Invokes {@link getLikedRecipeIds} to fetch liked recipe IDs for the user.
 * ~ Renders {@link CategoryJsonLdSchema} with the full SEO recipe list.
 * ~ Renders {@link CategoryPageServer} with only the first-page recipes.
 *
 * ROUTE:
 * /kategori/[slug] → e.g., /kategori/ekonomik-tarifler
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { notFound } from "next/navigation"

/* --- Server Infrastructure --- */
import { getLikedRecipeIds } from "@/lib/dal/home"
import {
	searchRecipesByCategory,
	getAllRecipesByCategory,
} from "@/lib/dal/search"

/* --- Components --- */
import CategoryPageServer from "@/components/category/CategoryPageServer"
import CategoryJsonLdSchema from "@/components/seo/CategoryJsonLdSchema"

/* --- Types --- */
import type { Metadata } from "next"
import type {
	SearchRecipesByCategoryResult,
	SeoRecipeItem,
} from "@/lib/dal/search"

/* === Metadata ============================================================= */
/**
 * Creates server-side, dynamic metadata for {@link CategoryPage} based on
 * category content.
 *
 * FLOW:
 * ~ Resolves route parameter to extract target category slug.
 * ~ Invokes {@link searchRecipesByCategory} to retrieve the data needed for
 * 	 content-aware metadata.
 * ~ Continues to content-aware metadata construction if result found.
 * ~ Returns not-found metadata if result not found.
 * ~ Constructs OpenGraph, social media metadata.
 * ~ Returns complete Metadata object for Next.js automatic <head> injection.
 *
 * NOTE(ARCHITECTURE):
 * Follows Next.js conventions for dynamic route metadata.
 * Performs data fetching to create content-aware metadata.
 *
 * INFO(FRAMEWORK):
 * Is a special Next.js function that receives route params and must return
 * Metadata object. Metadata object automatically injected into page <head>
 * by Next.js before client hydration. Errors thrown here are treated
 * as fatal and are routed through error boundaries.
 *
 * @async
 * @param params - Route parameters containing dynamic [slug] segment.
 * @returns {Promise<Metadata>} Next.js metadata object.
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	/* ── Route Parameter Resolution ──────────────────────────────────────── */
	const { slug } = await params

	/* ── Data Fetching ───────────────────────────────────────────────────── */
	const result: SearchRecipesByCategoryResult =
		await searchRecipesByCategory(slug)

	if (!result || !result.category) {
		/* ── Metadata Object ─────────────────────────────────────────────── */
		return {
			robots: { index: false }, // Does not index 404 pages.
		}
	}

	const pageTitle = `${result.category.name}`
	const pageDescription = result.category.description

	// Uses the image of first recipe.
	const pageimage = {
		url: result.recipes[0].imageUrl,
		width: 1200,
		height: 630,
	}

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
	const categoryUrl = `${baseUrl}/kategori/${result.category.slug}`

	/* ── Metadata Object ─────────────────────────────────────────────────── */
	return {
		title: pageTitle, // INFO(FRAMEWORK): Highest SEO priority.
		description: pageDescription,
		openGraph: {
			siteName: "Tattamam",
			title: pageTitle,
			description: pageDescription,
			type: "website",
			url: categoryUrl,
			locale: "tr",
			images: pageimage,
		},

		twitter: {
			card: "summary_large_image",
			title: pageTitle,
			description: pageDescription,
			images: pageimage,
		},

		alternates: {
			canonical: categoryUrl,
		},
	}
}

/* === Main Component ======================================================= */
export default async function CategoryPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	/* ─── Data Fetching ──────────────────────────────────────────────────── */
	/*
	 * Extracts the slug from route parameters.
	 */
	const { slug } = await params

	/*
	 * Fires both fetches concurrently:
	 * - `result`    → first-page recipes (take: 6) for the visible UI.
	 * - `seoRecipes` → full catalog (up to MAX_SEO_RECIPES) for JSON-LD;
	 *   server-only, never serialized to the client bundle.
	 *
	 * NOTE(ARCHITECTURE):
	 * `seoRecipes` contains the full category catalog (up to
	 * MAX_SEO_RECIPES) so crawlers see all recipes in the initial
	 * HTML, while the visible UI below still shows only 6.
	 *
	 * Using Promise.all ensures neither fetch blocks the other; the total
	 * wait time equals max(t_ui, t_seo) rather than t_ui + t_seo.
	 */
	const [result, seoRecipes]: [
		SearchRecipesByCategoryResult,
		SeoRecipeItem[],
	] = await Promise.all([
		searchRecipesByCategory(slug),
		getAllRecipesByCategory(slug),
	])

	if (!result || !result.category) {
		notFound()
	}

	const likedRecipeIds = await getLikedRecipeIds(
		result.recipes.map((recipe) => recipe.id),
	)

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			{/* ─── JSON-LD Category Schema for SEO ──────────────────────── */}
			<CategoryJsonLdSchema
				category={result.category}
				recipes={seoRecipes}
				totalCount={result.totalCount}
				baseUrl={process.env.NEXT_PUBLIC_BASE_URL || ""}
			/>

			{/* ─── Main Content ─────────────────────────────────────────── */}
			<CategoryPageServer
				category={result.category}
				recipes={result.recipes}
				likedRecipeIds={likedRecipeIds}
				totalCount={result.totalCount}
			/>
		</>
	)
}

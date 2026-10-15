/* =============================================================================
                   	   	 Search Page Entry Point
============================================================================= */
/**
 * @fileoverview
 * Server-side entry point for the dynamic search route.
 *
 * PURPOSE:
 * Fetches search results and user like state in parallel on the server.
 * Passes the resolved booleans as props to <SearchPageServer> so all components
 * receive correct initial states without extra round-trips.
 *
 * ROUTE:
 * /arama/[keyword] → e.g., /arama/dolma
 */

/* === Imports ============================================================== */
/* --- Server Infrastructure --- */
import { getLikedRecipeIds } from "@/lib/dal/home"
import { searchRecipesByKeyword } from "@/lib/dal/search"

/* --- Components --- */
import SearchPageServer from "@/components/search/SearchPageServer"

/* --- Utilities --- */
import { normalizeTurkish } from "@/utils/commons"

/* --- Types --- */
import type { Metadata } from "next"
import type { SearchRecipesByKeywordResult } from "@/lib/dal/search"

/* === Metadata ============================================================= */
/**
 * Generates server-side metadata for the dynamic search route.
 *
 * NOTE(ARCHITECTURE):
 * The search keyword is normalized before it is used to fetch the result set.
 * The resulting title and description are content-aware and reflect both the
 * user query and the most relevant recipe cards returned by the search query.
 *
 * @async
 * @param params - Route parameters containing the dynamic [keyword] segment.
 * @returns {Promise<Metadata>} Next.js metadata object for SEO injection.
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ keyword: string }>
}): Promise<Metadata> {
	/* ── Route Parameter Resolution ──────────────────────────────────────── */
	const { keyword } = await params
	const normalizedKeyword = normalizeTurkish(
		decodeURIComponent(keyword).trim(),
	)

	/* ── Search Result Resolution ────────────────────────────────────────── */
	const result: SearchRecipesByKeywordResult =
		await searchRecipesByKeyword(normalizedKeyword)

	const recipeNames = result.recipes
		.slice(0, 3)
		.map((recipe) => recipe.title.trim())
		.filter(Boolean)

	const pageTitle = `${normalizedKeyword} arama sonuçları`
	const pageDescription = [
		`${normalizedKeyword} için hazırladığımız tarifler.`,
		"Porsiyon sayısına ve anlatım tarzına göre ayarlanabilen " +
			"tam sana göre tarifler!",
		...(recipeNames.length > 0
			? [`Öne çıkan tarifler: ${recipeNames.join(", ")}.`]
			: []),
	].join(" ")

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
	const canonicalUrl =
		`${baseUrl}/arama/` + `${encodeURIComponent(normalizedKeyword)}`

	const pageImage = result.recipes[0]?.imageUrl
		? {
				url: result.recipes[0].imageUrl,
				width: 1200,
				height: 630,
			}
		: undefined

	/* ── Metadata Object ─────────────────────────────────────────────────── */
	return {
		title: pageTitle,
		description: pageDescription,
		robots: { index: false, follow: false },
		openGraph: {
			siteName: "Tattamam",
			title: pageTitle,
			description: pageDescription,
			type: "website",
			url: canonicalUrl,
			locale: "tr",
			images: pageImage,
		},
		twitter: {
			card: "summary_large_image",
			title: pageTitle,
			description: pageDescription,
			images: pageImage,
		},
		alternates: {
			canonical: canonicalUrl,
		},
	}
}

/* === Main Component ======================================================= */
export default async function SearchPage({
	params,
}: {
	params: Promise<{ keyword: string }>
}) {
	/* ─── Data Fetching ──────────────────────────────────────────────────── */
	/*
	 * Extracts the keyword from route parameters.
	 */
	const { keyword } = await params
	const normalizedKeyword = normalizeTurkish(
		decodeURIComponent(keyword).trim(),
	)

	const result: SearchRecipesByKeywordResult =
		await searchRecipesByKeyword(normalizedKeyword)

	const likedRecipeIds = await getLikedRecipeIds(
		result.recipes.map((recipe) => recipe.id),
	)

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<SearchPageServer
			searchedText={normalizedKeyword}
			matchedTag={result.tag}
			recipes={result.recipes}
			likedRecipeIds={likedRecipeIds}
			totalCount={result.totalCount}
		/>
	)
}

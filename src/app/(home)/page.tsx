/* =============================================================================
                                Home Page
============================================================================= */
/**
 * @fileoverview
 * Server-side main component for the home page route.
 *
 * PURPOSE:
 * Displays the home page hero carousel, trending recipes, classical recipes,
 * and innovative recipes in a structured layout.
 *
 * FLOW:
 * ~ Fetches trending, classical, and innovative recipes from the database.
 * ~ Retrieves liked and favorited recipe IDs for the current user.
 * ~ Renders the hero carousel, horizontal carousels for trending and classical
 *   recipes, and a vertical grid for innovative recipes.
 *
 * NOTE(ARCHITECTURE):
 * - Uses server-side rendering to fetch and prepare data before sending it to
 *   the client.
 * - Follows a modular approach by separating concerns into dedicated components
 *   for each section of the home page.
 * - Ensures SEO optimization by including a JSON-LD schema for the website.
 */

/* === Imports ============================================================== */
/* --- Server Infrastructure --- */
import {
	getTrendingRecipes,
	getClassicalRecipes,
	getInnovativeRecipes,
	getLikedRecipeIds,
	getFavoritedRecipeIds,
} from "@/lib/dal/home"

/* --- Components --- */
import HeroCarousel from "@/components/layout/hero/HeroCarousel"
import HorizontalCarousel from "@/components/recipe/HorizontalCarousel"
import VerticalGrid from "@/components/recipe/VerticalGrid"
import WebsiteJsonLdSchema from "@/components/seo/WebsiteJsonLdSchema"
import CookieBanner from "@/components/layout/cookie-banner/CookieBanner"

/* --- Types --- */
import type { RecipeCardDto, InnovativeRecipeDto } from "@/lib/dto"

/* === Main Component ======================================================= */
export default async function HomePage() {
	/* ─── Data Fetching ──────────────────────────────────────────────────── */
	/**
	 * Fetches the necessary data for the home page, including trending,
	 * classical, and innovative recipes, as well as the liked and favorited
	 * recipe IDs for the current user.
	 *
	 * NOTE(ARCHITECTURE):
	 * - Uses Promise.all to fetch all data in parallel for efficiency.
	 *
	 * @returns A Promise that resolves to an object containing fetched data.
	 */
	const [trendingRecipes, classicalRecipes, innovativeRecipes]: [
		RecipeCardDto[],
		RecipeCardDto[],
		InnovativeRecipeDto[],
	] = await Promise.all([
		getTrendingRecipes(),
		getClassicalRecipes(),
		getInnovativeRecipes(),
	])

	/**
	 * Fetches the liked and favorited recipe IDs for the current user.
	 *
	 * NOTE(ARCHITECTURE):
	 * - Uses Promise.all to fetch all data in parallel for efficiency.
	 *
	 * @param recipeIds - An array of recipe IDs to check
	 * 					  for liked and favorited status.
	 * @returns A Promise that resolves to a tuple containing two sets:
	 *          - Set of liked recipe IDs
	 *          - Set of favorited recipe IDs
	 */
	const [likedRecipeIds, favoritedRecipeIds]: [Set<number>, Set<number>] =
		await Promise.all([
			getLikedRecipeIds(
				trendingRecipes
					.concat(classicalRecipes)
					.map((recipe) => recipe.id),
			),
			getFavoritedRecipeIds(innovativeRecipes.map((recipe) => recipe.id)),
		])

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const mainClass =
		"h-auto mx-auto w-full max-w-[1600px] px-2 md:px-6 xl:px-10 py-6"

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			{/* ─── JSON-LD Website Schema for SEO ───────────────────────── */}
			<WebsiteJsonLdSchema
				baseUrl={process.env.NEXT_PUBLIC_BASE_URL || ""}
			/>

			{/* ─── Main Content ─────────────────────────────────────────── */}
			<main className={mainClass}>
				<HeroCarousel />

				{/* Trending Recipes Section */}
				<HorizontalCarousel
					title="Popüler"
					recipes={trendingRecipes}
					likedRecipeIds={likedRecipeIds}
				/>

				{/* Classical Recipes Section */}
				<HorizontalCarousel
					title="Klasikler"
					recipes={classicalRecipes}
					likedRecipeIds={likedRecipeIds}
				/>

				{/* Innovative Recipes Section */}
				<VerticalGrid
					recipes={innovativeRecipes}
					favoritedRecipeIds={favoritedRecipeIds}
				/>
				<CookieBanner />
			</main>
		</>
	)
}

/* =============================================================================
                              All Recipes Page
============================================================================= */
/**
 * @fileoverview
 * Renders the all recipes page, which displays a comprehensive list of recipes
 * available on the platform. Accessible to all users and provides a paginated
 * view of recipes, along with the ability to like recipes if the user is
 * authenticated.
 *
 * FLOW:
 * ~ Fetches initial recipe batch.
 * ~ Gets liked recipe IDs for current user.
 * ~ Passes data to CategoryPageServer for rendering.
 */

/* === Imports ============================================================== */
/* --- Server Infrastructure --- */
import { getLikedRecipeIds } from "@/lib/dal/home"
import { getAllRecipes } from "@/lib/dal/search"

/* --- Components --- */
import CategoryPageServer from "@/components/category/CategoryPageServer"

/* --- Types --- */
import type { Metadata } from "next"
import type { GetAllRecipesResult } from "@/lib/dal/search"

/* === Metadata ============================================================= */
export const metadata: Metadata = {
	title: "Tüm Tarifler",
	description: "Farklı damak tatlarına ve her ana uygun tüm tariflerimiz.",
	robots: { index: false, follow: false },
}

/* === Main Component ======================================================= */
export default async function AllRecipesPage() {
	/* ─── Data Fetching ──────────────────────────────────────────────────── */
	const result: GetAllRecipesResult = await getAllRecipes(12, 0)

	const likedRecipeIds = await getLikedRecipeIds(
		result.recipes.map((recipe) => recipe.id),
	)

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<CategoryPageServer
			category={{
				id: 0,
				name: "Tüm Tarifler",
				slug: "",
				description:
					"Farklı damak tatlarına ve her ana uygun, " +
					"çeşit çeşit yemeklerimizin tamamı.",
			}}
			recipes={result.recipes}
			likedRecipeIds={likedRecipeIds}
			totalCount={result.totalCount}
		/>
	)
}

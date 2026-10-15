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
/* --- Externals --- */
import { Suspense } from "react"
import { connection } from "next/server"

/* --- Server Infrastructure --- */
import { getLikedRecipeIds } from "@/lib/dal/home"
import { getAllRecipes } from "@/lib/dal/search"

/* --- Components --- */
import CategoryPageServer from "@/components/category/CategoryPageServer"

/* --- Types --- */
import type { GetAllRecipesResult } from "@/lib/dal/search"

/* === Skeleton components ================================================== */
function AllRecipesSkeleton(): React.ReactElement {
	/* === Class Aggregates ===================================================== */
	const mainSkeletonClass =
		"h-16 w-16 animate-pulse rounded-full bg-surface-container-high"

	return (
		<div className="flex min-h-[60vh] w-full items-center justify-center">
			<div className={mainSkeletonClass} />
		</div>
	)
}

/* === Sub-components ======================================================= */
async function AllRecipesContent(): Promise<React.ReactElement> {
	await connection()

	const result: GetAllRecipesResult = await getAllRecipes(12, 0)
	const likedRecipeIds = await getLikedRecipeIds(
		result.recipes.map((recipe) => recipe.id),
	)

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

/* === Main Component ======================================================= */
export default function AllRecipesPage(): React.ReactElement {
	return (
		<Suspense fallback={<AllRecipesSkeleton />}>
			<AllRecipesContent />
		</Suspense>
	)
}

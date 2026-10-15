/* =============================================================================
                  Vertical Innovative Recipe Grid
============================================================================= */
/**
 * @fileoverview
 * Renders a horizontal carousel of innovative recipe cards for the homepage.
 *
 * PURPOSE:
 * Designed to display a scrollable list of recipe cards in a vertical layout.
 * Used mainly on the homepage to showcase innovative recipes,
 * allowing users to quickly browse through new options.
 *
 * NOTE(ARCHITECTURE)
 * The grid is scrollable and displays recipe cards with favorite button.
 * There is a finite number of recipes to show and strictly 3 tags per recipe.
 * Receives an array of recipe data transfer objects and a set of favorite
 * recipe IDs for efficient rendering.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { getServerSession } from "next-auth/next"

/* --- Server Infrastructure --- */
import { authOptions } from "@/lib/auth"

/* --- Components --- */
import RecipeInnovativeCard from "@/components/recipe/RecipeInnovativeCard"

/* --- Types --- */
import type { InnovativeRecipeDto } from "@/lib/dto"

/* === Contracts ============================================================ */
/**
 * Properties required by {@link VerticalGrid}.
 *
 * @property recipes - Recipe cards for the current page.
 * @property favoritedRecipeIds - Set of recipe IDs currently favorited by user.
 * 							Used for O(1) lookup when rendering recipe cards.
 */
interface VerticalGridProps {
	recipes: InnovativeRecipeDto[]
	favoritedRecipeIds: Set<number>
}

/**
 * Renders a vertical grid of recipe cards.
 *
 * @param recipes - Array of recipe data transfer objects.
 * @param favoritedRecipeIds - Set of recipe IDs currently favorited by user.
 * @returns {Promise<React.ReactElement>} - The rendered horizontal carousel.
 */
export default async function VerticalGrid({
	recipes,
	favoritedRecipeIds,
}: VerticalGridProps): Promise<React.ReactElement> {
	/* ── Data Fetching ────────────────────────────────────────────── */
	const session = await getServerSession(authOptions)

	/* Resolve user favorite state (requires auth) */
	const isLoggedIn = !!session?.user

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const headerClass =
		"font-headline-lg font-semibold text-headline-lg text-on-surface mb-6"

	const gridContainerClass =
		"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<section id="home-innovative" className="mb-12">
			<h2 className={headerClass}>Yenilikçi</h2>

			<div className={gridContainerClass}>
				{recipes.map((recipe) => (
					<RecipeInnovativeCard
						key={recipe.id}
						recipe={recipe}
						isLoggedIn={isLoggedIn}
						initialFavorited={favoritedRecipeIds.has(recipe.id)}
					/>
				))}
			</div>
		</section>
	)
}

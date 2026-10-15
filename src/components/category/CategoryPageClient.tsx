/* =============================================================================
                     	   		Category Page Client
============================================================================= */
/**
 * @fileoverview
 * Client-side component for rendering a list of recipe cards in a paginated
 * manner on the category page.
 *
 * PURPOSE:
 * Displays a grid of recipe cards for a given category, progress indicator,
 * and a "Load More" button for pagination.
 *
 * NOTE(ARCHITECTURE):
 * - Implemented as a Client Component to handle user interactions such as
 *   "Load More" button clicks and state management for pagination.
 * - Uses React hooks for state and transition management.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useTransition } from "react"

/* --- Actions --- */
import {
	searchRecipesByCategoryAction,
	getAllRecipesAction,
} from "@/app/actions/category"

/* --- Components --- */
import RecipeCard, { RecipeCardLoading } from "@/components/recipe/RecipeCard"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* --- Assets --- */
import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid"

/* === Constants ============================================================ */
const PAGE_SIZE: number = 6

/* === Contracts ============================================================ */
interface CategoryPageClientProps {
	categorySlug?: string
	initialRecipes: RecipeCardDto[]
	likedRecipeIds: Set<number>
	totalCount: number
}

/* === Main Component ======================================================= */
export default function CategoryPageClient({
	categorySlug,
	initialRecipes,
	likedRecipeIds,
	totalCount,
}: CategoryPageClientProps): React.ReactElement {
	/* ─── States ─────────────────────────────────────────────────────────── */
	const [recipes, setRecipes] = useState<RecipeCardDto[]>(initialRecipes)
	const hasMore = recipes.length < totalCount

	/* ─── Hooks ──────────────────────────────────────────────────────────── */
	const [isPending, startTransition] = useTransition()

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	function handleLoadMore() {
		startTransition(async () => {
			const nextRecipes = categorySlug
				? await searchRecipesByCategoryAction(
						categorySlug,
						PAGE_SIZE,
						recipes.length,
					)
				: await getAllRecipesAction(PAGE_SIZE, recipes.length)

			setRecipes((current) => [...current, ...nextRecipes])
		})
	}

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const recipeGridContainerClass =
		"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"

	const progressIndicatorContainerClass =
		"flex flex-col items-center justify-center mt-stack-lg gap-4"

	const shownRecipePercentage = (recipes.length / totalCount) * 100

	const loadMoreButtonClass = [
		"bg-primary text-on-primary",
		"font-label-md px-10 py-4",
		"rounded-full",
		"hover:bg-on-primary-container",
		"active:scale-95",
		"transition-all",
		"flex items-center gap-2",
		"cursor-pointer",
	].join(" ")

	const progressTrackClass = [
		"w-64 h-1.5",
		"bg-surface-container",
		"rounded-full overflow-hidden",
		"mt-2",
	].join(" ")

	const progressFillClass = ["h-full bg-primary rounded-full"].join(" ")

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<>
			{/* Recipe Grid */}
			<section className={recipeGridContainerClass}>
				{recipes.map((recipe) => (
					<RecipeCard
						key={recipe.id}
						recipe={recipe}
						initialLiked={likedRecipeIds.has(recipe.id)}
						mode="search"
					/>
				))}

				{isPending && (
					<>
						{Array.from({ length: PAGE_SIZE }).map((_, index) => (
							<RecipeCardLoading key={index} />
						))}
					</>
				)}
			</section>

			{/* Progress Indicator */}
			<section className={progressIndicatorContainerClass}>
				{hasMore && (
					<button
						onClick={handleLoadMore}
						disabled={isPending}
						className={loadMoreButtonClass}
					>
						{isPending ? "Yükleniyor..." : "Daha Fazla Tarif Yükle"}
						<ChevronDoubleDownIcon className="size-4" />
					</button>
				)}

				<p className="text-on-surface-variant font-label-md">
					Toplam {totalCount} tariften {recipes.length} tanesi
					gösteriliyor
				</p>

				<div className={progressTrackClass}>
					<div
						className={progressFillClass}
						style={{ width: `${shownRecipePercentage}%` }}
					></div>
				</div>
			</section>
		</>
	)
}

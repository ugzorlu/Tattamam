/* =============================================================================
                   	   	Search Recipe List Client Component
============================================================================= */
/**
 * @fileoverview
 * Client-side component for the search recipe list.
 *
 * PURPOSE:
 * Manages the display and loading of recipe cards for the search results page.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useTransition } from "react"

/* --- Actions --- */
import { searchRecipesByKeywordAction } from "@/app/actions/search"

/* --- Components --- */
import RecipeCard, { RecipeCardLoading } from "@/components/recipe/RecipeCard"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* --- Assets --- */
import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid"

/* === Contracts ============================================================ */
interface SearchRecipeListProps {
	searchedText: string
	initialRecipes: RecipeCardDto[]
	likedRecipeIds: Set<number>
	totalCount: number
}

/* === Main Component ======================================================= */
export default function SearchRecipeList({
	searchedText,
	initialRecipes,
	likedRecipeIds,
	totalCount,
}: SearchRecipeListProps): React.ReactElement {
	/* ── Constants ───────────────────────────────────────────────────────── */
	const PAGE_SIZE: number = 6

	/* ── States ──────────────────────────────────────────────────────────── */
	const [recipes, setRecipes] = useState<RecipeCardDto[]>(initialRecipes)
	const hasMore = recipes.length < totalCount

	const [isPending, startTransition] = useTransition()

	/* ── Handlers ────────────────────────────────────────────────────────── */
	function handleLoadMore() {
		startTransition(async () => {
			const nextRecipes = await searchRecipesByKeywordAction(
				searchedText,
				PAGE_SIZE,
				recipes.length,
			)

			setRecipes((current) => [...current, ...nextRecipes])
		})
	}

	/* ── Class Aggregates ────────────────────────────────────────────────── */
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

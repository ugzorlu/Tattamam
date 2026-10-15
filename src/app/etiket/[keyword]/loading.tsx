/* =============================================================================
                           Search Page Loading Skeleton
============================================================================= */
/**
 * @fileoverview
 * Displays a loading skeleton UI that mimics the structure of
 * CategoryPageServer while page data is being fetched from the
 * server.
 */

/* === Imports ============================================================== */
/* --- Components --- */
import { RecipeCardLoading } from "@/components/recipe/RecipeCard"

/* --- Assets --- */
import { ChevronRightIcon } from "@heroicons/react/24/solid"

/**
 * SearchPageLoading Component
 *
 * Server component that renders skeleton UI while the category
 * page is loading. Structure mirrors:
 * - CategoryPageServer (header section)
 * - CategoryPageClient (recipe grid & progress indicator)
 *
 * @component
 * @returns {React.ReactElement} Skeleton loading UI
 */
export default function SearchPageLoading(): React.ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const mainClass = [
		"h-auto pt-8 pb-stack-lg max-w-container-max mx-auto",
		"px-margin-mobile md:px-margin-desktop",
	].join(" ")

	const headerClass = [
		"mb-stack-sm border-b border-outline-variant/30",
		"pb-stack-md",
	].join(" ")

	const topContainerClass = [
		"flex flex-col md:flex-row md:items-end",
		"justify-between gap-stack-sm",
	].join(" ")

	const navigationClass = [
		"flex items-center gap-2 mb-2",
		"text-on-surface-variant font-label-sm",
		"uppercase tracking-widest",
	].join(" ")

	const skeletonBaseClass = "rounded bg-surface-container animate-pulse"

	const recipeGridClass = [
		"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
	].join(" ")

	const progressContainerClass = [
		"flex flex-col items-center justify-center",
		"mt-stack-lg gap-4",
	].join(" ")

	const progressBarTrackClass =
		"w-64 h-1.5 bg-surface-container rounded-full overflow-hidden mt-2"

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<main className={mainClass}>
			{/* Header Section - Mimics CategoryPageServer */}
			<header className={headerClass}>
				<div className={topContainerClass}>
					<div>
						{/* Navigation Breadcrumb Skeleton */}
						<div className={navigationClass}>
							<span>Arama Sonuçları</span>
							<ChevronRightIcon className="size-4" />
							<div className={`h-4 w-48 ${skeletonBaseClass}`} />
						</div>

						{/* Category Title Skeleton */}
						<div
							className={`h-12 w-96 mb-2 ${skeletonBaseClass}`}
						/>

						{/* Category Description Skeleton */}
						<div className="space-y-2">
							<div
								className={`h-4 w-full ${skeletonBaseClass}`}
							/>
							<div className={`h-4 w-2/3 ${skeletonBaseClass}`} />
						</div>
					</div>

					{/* Total Recipe Count Skeleton */}
					<div className="flex items-center gap-1">
						<div className={`h-4 w-12 ${skeletonBaseClass}`} />
						<div className={`h-4 w-20 ${skeletonBaseClass}`} />
					</div>
				</div>
			</header>

			{/* Recipe Grid - Mimics CategoryPageClient */}
			<section className={recipeGridClass}>
				{Array.from({ length: 6 }).map((_, index) => (
					<RecipeCardLoading key={index} />
				))}
			</section>

			{/* Progress Indicator Section Skeleton */}
			<section className={progressContainerClass}>
				{/* Load More Button Skeleton */}
				<div
					className={`h-12 w-64 rounded-full ${skeletonBaseClass}`}
				/>

				{/* Progress Text Skeleton */}
				<div className={`h-4 w-72 ${skeletonBaseClass}`} />

				{/* Progress Bar Track Skeleton */}
				<div className={progressBarTrackClass} />
			</section>
		</main>
	)
}

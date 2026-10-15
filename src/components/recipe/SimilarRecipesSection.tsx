/* =============================================================================
                   		Similar Recipes Section
============================================================================= */
/**
 * @fileoverview
 * Server component that streams the related-recipes carousel after the main
 * recipe content is ready.
 */

/* === Imports ============================================================== */
/* --- Server Infrastructure --- */
import { getSimilarRecipes } from "@/lib/dal/recipe"
import { getLikedRecipeIds } from "@/lib/dal/home"

/* --- Components --- */
import HorizontalCarousel from "@/components/recipe/HorizontalCarousel"

/* === Contracts ============================================================ */
interface SimilarRecipesSectionProps {
	recipeId: number
	tagIds: readonly number[]
	tagSlugs: readonly string[]
}

/* === Main Component ======================================================= */
/**
 * Renders a carousel of similar recipes based on shared tags.
 *
 * SEO STRATEGY:
 * This section is marked with `data-nosnippet` to prevent it from being
 * included in Google search result snippets. This improves snippet quality
 * by focusing on primary recipe content while maintaining internal link
 * discoverability through the carousel links.
 *
 * ROBOTS DIRECTIVE SEMANTICS:
 * - `data-nosnippet`: Prevents content from appearing in search snippets
 *   (Google-supported de facto standard). Does not affect crawlability or
 *   the ability to discover linked pages.
 * - Internal links remain crawlable and follow-able, allowing Google to
 *   discover related recipe pages through the carousel.
 * - Individual "show more" links use `rel="nofollow"` to prevent tag pages
 *   from inheriting excessive link equity from this generated section.
 *
 * REFERENCE:
 * https://support.google.com/webmasters/answer/185879#data-nosnippet
 */
export default async function SimilarRecipesSection({
	recipeId,
	tagIds,
	tagSlugs,
}: SimilarRecipesSectionProps): Promise<React.ReactElement> {
	/* ── Data Fetching ───────────────────────────────────────────────────── */
	const similarRecipes = await getSimilarRecipes(recipeId, tagIds)

	/* ── Data Preparation ────────────────────────────────────────────────── */
	const likedRecipeIds =
		similarRecipes.length > 0
			? await getLikedRecipeIds(similarRecipes.map((item) => item.id))
			: new Set<number>()

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div
			className="h-auto mx-auto w-full px-2 md:px-6 xl:px-10 py-2 md:py-6"
			data-nosnippet
		>
			<HorizontalCarousel
				title="Benzer Tarifler"
				recipes={similarRecipes}
				likedRecipeIds={likedRecipeIds}
				showMoreHref={`/etiket/${tagSlugs.join(",")}`}
				showMoreRel="nofollow"
			/>
		</div>
	)
}

/* === Skeleton Component =================================================== */
export function SimilarRecipesSectionSkeleton(): React.ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const titleSkeletonClass =
		"h-8 w-40 animate-pulse rounded bg-surface-container-high"

	const showMoreButtonSkeletonClass =
		"h-6 w-20 animate-pulse rounded bg-surface-container-high"

	const recipeCardSkeletonClass =
		"h-56 w-48 shrink-0 animate-pulse rounded-2xl bg-surface-container-high"

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className="h-auto mx-auto w-full px-2 py-6 md:px-6 xl:px-10">
			<div className="mb-6 flex items-end justify-between">
				<div className={titleSkeletonClass} />
				<div className={showMoreButtonSkeletonClass} />
			</div>
			<div className="flex gap-4 overflow-hidden">
				{Array.from({ length: 10 }).map((_, index) => (
					<div key={index} className={recipeCardSkeletonClass} />
				))}
			</div>
		</div>
	)
}

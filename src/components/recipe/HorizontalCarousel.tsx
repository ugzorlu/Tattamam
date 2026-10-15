/* =============================================================================
                  		Horizontal Recipe Carousel
============================================================================= */
/**
 * @fileoverview
 * Client component that renders a horizontal carousel of recipe cards.
 *
 * USE CASES:
 * - Homepage trending recipe sections and detail-page related recipes.
 * - Any future use case that requires a horizontal carousel of recipe cards.
 *
 * NOTE(ARCHITECTURE):
 * The shell is intentionally presentation-focused so it can be composed by
 * different server components while keeping the client behavior centralized.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import Link from "next/link"

/* --- Components --- */
import HorizontalCarouselClient from "@/components/recipe/HorizontalCarouselClient"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* === Contracts ============================================================ */
/**
 * Properties required by {@link HorizontalCarousel}.
 *
 * @property title - Title of the carousel section (e.g., "Trending Recipes").
 * @property recipes - Recipe cards for the current page.
 * @property likedRecipeIds - Set of recipe IDs currently liked by the user.
 * 							Used for O(1) lookup when rendering recipe cards.
 * @property showMoreHref - Optional URL for the "Show More" link.
 * 							Defaults to "/tarif".
 * @property showMoreRel - Optional rel attribute for the show more link
 * 						   (e.g., "nofollow")
 */
interface HorizontalCarouselProps {
	title: string
	recipes: RecipeCardDto[]
	likedRecipeIds: Set<number>
	showMoreHref?: string
	showMoreRel?: string
}

/* === Main Component ======================================================= */
/**
 * Renders a container and header for a horizontal carousel of recipe cards.
 *
 * @component
 * @param HorizontalCarouselProps - See {@link HorizontalCarouselProps}.
 * @returns {React.ReactElement} - The rendered horizontal carousel.
 */
export default function HorizontalCarousel({
	title,
	recipes,
	likedRecipeIds,
	showMoreHref = "/tarif/",
	showMoreRel,
}: HorizontalCarouselProps): React.ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const headerClass = [
		"font-headline-lg font-semibold text-headline-lg text-on-surface",
	].join(" ")

	const showMoreButtonClass = [
		"font-label-md font-semibold",
		"text-label-md text-primary hover:text-primary/80 transition-colors",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<section id="home-popular" className="mb-12 scroll-mt-24">
			<div className="flex justify-between items-end mb-6">
				<h2 className={headerClass}>{title}</h2>
				<Link
					className={showMoreButtonClass}
					href={showMoreHref}
					prefetch={false}
					rel={showMoreRel}
				>
					Hepsini Gör
				</Link>
			</div>
			<HorizontalCarouselClient
				recipes={recipes}
				likedRecipeIds={likedRecipeIds}
			/>
		</section>
	)
}

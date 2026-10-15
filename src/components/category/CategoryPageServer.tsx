/* =============================================================================
                     	   		Category Page Server
============================================================================= */
/**
 * @fileoverview
 * Server-side main component for the category page route.
 *
 * PURPOSE:
 * Renders the category page with its recipes in a structured layout.
 *
 * NOTE(ARCHITECTURE):
 * - Implemented as a Server Component to leverage server-side rendering
 * 	 for SEO and performance.
 * - Uses data-driven rendering to avoid duplicated markup.
 * - Shared typography and animation styles are centralized to improve
 *   maintainability and keep line lengths within project standards.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import Link from "next/link"

/* --- Components --- */
import CategoryPageClient from "@/components/category/CategoryPageClient"

/* --- Types --- */
import type { CategoryDto, RecipeCardDto } from "@/lib/dto"

/* --- Assets --- */
import { ChevronRightIcon } from "@heroicons/react/24/solid"

/* === Contracts ============================================================ */
/**
 * Properties required by {@link CategoryPageServer}.
 *
 * @property categoryName -
 * @property recipes - Recipe cards for the current page.
 * @property likedRecipeIds - Set of recipe IDs currently liked by the user.
 * 							Used for O(1) lookup when rendering recipe cards.
 * @property totalCount - Total recipe count in the database.
 * @property hasMore - Indicates whether additional pages exist.
 */
interface CategoryPageServerProps {
	category?: CategoryDto
	recipes: RecipeCardDto[]
	likedRecipeIds: Set<number>
	totalCount: number
}

/* === Main Component ======================================================= */
export default function CategoryPageServer({
	category,
	recipes,
	likedRecipeIds,
	totalCount,
}: CategoryPageServerProps): React.ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const mainClass = [
		"h-auto pt-8 pb-stack-lg max-w-container-max mx-auto",
		"px-margin-mobile md:px-margin-desktop",
	].join(" ")

	const headerClass = [
		"mb-stack-sm border-b border-outline-variant/30 pb-stack-md",
	].join(" ")

	const topContainerClass = [
		"flex flex-col md:flex-row md:items-end justify-between gap-stack-sm",
	].join(" ")

	const navigationContainerClass = [
		"flex items-center gap-2 mb-2 text-on-surface-variant font-label-sm",
		"uppercase tracking-widest",
	].join(" ")

	const categoryNameClass =
		"font-headline-xl text-headline-xl text-on-surface mb-2"

	const categoryTextClass = "text-on-surface-variant font-body-lg"

	const totalRecipeCountContainerClass = [
		"flex items-center gap-1 text-on-surface-variant font-body-md italic",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<main className={mainClass}>
			<header className={headerClass}>
				<div className={topContainerClass}>
					<div>
						<nav className={navigationContainerClass}>
							<Link href="/kategori">Kategoriler</Link>
							<ChevronRightIcon className="size-4" />
							<span className="text-primary">
								{category.name}
							</span>
						</nav>
						<h1 className={categoryNameClass}>{category.name}</h1>
						<p className={categoryTextClass}>
							{category.description}
						</p>
					</div>
					<div className={totalRecipeCountContainerClass}>
						<span className="font-bold text-on-surface">
							{totalCount}
						</span>
						<span className="text-on-surface"> tarif</span>
					</div>
				</div>
			</header>

			<CategoryPageClient
				categorySlug={category.slug}
				initialRecipes={recipes}
				likedRecipeIds={likedRecipeIds}
				totalCount={totalCount}
			/>
		</main>
	)
}

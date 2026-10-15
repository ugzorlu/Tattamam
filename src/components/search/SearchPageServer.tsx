/* =============================================================================
                   	   	Search Page Server Component
============================================================================= */
/**
 * @fileoverview
 * Server-side component for the dynamic search route.
 *
 * PURPOSE:
 * Renders the search results page with recipe cards and user like state.
 * Receives props from {@link SearchPage} after server-side data fetching.
 */

/* === Imports ============================================================== */
/* --- Components --- */
import SearchRecipeList from "@/components/search/SearchRecipeList"
import { generateTagTitleVariants } from "@/utils/turkish"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* --- Assets --- */
import { ChevronRightIcon } from "@heroicons/react/24/solid"

/* === Contracts ============================================================ */
/**
 * Properties required by {@link SearchPageServer}.
 *
 * @property searchedText - The keyword used for the search query.
 * @property recipes - Recipe cards for the current page.
 * @property likedRecipeIds - Set of recipe IDs currently liked by the user.
 * 							Used for O(1) lookup when rendering recipe cards.
 * @property totalCount - Total recipe count in the database.
 * @property hasMore - Indicates whether additional pages exist.
 */
interface SearchPageServerProps {
	searchedText: string
	matchedTag: string | null
	recipes: RecipeCardDto[]
	likedRecipeIds: Set<number>
	totalCount: number
}

/* === Main Component ======================================================= */
export default function SearchPageServer({
	searchedText,
	matchedTag,
	recipes,
	likedRecipeIds,
	totalCount,
}: SearchPageServerProps): React.ReactElement {
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

	const tagNameClass =
		"font-headline-xl text-headline-xl text-on-surface mb-2"
	const tagTextClass = "text-on-surface-variant font-body-lg"

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
							<span>Arama Sonuçları</span>
							<ChevronRightIcon className="size-4" />
							<span className="text-primary">{searchedText}</span>
						</nav>
						{matchedTag && (
							<>
								<h1 className={tagNameClass}>
									{generateTagTitleVariants(matchedTag)}
								</h1>
								<p className={tagTextClass}>
									{matchedTag} ile hazırlanan, porsiyon
									sayısına ve anlatım tarzına göre
									ayarlanabilen tam sana göre tarifler.
								</p>
								<p className={tagTextClass}>
									{matchedTag} ile ne yemek yapılır?{" "}
									{matchedTag} nasıl değerlendirilir? Cevaplar
									için doğru adrestesin.
								</p>
							</>
						)}
					</div>
					<div className={totalRecipeCountContainerClass}>
						<span className="font-bold text-on-surface">
							{totalCount}
						</span>
						<span className="text-on-surface"> tarif</span>
					</div>
				</div>
			</header>

			<SearchRecipeList
				searchedText={searchedText}
				initialRecipes={recipes}
				likedRecipeIds={likedRecipeIds}
				totalCount={totalCount}
			/>
		</main>
	)
}

/**
 * ============================================================================
 * 								Profile Page
 * ============================================================================
 *
 * @fileoverview
 * Server-rendered profile page responsible for displaying:
 * - User identity information
 * - Membership metadata
 * - Favorite recipes
 * - Account security controls
 * - logout entry point inside the account security panel
 *
 * NOTE(ARCHITECTURE):
 * Data is provided by the parent route and rendered without
 * additional data fetching.
 *
 * - Fast server-side rendering
 * - Minimal client-side JavaScript
 * - Clear separation between profile presentation and account actions
 */

/* === Imports ============================================================== */
/* --- Components --- */
import RecipeCard from "@/components/recipe/RecipeCard"
import SecurityPanel from "@/components/profile/SecurityPanel"

/* --- Types --- */
import type { UserProfileDto, RecipeCardDto } from "@/lib/dto"

/* --- Assets --- */
import { UserIcon, BookmarkIcon } from "@heroicons/react/24/outline"

/* === Contracts ============================================================ */
/**
 * Properties required by ProfilePageServer.
 *
 * @property userProfile - Fully hydrated user profile DTO.
 * @property likedRecipeIds - Set of recipe IDs currently liked by the user.
 * 							Used for O(1) lookup when rendering recipe cards.
 */
interface ProfilePageServerProps {
	userProfile: UserProfileDto
	likedRecipeIds: Set<number>
}

/* === Main Component ======================================================= */
/**
 * Renders the authenticated user's profile page.
 *
 * Displays:
 * - Username and membership information
 * - Favorite recipe collection
 * - Password management controls
 *
 * @component
 * @param props Profile page rendering data.
 * @returns Server-rendered profile page.
 */
export default function ProfilePageServer({
	userProfile,
	likedRecipeIds,
}: ProfilePageServerProps): React.ReactElement {
	/* ─── Derived Values ─────────────────────────────────────────────────── */
	const joinedYear = new Date(userProfile.createdAt).getFullYear()
	const joinedText = `${joinedYear} yılından beri Tattamam üyesi`

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const mainClass = ["max-w-7xl mx-auto px-4 md:px-10 mb-12"].join(" ")

	const headerClass = [
		"flex flex-col items-center text-center",
		"mb-12 animate-in fade-in zoom-in duration-500",
	].join(" ")

	const avatarBoxClass = [
		"w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface-container",
		"flex items-center justify-center mb-6 border-4 border-white",
		"shadow-sm overflow-hidden",
	].join(" ")

	const h1Class =
		"font-headline-xl font-semibold text-headline-xl text-primary"

	const subTextClass = [
		"font-body-lg text-body-lg text-on-surface-variant",
		"mt-2 max-w-lg",
	].join(" ")

	const gridClass = "grid grid-cols-1 lg:grid-cols-12 gap-6"
	const leftColClass = "lg:col-span-8 space-y-6"
	const rightColClass = "lg:col-span-4 space-y-6"

	const favHeaderClass = [
		"font-headline-lg font-semibold",
		"text-headline-lg text-on-surface",
		"flex items-center gap-2 ",
	].join(" ")

	const favGridClass = "grid grid-cols-1 md:grid-cols-2 gap-6"

	const emptyBoxClass = [
		"bg-surface-container-low rounded-xl p-10 text-center",
		"border border-outline-variant/30 col-span-full",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			{/* Top spacing for layout focus */}
			<div className="h-16 md:h-24"></div>
			<main className={mainClass}>
				{/* Profile Header Section */}
				<header className={headerClass}>
					<div className={avatarBoxClass}>
						<UserIcon className="size-20 text-primary" />
					</div>
					<h1 className={h1Class}>{userProfile.username}</h1>
					<p className={subTextClass}>{joinedText}</p>
				</header>

				{/* Main Content Layout */}
				<div className={gridClass}>
					{/* LEFT: Favorites Section */}
					<section className={leftColClass}>
						<div className="flex items-center justify-between">
							<h2 className={favHeaderClass}>
								<BookmarkIcon className="size-5 text-primary" />
								Favori Tariflerim
							</h2>
						</div>

						<div className={favGridClass}>
							{userProfile.favoriteRecipes.length > 0 ? (
								userProfile.favoriteRecipes.map(
									(recipe: RecipeCardDto) => (
										<RecipeCard
											key={recipe.id}
											recipe={recipe}
											initialLiked={likedRecipeIds.has(
												recipe.id,
											)}
											mode="homepage"
										/>
									),
								)
							) : (
								<div className={emptyBoxClass}>
									<h3
										className="font-headline-md
                                        text-[24px] mb-2"
									>
										Henüz favori tarifin yok.
									</h3>
									<p className="text-on-surface-variant">
										Beğendiğin tarifleri tarif sayfasındaki
										favori{" "}
										<BookmarkIcon className="size-4 inline-block" />{" "}
										ikonuna tıklayarak favorilerine
										ekleyebilirsin.
									</p>
								</div>
							)}
						</div>
					</section>

					{/* RIGHT: Authentication Section */}
					<aside className={rightColClass}>
						<SecurityPanel />
					</aside>
				</div>
			</main>
		</>
	)
}

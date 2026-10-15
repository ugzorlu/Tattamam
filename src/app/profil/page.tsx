/* =============================================================================
                              Profile Entry Page
============================================================================= */
/**
 * @fileoverview
 * Entry point for the authenticated user profile page route.
 *
 * PURPOSE:
 * Serves as the route handler for `/profil`. It fetches the user session
 * and profile data, and renders the user's dashboard (including their
 * favorite recipes and security settings).
 *
 * FLOW:
 * ~ Renders the main static shell and a Suspense boundary.
 * ~ `ProfileContent` (inner component) fetches the active session.
 * ~ Redirects unauthenticated users to the homepage (`/`).
 * ~ Fetches full user profile (favorites) and visitor like states.
 * ~ Renders `ProfilePageServer` with the resolved data.
 *
 * NOTE(ARCHITECTURE):
 * The dynamic data fetching (`getServerSession`, `cookies()`, etc.) is
 * isolated inside the `ProfileContent` component and wrapped in `<Suspense>`.
 * This prevents the dynamic requirements of this specific page from bubbling
 * up and de-opting the entire global layout (like Navbar and Footer) into
 * blocking dynamic rendering.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

/* --- Server Infrastructure --- */
import { authOptions } from "@/lib/auth"
import { getLikedRecipeIds } from "@/lib/dal/home"
import { getUserProfile } from "@/lib/dal/user"

/* --- Components --- */
import ProfilePageServer from "@/components/profile/ProfilePageServer"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"
import type { Metadata } from "next"

/* === Metadata ============================================================= */
export const metadata: Metadata = {
	title: "Profilim",
	description: "Tattamam profil sayfanız ve favori tarifleriniz.",
	robots: { index: false }, // Do not index private profile pages
}

/* === Sub-components ======================================================= */
/**
 * Isolated server component to handle dynamic session and profile data.
 *
 * Wrapped in Suspense in the main page to prevent the entire route
 * from de-opting into blocking dynamic rendering.
 *
 * @async
 * @returns {Promise<React.ReactElement>} The resolved profile page content.
 */
async function ProfileContent(): Promise<React.ReactElement> {
	/* ─── Session Resolution ─────────────────────────────────────────────── */
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		redirect("/") // Redirect anonymous visitors to homepage
	}

	/* ─── Profile Data Fetching ──────────────────────────────────────────── */
	const userId = parseInt(session.user.id, 10)
	const userProfile = await getUserProfile(userId)

	if (!userProfile) {
		redirect("/") // Failsafe if user profile is missing from DB
	}

	/* ─── Recipe Metadata Fetching ───────────────────────────────────────── */
	const recipes: RecipeCardDto[] = userProfile.favoriteRecipes
	const likedRecipeIds = await getLikedRecipeIds(
		recipes.map((recipe) => recipe.id),
	)

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<ProfilePageServer
			userProfile={userProfile}
			likedRecipeIds={likedRecipeIds}
		/>
	)
}

/**
 * Loading skeleton displayed while profile data resolves.
 *
 * @returns {React.ReactElement} A simple centered pulse animation.
 */
function ProfileSkeleton(): React.ReactElement {
	const containerClass = [
		"flex h-[70vh] w-full items-center justify-center",
	].join(" ")

	return (
		<div className={containerClass}>
			<div className="h-16 w-16 animate-pulse rounded-full bg-surface-container-high" />
		</div>
	)
}

/* === Main Component ======================================================= */
/**
 * Renders the profile page route.
 *
 * @component
 * @returns {React.ReactElement} The profile page wrapper.
 */
export default function ProfilePage(): React.ReactElement {
	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<Suspense fallback={<ProfileSkeleton />}>
			<ProfileContent />
		</Suspense>
	)
}

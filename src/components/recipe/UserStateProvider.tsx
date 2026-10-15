/* =============================================================================
                           User State Provider
============================================================================= */
/**
 * @fileoverview
 * Async Server Component that resolves per-visitor and per-user state
 * for the recipe action panel and renders ActionPanel with real data.
 *
 * PURPOSE:
 * Isolates all request-scoped dynamic operations (session lookup, like
 * check, favorite check) into a single async boundary so they can be
 * streamed into the page independently of the cached static shell.
 *
 * FLOW:
 * ~ Resolves the active session via `getServerSession`.
 * ~ Derives `isLoggedIn` and `userId` from the session payload.
 * ~ Checks visitor like state via `hasLikedRecipe` (reads cookies
 *   and IP hash — inherently dynamic, cannot be cached).
 * ~ Checks user favorite state via `isFavoritedByUser` for
 *   authenticated visitors only (skips the DB call for anonymous).
 * ~ Renders `ActionPanel` with fully resolved boolean initial state.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally reads `cookies()` and `headers()` (via `getServerSession`
 * and `getVisitorIdentity`). It MUST NOT be marked with `'use cache'`.
 *
 * Designed to run inside a `<Suspense>` boundary in `page.tsx` so that
 * the cached recipe static shell can stream to the client immediately while
 * this component resolves.
 *
 * ROUTE:
 * Used exclusively by `/tarif/[slug]/page.tsx`.
 */

/* === Imports ============================================================== */
/* --- Authentication --- */
import { getServerSession } from "next-auth/next"

/* --- Server Infrastructure --- */
import { authOptions } from "@/lib/auth"
import { hasLikedRecipe, isFavoritedByUser } from "@/lib/dal/recipe"

/* --- Components --- */
import ActionPanel from "@/components/recipe/ActionPanel"

/* === Contracts ============================================================ */
/**
 * Properties required by {@link UserStateProvider}.
 *
 * @property recipeId    - Database recipe ID for like/favorite queries.
 * @property recipeSlug  - URL slug used to construct share links.
 * @property recipeTitle - Human-readable title for share text.
 */
interface UserStateProviderProps {
	readonly recipeId: number
	readonly recipeSlug: string
	readonly recipeTitle: string
}

/* === Main Component ======================================================= */
/**
 * Resolves dynamic per-visitor state and renders the recipe ActionPanel.
 *
 * Designed to be placed inside a `<Suspense>` boundary with
 * `<ActionPanelSkeleton />` as the fallback. The skeleton is shown
 * immediately from the cached static shell, while this component
 * streams in once session and DB queries resolve.
 *
 * @async
 * @component
 * @param props - See {@link UserStateProviderProps}.
 * @returns {Promise<React.ReactElement>} ActionPanel with resolved state.
 */
export default async function UserStateProvider({
	recipeId,
	recipeSlug,
	recipeTitle,
}: UserStateProviderProps): Promise<React.ReactElement> {
	/* ── Session Resolution ───────────────────────────────────────────── */
	/*
	 * `getServerSession` reads the JWT cookie — this is the primary
	 * source of dynamic rendering for this component. It runs in its
	 * own Suspense boundary, not in the cached shell.
	 */
	const session = await getServerSession(authOptions)

	/* ── Identity Derivation ──────────────────────────────────────────── */
	const isLoggedIn = !!session?.user
	const userId = isLoggedIn
		? Number((session!.user as { id?: string | number }).id)
		: null

	/* ── Parallel State Queries ───────────────────────────────────────── */
	/*
	 * Both queries depend only on `recipeId`, which is already
	 * resolved from the cached recipe data in the parent page.
	 * Running them in parallel eliminates a sequential DB waterfall.
	 *
	 * `isFavoritedByUser` is skipped entirely for anonymous visitors
	 * to avoid an unnecessary DB round-trip on the shared-hosting
	 * MariaDB connection pool.
	 */
	const [initialLiked, initialFavorited] = await Promise.all([
		hasLikedRecipe(recipeId),
		userId && !isNaN(userId)
			? isFavoritedByUser(recipeId, userId)
			: Promise.resolve(false),
	])

	/* ── Render ───────────────────────────────────────────────────────── */
	return (
		<ActionPanel
			recipeId={recipeId}
			recipeSlug={recipeSlug}
			recipeTitle={recipeTitle}
			initialLiked={initialLiked}
			initialFavorited={initialFavorited}
			isLoggedIn={isLoggedIn}
		/>
	)
}

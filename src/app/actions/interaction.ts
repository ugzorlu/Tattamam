/* =============================================================================
                        	Recipe Interaction Actions
============================================================================= */
/**
 * @fileoverview
 * Server actions for recipe interactions: likes and favorites.
 *
 * --- LIKE ACTIONS (public — any visitor) ---
 * likeRecipe   — records a RecipeLike row, increments counter
 * unlikeRecipe — deletes the RecipeLike row, decrements counter
 *
 * --- FAVORITE ACTION (auth-gated) ---
 * toggleFavoriteAction — adds or removes a recipe from the authenticated
 * user's favorite list. Returns the new state.
 *
 * NOTE(ARCHITECTURE):
 * Like actions use a two-signal identity: a hashed IP and a UUID fingerprint
 * cookie. `ensureVisitorIdentity` creates the ookie on first call
 * so subsequent checks work correctly.
 */

"use server"

/* === Imports ============================================================== */
/* --- Externals --- */
import crypto from "crypto"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"

/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"

/* --- Server Infrastructure --- */
import { authOptions } from "@/lib/auth"
import {
	isFavoritedByUser,
	addFavorite,
	removeFavorite,
} from "@/lib/dal/recipe"

/* --- Helpers --- */
import { ensureVisitorIdentity } from "@/lib/identity"
import { logger } from "@/lib/logging"

// const FINGERPRINT_COOKIE = "ttm_visitor"

/**
 * Reads the visitor identity from the current request.
 *
 * This function intentionally stays request-scoped and never generates a new
 * UUID. Cookie creation is reserved for action code, not for route rendering.
 */
export async function getVisitorIdentity() {
	const cookieStore = await cookies()
	const headerStore = await headers()

	const fingerprint = cookieStore.get("ttm_visitor")?.value ?? null

	const ip = (
		headerStore.get("x-forwarded-for") ??
		headerStore.get("x-real-ip") ??
		"unknown"
	)
		.split(",")[0]
		.trim()

	const ipHash = crypto
		.createHash("sha256")
		.update(`${ip}:${process.env.LIKE_SALT}`)
		.digest("hex")

	return {
		ipHash,
		fingerprint,
		userAgent: headerStore.get("user-agent"),
	}
}

/* === Contracts ============================================================ */
type LikeResult = { success: true } | { success: false; reason?: string }

type FavoriteResult =
	| { success: true; favorited: boolean }
	| { success: false; reason: string }

/* === Actions ============================================================== */
/**
 * Records a like from the current visitor for a recipe.
 *
 * Atomic transaction: creates RecipeLike row + increments likeCount.
 * Fails silently (returns success:false) if already liked to prevent
 * duplicate likes without exposing internal errors to the client.
 *
 * @param recipeId - Database recipe ID.
 */
export async function likeRecipe(recipeId: number): Promise<LikeResult> {
	const identity = await getVisitorIdentity()
	const fingerprint = await ensureVisitorIdentity()

	try {
		await prisma.$transaction(async (tx) => {
			await tx.recipeLike.create({
				data: {
					recipeId,
					ipHash: identity.ipHash,
					fingerprint,
					userAgent: identity.userAgent,
				},
			})

			await tx.recipe.update({
				where: { id: recipeId },
				data: { likeCount: { increment: 1 } },
			})
		})

		revalidatePath("/")
		return { success: true }
	} catch {
		return { success: false, reason: "already-liked" }
	}
}

/**
 * Removes the current visitor's like from a recipe.
 *
 * Atomic transaction: deletes RecipeLike row + decrements likeCount.
 *
 * @param recipeId - Database recipe ID.
 */
export async function unlikeRecipe(recipeId: number): Promise<LikeResult> {
	const identity = await getVisitorIdentity()
	const fingerprint = await ensureVisitorIdentity()

	try {
		await prisma.$transaction(async (tx) => {
			await tx.recipeLike.delete({
				where: {
					recipe_visitor: {
						recipeId,
						ipHash: identity.ipHash,
						fingerprint,
					},
				},
			})

			await tx.recipe.update({
				where: { id: recipeId },
				data: { likeCount: { decrement: 1 } },
			})
		})

		revalidatePath("/")
		return { success: true }
	} catch (error) {
		logger.error(error, "[unlikeRecipe] error:")
		return { success: false }
	}
}

/**
 * Toggles the authenticated user's favorite status for a recipe.
 *
 * FLOW:
 * ~ Reads the session — returns unauthenticated if no valid session.
 * ~ Reads the current DB state to determine add vs remove.
 * ~ Executes the DAL mutation.
 * ~ Revalidates the recipe and profile paths.
 * ~ Returns the new favorited boolean to the client.
 *
 * @async
 * @param recipeId   - Database recipe ID.
 * @param recipeSlug - Recipe slug for path revalidation.
 * @returns {Promise<FavoriteResult>} - Result of the toggle operation.
 */
export async function toggleFavoriteAction(
	recipeId: number,
	recipeSlug: string,
): Promise<FavoriteResult> {
	/* ─── Authentication Check ───────────────────────────────────────────── */
	const session = await getServerSession(authOptions)

	if (!session?.user) {
		return { success: false, reason: "unauthenticated" }
	}

	/* ─── User ID Extraction ─────────────────────────────────────────────── */
	/**
	 * Extracts user ID from session.
	 *
	 * NOTE(LIBRARY):
	 * NextAuth JWT callback stores id as string token.id.
	 */
	const userId = Number((session.user as { id?: string | number }).id)

	/* ─── Validation ─────────────────────────────────────────────────────── */
	if (!userId || isNaN(userId)) {
		return { success: false, reason: "invalid-session" }
	}

	try {
		/* ─── DAL Operations ─────────────────────────────────────────────── */
		const currentlyFavorited = await isFavoritedByUser(recipeId, userId)

		if (currentlyFavorited) {
			await removeFavorite(recipeId, userId)
		} else {
			await addFavorite(recipeId, userId)
		}

		/* ─── Revalidation ───────────────────────────────────────────────── */
		revalidatePath(`/tarif/${recipeSlug}/`)
		revalidatePath("/profil/")

		/* ─── Return Result ──────────────────────────────────────────────── */
		return { success: true, favorited: !currentlyFavorited }
	} catch (error) {
		logger.error(error, "[toggleFavoriteAction] error:")
		return { success: false, reason: "server-error" }
	}
}

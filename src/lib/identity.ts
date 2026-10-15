/* =============================================================================
                    	Visitor Identity Utilities
============================================================================= */
/**
 * @fileoverview
 * Utilities for managing visitor identity in the application.
 *
 * PURPOSE:
 * Provides functions to retrieve and ensure a unique visitor identity.
 *
 * NOTE(ARCHITECTURE):
 * Uses cookies & request headers to generate a unique fingerprint
 * for each visitor.
 * The fingerprint is based on the visitor's IP address and user agent,
 * hashed with a salt for security.
 *
 * USE CASES:
 * - Tracking visitor interactions
 * - Personalizing user experience
 * - Analytics and logging
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import crypto from "crypto"
import { cookies, headers } from "next/headers"

// const FINGERPRINT_COOKIE = "ttm_visitor"

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

export async function ensureVisitorIdentity(): Promise<string> {
	const cookieStore = await cookies()
	const headerStore = await headers()

	let fingerprint = cookieStore.get("ttm_visitor")?.value

	if (!fingerprint) {
		const ip = (
			headerStore.get("x-forwarded-for") ??
			headerStore.get("x-real-ip") ??
			"unknown"
		)
			.split(",")[0]
			.trim()

		const userAgent = headerStore.get("user-agent") ?? "unknown"
		fingerprint = crypto
			.createHash("sha256")
			.update(`${ip}:${userAgent}:${process.env.LIKE_SALT ?? "tattamam"}`)
			.digest("hex")

		cookieStore.set("ttm_visitor", fingerprint, {
			maxAge: 60 * 60 * 24 * 365 * 5,
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		})
	}

	return fingerprint
}

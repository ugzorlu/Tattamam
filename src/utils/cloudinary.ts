/* =============================================================
               Cloudinary URL Transformation Utilities
=============================================================== */
/**
 * @fileoverview
 * Utilities for injecting Cloudinary transformation parameters
 * into image URLs at the point of rendering.
 *
 * PURPOSE:
 * Cloudinary images are stored at their original upload
 * resolution. Without URL-level transformations, each visitor's
 * browser downloads the full-size source file. These helpers
 * rewrite the URL to request a format-, quality-, and
 * size-optimised variant from Cloudinary's CDN edge instead,
 * significantly reducing payload on every page load.
 *
 * HOW IT WORKS:
 * Cloudinary's delivery URL scheme embeds transformations in a
 * path segment that sits between the cloud name and the asset
 * public ID:
 *   .../image/upload/<transformations>/<version>/<public-id>
 *
 * This module splices a transformation string into that slot.
 * Non-Cloudinary URLs pass through unchanged so local/fallback
 * images are never broken.
 *
 * USAGE:
 *   import {
 *     buildCloudinaryUrl,
 *     buildCloudinaryBlurUrl,
 *   } from "@/utils/cloudinary"
 *
 *   const src  = buildCloudinaryUrl(recipe.imageUrl, { width: 800 })
 *   const blur = buildCloudinaryBlurUrl(recipe.imageUrl)
 *
 * @see {@link https://cloudinary.com/documentation/transformation_reference}
 */

/* === Types ============================================================= */
/**
 * Subset of Cloudinary transformation options relevant to this
 * project. Extend as new use-cases arise.
 *
 * @property width  - Maximum pixel width of the delivered image.
 * @property height - Maximum pixel height (optional).
 * @property crop   - Cloudinary crop mode (default: "limit").
 * @property quality - Quality level: number 1–100 or "auto".
 * @property format  - Delivery format or "auto" for negotiation.
 */
export interface CloudinaryTransformOptions {
	readonly width?: number
	readonly height?: number
	readonly crop?: string
	readonly quality?: number | "auto"
	readonly format?: string | "auto"
}

/* === Constants ============================================================ */
/**
 * Cloudinary delivery URL prefix shared by all project assets.
 * Used to detect whether a URL originates from Cloudinary before
 * attempting transformation string injection.
 */
const CLOUDINARY_HOST = "res.cloudinary.com"

/**
 * The Cloudinary URL segment at which transformation strings are
 * injected. Everything after this token is the asset path.
 */
const UPLOAD_SEGMENT = "/image/upload/"

/* === Helpers ============================================================== */
/**
 * Builds a Cloudinary transformation string from the given options.
 *
 * Each option maps to a Cloudinary parameter abbreviation:
 *   w  → width
 *   h  → height
 *   c  → crop
 *   q  → quality
 *   f  → format
 *
 * @param opts - Transformation options to serialize.
 * @returns    Comma-separated Cloudinary transformation string,
 *             e.g. "f_auto,q_auto,w_800,c_limit".
 */
function buildTransformString(opts: CloudinaryTransformOptions): string {
	const parts: string[] = []

	/* Format first so Cloudinary picks optimal encoding early. */
	const format = opts.format ?? "auto"
	parts.push(`f_${format}`)

	/* Quality defaults to Cloudinary's adaptive compression. */
	const quality = opts.quality ?? "auto"
	parts.push(`q_${quality}`)

	if (opts.width !== undefined) {
		parts.push(`w_${opts.width}`)
	}

	if (opts.height !== undefined) {
		parts.push(`h_${opts.height}`)
	}

	/* "limit" resizes only if larger than the target dimensions,
	 * preserving upscaling protection on small images. */
	const crop = opts.crop ?? "limit"
	parts.push(`c_${crop}`)

	return parts.join(",")
}

/* === Public API =========================================================== */
/**
 * Rewrites a Cloudinary image URL to include transformation
 * parameters for optimised delivery.
 *
 * BEHAVIOUR:
 * - Returns the original URL unchanged when:
 *   • the URL is null/undefined/empty
 *   • the URL does not originate from res.cloudinary.com
 *   • the URL already contains a transformation segment
 * - Otherwise splices the transformation string into the Cloudinary
 *   upload path segment so Cloudinary's CDN serves the variant.
 *
 * @param url  - Source image URL, potentially from the database.
 * @param opts - Desired transformation parameters.
 * @returns    Rewritten Cloudinary URL, or the original on error.
 *
 * @example
 * const src = buildCloudinaryUrl(recipe.imageUrl, { width: 800 })
 * // https://res.cloudinary.com/di6klblik/image/upload/
 * //   f_auto,q_auto,w_800,c_limit/v1234/my-recipe.jpg
 */
export function buildCloudinaryUrl(
	url: string | null | undefined,
	opts: CloudinaryTransformOptions = {},
): string | null {
	/* ── Guard: null / empty ──────────────────────────────────── */
	if (!url) return null

	/* ── Guard: non-Cloudinary origin ────────────────────────── */
	if (!url.includes(CLOUDINARY_HOST)) return url

	/* ── Guard: already transformed ──────────────────────────── */
	const uploadIndex = url.indexOf(UPLOAD_SEGMENT)
	if (uploadIndex === -1) return url

	/* ── Splice transformation string into URL ────────────────── */
	const insertAt = uploadIndex + UPLOAD_SEGMENT.length
	const base = url.slice(0, insertAt)
	const asset = url.slice(insertAt)

	/* Skip injection if a named transformation is already present
	 * (starts with "t_") to avoid double-transforming. */
	if (asset.startsWith("t_")) return url

	const transform = buildTransformString(opts)

	return `${base}${transform}/${asset}`
}

/**
 * Generates a tiny, heavily-compressed Cloudinary thumbnail URL
 * suitable for use as a Low-Quality Image Placeholder (LQIP).
 *
 * The resulting image is 30 × 20 px, which Next.js encodes as a
 * base64 `blurDataURL` string. At this resolution, Cloudinary
 * responds in ~1 KB, so the blur is visible almost immediately,
 * eliminating the grey "empty box" perception during load.
 *
 * @param url - Source image URL from the database.
 * @returns   Rewritten URL for the tiny placeholder variant,
 *            or null if the URL is not a Cloudinary URL.
 *
 * @example
 * const blur = buildCloudinaryBlurUrl(recipe.imageUrl)
 * // https://res.cloudinary.com/di6klblik/image/upload/
 * //   f_auto,q_30,w_30,h_20,c_fill/v1234/my-recipe.jpg
 */
export function buildCloudinaryBlurUrl(
	url: string | null | undefined,
): string | null {
	return buildCloudinaryUrl(url, {
		format: "auto",
		/* Deliberately low quality — the image is blurred anyway. */
		quality: 30,
		width: 30,
		height: 20,
		/* "fill" ensures the placeholder always covers the aspect
		 * ratio without transparent bars that break the blur. */
		crop: "fill",
	})
}

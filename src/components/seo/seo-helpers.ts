/* =============================================================================
                         SEO Schema Shared Helpers
============================================================================= */
/**
 * @fileoverview
 * Pure utility functions shared across all JSON-LD schema components.
 *
 * PURPOSE:
 * Centralises helpers that would otherwise be duplicated across
 * {@link RecipeJsonLdSchema} and {@link CategoryJsonLdSchema}.
 *
 * EXPORTS:
 * - {@link toIsoDuration}        — minutes → ISO 8601 duration string
 * - {@link buildCloudinaryImages} — single URL → multi-ratio image array
 */

/* === ISO 8601 Duration ===================================================== */
/**
 * Converts a duration in minutes to an ISO 8601 duration string.
 *
 * Schema.org `Recipe` nodes require `prepTime`, `cookTime`, and `totalTime`
 * expressed as ISO 8601 durations (e.g. `PT15M`, `PT1H30M`).
 *
 * Returns `undefined` for `null`, `0`, or negative values so that the
 * caller can use spread syntax (`...(value && { key: value })`) to omit
 * the property from the schema object entirely rather than serialising it
 * as `null` or `"PT0M"`.
 *
 * @param minutes - Duration in whole minutes.
 * @returns {string | undefined} ISO 8601 duration string, or `undefined`.
 *
 * @example
 * toIsoDuration(90) // → "PT1H30M"
 * toIsoDuration(15) // → "PT15M"
 * toIsoDuration(60) // → "PT1H"
 * toIsoDuration(0)  // → undefined
 * toIsoDuration(null) // → undefined
 */
export function toIsoDuration(
	minutes: number | null | undefined,
): string | undefined {
	if (!minutes || minutes <= 0) return undefined

	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60

	if (hours > 0 && mins > 0) return `PT${hours}H${mins}M`
	if (hours > 0) return `PT${hours}H`
	return `PT${mins}M`
}

/* === Cloudinary Image Variants ============================================= */
/**
 * Aspect-ratio descriptors required by Google's structured data guidelines.
 *
 * Google recommends providing images in all three aspect ratios to maximise
 * eligibility for rich result image snippets and Google Images carousels:
 * - `1:1`  — square thumbnail
 * - `4:3`  — standard landscape
 * - `16:9` — widescreen / featured image
 *
 * @see {@link buildCloudinaryImages}
 */
const CLOUDINARY_IMAGE_RATIOS = ["1:1", "4:3", "16:9"] as const

/** Union of the supported Cloudinary aspect-ratio strings. */
export type CloudinaryAspectRatio = (typeof CLOUDINARY_IMAGE_RATIOS)[number]

/**
 * Injects Cloudinary transformation parameters into an existing upload URL
 * to produce a variant for a given aspect ratio.
 *
 * The transformation string `ar_{ratio},c_fill` is inserted immediately after
 * the `/upload/` path segment, which is where Cloudinary expects it.
 *
 * @param url   - Original Cloudinary upload URL (must contain `/upload/`).
 * @param ratio - Aspect ratio in `W:H` notation (e.g. `"16:9"`).
 * @returns {string} Transformed URL with `ar_{ratio},c_fill` applied.
 *
 * @example
 * injectCloudinaryTransform(
 *   "https://res.cloudinary.com/exp/image/upload/v123/t.png",
 *   "16:9"
 * )
 * // → "https://res.cloudinary.com/exp/image/upload/ar_16:9,c_fill/v123/t.png"
 */
function injectCloudinaryTransform(
	url: string,
	ratio: CloudinaryAspectRatio,
): string {
	/*
	 * Cloudinary transformations are injected between "/upload/" and the
	 * version/public-ID segment. Using a simple string replacement on the
	 * known segment is more reliable than URL-parsing and avoids introducing
	 * a URL-parsing dependency.
	 */
	return url.replace("/upload/", `/upload/ar_${ratio},c_fill/`)
}

/**
 * Builds a multi-ratio Cloudinary image array suitable for the `image`
 * property of a schema.org `Recipe` or `ItemList` node.
 *
 * PURPOSE:
 * Google's structured data guidelines recommend providing images in all
 * three standard aspect ratios (1:1, 4:3, 16:9) to maximise the likelihood
 * that rich image snippets appear in Search results and Google Images.
 *
 * BEHAVIOUR:
 * - Returns `undefined` when `imageUrl` is `null` or falsy so the caller
 *   can cleanly omit the `image` key from the schema object.
 * - Returns `undefined` when the URL does not contain `/upload/` (i.e.
 *   it is not a Cloudinary upload URL), falling back gracefully without
 *   producing a malformed URL.
 * - For valid Cloudinary URLs, returns an array of three transformed URLs,
 *   one per ratio in the order `["1:1", "4:3", "16:9"]`.
 *
 * NOTE(FUTURE):
 * If non-Cloudinary image hosts are ever introduced, extend this function
 * with a host check and a separate transformation strategy for each host.
 *
 * @param imageUrl - Raw Cloudinary upload URL, or `null`.
 * @returns {string[] | undefined} Array of three image URLs, or `undefined`.
 *
 * @example
 * buildCloudinaryImages(
 *   "https://res.cloudinary.com/exp/image/upload/v123456/t.png"
 * )
 * // → [
 * //     "https://res.cloudinary.com/.../upload/ar_1:1,c_fill/v123456/t.png",
 * //     "https://res.cloudinary.com/.../upload/ar_4:3,c_fill/v123456/t.png",
 * //     "https://res.cloudinary.com/.../upload/ar_16:9,c_fill/v123456/t.png",
 * //   ]
 */
export function buildCloudinaryImages(
	imageUrl: string | null | undefined,
): string[] | undefined {
	if (!imageUrl) return undefined

	/*
	 * Guard against non-Cloudinary URLs. Transformation injection relies on
	 * the `/upload/` segment being present; silently return `undefined` if
	 * it is missing so the schema degrades gracefully (no `image` key) rather
	 * than emitting a malformed URL.
	 */
	if (!imageUrl.includes("/upload/")) return undefined

	return CLOUDINARY_IMAGE_RATIOS.map((ratio) =>
		injectCloudinaryTransform(imageUrl, ratio),
	)
}

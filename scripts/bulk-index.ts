/* =============================================================================
                 		 Bulk Indexing Script
============================================================================= */
/**
 * @fileoverview
 * Manually notifies Google about URLs generated from the site's sitemap data.
 * Run with `npm run index:bulk`; append `-- --dry-run` to preview URLs.
 *
 * @remarks
 * Google's Indexing API is restricted to JobPosting pages and livestream pages
 * with BroadcastEvent markup. Recipe, category, and tag URLs are not eligible.
 * Use the sitemap and Search Console for normal recipe-site discovery.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { google } from "googleapis"

/* --- Server Infrastructure --- */
import { getAllRecipes } from "@/lib/dal/search"
import { getAllCategories, getAllTags } from "@/lib/dal/taxonomy"

/* === Constants ============================================================ */
const API_SCOPE = "https://www.googleapis.com/auth/indexing"
const BATCH_SIZE = 5
const BATCH_DELAY_MS = 500

/* === Contracts ============================================================ */
interface RunOptions {
	dryRun: boolean
}

type RunResult =
	| { success: true; processed: number; failed: number }
	| { success: false; error: string }

/* === Helpers ============================================================== */
/**
 * Formats unknown thrown values without assuming an Error instance.
 *
 * @param error - Value thrown by a database, auth, or Google API operation.
 * @returns A readable message suitable for command-line output.
 */
function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}

	if (typeof error === "string") {
		return error
	}

	try {
		return JSON.stringify(error) ?? String(error)
	} catch {
		return String(error)
	}
}

/**
 * Splits a list into sequential batches of a fixed maximum size.
 *
 * @param items - URLs to divide into batches.
 * @param size - Maximum number of URLs in each batch.
 * @returns Ordered batches; an empty input returns no batches.
 */
function chunkArray<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = []
	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size))
	}
	return chunks
}

/**
 * Pauses between request batches to avoid sending a large burst of calls.
 *
 * @param milliseconds - Delay duration in milliseconds.
 * @returns A promise that resolves after the requested delay.
 */
function delay(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

/**
 * Builds canonical URLs for the static and database-backed sitemap routes.
 *
 * @param baseUrl - Public origin configured for the deployed website.
 * @returns A de-duplicated set of absolute route URLs.
 */
async function collectUrls(baseUrl: URL): Promise<string[]> {
	const [recipesResult, categoriesResult, tagsResult] = await Promise.all([
		getAllRecipes(),
		getAllCategories(),
		getAllTags(),
	])
	const origin = baseUrl.origin
	const toUrl = (route: string) => new URL(route, `${origin}/`).toString()
	const staticUrls = [toUrl("/"), toUrl("/kategori")]
	const recipeUrls = recipesResult.recipes.map((recipe) =>
		toUrl(`/tarif/${recipe.slug}/`),
	)
	const categoryUrls = categoriesResult.categories.map((category) =>
		toUrl(`/kategori/${category.slug}/`),
	)
	const tagUrls = tagsResult.tags.map((tag) => toUrl(`/etiket/${tag.slug}/`))

	return [
		...new Set([...staticUrls, ...recipeUrls, ...categoryUrls, ...tagUrls]),
	]
}

/* === Main Script ========================================================== */
/**
 * Validates credentials, collects target URLs, and sends update notifications.
 *
 * Dry-run mode still reads the sitemap data but skips Google authentication
 * and all network requests.
 *
 * @param options - Controls whether the script only previews target URLs.
 * @returns Processing counts or a typed failure result.
 */
export async function runBulkIndexing(
	options: RunOptions = { dryRun: false },
): Promise<RunResult> {
	const baseUrlValue = process.env.GOOGLE_PUBLIC_BASE_URL
	if (!baseUrlValue) {
		return {
			success: false,
			error: "GOOGLE_PUBLIC_BASE_URL is not set.",
		}
	}

	let baseUrl: URL
	try {
		baseUrl = new URL(baseUrlValue)
	} catch {
		return {
			success: false,
			error: "GOOGLE_PUBLIC_BASE_URL must be a valid absolute URL.",
		}
	}

	if (baseUrl.protocol !== "https:") {
		return {
			success: false,
			error: "GOOGLE_PUBLIC_BASE_URL must use HTTPS.",
		}
	}

	console.info("Collecting URLs from the sitemap data...")
	const urls = await collectUrls(baseUrl)
	console.info(`Found ${urls.length} unique URLs.`)

	if (options.dryRun) {
		urls.forEach((url) => console.info(url))
		console.info("Dry run complete; no notifications were sent.")
		return { success: true, processed: 0, failed: 0 }
	}

	const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
	const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
	if (!clientEmail || !privateKey) {
		return {
			success: false,
			error: "GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY are required.",
		}
	}

	const authClient = new google.auth.JWT({
		email: clientEmail,
		key: privateKey,
		scopes: [API_SCOPE],
	})

	try {
		await authClient.authorize()
	} catch (error: unknown) {
		return {
			success: false,
			error: `Google authentication failed: ${formatError(error)}`,
		}
	}

	const indexing = google.indexing("v3")
	const batches = chunkArray(urls, BATCH_SIZE)
	let processed = 0
	let failed = 0

	for (const [batchIndex, batch] of batches.entries()) {
		console.info(`Processing batch ${batchIndex + 1} of ${batches.length}.`)
		const results = await Promise.allSettled(
			batch.map((url) =>
				indexing.urlNotifications.publish({
					auth: authClient,
					requestBody: { url, type: "URL_UPDATED" },
				}),
			),
		)

		results.forEach((result, index) => {
			if (result.status === "fulfilled") {
				console.info(`Submitted: ${batch[index]}`)
				processed++
				return
			}

			console.error(
				`Submission failed for ${batch[index]}: ` +
					formatError(result.reason),
			)
			failed++
		})

		if (batchIndex < batches.length - 1) {
			await delay(BATCH_DELAY_MS)
		}
	}

	console.info(`Complete. Submitted: ${processed}; failed: ${failed}.`)
	return { success: true, processed, failed }
}

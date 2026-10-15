/* =============================================================================
                              Category All Page
============================================================================= */
/**
 * @fileoverview
 * Server-side main component for the category all page route.
 *
 * PURPOSE:
 * Displays all categories in a structured menu-like layout.
 *
 * FLOW:
 * ~ Renders the category all page with a list of categories
 * 	 via {@link CategoryAllPageServer}.
 *
 * NOTE(ARCHITECTURE):
 * - Uses server-side rendering to fetch and prepare data before sending it to
 *   the client.
 */

/* === Imports ============================================================== */
/* --- Components --- */
import CategoryAllPageServer from "@/components/category/CategoryAllPageServer"

/* --- Types --- */
import type { Metadata } from "next"

/* === Metadata ============================================================= */
/**
 * Creates server-side metadata for {@link CategoryAllPage} based on
 * static category data.
 *
 * FLOW:
 * ~ Constructs OpenGraph, social media metadata.
 * ~ Returns complete Metadata object for Next.js automatic <head> injection.
 *
 * NOTE(ARCHITECTURE):
 * Follows Next.js conventions for dynamic route metadata.
 *
 * INFO(FRAMEWORK):
 * Is a special Next.js function that receives route params and must return
 * Metadata object. Metadata object automatically injected into page <head>
 * by Next.js before client hydration. Errors thrown here are treated
 * as fatal and are routed through error boundaries.
 *
 * @async
 * @returns {Promise<Metadata>} Next.js metadata object.
 */
export async function generateMetadata(): Promise<Metadata> {
	const pageTitle = "Tüm kategoriler"
	const pageDescription =
		"Porsiyon sayısına ve anlatım tarzına göre " +
		"ayarlanabilen tam sana göre tarifler. " +
		"Pratik ve ekonomik yemek tarifleri burada."

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
	const categoryUrl = `${baseUrl}/kategori`

	const pageimage = {
		url: `${baseUrl}/logo.png`,
		width: 1200,
		height: 400,
	}

	/* ── Metadata Object ─────────────────────────────────────────────────── */
	return {
		title: pageTitle, // INFO(FRAMEWORK): Highest SEO priority.
		description: pageDescription,
		openGraph: {
			siteName: "Tattamam",
			title: pageTitle,
			description: pageDescription,
			type: "website",
			url: categoryUrl,
			locale: "tr",
			images: pageimage,
		},

		twitter: {
			card: "summary_large_image",
			title: pageTitle,
			description: pageDescription,
			images: pageimage,
		},

		alternates: {
			canonical: categoryUrl,
		},
	}
}

/* === Main Component ======================================================= */
export default function CategoryAllPage() {
	/* ─── Render ─────────────────────────────────────────────────────────── */
	return <CategoryAllPageServer />
}

/* =============================================================================
                                Root Layout                                 
============================================================================= */
/**
 * @fileoverview
 * Root application layout and global rendering shell for Next.js App Router.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally acts as the highest-level composition root of the application.
 * which helps to centralize:
 * - Persistent UI infrastructure
 * - Localization initialization
 * - Global SEO registration
 *
 * --- Layout Hierarchy ---
 * RootLayout
 * ├── HTML shell
 * ├── Global SEO
 * ├── Persistent Navigation
 * ├── Route Content
 * └── Persistent Footer
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { Lora, Figtree } from "next/font/google"
import { GoogleTagManager } from "@next/third-parties/google"

/* --- Components --- */
import ScrollReset from "@/components/ui/ScrollReset"
import Navbar from "@/components/layout/navbar/Navbar"
import Footer from "@/components/layout/footer/Footer"

/* --- Types --- */
import type { ReactNode } from "react"
import type { Metadata } from "next"

/* --- Style --- */
import "@/app/globals.css"

/* === Contracts ============================================================ */
/**
 * Root application layout properties.
 *
 * PURPOSE:
 * Defines the dynamic route content rendered inside the application shell.
 *
 * @property children - Route segment content rendered by Next.js App Router.
 */
interface RootLayoutProps {
	children: ReactNode
}

/* === Font Configuration =================================================== */
const lora = Lora({
	variable: "--font-lora",
	subsets: ["latin"],
	weight: ["600"],
	display: "swap",
	preload: true,
})

const figtree = Figtree({
	weight: ["400", "700"],
	variable: "--font-figtree",
	subsets: ["latin"],
	display: "swap",
	preload: true,
})

// /**
//  * Registers the Google Material Symbols Outlined font family.
//  *
//  * NOTE(ARCHITECTURE):
//  * Fonts are exposed as CSS variables rather than applied globally to preserve
//  * explicit typography control, enable flexible Tailwind integration,
//  * and ensure predictable component-level styling.
//  *
//  * INFO(FRAMEWORK):
//  * Next.js local font optimization enables:
//  * - Automatic font optimization
//  * - Reduced layout shift
//  * - Build-time asset optimization
//  * - Self-hosted font serving
//  */
// const materialSymbols = localFont({
// 	src: "./fonts/material-symbols/MaterialSymbolsSubset.woff2",
// 	variable: "--font-material-symbols",
// 	// display: "block", // Prevents FOUT and layout shift during font loading.
// 	preload: false, // Prevents forcing early download at highest priority.
// 	weight: "100 700",
// 	style: "normal",
// 	fallback: ["Segoe UI Symbol", "sans-serif"],
// })

/* === Metadata ============================================================= */
export const metadata: Metadata = {
	applicationName: "Tattamam",

	title: {
		default: "Tattamam - Tam Sana Göre Tarifler",
		// For dynamic sub-pages.
		template: "%s | Kişiye göre ayarlanan tarifler - Tattamam",
	},

	description:
		"Porsiyon sayısına ve anlatım tarzına göre " +
		"ayarlanabilen tam sana göre tarifler! " +
		"Pratik ve ekonomik yemek tarifleri burada.",

	// Sets base URL for Open Graph (required for absolute URLs).
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_BASE_URL || "https://tattamam.com.tr",
	),

	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" }, // Standard fallback.

			// For Googlebot and Google SERP preferable format and size.
			{ url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
		],
		apple: [
			// For Apple devices and iOS Safari.
			{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
		],
	},

	alternates: {
		canonical: "/", // Resolves to the current path with a trailing slash
		languages: {
			"tr-TR": "/tr",
		},
	},

	// For Facebook, WhatsApp, LinkedIn, Discord etc.
	openGraph: {
		title: "Tattamam - Tam Sana Göre Tarifler",
		description:
			"Porsiyon sayısına ve anlatım tarzına göre " +
			"ayarlanabilen tam sana göre tarifler!",
		url: "/",
		siteName: "Tattamam",
		images: [
			// {
			// 	url: "/web-app-manifest-512x512.png",
			// 	width: 512,
			// 	height: 512,
			// 	alt: "Tattamam",
			// },
			{
				url: "/media/hero/hero-min.webp",
				width: 1376,
				height: 768,
				alt: "Tattamam Yemek Tarifleri",
			},
		],
		locale: "tr_TR",
		type: "website",
	},

	twitter: {
		card: "summary_large_image", // Forces the large image card on X.
		title: "Tattamam - Tam Sana Göre Tarifler",
		description:
			"Porsiyon sayısına ve anlatım tarzına göre " +
			"ayarlanabilen tam sana göre tarifler!",
		// images: ["/web-app-manifest-512x512.png"],
		images: ["/media/hero/hero-min.webp"],
		site: "@tat_tamam",
	},
}

/* === Main Component ======================================================= */
/**
 * Global application layout and persistent rendering shell.
 *
 * FLOW:
 * ~ Next.js App Router renders the route segment content inside the layout.
 * ~ The layout provides a persistent application shell with navbar and footer.
 * ~ The layout applies global styles, fonts, and metadata for the application.
 * ~ The layout is rendered on the server and streamed to the client.
 * ~ The layout is re-rendered on the server when route segments change.
 *
 * @async
 * @component
 * @param props - See {@link RootLayoutProps} for details.
 * @returns {Promise<React.ReactElement>} The root HTML structure.
 */
export default async function RootLayout({
	children,
}: Readonly<RootLayoutProps>): Promise<React.ReactElement> {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const htmlClass = [
		lora.variable,
		figtree.variable,
		"h-full antialiased",
	].join(" ")

	const bodyClass = [
		"flex flex-col h-full min-h-screen pt-20",
		"font-body-md text-on-background bg-background",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<html lang="tr" className={htmlClass}>
			<GoogleTagManager gtmId="GTM-WC3FVKKT" />

			<body className={bodyClass}>
				<ScrollReset />
				<Navbar />
				<div className="flex-1">{children}</div>
				<Footer />
			</body>
		</html>
	)
}

/* =============================================================================
                     	     Information Page
============================================================================= */
/**
 * @fileoverview
 * Information page with tabbed content for About, Legal and Contact sections.
 *
 * FLOW:
 * The page receives a query parameter to determine the active tab.
 * It renders the corresponding content component based on the active tab.
 *
 * NOTE(ARCHITECTURE):
 * Server component to leverage server-side rendering, metadata API and
 * routing capabilities of Next.js App Router.
 * Each tab's content is encapsulated in its own client component.
 *
 * INFO(FRAMEWORK):
 * Uses Next.js App Router with dynamic routing and query parameters.
 */

/* === Imports ============================================================== */
/* --- Components --- */
import TabBar from "@/components/info/TabBar"
import AboutPage from "@/components/info/AboutPage"
import LegalPage from "@/components/info/LegalPage"
import ContactPage from "@/components/info/ContactPage"

/* --- Types --- */
import type { Metadata } from "next"

/* === Metadata ============================================================= */
export const metadata: Metadata = {
	title: "Bilgi Sayfası",
	description:
		"Tattamam hakkında bilgiler, kullanım koşulları, " +
		"çerez politikası ve iletişim bilgileri.",
}

/* === Contracts ============================================================ */
interface InfoPageProps {
	searchParams: Promise<{ tab?: string }>
}

import { Suspense } from "react"

/* === Sub-components ======================================================= */
/**
 * Isolated server component to handle dynamic searchParams.
 * Wrapped in Suspense in the main page to prevent the entire route
 * from de-opting into blocking dynamic rendering.
 */
async function InfoTabs({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>
}) {
	const resolvedParams = await searchParams
	const activeTab = resolvedParams.tab || "about"

	return (
		<>
			<TabBar activeTab={activeTab} />

			<div className="relative mt-6">
				{activeTab === "about" && <AboutPage />}
				{activeTab === "legal" && <LegalPage />}
				{activeTab === "contact" && <ContactPage />}
			</div>
		</>
	)
}

/* === Main Component ======================================================= */
export default function InfoPage({ searchParams }: InfoPageProps) {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const fallbackClass = [
		"min-h-[50vh] w-full animate-pulse bg-surface-container-low rounded-xl",
	].join(" ")

	const mainClass = [
		"max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop",
		"min-h-[70vh] py-stack-lg",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<main className={mainClass}>
			<Suspense fallback={<div className={fallbackClass} />}>
				<InfoTabs searchParams={searchParams} />
			</Suspense>
		</main>
	)
}

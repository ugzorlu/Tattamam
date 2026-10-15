/* =============================================================================
                           Home Page Loading Screen
============================================================================= */
/**
 * @fileoverview
 * Loading placeholder UI for the home page.
 *
 * PURPOSE:
 * Shows a lightweight loading state while the home content is preparing.
 *
 * FLOW:
 * 1. Imports the dedicated hero loading skeleton.
 * 2. Renders it in place of the hero carousel content.
 *
 * NOTE(ARCHITECTURE):
 * - The loading screen is intentionally minimal to avoid blocking the user
 *   from interacting with the page while data is fetched.
 * - Hero loading skeleton is sepreated to keep the loading state modular.
 * - Additional loading states for the horizontal carousels and vertical grid
 *   currently not implemented for their lesser impact on perceived performance.
 */

/* === Imports ============================================================== */
/* --- Components --- */
import HeroCarouselLoading from "@/components/layout/hero/HeroCarouselLoading"

export default function HomePageLoading() {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const mainClass =
		"h-auto mx-auto w-full max-w-[1600px] px-2 md:px-6 xl:px-10 py-6"

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className={mainClass}>
			<HeroCarouselLoading />
		</div>
	)
}

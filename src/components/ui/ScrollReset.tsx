/* =============================================================================
                                Scroll Reset                               
============================================================================= */
/**
 * @fileoverview
 * Client-side component that resets the scroll position to the top of the page
 * whenever the route changes in the application.
 *
 * NOTE(ARCHITECTURE):
 * Intended to be used at the root layout level to ensure that scroll position
 * is reset for all route transitions, providing a consistent user experience
 * across the application.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"

/* === Main Component ======================================================= */
export default function ScrollReset() {
	const pathname = usePathname()

	useLayoutEffect(() => {
		window.scrollTo(0, 0)
	}, [pathname])

	return null
}

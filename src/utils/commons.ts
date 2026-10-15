/* ==============================================================================================
                                        DOM Utilities
================================================================================================= */
/**
 * @fileoverview
 * Pure DOM helper utilities for browser-side interactions.
 *
 * PURPOSE:
 * Provides a collection of reusable, framework-agnostic functions for common DOM operations.
 *
 * NOTE(ARCHITECTURE):
 * Safe to be used across both Server and Client Components without introducing dependencies.
 * Free of React lifecycle logic.
 * Does not import from react or client-only modules.
 * Maximum tree-shakability and reuse across UI layers.
 */

/* === Utilities ================================================================================ */
/**
 * Smoothly scrolls to a DOM element by its ID.
 *
 * PURPOSE:
 * Provides a simple utility for navigating to specific sections of the page, enhancing UX.
 *
 * USE CASES:
 * - App Router navigations
 * - URL search param updates
 * - Suspense boundary resolutions
 * - Conditional rendering
 *
 * NOTE(ARCHITECTURE):
 * Avoids race conditions where the target element exists
 * in the tree but has not yet been fully painted/measured.
 *
 * INFO(FRAMEWORK):
 * Uses `requestAnimationFrame` to defer execution until after
 * React/Next.js commit + layout phases are completed.
 *
 * @param elementId - The target DOM element ID.
 * @param options - Optional scroll configuration.
 * @returns {void}
 *
 * @example
 * scrollToElementById('category-band')
 * @example
 * scrollToElementById('items-section', {
 *     behavior: 'smooth',
 *     block: 'start',
 * })
 */
export function scrollToElementById(
	elementId: string,
	options?: Pick<ScrollIntoViewOptions, "behavior" | "block">,
): void {
	requestAnimationFrame(() => {
		const targetElement: HTMLElement | null =
			document.getElementById(elementId)

		if (!targetElement) return

		targetElement.scrollIntoView({
			behavior: options?.behavior ?? "smooth",
			block: options?.block ?? "start",
		})
	})
}

export function normalizeTurkish(text: string): string {
	return text.toLocaleLowerCase("tr").normalize("NFC").trim()
}

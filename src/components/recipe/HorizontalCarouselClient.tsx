/* =============================================================================
                  		Horizontal Recipe Carousel
============================================================================= */
/**
 * @fileoverview
 * Renders a horizontal carousel of recipe cards for the homepage.
 *
 * PURPOSE:
 * Designed to display a scrollable list of recipe cards in a horizontal layout.
 * Used mainly on the homepage to showcase trending recipes or classical recipes
 * allowing users to quickly browse through options.
 *
 * NOTE(ARCHITECTURE):
 * Scrollable and displays recipe cards with like buttons.
 * Receives an array of recipe data transfer objects and a set of liked
 * recipe IDs for efficient rendering.
 *
 * NOTE(DESIGN):
 * Uses `touch-action: manipulation` so the browser natively disambiguates
 * horizontal swipes (carousel) from vertical swipes (page scroll) based on
 * the initial touch angle. This avoids blocking the page's vertical scroll
 * while still enabling smooth horizontal panning inside the carousel.
 * See: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import React, { useCallback, useEffect, useRef, useState } from "react"

/* --- Components --- */
import RecipeCard from "@/components/recipe/RecipeCard"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* --- Assets --- */
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid"

/* === Local Constants ====================================================== */
/**
 * Fraction of the visible container width used as the scroll distance
 * when a guide arrow is clicked.
 *
 * NOTE(DESIGN):
 * Using a fraction instead of a fixed pixel value makes the scroll distance
 * proportional to the viewport, providing a consistent feel across screen
 * sizes (mobile → desktop).
 */
const SCROLL_FRACTION = 0.75

/**
 * Pixel threshold for fading out scroll guides near the edges.
 *
 * NOTE(DESIGN):
 * Prevents the guide from flickering at the extreme bounds where
 * fractional pixels from sub-pixel rendering could cause jitter.
 */
const EDGE_THRESHOLD_PX = 20

/* === Contracts ============================================================ */
/**
 * Properties for the {@link ScrollGuidesOverlay} subcomponent.
 *
 * @property canScrollLeft  - Whether the container can scroll further left.
 * @property canScrollRight - Whether the container can scroll further right.
 * @property onScrollLeft   - Callback invoked when the left guide activated.
 * @property onScrollRight  - Callback invoked when the right guide activated.
 */
interface ScrollGuidesOverlayProps {
	canScrollLeft: boolean
	canScrollRight: boolean
	onScrollLeft: () => void
	onScrollRight: () => void
}

/**
 * Properties required by {@link HorizontalCarouselClient}.
 *
 * @property recipes        - Recipe cards for the current page.
 * @property likedRecipeIds - Set of recipe IDs currently liked by the user.
 * 							  Used for O(1) lookup when rendering recipe cards.
 */
interface HorizontalCarouselClientProps {
	recipes: RecipeCardDto[]
	likedRecipeIds: Set<number>
}

/* === Subcomponents ======================================================== */
/**
 * Renders left and right scroll navigation guides.
 *
 * Fades in/out based on scroll position.
 * Allows users to scroll the category band left/right when content overflows.
 *
 * NOTE(PERFORMANCE):
 * Wrapped in `React.memo` to skip re-renders when the parent re-renders
 * but the scroll position (and therefore guide visibility) hasn't changed.
 *
 * NOTE(DESIGN):
 * Uses `<button>` elements with `aria-label` instead of `<div onClick>` so
 * the guides are keyboard-focusable and screen-reader-announced.
 *
 * @component
 * @param props - See {@link ScrollGuidesOverlayProps} for details.
 * @return {React.ReactElement} The scroll guides element.
 */
const ScrollGuidesOverlay = React.memo(function ScrollGuidesOverlay({
	canScrollLeft,
	canScrollRight,
	onScrollLeft,
	onScrollRight,
}: ScrollGuidesOverlayProps): React.ReactElement {
	const nonScrollableButtonClass = "opacity-0 pointer-events-none"

	const arrowButtonClass = [
		"absolute flex items-center justify-center",
		"top-[calc(50%-15px)] -translate-y-1/2",
		"p-2 md:p-6 z-20 rounded-full",
		"size-8 md:size-16",
		"backdrop-blur-sm",
		"bg-surface-container-lowest/20 hover:bg-surface-container-lowest/40",
		"text-color-primary cursor-pointer",
		/* Smooth opacity transition for fade-in/out. */
		"transition-opacity duration-400",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			{/* Left Scroll Guide */}
			<button
				type="button"
				aria-label="Sola kaydır"
				onClick={onScrollLeft}
				className={`${arrowButtonClass} left-0
					${canScrollLeft ? "opacity-100" : nonScrollableButtonClass}
				`}
			>
				<ChevronLeftIcon />
			</button>

			{/* Right Scroll Guide */}
			<button
				type="button"
				aria-label="Sağa kaydır"
				onClick={onScrollRight}
				className={`${arrowButtonClass} right-0
					${canScrollRight ? "opacity-100" : nonScrollableButtonClass}
				`}
			>
				<ChevronRightIcon />
			</button>
		</>
	)
})

/* === Main Component ======================================================= */
/**
 * Renders a horizontal carousel of recipe cards.
 *
 * @param recipes        - Array of recipe data transfer objects.
 * @param likedRecipeIds - Set of recipe IDs currently liked by the user.
 * @returns {React.ReactElement} - The rendered horizontal carousel.
 */
export default function HorizontalCarouselClient({
	recipes,
	likedRecipeIds,
}: HorizontalCarouselClientProps): React.ReactElement {
	/* ─── References ─────────────────────────────────────────────────────── */
	const containerRef = useRef<HTMLDivElement>(null)

	/**
	 * Tracks whether an `evaluateScrollPosition` call is already scheduled
	 * via `requestAnimationFrame`, preventing redundant work.
	 */
	const rafIdRef = useRef<number | null>(null)

	/* ─── States ─────────────────────────────────────────────────────────── */
	/**
	 * Scroll guide visibility state.
	 *
	 * Tracks whether left/right scroll guides should be visible
	 * based on current scroll position.
	 */
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)

	/* --- Scroll Management Callbacks --- */
	/**
	 * Evaluates the current scroll position and updates guide visibility.
	 *
	 * Checks whether the container can scroll left or right and updates
	 * the corresponding state to show/hide the scroll guide chevrons.
	 */
	const evaluateScrollPosition = useCallback(() => {
		const el = containerRef.current
		if (!el) return

		const maxScroll = el.scrollWidth - el.clientWidth
		setCanScrollLeft(el.scrollLeft > EDGE_THRESHOLD_PX)
		setCanScrollRight(el.scrollLeft < maxScroll - EDGE_THRESHOLD_PX)
	}, [])

	/**
	 * RAF-throttled wrapper around {@link evaluateScrollPosition}.
	 *
	 * NOTE(ARCHITECTURE):
	 * Scroll events fire at display refresh rate (60–120 Hz). Coalescing
	 * them through `requestAnimationFrame` guarantees at most one state
	 * update per paint frame, avoiding layout thrashing and excessive
	 * React re-renders.
	 */
	const scheduleScrollEvaluation = useCallback(() => {
		if (rafIdRef.current !== null) return

		rafIdRef.current = requestAnimationFrame(() => {
			evaluateScrollPosition()
			rafIdRef.current = null
		})
	}, [evaluateScrollPosition])

	/**
	 * Scrolls the carousel to the left/right by a fraction of the visible
	 * container width.
	 *
	 * NOTE(ARCHITECTURE):
	 * Uses `SCROLL_FRACTION * clientWidth` so that the scroll distance
	 * adapts to the current container size, producing consistent UX
	 * regardless of screen width or orientation.
	 */
	const scrollLeft = useCallback(() => {
		const el = containerRef.current
		if (!el) return
		const scrollAmount = el.clientWidth * SCROLL_FRACTION
		el.scrollBy({ left: -scrollAmount, behavior: "smooth" })
	}, [])
	const scrollRight = useCallback(() => {
		const el = containerRef.current
		if (!el) return
		const scrollAmount = el.clientWidth * SCROLL_FRACTION
		el.scrollBy({ left: scrollAmount, behavior: "smooth" })
	}, [])

	/* ─── Effects ────────────────────────────────────────────────────────── */
	/**
	 * Attaches scroll and resize observers to keep guide visibility in sync.
	 *
	 * - **scroll**: Updates guides as the user pans horizontally.
	 * - **ResizeObserver**: Re-evaluates when container width changes
	 *   (e.g. viewport resize, orientation change, sidebar toggle) because
	 *   a width change alters `scrollWidth - clientWidth`.
	 *
	 * NOTE(ARCHITECTURE):
	 * Cancels any pending `requestAnimationFrame` on unmount to prevent
	 * state updates on an unmounted component.
	 */
	useEffect(() => {
		const el = containerRef.current
		if (!el) return

		/* Initial evaluation. */
		evaluateScrollPosition()

		/* Scroll listener (RAF-throttled). */
		el.addEventListener("scroll", scheduleScrollEvaluation, {
			passive: true,
		})

		/* Resize observer: container width changes affect scroll bounds. */
		const resizeObserver = new ResizeObserver(() => {
			evaluateScrollPosition()
		})
		resizeObserver.observe(el)

		return () => {
			el.removeEventListener("scroll", scheduleScrollEvaluation)
			resizeObserver.disconnect()

			/* Cancel any pending RAF to avoid stale state updates. */
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current)
				rafIdRef.current = null
			}
		}
	}, [evaluateScrollPosition, scheduleScrollEvaluation])

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const scrollAreaClass = [
		"flex flex-nowrap gap-6 pb-4",
		"overflow-x-auto overflow-y-hidden snap-x snap-mandatory",
		/*
		 * `touch-manipulation` is equivalent to `pan-x pan-y` (allow both
		 * axes) while also disabling double-tap-to-zoom — exactly the
		 * semantics we need. The browser's native touch-angle heuristic
		 * decides whether a swipe is horizontal (carousel) or vertical
		 * (page scroll).
		 *
		 * `overscroll-x-contain` prevents horizontal scroll-chaining: when
		 * the carousel reaches its edge, the gesture does NOT propagate
		 * to the parent (e.g. triggering browser back-navigation).
		 */
		"touch-manipulation overscroll-x-contain no-scrollbar",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className="relative">
			<ScrollGuidesOverlay
				canScrollLeft={canScrollLeft}
				canScrollRight={canScrollRight}
				onScrollLeft={scrollLeft}
				onScrollRight={scrollRight}
			/>
			<div
				ref={containerRef}
				className={scrollAreaClass}
				role="region"
				aria-label="Yatay tarif alanı"
			>
				{recipes.map((recipe) => (
					<RecipeCard
						key={recipe.id}
						recipe={recipe}
						initialLiked={likedRecipeIds.has(recipe.id)}
						mode="homepage"
					/>
				))}
			</div>
		</div>
	)
}

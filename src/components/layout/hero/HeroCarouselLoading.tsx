/* =============================================================================
                           Hero Carousel Loading
============================================================================= */
/**
 * @fileoverview
 * Loading skeleton for the home hero carousel.
 *
 * PURPOSE:
 * Matches the hero carousel layout while content is still loading.
 *
 * FLOW:
 * 1. Builds a skeleton shell with the same spacing and proportions.
 * 2. Uses pulse blocks for the image, title, body, and actions.
 * 3. Exports the component for the route-level loading state.
 *
 * NOTE(ARCHITECTURE):
 * The component is intentionally lightweight and dependency-free.
 */

const sectionClass = [
	"relative w-full max-w-[1440px] mx-auto mb-stack-lg",
	"overflow-hidden rounded-xl isolate organic-shadow",
].join(" ")

const viewportClass = [
	"relative overflow-hidden h-[60svh] min-h-[420px] max-h-[680px]",
	"bg-surface-container-lowest animate-pulse",
].join(" ")

const overlayClass = [
	"absolute inset-0",
	"bg-linear-to-r from-black/20 to-transparent",
].join(" ")

const contentClass = [
	"relative max-w-3xl z-10 px-12 md:px-16 lg:px-20 py-32",
	"text-on-primary",
].join(" ")

const badgeClass = ["mb-4 h-7 w-32 rounded-full bg-surface-container"].join(" ")

const titleClass = ["mb-4 h-10 w-3/4 rounded bg-surface-container"].join(" ")

const bodyClass = ["mb-6 h-4 w-full rounded bg-surface-container/80"].join(" ")

const buttonClass = ["mt-4 h-14 w-72 rounded-lg bg-primary-container"].join(" ")

const indicatorContainerClass = [
	"absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2",
].join(" ")
const indicatorClass = ["h-2.5 w-2.5 rounded-full bg-white/40"].join(" ")

export default function HeroCarouselLoading() {
	return (
		<section className={sectionClass} aria-label="Yükleniyor">
			<div className={viewportClass}>
				<div className="absolute inset-0 bg-surface-container" />
				<div className={overlayClass} />

				<div className={contentClass}>
					<div className={badgeClass} />
					<div className={titleClass} />
					<div className={bodyClass} />
					<div className={bodyClass} />
					<div className={buttonClass} />
				</div>

				<div className={indicatorContainerClass}>
					<div className={indicatorClass} />
					<div className={indicatorClass} />
					<div className={indicatorClass} />
				</div>
			</div>
		</section>
	)
}

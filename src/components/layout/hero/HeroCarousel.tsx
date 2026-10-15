/* =============================================================================
                                Hero Carousel
============================================================================= */
/**
 * @fileoverview
 * Client-side hero carousel for featured recipes.
 *
 * PURPOSE:
 * Render the hero banner with autoplay, swipe support,
 * and navigation controls.
 *
 * FLOW:
 * 1. Defines the slide data and shared UI classes.
 * 2. Tracks the active slide and autoplay behavior.
 * 3. Renders the current slide and its controls.
 *
 * NOTE(ARCHITECTURE):
 * Client-only because it uses browser APIs for motion preferences
 * and touch gestures.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

/* --- Utilities --- */
import { scrollToElementById } from "@/utils/commons"

/* --- Assets --- */
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ArrowDownIcon,
	ArrowsPointingInIcon,
} from "@heroicons/react/24/solid"

/* === Local Constants ====================================================== */
const AUTO_PLAY_MS = 8000
const MIN_SWIPE_DISTANCE = 50
const HERO_IMAGE_SIZES =
	"(max-width: 768px) 100vw, (max-width: 1440px) 90vw, 1440px"

const HERO_SLIDES: HeroSlide[] = [
	{
		title: "Tam Sana Göre Tarifler",
		description: (
			<>
				Kaç kişilik pişireceğini ve istediğin anlatım tarzını seç.
				<br />
				Tarif anında sana göre uyarlansın. Dilersen mutfağındaki
				malzemelere göre özelleştirelim.
			</>
		),
		imageUrl: "/media/hero/hero-min.webp",
		ctaLabel: "En Sevilenleri Keşfet",
		icon: <ArrowDownIcon className="size-6" />,
		onClick: () => scrollToElementById("home-popular"),
		ctaLabel2: "Tarif Bulucuya Git",
		icon2: <ArrowsPointingInIcon className="size-6" />,
		href2: "/mutfaktaki-malzemelerle/",
	},
	{
		title: "Palamut Ekşilisi",
		description:
			"Ekşimsi ve aromatik sosuyla mevsim balıklarının tencerede " +
			"demlenmesiyle hazırlanan nefis bir klasik.",
		imageUrl: "/media/hero/hero2-min.webp",
		badge: "Haftanın Yemeği",
		ctaLabel2: "Tarifi İncele",
		icon2: <ArrowsPointingInIcon className="size-6" />,
		href2: "/tarif/palamut-eksilisi/",
	},
	{
		title: "Süt Reçelli Trileçe",
		description:
			"Hafif keki ve süt reçeli ile hazırlanan şerbetiyle damağı " +
			"ferahlatan orijinal tarif.",
		imageUrl: "/media/hero/hero3-min.webp",
		badge: "Haftanın Tatlısı",
		ctaLabel2: "Tarifi İncele",
		icon2: <ArrowsPointingInIcon className="size-6" />,
		href2: "/tarif/sut-recelli-trilece/",
	},
]

/* === Contracts ============================================================ */
interface HeroSlide {
	title: string
	description: ReactNode
	imageUrl: string
	badge?: string
	ctaLabel?: string
	icon?: React.ReactElement
	href?: string
	onClick?: () => void
	ctaLabel2?: string
	icon2?: React.ReactElement
	href2?: string
}

/* === Main Component ======================================================= */
export default function HeroCarousel() {
	/* ─── Constants ──────────────────────────────────────────────────────── */
	const totalSlides = HERO_SLIDES.length

	/* ─── References ─────────────────────────────────────────────────────── */
	const touchStartRef = useRef<number | null>(null)
	const touchEndRef = useRef<number | null>(null)
	const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

	/* ─── States ─────────────────────────────────────────────────────────── */
	const [currentSlide, setCurrentSlide] = useState(0)
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

	/* ─── Effects ────────────────────────────────────────────────────────── */
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
		const updatePreference = () => {
			setPrefersReducedMotion(mediaQuery.matches)
		}

		updatePreference()
		mediaQuery.addEventListener("change", updatePreference)

		return () => {
			mediaQuery.removeEventListener("change", updatePreference)
		}
	}, [])

	const stopAutoplay = useCallback(() => {
		if (autoplayRef.current) {
			clearInterval(autoplayRef.current)
			autoplayRef.current = null
		}
	}, [])

	const startAutoplay = useCallback(() => {
		if (prefersReducedMotion) {
			return
		}

		stopAutoplay()

		autoplayRef.current = setInterval(() => {
			if (document.hidden) {
				return
			}

			setCurrentSlide((prev) => (prev + 1) % totalSlides)
		}, AUTO_PLAY_MS)
	}, [prefersReducedMotion, stopAutoplay, totalSlides])

	useEffect(() => {
		startAutoplay()

		return stopAutoplay
	}, [startAutoplay, stopAutoplay])

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	const goToSlide = useCallback(
		(index: number) => {
			setCurrentSlide(index)
			startAutoplay()
		},
		[startAutoplay],
	)

	const moveCarousel = useCallback(
		(direction: number) => {
			setCurrentSlide((prev) => {
				return (prev + direction + totalSlides) % totalSlides
			})

			startAutoplay()
		},
		[startAutoplay, totalSlides],
	)

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		touchStartRef.current = event.clientX
		touchEndRef.current = null
	}

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		touchEndRef.current = event.clientX
	}

	const handlePointerUp = () => {
		const start = touchStartRef.current
		const end = touchEndRef.current

		if (start === null || end === null) {
			return
		}

		const distance = start - end

		if (distance > MIN_SWIPE_DISTANCE) {
			moveCarousel(1)
		}

		if (distance < -MIN_SWIPE_DISTANCE) {
			moveCarousel(-1)
		}
	}

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const sectionClass = [
		"relative hero-carousel group",
		"w-full max-w-[1440px] mx-auto mb-stack-lg",
		"overflow-hidden rounded-xl isolate organic-shadow",
	].join(" ")

	const viewportClass =
		"overflow-hidden h-[60svh] min-h-[420px] max-h-[680px]"

	const overlayClass = [
		"absolute inset-0",
		"bg-linear-to-r from-black/60 to-transparent bg-black/35",
	].join(" ")

	const contentClass = [
		"relative max-w-3xl z-10",
		"px-12 md:px-16 lg:px-20 py-8",
		"text-on-primary",
	].join(" ")

	const slideBadgeClass = [
		"inline-block bg-secondary-container text-[12px] tracking-wider",
		"text-on-secondary-container font-label-sm font-bold",
		"px-3 py-1 mb-4 rounded-full",
	].join(" ")

	const slideTitleClass = [
		"mb-2 md:mb-4 font-headline-lg md:font-headline-xl font-semibold",
		"text-headline-xl text-on-primary",
	].join(" ")

	const slideBodyClass = [
		"text-body-sm md:text-body-md lg:text-body-lg text-on-primary/90",
		"mb-2 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10",
	].join(" ")

	const slideButtonContainerClass =
		"flex flex-wrap gap-1 md:gap-4 mt-4 md:mt-6 lg:mt-8"

	const slideButtonClass = [
		"inline-flex items-center gap-2 px-3 md:px-6 py-4 mt-4",
		"border-1 text-white text-body-md md:text-body-lg",
		"font-bold font-label-md rounded-lg hover:opacity-90",
		"transition-colors shadow-lg shadow-[#1B3022]/10 cursor-pointer",
	].join(" ")

	const slideButton2Class = [
		"inline-flex items-center gap-2 px-6 md:px-10 py-4 mt-4",
		"bg-primary-container text-white text-body-md md:text-body-lg",
		"font-bold font-label-md rounded-lg hover:opacity-90",
		"transition-colors shadow-lg shadow-[#1B3022]/10 cursor-pointer",
	].join(" ")

	const arrowButtonClass = [
		"absolute flex items-center justify-center",
		"top-1/2 -translate-y-1/2",
		"p-2 md:p-6 z-20 rounded-full",
		"size-10 md:size-20",
		"backdrop-blur-sm",
		"bg-surface-container-lowest/20 hover:bg-surface-container-lowest/40",
		"text-white cursor-pointer",
		"transition-all md:opacity-0 md:group-hover:opacity-100",
	].join(" ")

	const slideIndicatorContainerClass =
		"absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-25"

	const slideIndicatorClass = [
		"h-2.5 rounded-full transition-all cursor-pointer",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<section
			role="region"
			aria-label="En sevilen tarifler"
			aria-roledescription="carousel"
			className={sectionClass}
		>
			<div
				className={viewportClass}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
			>
				<div
					id="hero-carousel"
					className="
						carousel-container
						w-full
						h-[60svh] min-h-[420px] max-h-[680px]
					"
					style={{
						transform: `translate3d(-${currentSlide * 100}%,0,0)`,
					}}
				>
					{HERO_SLIDES.map((slide, index) => (
						<div
							key={slide.title}
							aria-hidden={currentSlide !== index}
							className="
								carousel-slide
								relative
								flex
								h-full
								items-center
							"
						>
							<Image
								fill
								fetchPriority={index === 0 ? "high" : "low"}
								priority={index === 0}
								loading={index === 0 ? undefined : "lazy"}
								sizes={HERO_IMAGE_SIZES}
								quality={75}
								src={slide.imageUrl}
								alt={slide.title}
								className="
									object-cover
									pointer-events-none
								"
							/>

							<div className={overlayClass} />

							<div className={contentClass}>
								{slide.badge && (
									<span className={slideBadgeClass}>
										{slide.badge}
									</span>
								)}
								<h1 className={slideTitleClass}>
									{slide.title}
								</h1>
								<p className={slideBodyClass}>
									{slide.description}
								</p>

								<div className={slideButtonContainerClass}>
									{slide.ctaLabel && (
										<button
											type="button"
											className={slideButtonClass}
											onClick={slide.onClick}
										>
											{slide.ctaLabel}

											{slide.icon}
										</button>
									)}

									{slide.href2 && (
										<Link
											href={slide.href2}
											className={slideButton2Class}
										>
											{slide.ctaLabel2}

											{slide.icon2}
										</Link>
									)}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Navigation Arrows */}
				<button
					className={`
						${arrowButtonClass} left-1 sm:left-2 md:left-3
					`}
					onClick={() => moveCarousel(-1)}
				>
					<ChevronLeftIcon />
				</button>
				<button
					className={`
						${arrowButtonClass} right-1 sm:right-2 md:right-3
					`}
					onClick={() => moveCarousel(1)}
				>
					<ChevronRightIcon />
				</button>

				{/* Indicators */}
				<div className={slideIndicatorContainerClass}>
					{[0, 1, 2].map((index) => (
						<button
							key={index}
							className={`
								${slideIndicatorClass}
								${
									currentSlide === index
										? "bg-white w-6"
										: "bg-white/30 hover:bg-white/50 w-2.5"
								}
							`}
							onClick={() => goToSlide(index)}
						></button>
					))}
				</div>
			</div>
		</section>
	)
}

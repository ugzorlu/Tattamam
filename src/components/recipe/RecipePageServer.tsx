/* =============================================================================
                         Recipe Detail — Static Shell
============================================================================= */
/**
 * @fileoverview
 * Pure static Server Component for the recipe detail page.
 *
 * PURPOSE:
 * Renders all public, user-agnostic recipe content: hero image, title,
 * description, category breadcrumb, tag badges, info card, and the
 * interactive ingredients/steps panel. Receives all data as props
 * (no dynamic DB calls here) so Next.js can serve this component
 * directly from the application-level cache.
 *
 * NOTE(ARCHITECTURE):
 * - This component is intentionally free of any request-scoped dynamic
 *   APIs (`cookies()`, `headers()`, `getServerSession`). It must remain
 *   cacheable under the `'use cache'` model used by its parent page.
 * - The floating `ActionPanel` (like, favorite, share) is rendered
 *   separately by `UserStateProvider` inside a `<Suspense>` boundary in
 *   `page.tsx`. This lets the static shell stream to the client
 *   immediately while per-visitor state resolves asynchronously.
 * - Shared typography and animation styles are centralized to improve
 *   maintainability and keep line lengths within project standards.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"

/* --- Components (lazy-loaded) --- */
import { InteractivePanelSkeleton } from "@/components/recipe/InteractivePanel"
const InteractivePanel = dynamic(
	async () => (await import("@/components/recipe/InteractivePanel")).default,
	{
		loading: () => <InteractivePanelSkeleton />,
	},
)

/* --- Utilities --- */
import { buildCloudinaryUrl, buildCloudinaryBlurUrl } from "@/utils/cloudinary"

/* --- Types --- */
import type { RecipeDetailDto } from "@/lib/dto"

/* --- Assets --- */
import { ChevronRightIcon } from "@heroicons/react/24/solid"
import {
	ClockIcon,
	FireIcon,
	BanknotesIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline"

/* === Contracts ============================================================ */
/**
 * Properties required by {@link InfoCell}.
 *
 * @property icon - React element representing the Heroicon in the info cell.
 * @property label - Label text for the info cell.
 * @property value - Value text for the info cell.
 */
interface InfoCellProps {
	icon: React.ReactElement
	label: string
	value: React.ReactNode
}

/**
 * Properties required by {@link RecipePageServer}.
 *
 * @property recipe - Fully-hydrated recipe DTO from the cached DAL.
 * @property actionPanelSlot - Optional React node (typically a Suspense-wrapped
 *                             dynamic component) to render in image container.
 *
 * NOTE(DESIGN):
 * User-specific state (like, favorite, session) is intentionally
 * absent from this interface. Those concerns are handled by
 * `UserStateProvider` which renders `ActionPanel` independently
 * inside a `<Suspense>` boundary in the parent page and is passed
 * here via the `actionPanelSlot`.
 */
interface RecipePageServerProps {
	recipe: RecipeDetailDto
	actionPanelSlot?: React.ReactNode
}

/* === Sub-components ======================================================= */
/**
 * Renders the sweet donut icon assigned to the dessert tag.
 *
 * @returns A decorative donut SVG sized for a tag badge.
 */
function DonutIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
			<path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
			<path d="m8 6 1 1m7 0 1-1m1 8 1 1m-12 1 1-1" />
		</svg>
	)
}

/**
 * Renders the oven icon assigned to the oven-technique tag.
 *
 * @returns A decorative oven SVG sized for a tag badge.
 */
function OvenIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<rect x="4" y="3" width="16" height="18" rx="2" />
			<path d="M7 7h10M7 11h10" />
			<rect x="7" y="14" width="10" height="4" rx="0.75" />
		</svg>
	)
}

/**
 * Renders a top-down view of a high-fire frying pan.
 *
 * @returns A decorative overhead frying-pan SVG sized for a tag badge.
 */
function PanFryIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<circle cx="10" cy="11" r="7" />
			<circle cx="10" cy="11" r="5" />
			<path d="m15 6 5-4 2 2-5 5" />
			<path d="M7 10c1-1 2-1 3 0s2 1 3 0" />
			<path d="M6 20c-.8-1.2.8-1.6 0-3" />
			<path d="M10 21c-.8-1.2.8-1.6 0-3" />
			<path d="M14 20c-.8-1.2.8-1.6 0-3" />
		</svg>
	)
}

/**
 * Renders the low-fire stewpot icon.
 *
 * @returns A decorative stewpot and low flame SVG sized for a tag badge.
 */
function StewpotLowFireIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6Z" />
			<path d="M3 10h18M8 7h8" />
			<path d="M9 22c-.8-1.1.8-1.5 0-2.5" />
		</svg>
	)
}

/**
 * Renders the high-steam stewpot icon.
 *
 * @returns A decorative stewpot and steam SVG sized for a tag badge.
 */
function StewpotSteamIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6Z" />
			<path d="M3 10h18M8 7h8" />
			<path d="M9 5c-1.5-1.5 1.5-2.5 0-4" />
			<path d="M13 5c-1.5-1.5 1.5-2.5 0-4" />
			<path d="M17 5c-1.5-1.5 1.5-2.5 0-4" />
		</svg>
	)
}

/**
 * Renders the raw vegetables icon.
 *
 * @returns A decorative leafy vegetables SVG sized for a tag badge.
 */
function RawVegetablesIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M12 20V9" />
			<path d="M12 13c-4 0-6-2.5-6-6 3.5 0 6 2 6 6Z" />
			<path d="M12 10c0-3.5 2.5-6 6-6 0 4-2 6-6 6Z" />
			<path d="M12 17c3.5 0 5.5-2 5.5-5.5-3.5 0-5.5 2-5.5 5.5Z" />
			<path d="M8 20h8" />
		</svg>
	)
}

/**
 * Renders the caramel melting-cube icon.
 *
 * @returns A decorative melting caramel cube SVG sized for a tag badge.
 */
function CaramelIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="m5 8 7-4 7 4-7 4-7-4Z" />
			<path d="M5 8v7l7 4 7-4V8" />
			<path d="M12 12v7M8.5 6l7 4" />
			<path d="M8 19c-.8 1 .8 1.5 0 2.5M16 19c-.8 1 .8 1.5 0 2.5" />
		</svg>
	)
}

/**
 * Renders the vaporizing-water icon.
 *
 * @returns A decorative water droplet and vapor SVG sized for a tag badge.
 */
function VaporizingWaterIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M7 14a4 4 0 0 0 8 0c0-2.2-4-7-4-7s-4 4.8-4 7Z" />
			<path d="M6 5c-1.5-1.5 1.5-2.5 0-4M12 5c-1.5-1.5 1.5-2.5 0-4" />
			<path d="M18 5c-1.5-1.5 1.5-2.5 0-4" />
		</svg>
	)
}

/**
 * Renders the white flour icon.
 *
 * @returns A decorative flour sack and grain SVG sized for a tag badge.
 */
function WhiteFlourIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M7 7h10l1 13H6L7 7Z" />
			<path d="M8 7c0-2 1-3 4-3s4 1 4 3M7 11h10" />
			<path d="M10 15c1-1 2-1 3 0s2 1 3 0" />
			<path d="M12 13v4" />
		</svg>
	)
}

/**
 * Renders the milk icon.
 *
 * @returns A decorative milk bottle SVG sized for a tag badge.
 */
function MilkIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M9 5h6l1 3v12H8V8l1-3Z" />
			<path d="M9 5V3h6v2M8 10h8" />
			<path d="M11 14h2M11 17h2" />
		</svg>
	)
}

/**
 * Renders the baklava icon.
 *
 * @returns A decorative layered baklava diamond SVG sized for a tag badge.
 */
function BaklavaIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="m12 3 8 9-8 9-8-9 8-9Z" />
			<path d="m12 6 5.5 6-5.5 6-5.5-6L12 6Z" />
			<path d="M12 3v3M12 18v3M4 12h4M16 12h4" />
		</svg>
	)
}

/**
 * Renders the cake icon.
 *
 * @returns A decorative frosted cake slice SVG sized for a tag badge.
 */
function CakeIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M4 11h16v8H4v-8Z" />
			<path d="M4 14h16M7 11V8h10v3" />
			<path d="M10 8V5h4v3M12 3v2" />
			<path d="M7 16v3M12 16v3M17 16v3" />
		</svg>
	)
}

/**
 * Renders a sea-wave icon for the coastal tag.
 *
 * @returns A decorative sea-wave SVG sized for a tag badge.
 */
function SeaWaveIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<path d="M3 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
			<path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
			<path d="M4 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
		</svg>
	)
}

/**
 * Renders a perforated cracker icon.
 *
 * @returns A decorative cracker SVG sized for a tag badge.
 */
function CrackerIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
			aria-hidden="true"
		>
			<rect x="4" y="4" width="16" height="16" rx="3" />
			<path d="m7 7 10 10M17 7 7 17" />
			<circle cx="12" cy="8" r="0.5" />
			<circle cx="8" cy="12" r="0.5" />
			<circle cx="16" cy="12" r="0.5" />
			<circle cx="12" cy="16" r="0.5" />
		</svg>
	)
}

/**
 * Resolves the dedicated icon for a subgroup or technique tag.
 *
 * Unsupported tag IDs intentionally return no icon until an assignment exists.
 *
 * @param tagId The tag identifier to resolve.
 * @returns The assigned icon, or null when no icon is registered.
 */
function getTagIcon(tagId: number): React.ReactNode {
	if (tagId === 1) {
		return <DonutIcon />
	}

	if (tagId === 2) {
		return <CrackerIcon />
	}

	if (tagId === 8) {
		return <SeaWaveIcon />
	}

	if (tagId === 1007) {
		return <OvenIcon />
	}

	if ([1001, 1008, 1009, 1011].includes(tagId)) {
		return <PanFryIcon />
	}

	if ([1002, 1006, 1010, 1019].includes(tagId)) {
		return <StewpotLowFireIcon />
	}

	if ([1003, 1013].includes(tagId)) {
		return <StewpotSteamIcon />
	}

	if (tagId === 1004) {
		return <RawVegetablesIcon />
	}

	if (tagId === 1017) {
		return <CaramelIcon />
	}

	if ([1012, 1018].includes(tagId)) {
		return <VaporizingWaterIcon />
	}

	if (tagId === 4) {
		return <WhiteFlourIcon />
	}

	if (tagId === 5) {
		return <MilkIcon />
	}

	if (tagId === 6) {
		return <BaklavaIcon />
	}

	if ([9, 16].includes(tagId)) {
		return <CakeIcon />
	}

	return null
}

interface LevelScaleProps {
	level: number
	symbol: "₺" | "dot"
}

function LevelScale({ level, symbol }: LevelScaleProps) {
	const filledCount = Math.min(5, Math.max(0, level))
	const scaleLabel = `${filledCount} / 5`
	const itemClass = symbol === "dot" ? "size-2 rounded-full" : "text-xs"

	return (
		<span
			className="inline-flex items-center gap-0.5 ml-1"
			aria-label={scaleLabel}
		>
			{Array.from({ length: 5 }, (_, index) => {
				const isFilled = index < filledCount
				const colorClass = isFilled
					? symbol === "dot"
						? "bg-primary"
						: "text-primary"
					: symbol === "dot"
						? "bg-inverse-primary"
						: "text-inverse-primary"

				return (
					<span
						key={index}
						className={`${itemClass} ${colorClass}`}
						aria-hidden="true"
					>
						{symbol === "₺" ? "₺" : null}
					</span>
				)
			})}
		</span>
	)
}

function InfoCell({ icon, label, value }: InfoCellProps) {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const infoCellContainerClass = "flex items-center gap-3"
	const infoCellLabelClass = [
		"text-label-sm font-label-sm",
		"text-on-surface-variant",
	].join(" ")
	const infoCellValueClass = "font-label-md text-label-md"

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className={infoCellContainerClass}>
			{icon}
			<div>
				<p className={infoCellLabelClass}>{label}</p>
				<p className={infoCellValueClass}>{value}</p>
			</div>
		</div>
	)
}

/* === Main Component ======================================================= */
/**
 * Renders the static recipe content shell.
 *
 * All props are derived from the cross-request cached
 * {@link getCachedRecipeBySlug} result in the parent page, so this
 * render path never issues a DB query itself.
 *
 * @component
 * @param props - See {@link RecipePageServerProps}.
 * @returns {React.ReactElement} The fully rendered recipe static shell.
 */
export default async function RecipePageServer({
	recipe,
	actionPanelSlot,
}: RecipePageServerProps): Promise<React.ReactElement> {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const navigationContainerClass = [
		"flex items-center gap-2 mb-4 md:mb-8",
		"text-on-surface-variant font-label-sm",
		"uppercase tracking-widest",
	].join(" ")

	const articleContainerClass = [
		"max-w-container-max mx-auto",
		"px-margin-mobile md:px-margin-desktop",
	].join(" ")

	const heroSectionClass = [
		"grid grid-cols-1 lg:grid-cols-12",
		"gap-gutter items-center mb-stack-sm",
	].join(" ")

	const imageWrapperClass = [
		"rounded-xl overflow-hidden organic-shadow",
		/*
		 * NOTE(PERFORMANCE):
		 * `image-shimmer` adds a CSS pseudo-element sweep animation
		 * that is visible while the Cloudinary image downloads. Once
		 * the browser paints the actual <img>, it occludes the
		 * pseudo-element automatically — no JS event listener needed.
		 *
		 * `aspect-4/3` + `relative` are required by next/image `fill`.
		 */
		"aspect-4/3 bg-surface-container relative image-shimmer",
	].join(" ")

	const imageFallbackClass = [
		"w-full h-full bg-surface-variant",
		"flex items-center justify-center",
		"text-on-surface-variant",
	].join(" ")

	const metadataColumnClass = [
		"lg:col-span-5 flex flex-col",
		"gap-stack-sm mt-2 lg:mt-0",
	].join(" ")

	const titleClass = [
		"font-headline-lg text-headline-lg lg:font-headline-xl lg:text-headline-xl",
		"font-semibold text-primary",
	].join(" ")

	const descriptionClass = [
		"font-body-lg text-body-lg",
		"text-on-surface-variant italic",
	].join(" ")

	const infoCardClass = [
		"grid grid-cols-2 gap-4 mt-4",
		"bg-surface-container-low p-6 rounded-xl",
		"border border-outline-variant/30",
	].join(" ")

	const tagsContainerClass = "flex flex-wrap gap-2 mb-2"

	const tagBadgeBaseClass = [
		"rounded-full",
		"font-label-sm text-label-sm",
	].join(" ")

	const tagBadgeKind0Class = [
		"inline-flex items-center gap-2 px-5 py-2",
		"bg-secondary-container text-on-secondary-container",
		"border border-secondary/30",
	].join(" ")

	const tagBadgeKind1Class = [
		"px-3 py-1",
		"text-white bg-primary-container",
		"text-on-primary-container",
	].join(" ")

	const tagBadgeKind2Class = [
		"inline-flex items-center gap-2 px-5 py-2",
		"bg-surface-container-high text-on-surface-variant",
		"border border-outline-variant/30",
	].join(" ")

	const subgroupAndTechniqueTags = [
		...recipe.tags.filter((tag) => tag.kind === 0),
		...recipe.tags.filter((tag) => tag.kind === 2),
	]

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<main className="h-auto pt-8 pb-stack-lg">
			<article className={articleContainerClass}>
				{/* ── Category Navigation ───────────────────────────────── */}
				<nav className={navigationContainerClass}>
					<Link href="/kategori">Kategoriler</Link>
					<ChevronRightIcon className="size-4" />
					<Link
						href={`/kategori/${recipe.categories[0].slug}`}
						className="text-primary"
					>
						{recipe.categories[0].name}
					</Link>
				</nav>

				{/* ── Hero Section (Server Rendered) ────────────────────── */}
				<section className={heroSectionClass}>
					{/* ── Image Column ──────────────────────────────────── */}
					{/*
					 * `relative` on the outer div is required so that
					 * UserStateProvider's ActionPanel (rendered via
					 * Suspense in page.tsx) can be positioned absolutely
					 * inside this same stacking context with `top-4 right-4`.
					 */}
					<div className="lg:col-span-7 relative group">
						<div className={imageWrapperClass}>
							{recipe.imageUrl ? (
								/*
								 * NOTE(RESPONSIVE IMAGE STRATEGY):
								 * The recipe hero image is the LCP element.
								 *
								 * RENDERING WIDTHS (actual CSS):
								 * Mobile  (<375px):   100vw - 2rem
								 * Mobile  (375-640px): 100vw - 2rem
								 * Tablet  (640-1024px):100vw - 3rem
								 * Desktop (1024-1440): 60vw  - 1rem
								 * Desktop (1440px+):   58vw  - 1rem
								 *
								 * REQUESTED WIDTH: 560px
								 * Safe middle ground at ~1.47x DPI.
								 * Covers Lighthouse test devices
								 * (380px displayed): 560/380 = 1.47x ✓
								 *
								 * BLUR PLACEHOLDER:
								 * Falls back to `undefined` (not the
								 * full image URL) so a failed blur
								 * generation doesn't force a wasted
								 * full-resolution download.
								 *
								 * OPTIMIZATIONS:
								 * 1. fetchPriority="high" — LCP boost
								 * 2. quality/format="auto" — Cloudinary
								 *    WebP/AVIF transcoding
								 * 3. Granular `sizes` — prevents
								 *    over-requesting across all vp.
								 */
								<Image
									src={
										buildCloudinaryUrl(recipe.imageUrl, {
											width: 560,
											quality: "auto",
											format: "auto",
										}) ?? recipe.imageUrl
									}
									alt={recipe.title}
									fill
									className="object-cover z-10"
									sizes={
										"(max-width: 375px) " +
										"calc(100vw - 2rem), " +
										"(max-width: 640px) " +
										"calc(100vw - 2rem), " +
										"(max-width: 1024px) " +
										"calc(100vw - 3rem), " +
										"(max-width: 1440px) " +
										"calc(60vw - 1rem), " +
										"calc(58vw - 1rem)"
									}
									priority
									fetchPriority="high"
									placeholder="blur"
									blurDataURL={
										buildCloudinaryBlurUrl(
											recipe.imageUrl,
										) ?? undefined
									}
								/>
							) : (
								<div className={imageFallbackClass}>
									Görsel Bulunamadı
								</div>
							)}
						</div>
						<span className="data-nosnippet items-center text-xs text-black/40">
							Görseldeki yemek yapay zeka yardımıyla mutfağa
							yerleştirilmiştir.
						</span>
						{/*
						 * `ActionPanel` is passed in via `actionPanelSlot` and
						 * rendered inside a <Suspense> boundary in page.tsx.
						 *
						 * NOTE(DESIGN):
						 * Positioned absolute within this same
						 * `relative` wrapper via portal-free overlay.
						 */}
						{actionPanelSlot}
					</div>

					{/* ── Recipe Metadata ──────────────────────────────── */}
					<div className={metadataColumnClass}>
						{/* Recipe Titles */}
						<h1 className={titleClass}>{recipe.title}</h1>
						{recipe.alternativeTitle && (
							<h1 className={titleClass}>
								{" "}
								({recipe.alternativeTitle})
							</h1>
						)}

						{/* Recipe Description */}
						{recipe.description && (
							<p className={descriptionClass}>
								{recipe.description}
							</p>
						)}

						{/* Sub-group & Kitchen technique Tag Badges */}
						<div className={tagsContainerClass}>
							{subgroupAndTechniqueTags.map((tag) => {
								const kindClass =
									tag.kind === 0
										? tagBadgeKind0Class
										: tagBadgeKind2Class
								const badgeClassName = [
									tagBadgeBaseClass,
									kindClass,
								].join(" ")

								return (
									<Link
										href={`/etiket/${tag.slug}`}
										key={tag.id}
										className={badgeClassName}
									>
										{getTagIcon(tag.id)}
										{tag.name}
									</Link>
								)
							})}
						</div>

						{/* Info Card: Times & Budget & Difficulty */}
						<div className={infoCardClass}>
							<InfoCell
								icon={
									<ClockIcon className="size-5 text-primary" />
								}
								label="HAZIRLAMASI"
								value={
									(recipe.prepTimeMinutes ?? 0) > 0
										? `${recipe.prepTimeMinutes} dk.`
										: "-"
								}
							/>
							<InfoCell
								icon={
									<FireIcon className="size-5 text-primary" />
								}
								label="PİŞİRMESİ"
								value={
									(recipe.cookTimeMinutes ?? 0) > 0
										? `${recipe.cookTimeMinutes} dk.`
										: "-"
								}
							/>
							<InfoCell
								icon={
									<BanknotesIcon className="size-5 text-primary" />
								}
								label="BÜTÇE"
								value={
									<>
										{recipe.budgetLevel === 1
											? "Ekonomik"
											: recipe.budgetLevel === 2
												? "Uygun"
												: recipe.budgetLevel === 3
													? "Orta"
													: recipe.budgetLevel === 4
														? "Yüksek"
														: "Çok Yüksek"}
										<LevelScale
											level={recipe.budgetLevel}
											symbol="₺"
										/>
									</>
								}
							/>
							<InfoCell
								icon={
									<TrophyIcon className="size-5 text-primary" />
								}
								label="ZORLUK"
								value={
									<>
										{recipe.difficultyLevel === 1
											? "Çok Kolay"
											: recipe.difficultyLevel === 2
												? "Kolay"
												: recipe.difficultyLevel === 3
													? "Orta"
													: recipe.difficultyLevel ===
														  4
														? "Zor"
														: "Çok Zor"}
										<LevelScale
											level={recipe.difficultyLevel}
											symbol="dot"
										/>
									</>
								}
							/>
						</div>

						{/* Ingridients Tag Badges */}
						<div className={tagsContainerClass}>
							{recipe.tags
								.filter((tag) => tag.kind === 1)
								.map((tag) => {
									const badgeClassName = [
										tagBadgeBaseClass,
										tagBadgeKind1Class,
									].join(" ")

									return (
										<Link
											href={`/etiket/${tag.slug}`}
											key={tag.id}
											className={badgeClassName}
										>
											#{tag.name}
										</Link>
									)
								})}
						</div>
					</div>
				</section>

				{/* ── Interactive Panel (Client Component) ─────────────── */}
				<InteractivePanel
					servingsBase={recipe.servingsBase}
					ingredients={recipe.ingredients}
					steps={recipe.steps}
					tips={recipe.tips}
				/>
			</article>
		</main>
	)
}

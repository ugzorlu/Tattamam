/* =============================================================================
                            Category All Page Server
============================================================================= */
/**
 * @fileoverview
 * Server-side main component for the category all page route.
 *
 * PURPOSE:
 * Renders the complete category directory in a structured layout.
 *
 * NOTE(DESIGN):
 * - Left column: featured / popular categories
 * - Right column: all remaining categories
 *
 * NOTE(ARCHITECTURE):
 * - Implemented as a Server Component to leverage server-side rendering
 * 	 for SEO and performance.
 * - Uses data-driven rendering to avoid duplicated markup.
 * - Shared typography and animation styles are centralized to improve
 *   maintainability and keep line lengths within project standards.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import Link from "next/link"

/* === Contracts ============================================================ */
type CategoryLinkItem = {
	label: string
	href: string
}

type CategoryColumnProps = {
	items: CategoryLinkItem[]
}

type SectionHeadingProps = {
	children: React.ReactNode
}

type CategoryLinkProps = {
	label: string
	href: string
	className: string
}

/* === Constants ============================================================ */
const ANIMATION_STYLE = {
	opacity: 1,
	transform: "translateY(0px)",
	transitionDuration: "0.6s",
	transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const

const POPULAR_CATEGORIES = [
	{
		label: "Sonbahar",
		href: "/kategori/sonbahar",
	},
	{
		label: "Tatlılar",
		href: "/kategori/tatlilar",
	},
	{
		label: "Hamurişleri",
		href: "/kategori/hamurisleri",
	},
	{
		label: "Ege Mutfağı",
		href: "/kategori/ege-mutfagi",
	},
]

const CATEGORY_COLUMNS: CategoryLinkItem[][] = [
	[
		{
			label: "Ana Yemekler",
			href: "/kategori/ana-yemekler",
		},
		{
			label: "Tavuk Yemekleri",
			href: "/kategori/tavuk-yemekleri",
		},
		{
			label: "Sebze Yemekleri",
			href: "/kategori/sebze-yemekleri",
		},
		{
			label: "Et Yemekleri",
			href: "/kategori/et-yemekleri",
		},
		{
			label: "Kahvaltılıklar",
			href: "/kategori/kahvaltiliklar",
		},
		{
			label: "Salatalar",
			href: "/kategori/salatalar",
		},
		{
			label: "İçecekler",
			href: "/kategori/icecekler",
		},
	],
	[
		{
			label: "Geleneksel Türk Mutfağı",
			href: "/kategori/geleneksel-turk-mutfagi",
		},
		{
			label: "Dünya Mutfağı",
			href: "/kategori/dunya-mutfagi",
		},
		{
			label: "Vejetaryen Yemekler",
			href: "/kategori/vejetaryen-yemekler",
		},
		{
			label: "Garnitürler",
			href: "/kategori/garniturler",
		},
		{
			label: "Sağlıklı Öğünler",
			href: "/kategori/saglikli-ogunler",
		},
		{
			label: "Pratik Tarifler",
			href: "/kategori/pratik-tarifler",
		},
		{
			label: "Ekonomik Tarifler",
			href: "/kategori/ekonomik-tarifler",
		},
	],
]

/* === Subcomponents ======================================================== */
function SectionHeading({ children }: SectionHeadingProps) {
	const sectionTitleClass = [
		"font-label-sm",
		"text-label-sm",
		"uppercase",
		"tracking-[0.2em]",
		"text-outline",
		"mb-4 sm:mb-6 md:mb-10",
	].join(" ")

	return (
		<h2 className={sectionTitleClass} style={ANIMATION_STYLE}>
			{children}
		</h2>
	)
}

function CategoryLink({ label, href, className }: CategoryLinkProps) {
	return (
		<Link href={href} className={className} style={ANIMATION_STYLE}>
			{label}
		</Link>
	)
}

function CategoryColumn({ items }: CategoryColumnProps) {
	const categoryLinkClass = [
		"category-link",
		"font-headline-md",
		"text-headline-md",
		"text-on-surface",
		"hover:text-primary",
	].join(" ")

	return (
		<div className="flex flex-col">
			{items.map((item) => (
				<div
					key={item.href}
					className="grid-item"
					style={ANIMATION_STYLE}
				>
					<CategoryLink
						label={item.label}
						href={item.href}
						className={categoryLinkClass}
					/>
				</div>
			))}
		</div>
	)
}

/* === Main Component ======================================================= */
export default function CategoryAllPageServer() {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const pageClass = [
		"max-w-container-max",
		"mx-auto",
		"px-margin-mobile",
		"md:px-margin-desktop",
		"py-12",
	].join(" ")

	const headerClass = "mb-stack-sm sm:mb-stack-lg sm:max-h-margin-desktop"
	const headerLabelClass =
		"mb-4 font-headline-xl text-headline-xl text-on-surface"

	const categoryLinksContainerClass =
		"grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16"

	const popularLinkClass = [
		"popular-link",
		"category-link",
		"font-headline-lg",
		"text-[40px]",
		"md:text-[56px]",
		"leading-tight",
		"italic",
	].join(" ")

	const textureOverlayClass = [
		"pointer-events-none",
		"fixed",
		"inset-0",
		"z-99",
		"opacity-[0.03]",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			<main className={pageClass}>
				{/* ─── Header Section ───────────────────────────────────── */}
				<header className={headerClass}>
					<h1
						className={headerLabelClass}
						style={{
							opacity: 1,
							transform: "translateY(0px)",
							transitionDuration: "0.6s",
							transitionTimingFunction:
								"cubic-bezier(0.16, 1, 0.3, 1)",
						}}
					>
						Tüm Kategoriler
					</h1>
				</header>

				{/* ─── Category Links Section ───────────────────────────── */}
				<div className={categoryLinksContainerClass}>
					{/* --- Popular Categories (Bigger, Serif, Left) --- */}
					<section className="lg:col-span-5 space-y-12">
						<div>
							<SectionHeading>Popüler</SectionHeading>
							<ul className="space-y-2 sm:space-y-4 md:space-y-8">
								{POPULAR_CATEGORIES.map((category) => (
									<li key={category.href}>
										<CategoryLink
											label={category.label}
											href={category.href}
											className={popularLinkClass}
										/>
									</li>
								))}
							</ul>
						</div>
					</section>

					{/* --- Other Categories (Multi-column Grid, Right) --- */}
					<section className="lg:col-span-7">
						<SectionHeading>Diğer</SectionHeading>
						<div
							className="
								grid
								grid-cols-1
								md:grid-cols-2
								gap-x-12
								gap-y-0
							"
						>
							{CATEGORY_COLUMNS.map((column, index) => (
								<CategoryColumn key={index} items={column} />
							))}
						</div>
					</section>
				</div>
			</main>
			<div
				className={textureOverlayClass}
				style={{
					backgroundImage:
						"url('https://www.transparenttextures.com/" +
						"patterns/natural-paper.png')",
				}}
			></div>
		</>
	)
}

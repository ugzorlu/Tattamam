/* =============================================================
                  Recipe Detail Loading Skeleton
=============================================================== */
/**
 * @fileoverview
 * Loading skeleton for the recipe detail page (`/tarif/[slug]/`).
 *
 * PURPOSE:
 * Next.js App Router streams this component to the browser
 * immediately — before the async `RecipePage` resolves its DB
 * queries. It gives visitors instant visual feedback that content
 * is on its way, replacing the blank-screen experience.
 *
 * DESIGN PRINCIPLE:
 * The skeleton mirrors `RecipePageServer` and its sub-components
 * pixel-for-pixel: same grid columns, same aspect ratios, same
 * spacing tokens. A high-fidelity skeleton prevents the jarring
 * layout shift that occurs when a low-fidelity placeholder is
 * suddenly replaced by a radically different real layout.
 *
 * SECTIONS:
 * 1. Breadcrumb navigation bar
 * 2. Hero grid
 *    a. Image placeholder (aspect-4/3) + floating action buttons
 *    b. Recipe metadata column (tags, title, description, info card)
 * 3. Interactive panel (mode toggle, ingredients, steps)
 * 4. Similar-recipes carousel (mirrors the Suspense fallback)
 *
 * NOTE(PERFORMANCE):
 * All skeleton divs use `animate-pulse` which is a CSS-only
 * animation — no JavaScript is needed. The component itself is a
 * pure Server Component (no "use client" directive).
 */

/* === Component ============================================================ */
/**
 * Full-page loading skeleton for the recipe detail route.
 *
 * @component
 * @returns {React.ReactElement} Animated skeleton UI.
 */
import { SimilarRecipesSectionSkeleton } from "@/components/recipe/SimilarRecipesSection"

/* --- Assets --- */
import { ChevronRightIcon } from "@heroicons/react/24/solid"

export default function RecipePageLoading(): React.ReactElement {
	/* ── Shared base class ──────────────────────────────────────── */
	/**
	 * All placeholder blocks share a pulse animation and a surface
	 * background. Individual overrides (width, height, radius) are
	 * appended per element.
	 */
	const sk = "animate-pulse rounded bg-surface-container"

	/* ── Class aggregates ───────────────────────────────────────── */
	const articleClass = [
		"max-w-container-max mx-auto",
		"px-margin-mobile md:px-margin-desktop",
	].join(" ")

	const heroGridClass = [
		"grid grid-cols-1 lg:grid-cols-12",
		"gap-gutter items-center mb-stack-lg",
	].join(" ")

	const metaColClass = [
		"lg:col-span-5 flex flex-col",
		"gap-stack-sm mt-6 lg:mt-0",
	].join(" ")

	const infoCardClass = [
		"grid grid-cols-2 gap-4 mt-4",
		"bg-surface-container-low p-6 rounded-xl",
		"border border-outline-variant",
	].join(" ")

	const panelGridClass = ["grid grid-cols-1 lg:grid-cols-12 gap-12"].join(" ")

	/* ── Render ─────────────────────────────────────────────────── */
	return (
		<main
			className="h-auto pt-8 pb-stack-lg"
			/* Announces to screen readers that the page is loading
			 * so assistive technologies do not read an empty page. */
			aria-busy="true"
			aria-label="Tarif yükleniyor"
			role="status"
		>
			<article className={articleClass}>
				{/* ── 1. Breadcrumb navigation ────────────────────── */}
				<nav
					className={[
						"flex items-center gap-2 mb-4 md:mb-8",
						"text-on-surface-variant font-label-sm",
						"uppercase tracking-widest",
					].join(" ")}
					aria-label="Sayfa yolu"
				>
					{/* Static "Kategoriler" label always visible */}
					<span>Kategoriler</span>
					<ChevronRightIcon className="size-4" />
					{/* Category name placeholder */}
					<div className={`h-4 w-24 ${sk}`} />
				</nav>

				{/* ── 2. Hero grid ────────────────────────────────── */}
				<section className={heroGridClass}>
					{/* 2a. Image column + floating action buttons */}
					<div className="lg:col-span-7 relative group">
						{/*
						 * Placeholder block mirrors the `aspect-4/3
						 * rounded-xl` wrapper used by `RecipePageServer`.
						 * The pulse animation gives the impression that
						 * an image is being progressively loaded.
						 */}
						<div
							className={[
								"aspect-4/3 rounded-xl overflow-hidden",
								"organic-shadow",
								"bg-surface-container animate-pulse",
							].join(" ")}
						/>

						{/*
						 * Floating action button skeletons mirror the
						 * three circular buttons rendered by ActionPanel
						 * (Favorite, Like, Share). Without these, the
						 * skeleton has no top-right affordance and the
						 * layout shifts noticeably when ActionPanel mounts.
						 */}
						<div
							className={[
								"absolute top-4 right-4",
								"flex flex-col gap-2",
							].join(" ")}
						>
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className={[
										"w-12 h-12 rounded-full",
										"bg-white/70 animate-pulse",
									].join(" ")}
								/>
							))}
						</div>
					</div>

					{/* 2b. Recipe metadata column */}
					<div className={metaColClass}>
						{/* Primary title */}
						<div className={`h-12 w-3/4 ${sk}`} />
						{/* Alternative title (smaller) */}
						<div className={`h-8 w-1/2 mt-1 ${sk}`} />

						{/* Description lines */}
						<div className="space-y-2 mt-4">
							<div className={`h-4 w-full ${sk}`} />
							<div className={`h-4 w-full ${sk}`} />
							<div className={`h-4 w-5/6 ${sk}`} />
						</div>

						{/*
						 * Info card: mirrors the 2×2 grid of `InfoCell`
						 * components (prep time, cook time, budget,
						 * difficulty). Each cell has an icon placeholder
						 * and two text-line placeholders.
						 */}
						<div className={infoCardClass}>
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center gap-3"
								>
									<div
										className={`h-5 w-5 rounded-full ${sk}`}
									/>
									<div className="space-y-1">
										<div className={`h-3 w-16 ${sk}`} />
										<div className={`h-4 w-24 ${sk}`} />
									</div>
								</div>
							))}
						</div>

						{/* Tag badge row */}
						<div className="flex flex-wrap gap-2 mb-2">
							<div className={`h-7 w-20 rounded-full ${sk}`} />
							<div className={`h-7 w-20 rounded-full ${sk}`} />
							<div className={`h-7 w-24 rounded-full ${sk}`} />
						</div>
					</div>
				</section>

				{/* ── 3. Interactive panel skeleton ───────────────── */}
				<div className="flex flex-col gap-10">
					{/* Mode toggle pill (Traditional / Precise / Mixed) */}
					<div className="flex justify-center w-full mt-10">
						<div className={`h-11 w-72 rounded-full ${sk}`} />
					</div>

					<div className={panelGridClass}>
						{/* LEFT: Ingredients card */}
						<aside className="lg:col-span-4 flex flex-col gap-stack-md">
							<div
								className={[
									"bg-surface-container-lowest p-8",
									"rounded-xl border border-outline-variant",
									"organic-shadow",
								].join(" ")}
							>
								{/* "Malzemeler" heading */}
								<div className={`h-6 w-32 ${sk} mb-4`} />
								{/* Servings control */}
								<div className={`h-12 w-full ${sk} mb-8`} />
								{/* Ingredient rows */}
								<div className="space-y-4">
									{Array.from({ length: 6 }).map((_, i) => (
										<div
											key={i}
											className={[
												"flex items-center",
												"gap-3 py-2",
											].join(" ")}
										>
											{/* Checkbox placeholder */}
											<div
												className={`h-5 w-5 rounded ${sk}`}
											/>
											{/* Ingredient name + qty */}
											<div
												className={`h-4 w-3/4 ${sk}`}
											/>
										</div>
									))}
								</div>
							</div>
						</aside>

						{/* RIGHT: Preparation steps */}
						<section className="lg:col-span-8">
							{/* "Hazırlanış" heading */}
							<div className={`h-8 w-36 ${sk} mb-8`} />

							<div className="flex flex-col gap-10">
								{Array.from({ length: 4 }).map((_, i) => (
									<div
										key={i}
										className={[
											"flex gap-6 items-start",
											i < 3
												? "border-b border-outline-variant pb-6"
												: "",
										].join(" ")}
									>
										{/* Step number badge */}
										<div
											className={[
												"w-10 h-10 rounded-full",
												`shrink-0 mt-1 ${sk}`,
											].join(" ")}
										/>
										{/* Step text lines */}
										<div className="pt-1 w-full space-y-2">
											<div
												className={`h-4 w-full ${sk}`}
											/>
											<div
												className={`h-4 w-11/12 ${sk}`}
											/>
											<div
												className={`h-4 w-4/5 ${sk}`}
											/>
										</div>
									</div>
								))}
							</div>
						</section>
					</div>
				</div>
			</article>

			{/* ── 4. Similar-recipes carousel skeleton (shared) ─── */}
			<SimilarRecipesSectionSkeleton />
		</main>
	)
}

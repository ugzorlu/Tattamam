/* =============================================================================
                     	  Recipe Detail Entry Page
============================================================================= */
/**
 * @fileoverview
 * Server-side main component for the recipe detail page route.
 *
 * PURPOSE:
 * Displays the recipe detail page for a given recipe slug. Implements the
 * "Static Shell + Dynamic Holes" architecture for maximum performance.
 *
 * FLOW:
 * ~ Resolves route parameter to extract target recipe slug.
 * ~ Invokes `getCachedRecipeBySlug` to retrieve the cached recipe data.
 * ~ Renders the static shell (`RecipePageServer`) instantly from cache.
 * ~ Streams dynamic user state (`UserStateProvider`) via `<Suspense>`.
 * ~ Streams similar recipes (`SimilarRecipesSection`) via `<Suspense>`.
 *
 * NOTE(ARCHITECTURE):
 * The main recipe content is purely static and cached at the application
 * level. Request-scoped dynamic state (session, likes, favorites) is
 * isolated in `UserStateProvider` and streamed in asynchronously.
 *
 * ROUTE:
 * /tarif/[slug]/ → e.g., /tarif/zeytinyagli-biber-dolma/
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { Suspense } from "react"
import { notFound } from "next/navigation"

/* --- Server Infrastructure --- */
import { getCachedRecipeBySlug } from "@/lib/dal/recipe"

/* --- Components --- */
import { ActionPanelSkeleton } from "@/components/recipe/ActionPanel"
import SimilarRecipesSection, {
	SimilarRecipesSectionSkeleton,
} from "@/components/recipe/SimilarRecipesSection"
import RecipePageServer from "@/components/recipe/RecipePageServer"
import UserStateProvider from "@/components/recipe/UserStateProvider"
import RecipeJsonLdSchema from "@/components/seo/RecipeJsonLdSchema"
import SmartRecipeFinderSkeleton from "@/components/smart/SmartRecipeFinderPageL"
import SmartRecipeFinderPageC from "@/components/smart/SmartRecipeFinderPageC"

/* --- Types --- */
import type { Metadata } from "next"

/* === Metadata ============================================================= */
/**
 * Creates server-side, dynamic metadata for {@link RecipePage} based on
 * recipe content.
 *
 * NOTE(ARCHITECTURE):
 * Uses `getRecipeBySlug` (which wraps the DB call in React's `cache()`)
 * so that if this is a cache miss, the DB round-trip is deduplicated
 * with the page render.
 *
 * @async
 * @param params - Route parameters containing dynamic [slug] segment.
 * @returns {Promise<Metadata>} Next.js metadata object.
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	/* ── Route Parameter Resolution ──────────────────────────────────────── */
	const { slug } = await params
	/* ── Data Fetching ───────────────────────────────────────────────────── */
	const recipe = await getCachedRecipeBySlug(slug)
	if (!recipe) {
		/* ── Metadata Object ─────────────────────────────────────────────── */
		return {
			robots: { index: false }, // Does not index 404 pages.
		}
	}

	const pageTitle = `${recipe.title}`
	const pageDescription =
		"Porsiyon sayısına ve anlatım tarzına göre ayarlanan tam sana göre " +
		`bir ${recipe.title} tarifi. ` +
		recipe.description

	const pageimage = {
		url: recipe.imageUrl,
		width: 1200,
		height: 630,
	}

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
	const recipeUrl = `${baseUrl}/tarif/${recipe.slug}/`

	/* ── Metadata Object ─────────────────────────────────────────────────── */
	return {
		title: pageTitle,
		description: pageDescription,
		openGraph: {
			siteName: "Tattamam",
			title: pageTitle,
			description: pageDescription,
			type: "website",
			url: recipeUrl,
			locale: "tr",
			images: pageimage,
		},

		twitter: {
			card: "summary_large_image",
			title: pageTitle,
			description: pageDescription,
			images: pageimage,
		},

		alternates: {
			canonical: recipeUrl,
		},
	}
}

/* === Main Component ======================================================= */
/**
 * Renders the recipe detail page for a given recipe slug.
 *
 * @async
 * @component
 * @param params - Route parameters containing the recipe slug.
 * @returns {Promise<React.ReactElement>} - The rendered recipe detail page.
 *
 * @throws notFound() if recipe is not found in the database.
 */
export default async function RecipePage({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<React.ReactElement> {
	/* ── Data Fetching (Cached) ──────────────────────────────────────────── */
	const { slug } = await params

	// ⚡ CACHED — served instantly from cache for repeat visitors
	const recipe = await getCachedRecipeBySlug(slug)

	/* ── Early Return ────────────────────────────────────────────────────── */
	if (!recipe) notFound()

	/* ── Data Preparation ────────────────────────────────────────────────── */
	/* Restricts similarity matching to the tag kinds that are explicitly
	 * supported by the UI. Tags with other kinds are excluded so the related
	 * recipe query remains focused and predictable. */
	const similarityTags = recipe.tags.filter(
		(tag) => tag.kind === 0 || tag.kind === 1,
	)
	const similarityTagIds = similarityTags.map((tag) => tag.id)
	const similarityTagSlugs = similarityTags.map((tag) => tag.slug)
	const relatedIngredients = recipe.tags
		.filter((tag) => tag.kind === 1)
		.map((tag) => tag.name)

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<>
			{/* --- JSON-LD Breadcrumb and Recipe Schema --- */}
			<RecipeJsonLdSchema
				recipe={recipe}
				baseUrl={process.env.NEXT_PUBLIC_BASE_URL || ""}
			/>

			{/* --- Main Recipe Content (Static Shell + Action Panel Hole) --- */}
			<RecipePageServer
				recipe={recipe}
				actionPanelSlot={
					<Suspense fallback={<ActionPanelSkeleton />}>
						<UserStateProvider
							recipeId={recipe.id}
							recipeSlug={recipe.slug}
							recipeTitle={recipe.title}
						/>
					</Suspense>
				}
			/>

			{/* --- Similar Recipes Section (Streamed) --- */}
			<Suspense fallback={<SimilarRecipesSectionSkeleton />}>
				<SimilarRecipesSection
					recipeId={recipe.id}
					tagIds={similarityTagIds}
					tagSlugs={similarityTagSlugs}
				/>
			</Suspense>

			{/* --- Smart Recipe Founder Section (Streamed) --- */}
			<Suspense fallback={<SmartRecipeFinderSkeleton />}>
				<div className="h-auto mx-auto w-full px-2 py-2 md:py-6 md:px-6 xl:px-10">
					<div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
						<section className="pt-8">
							<h2 className="text-headline-lg font-headline-lg text-on-surface">
								Akıllı Tarif Bulucu
							</h2>
							<p className="mt-2 text-body-md text-on-surface-variant">
								Mutfağındaki malzemeleri seç, tam sana göre
								tarifleri ve porsiyon miktarını şipşak bulalım.
							</p>
						</section>
						<SmartRecipeFinderPageC
							relatedIngredients={relatedIngredients}
						/>
					</div>
				</div>
			</Suspense>
		</>
	)
}

/* === Imports ============================================================== */
/* --- Helpers --- */
import {
	toIsoDuration,
	buildCloudinaryImages,
} from "@/components/seo/seo-helpers"

/* --- Types --- */
import type { RecipeDetailDto, RecipeIngredientDto } from "@/lib/dto"

/* === Contracts ============================================================ */
/**
 * Properties for the {@link RecipeJsonLdSchema} component.
 *
 * @property recipe - The full dto containing all necessary info for the schema.
 * @property baseUrl - Used to construct absolute URLs in the schema.
 */
interface RecipeJsonLdSchemaProps {
	recipe: RecipeDetailDto
	baseUrl: string
}

/* === Pure Helpers ========================================================= */
/**
 * Formats a single ingredient line for the `recipeIngredient` schema array.
 *
 * Prefers exact measurement fields over traditional ones when available,
 * and appends any preparation note (e.g. "ince kıyılmış") to the string.
 *
 * @param ingredient - Ingredient DTO from the recipe detail payload.
 * @returns {string} Human-readable ingredient string for structured data.
 */
function formatIngredient(ingredient: RecipeIngredientDto): string {
	const amount = ingredient.exactQuantity ?? ingredient.traditionalQuantity
	const unit = ingredient.exactUnit ?? ingredient.traditionalUnit
	const note = ingredient.notes ? ` ${ingredient.notes}` : ""

	return `${amount} ${unit} ${ingredient.name}${note}`
}

/* === Main Component ======================================================= */
/**
 * JSON-LD Schema Component for SEO
 *
 * PURPOSE:
 * Provides structured data in JSON-LD format for SEO optimization.
 *
 * NOTE(ARCHITECTURE):
 * Designed to be used within the <head> of the recipe detail pages
 * for better search engine understanding.
 * Combines WebPage, BreadcrumbList & Recipe schemas to enhance search results.
 */
export default function RecipeJsonLdSchema({
	recipe,
	baseUrl,
}: RecipeJsonLdSchemaProps) {
	const recipeUrl = `${baseUrl}/tarif/${recipe.slug}/`
	const pageId = `${recipeUrl}#webpage`
	const breadcrumbId = `${recipeUrl}#breadcrumb`
	const recipeId = `${recipeUrl}#recipe`
	const primaryCategory = recipe.categories[0]

	/* ─── Web Page Node ──────────────────────────────────────────────────── */
	const pageSchema = {
		"@type": "WebPage",
		"@id": pageId,
		url: recipeUrl,
		name: recipe.title,
		description: recipe.description,
		mainEntity: { "@id": recipeId }, // Links page directly to Recipe entity
		breadcrumb: { "@id": breadcrumbId },
	}

	/* ─── Breadcrumb List Node ───────────────────────────────────────────── */
	const breadcrumbList = {
		"@type": "BreadcrumbList",
		"@id": breadcrumbId,
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Kategoriler",
				item: {
					"@type": "WebPage",
					"@id": `${baseUrl}/kategori/`,
					name: "Kategoriler",
				},
			},
			{
				"@type": "ListItem",
				position: 2,
				name: primaryCategory.name,
				item: {
					"@type": "WebPage",
					"@id": `${baseUrl}/kategori/${primaryCategory.slug}/`,
					name: primaryCategory.name,
				},
			},
			{
				"@type": "ListItem",
				position: 3,
				name: recipe.title,
				item: {
					"@type": "WebPage",
					"@id": recipeUrl,
					name: recipe.title,
				},
			},
		],
	}

	/* ─── Full Recipe Node ───────────────────────────────────────────────── */
	const recipeSchema = {
		"@type": "Recipe",

		/* --- Required Properties --- */
		"@id": recipeId,
		url: recipeUrl,

		name: recipe.title,

		/*
		 * Google recommends all three aspect ratios (1:1, 4:3, 16:9) to
		 * maximise rich-result image snippet eligibility. The helper injects
		 * Cloudinary `ar_*,c_fill` transformations into the original URL.
		 * Returns `undefined` for null/non-Cloudinary URLs → key is omitted.
		 */
		image: recipe.imageUrl
			? buildCloudinaryImages(recipe.imageUrl)
			: undefined,

		author: {
			"@type": "Organization",
			name: "Tattamam",
			url: baseUrl,
		},

		/* --- Recommended Properties --- */
		/*
		 * Schema.org expects ISO 8601 date strings. UTC output from
		 * `toISOString()` is also accepted by Google as an RFC 3339 date.
		 */
		datePublished: recipe.createdAt.toISOString(),
		dateModified: (recipe.updatedAt ?? recipe.createdAt).toISOString(),

		description: recipe.description,

		recipeCategory: recipe.categories.map((x) => x.name),

		// recipeCuisine: "Turkish",

		keywords: recipe.tags.map((x) => x.name).join(", "),

		recipeYield: `${recipe.servingsBase} porsiyon`,

		prepTime: toIsoDuration(recipe.prepTimeMinutes),
		cookTime: toIsoDuration(recipe.cookTimeMinutes),
		/*
		 * `totalTime` is only emitted when both prep and cook times
		 * are known; a partial sum would be misleading to crawlers.
		 */
		totalTime:
			recipe.prepTimeMinutes && recipe.cookTimeMinutes
				? toIsoDuration(recipe.prepTimeMinutes + recipe.cookTimeMinutes)
				: undefined,

		recipeIngredient: recipe.ingredients.map(formatIngredient),

		recipeInstructions: recipe.steps.map((step) => {
			return {
				"@type": "HowToStep",
				text: step.mixedInstruction,
				...(step.sectionName && {
					name: step.sectionName,
					url: `${recipeUrl}#step-${step.id}`,
				}),
			}
		}),

		inLanguage: "tr-TR",

		mainEntityOfPage: { "@id": recipeUrl },
	}

	/* ─── Combined Graph ─────────────────────────────────────────────────── */
	const schema = {
		"@context": "https://schema.org",
		"@graph": [pageSchema, breadcrumbList, recipeSchema],
	}

	/* ─── Script ─────────────────────────────────────────────────────────── */
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
			suppressHydrationWarning
		/>
	)
}

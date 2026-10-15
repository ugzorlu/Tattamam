/* === Imports ============================================================== */
/* --- Helpers --- */
import {
	toIsoDuration,
	buildCloudinaryImages,
} from "@/components/seo/seo-helpers"

/* --- Types --- */
import type { CategoryDto } from "@/lib/dto"
import type { SeoRecipeItem } from "@/lib/dal/search"

/* === Contracts ============================================================ */
/**
 * Properties for the {@link CategoryJsonLdSchema} component.
 *
 * @property category   - The category info.
 * @property recipes    - Minimal SEO recipe list (may be capped at
 *                        `MAX_SEO_RECIPES` in the DAL). Never pass full
 *                        `RecipeCardDto[]` here; use `SeoRecipeItem[]` to
 *                        keep the server payload lean.
 * @property totalCount - True total recipe count from the database.
 *                        Used for `numberOfItems` so the value reflects
 *                        reality even when `recipes` is capped.
 * @property baseUrl    - Used to construct absolute URLs in the schema.
 */
interface CategoryJsonLdSchemaProps {
	category: CategoryDto
	recipes: SeoRecipeItem[]
	totalCount: number
	baseUrl: string
}

/* === Main Component ======================================================= */
/**
 * JSON-LD Schema Component for Category SEO.
 *
 * PURPOSE:
 * Provides structured data in JSON-LD format for category pages.
 * The full recipe catalog (up to `MAX_SEO_RECIPES`) is embedded in the
 * initial HTML so Google crawlers can discover all recipes without
 * triggering any "Load More" interactions.
 *
 * NOTE(ARCHITECTURE):
 * Combines BreadcrumbList and ItemList (of Recipes) schemas to enhance
 * search results and enable host carousels on search engines.
 * This component is server-rendered only; the data it receives is never
 * part of the client hydration payload.
 *
 * TODO(FUTURE IMPROVEMENTS):
 * 1. `aggregateRating` — `likeCount` is not surfaced in the Recipe schema
 *    node. Adding it as `AggregateRating` (with a `ratingValue` computed
 *    from likes relative to category average) would improve CTR from
 *    rich results. Requires adding `likeCount` back to `SeoRecipeItem`
 *    and a rating normalization strategy.
 *
 * 2. `numberOfItems` vs. capped list — When `totalCount > MAX_SEO_RECIPES`,
 *    `itemListElement.length` is shorter than `numberOfItems`. Google
 *    accepts partial lists per their guidelines. If the cap is ever removed,
 *    `numberOfItems` will automatically be accurate without code changes.
 */
export default function CategoryJsonLdSchema({
	category,
	recipes,
	totalCount,
	baseUrl,
}: CategoryJsonLdSchemaProps) {
	const baseCategoryUrl = `${baseUrl}/kategori/`
	const categoryUrl = `${baseUrl}/kategori/${category.slug}/`

	/* ─── Breadcrumb Schema ──────────────────────────────────────────────── */
	const breadcrumbList = {
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Kategoriler",
				item: {
					"@type": "WebPage",
					"@id": baseCategoryUrl,
					name: "Kategoriler",
				},
			},
			{
				"@type": "ListItem",
				position: 2,
				name: category.name,
				item: {
					"@type": "WebPage",
					"@id": categoryUrl,
					name: category.name,
				},
			},
		],
	}

	/* ─── Item List Schema ───────────────────────────────────────────────── */
	const itemListSchema = {
		"@type": "ItemList",
		name: category.name,
		description: category.description || undefined,
		url: categoryUrl,
		/*
		 * `totalCount` reflects the true database total, not the capped
		 * recipes array length. Google accepts partial item lists where
		 * itemListElement.length < numberOfItems.
		 */
		numberOfItems: totalCount,
		itemListElement: recipes.map((recipe, index) => {
			const recipeUrl = `${baseUrl}/tarif/${recipe.slug}/`

			/*
			 * Converts nullable minute values to ISO 8601 durations.
			 * `toIsoDuration` returns `undefined` for null/zero values,
			 * causing those properties to be omitted from the schema
			 * object rather than serialised as `null` or `"PT0M"`.
			 */
			const prepTime = toIsoDuration(recipe.prepTimeMinutes)
			const cookTime = toIsoDuration(recipe.cookTimeMinutes)

			/*
			 * `totalTime` is only emitted when both prep and cook times
			 * are known; a partial sum would be misleading to crawlers.
			 */
			const totalTime =
				recipe.prepTimeMinutes && recipe.cookTimeMinutes
					? toIsoDuration(
							recipe.prepTimeMinutes + recipe.cookTimeMinutes,
						)
					: undefined

			return {
				"@type": "ListItem",
				position: index + 1,
				url: recipeUrl,
				item: {
					"@type": "Recipe",
					"@id": `${recipeUrl}#recipe`,
					name: recipe.title,
					url: recipeUrl,
					/*
					 * Google recommends all three aspect ratios (1:1, 4:3, 16:9) to
					 * maximise rich-result image snippet eligibility. The helper injects
					 * Cloudinary `ar_*,c_fill` transformations into the original URL.
					 * Returns `undefined` for null/non-Cloudinary URLs → key is omitted.
					 */
					image: recipe.imageUrl
						? buildCloudinaryImages(recipe.imageUrl)
						: undefined,
					description: category.description
						? category.description // Primary category description.
						: "Porsiyon sayısına ve anlatım tarzına göre " +
							"ayarlanabilen tam sana göre bir " +
							`${recipe.title} tarifi`, // Custom fallback.
					recipeCategory: category.name,
					// recipeCuisine: "Turkish",
					...(prepTime && { prepTime }),
					...(cookTime && { cookTime }),
					...(totalTime && { totalTime }),
					author: {
						"@type": "Organization",
						name: "Tattamam",
					},
				},
			}
		}),
	}

	/* ─── Combined Graph ─────────────────────────────────────────────────── */
	const schema = {
		"@context": "https://schema.org",
		"@graph": [breadcrumbList, itemListSchema],
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

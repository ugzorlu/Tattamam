/* =============================================================================
                    Data Transfer Objects
============================================================================= */
/**
 * @fileoverview
 * Strictly-typed DTOs for the recipe detail page presentation layer.
 *
 * PURPOSE:
 * Provides a serialization-safe contract between the Data Access Layer and
 * React Server/Client components. All Prisma-specific types (e.g. `Decimal`)
 * are converted to JSON-friendly primitives at the DAL boundary.
 *
 * USE CASES:
 * - Server Component → Client Component data serialization
 * - Recipe detail page rendering
 * - Serving size scaling calculations
 *
 * NOTE(ARCHITECTURE):
 * These types intentionally mirror the Prisma schema shape but substitute
 * non-serializable types. `Decimal` fields become `number` so React can
 * safely pass them across the server/client boundary without hydration errors.
 */

/* === Category DTO ========================================================= */
/** Lightweight category reference for tag display. */
export interface CategoryDto {
	readonly id: number
	readonly name: string
	readonly slug: string
	readonly description: string | null
}

/* === Tag DTO ============================================================== */
/** Lightweight tag reference for chip/badge display. */
export interface TagDto {
	readonly id: number
	readonly name: string
	readonly slug: string
}

/* === Recipe Tag DTO ======================================================= */
/** Recipe-specific tag reference including kind and importance. */
export interface RecipeTagDto {
	readonly id: number
	readonly name: string
	readonly slug: string
	readonly kind: number
	readonly importance: number
}

/* === Smart Ingredient DTO ================================================ */
/** Tag fields needed by smart ingredient search and selection. */
export interface SmartIngredientTagDto {
	readonly id: number
	readonly name: string
	readonly group: string | null
	readonly emoji: string | null
}

/** One selected ingredient constraint submitted to smart recipe search. */
export interface SmartRecipeSearchIngredientDto {
	readonly name: string
	readonly unit: string
	readonly quantity: number
}

/** Minimal recipe card data with smart-search match and portion metrics. */
export interface SmartRecipeSearchResultDto {
	readonly id: number
	readonly title: string
	readonly slug: string
	readonly imageUrl: string | null
	readonly prepTimeMinutes: number | null
	readonly cookTimeMinutes: number | null
	readonly budgetLevel: number
	readonly difficultyLevel: number
	readonly matchedIngredientCount: number
	readonly matchedIngredientNames: readonly string[]
	/** Number of selected ingredient names also present in recipe tags. */
	readonly matchedTagCount: number
	readonly maxServings: number
}

/* === Recipe Ingredient DTO ================================================ */
/**
 * A single ingredient line item with quantity scaling support.
 *
 * NOTE(SERIALIZATION):
 * `baseQuantity` is converted from Prisma `Decimal` to `number` at the DAL
 * boundary. Client components use this for serving-size multiplication.
 */
export interface RecipeIngredientDto {
	readonly id: number
	readonly name: string
	/** Quantity for the recipe's traditional serving size. */
	readonly traditionalQuantity: number
	/** Measurement unit (e.g. "su bardağı", "yemek kaşığı"). */
	readonly traditionalUnit: string
	/** Exact measurement for the recipe if applicable. */
	readonly exactQuantity: number | null
	/** Exact measurement unit (e.g. "g", "ml"). */
	readonly exactUnit: string | null
	/** Optional preparation note (e.g. "ince kıyılmış"). */
	readonly notes: string | null
	/** Grouping label (e.g. "ANA MALZEMELER", "OPSİYONEL MALZEMELER"). */
	readonly sectionName: string | null
	readonly displayOrder: number
	/** When non-null, direct alternative to the specified ingredient ID. */
	readonly alternativeToId: number | null
}

/* === Preparation Step DTO ================================================= */
/**
 * A single numbered instruction step.
 */
export interface PreparationStepDto {
	readonly id: number
	readonly stepNumber: number
	readonly traditionalInstruction: string
	readonly exactInstruction: string | null
	readonly mixedInstruction: string
	/** Estimated duration in minutes for this step, if known. */
	readonly durationMinutes: number | null
	/** Grouping label (e.g. "Hazırlık", "Pişirme"). */
	readonly sectionName: string | null
}

/* === Recipe Tip DTO ======================================================= */
/**
 * Single cooking tip displayed in the tips section.
 */
export interface RecipeTipDto {
	readonly id: number
	/** Tip content text. */
	readonly content: string
	/** Display order for sorting tips in the UI. */
	readonly displayOrder: number
}

/* === Recipe Detail DTO ==================================================== */
/**
 * Root DTO for the recipe detail page.
 *
 * PURPOSE:
 * Aggregates all recipe data required for a complete detail page render,
 * including metadata, ingredients, steps, tips, options, categories, and tags.
 *
 * NOTE(ARCHITECTURE):
 * This is a "fat" DTO intentionally — it carries everything the page needs
 * in a single server→client payload. The server component performs the DB
 * query once, serializes this DTO, and the client component tree hydrates
 * from it without additional round trips.
 */
export interface RecipeDetailDto {
	readonly id: number
	readonly title: string
	readonly alternativeTitle: string | null
	readonly slug: string
	readonly description: string | null
	readonly imageUrl: string | null
	/** Base serving size used for ingredient quantity calculations. */
	readonly servingsBase: number
	readonly prepTimeMinutes: number | null
	readonly cookTimeMinutes: number | null
	readonly likeCount: number
	readonly budgetLevel: number
	readonly difficultyLevel: number
	/** Original publication timestamp from the recipe record. */
	readonly createdAt: Date
	/** Last edit timestamp, or null when the recipe has never been edited. */
	readonly updatedAt: Date | null
	// readonly isLiked: boolean

	readonly ingredients: readonly RecipeIngredientDto[]
	readonly steps: readonly PreparationStepDto[]
	readonly tips: readonly RecipeTipDto[]
	readonly categories: readonly CategoryDto[]
	readonly tags: readonly RecipeTagDto[]
}

/* === Recipe Card DTO ================================================== */
/**
 * Lightweight DTO for recipe cards displayed on the homepage.
 *
 * PURPOSE:
 * Represents a recipe in a minimal card view showing title, image,
 * and prep time. Used for horizontal scrolling sections on the home page.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally minimal—only includes fields needed for the UI presentation.
 * This reduces payload size compared to the full RecipeDetailDto.
 */
export interface RecipeCardDto {
	readonly id: number
	readonly title: string
	readonly slug: string
	readonly imageUrl: string | null
	readonly prepTimeMinutes: number | null
	readonly cookTimeMinutes: number | null
	readonly likeCount: number
	readonly budgetLevel: number
	readonly difficultyLevel: number
	readonly createdAt: Date
	readonly updatedAt: Date | null
}

/* === Innovative Recipe DTO ================================================ */
/**
 * Lightweight DTO for innovative recipe cards displayed on the homepage.
 *
 * PURPOSE:
 * Represents a recipe in a grid card view showing title, description, image,
 * and prep time. Used for the Innovative section on the home page.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally minimal—only includes fields needed for the UI presentation.
 * Differs from TrendingRecipeDto by including a description field.
 */
export interface InnovativeRecipeDto {
	readonly id: number
	readonly title: string
	readonly slug: string
	readonly description: string | null
	readonly imageUrl: string | null
	readonly tags: readonly RecipeTagDto[]
	readonly difficultyLevel: number
}

export interface UserProfileDto {
	id: number
	username: string
	email: string
	createdAt: Date
	favoriteRecipes: RecipeCardDto[]
}

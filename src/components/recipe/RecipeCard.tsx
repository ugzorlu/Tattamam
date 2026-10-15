"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import Image from "next/image"
import Link from "next/link"

/* --- Components --- */
import LikeButton from "@/components/ui/LikeButton"

/* --- Utilities --- */
import { buildCloudinaryUrl, buildCloudinaryBlurUrl } from "@/utils/cloudinary"

/* --- Types --- */
import type { RecipeCardDto } from "@/lib/dto"

/* --- Assets --- */
import {
	HeartIcon,
	ClockIcon,
	CurrencyDollarIcon,
} from "@heroicons/react/24/outline"

/* === Local Constants ====================================================== */
const BUDGET_LEVELS = {
	1: { icon: "₺", label: "Ekonomik", count: 1 },
	2: { icon: "₺", label: "Uygun", count: 2 },
	3: { icon: "₺", label: "Orta", count: 3 },
	4: { icon: "₺", label: "Yüksek", count: 4 },
	5: { icon: "₺", label: "Çok Yüksek", count: 5 },
} as const

type BudgetLevelKey = keyof typeof BUDGET_LEVELS

/* === Contracts ============================================================ */
interface RecipeCardProps {
	recipe: RecipeCardDto
	initialLiked: boolean
	mode?: "homepage" | "recipe" | "search"
}

/* === Sub-components ======================================================= */
/**
 * Renders a loading skeleton for the RecipeCard component, providing a visual
 * placeholder while the actual recipe data is being fetched or processed.
 *
 * @component
 * @returns {React.ReactElement} Loading state of a recipe card.
 */
export function RecipeCardLoading(): React.ReactElement {
	/* ── Class Aggregates ────────────────────────────────────────────────── */
	const mainClass = [
		"min-w-70 md:min-w-[320px]",
		"bg-surface-container-lowest",
		"rounded-xl overflow-hidden",
		"border border-outline-variant/30",
		"animate-pulse",
	].join(" ")

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className={mainClass}>
			<div className="h-48 bg-surface-container" />

			<div className="p-5">
				<div className="h-7 rounded bg-surface-container mb-4" />

				<div className="flex justify-between">
					<div className="h-4 w-20 rounded bg-surface-container" />

					<div className="h-4 w-24 rounded bg-surface-container" />
				</div>
			</div>
		</div>
	)
}

/* === Main Component ======================================================= */
export default function RecipeCard({
	recipe,
	initialLiked,
	mode = "homepage",
}: RecipeCardProps) {
	/* ─── Local Constants ────────────────────────────────────────────────── */
	const budgetConfig = BUDGET_LEVELS[recipe.budgetLevel as BudgetLevelKey]
	// const budgetDisplay =
	// 	budgetConfig?.count && budgetConfig?.label
	// 		? `${budgetConfig.icon.repeat(budgetConfig.count)}
	//         ${budgetConfig.label}`
	// 		: null
	const budgetDisplay = budgetConfig?.label ? `${budgetConfig.label}` : null

	const totalTime =
		(recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)

	const mainClass = [
		"min-w-70 md:min-w-[320px] bg-surface-container-lowest",
		"rounded-xl overflow-hidden shadow-sm shadow-[#1B3022]/5 group",
		"border border-outline-variant/30 shrink-0 cursor-pointer",
	].join(" ")

	const tagPrimaryClass = [
		"bg-primary-container text-on-primary-fixed-variant px-3 py-1",
		"rounded-full font-label-sm z-1",
	].join(" ")

	const tagSecondaryClass = [
		"bg-secondary-container text-on-secondary-fixed-variant px-3 py-1",
		"rounded-full font-label-sm z-1",
	].join(" ")

	const imageClass = [
		"object-cover group-hover:scale-105 transition-transform duration-500 z-10",
	].join(" ")

	const likeCountClass = [
		"absolute flex items-center bottom-3 left-3 px-2 py-1 gap-1",
		"bg-secondary-container text-on-secondary-container",
		"font-label-sm text-[12px] font-bold",
		"rounded-md shadow-sm z-10",
	].join(" ")

	const titleClass = [
		"font-headline-md text-headline-md text-on-surface mb-2",
	].join(" ")

	const infoContainerClass = [
		"flex items-center justify-between mt-auto",
	].join(" ")

	const timeContainerClass = [
		"flex items-center space-x-1 text-on-surface-variant font-label-md",
	].join(" ")

	const budgetContainerClass = "flex items-center space-x-1"
	const budgetTextClass = "text-on-surface-variant font-label-sm ml-1"

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<Link
			href={`/tarif/${recipe.slug}/`}
			className={mainClass}
			prefetch={false}
		>
			<div className="relative h-48 overflow-hidden">
				{mode === "search" && (
					<div className="absolute top-4 left-4 flex gap-2 z-20">
						{recipe.likeCount > 3 && (
							<span className={tagPrimaryClass}>Popüler</span>
						)}

						{recipe.difficultyLevel === (1 || 2) && (
							<span className={tagSecondaryClass}>Pratik</span>
						)}
					</div>
				)}

				<Image
					src={
						buildCloudinaryUrl(recipe.imageUrl, { width: 400 }) ??
						recipe.imageUrl!
					}
					alt={recipe.title}
					className={imageClass}
					fill
					sizes="(max-width: 640px) 90vw, 320px"
					placeholder="blur"
					blurDataURL={
						buildCloudinaryBlurUrl(recipe.imageUrl) ??
						recipe.imageUrl!
					}
				/>

				<LikeButton recipeId={recipe.id} initialLiked={initialLiked} />

				{mode === "homepage" && (
					<div className={likeCountClass}>
						<HeartIcon className="size-5" />
						{recipe.likeCount}
					</div>
				)}
			</div>

			<div className="p-5 grow bg-surface-container-low/30">
				<h3 className={titleClass}>{recipe.title}</h3>
				<div className={infoContainerClass}>
					<span className={timeContainerClass}>
						<ClockIcon className="size-5 text-primary" />
						<span>{totalTime} dk.</span>
					</span>

					<span className={budgetContainerClass}>
						<CurrencyDollarIcon className="size-5 text-primary" />
						<span className={budgetTextClass}>{budgetDisplay}</span>
					</span>
				</div>
			</div>
		</Link>
	)
}

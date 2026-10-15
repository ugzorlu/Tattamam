/* =============================================================================
                       Smart Recipe Result Card
============================================================================= */
/**
 * @fileoverview Reusable recipe result card for smart ingredient searches.
 * Displays standard recipe context with ingredient-match and portion metrics.
 */

/* === Imports ============================================================== */
import Image from "next/image"
import Link from "next/link"
import { ClockIcon, PhotoIcon } from "@heroicons/react/24/outline"
import type { SmartRecipeSearchResultDto } from "@/lib/dto"
import { buildCloudinaryUrl } from "@/utils/cloudinary"

/* === Contracts ============================================================ */
/** Props for one ranked smart recipe result. */
interface SmartRecipeCardProps {
	readonly recipe: SmartRecipeSearchResultDto
}

/* === Class Aggregates ===================================================== */
const CARD_CLASSES = {
	link: [
		"group flex min-w-0 overflow-hidden rounded-lg",
		"bg-surface-container-lowest shadow-sm",
		"transition-shadow hover:shadow-md",
	].join(" "),
	imageFrame: ["relative w-28 shrink-0 bg-surface-container", "sm:w-36"].join(
		" ",
	),
	image: "object-cover transition-transform group-hover:scale-105",
	body: "flex min-w-0 flex-1 flex-col justify-between gap-3 p-3 sm:p-4",
	metrics: "flex flex-wrap items-center gap-4",
	metric: "flex items-center gap-1.5 text-label-sm text-on-surface-variant",
	metadata: [
		"flex flex-wrap gap-x-3 gap-y-1 text-label-sm",
		"text-on-surface-variant",
	].join(" "),
	portion: "text-label-md font-semibold text-primary",
}

const BUDGET_LABELS: Readonly<Record<number, string>> = {
	1: "Ekonomik",
	2: "Uygun",
	3: "Orta",
	4: "Yüksek",
	5: "Çok Yüksek",
}

const DIFFICULTY_LABELS: Readonly<Record<number, string>> = {
	1: "Çok Kolay",
	2: "Kolay",
	3: "Orta",
	4: "Zor",
	5: "Çok Zor",
}

/* === Main Component ======================================================= */
/**
 * Renders a linked recipe result with match and serving information.
 *
 * @param props.recipe Ranked result with recipe metadata and portion metrics.
 * @returns A reusable smart recipe result card.
 */
export default function SmartRecipeCard({
	recipe,
}: SmartRecipeCardProps): React.ReactElement {
	const imageUrl = buildCloudinaryUrl(recipe.imageUrl, { width: 320 })
	const totalTime =
		(recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)

	return (
		<Link
			className={CARD_CLASSES.link}
			href={`/tarif/${recipe.slug}/`}
			prefetch={false}
		>
			<div className={CARD_CLASSES.imageFrame}>
				{imageUrl ? (
					<Image
						alt={recipe.title}
						className={CARD_CLASSES.image}
						fill
						sizes="(max-width: 640px) 112px, 144px"
						src={imageUrl}
					/>
				) : (
					<div className="grid h-full min-h-28 place-items-center">
						<PhotoIcon
							aria-hidden="true"
							className="size-8 text-outline"
						/>
					</div>
				)}
			</div>

			<div className={CARD_CLASSES.body}>
				<div className="min-w-0">
					<h2 className="line-clamp-2 text-body-md font-semibold">
						{recipe.title}
					</h2>
					<div className={CARD_CLASSES.metrics}>
						<span className={CARD_CLASSES.metric}>
							<ClockIcon aria-hidden="true" className="size-4" />
							{totalTime > 0
								? `${totalTime} dk.`
								: "Süre belirtilmemiş"}
						</span>
						<span className={CARD_CLASSES.metric}>
							{recipe.matchedIngredientCount} malzeme eşleşti:{" "}
							{recipe.matchedIngredientNames.join(", ")}
						</span>
						{/* <span className={CARD_CLASSES.metric}>
							{recipe.matchedTagCount} etiket eşleşti
						</span> */}
					</div>
					{/* <div className={CARD_CLASSES.metadata}>
						<span>
							Bütçe: {BUDGET_LABELS[recipe.budgetLevel] ?? "-"}
						</span>
						<span>
							Zorluk:{" "}
							{DIFFICULTY_LABELS[recipe.difficultyLevel] ?? "-"}
						</span>
					</div> */}
				</div>

				<p className={CARD_CLASSES.portion}>
					En fazla {recipe.maxServings} porsiyon
				</p>
			</div>
		</Link>
	)
}

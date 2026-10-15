"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState } from "react"

/* --- Actions --- */
import { likeRecipe, unlikeRecipe } from "@/app/actions/interaction"

/* --- Assets --- */
import { HeartIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartLikedIcon } from "@heroicons/react/24/solid"

/* === Contracts ===========================================================  */
interface LikeButtonProps {
	recipeId: number
	initialLiked: boolean
}

/* === Main Component ======================================================  */
export default function LikeButton({
	recipeId,
	initialLiked,
}: LikeButtonProps) {
	const [liked, setLiked] = useState(initialLiked)

	async function handleLike(e: React.MouseEvent<HTMLDivElement>) {
		e.preventDefault()
		e.stopPropagation()

		if (liked) {
			const result = await unlikeRecipe(recipeId)

			if (result.success) {
				setLiked(false)
			}
		} else {
			const result = await likeRecipe(recipeId)

			if (result.success) {
				setLiked(true)
			}
		}
	}

	const likeButtonClass = [
		"absolute top-3 right-3 w-9 h-9",
		"bg-surface-container-lowest/90 backdrop-blur-sm",
		"flex items-center justify-center organic-shadow",
		"hover:scale-110 active:scale-95 transition-all cursor-pointer",
		"px-2 py-2 rounded-full gap-1 shadow-sm",
		"border-0 outline-none z-10",
	].join(" ")

	return (
		<div
			aria-label={liked ? "Beğeniyi kaldır" : "Beğen"}
			className={`
				${likeButtonClass}
				${liked ? "text-error" : "text-on-surface-variant"}
			`}
			onClick={handleLike}
		>
			{liked ? (
				<HeartLikedIcon className="size-4" />
			) : (
				<HeartIcon className="size-4" />
			)}
		</div>
	)
}

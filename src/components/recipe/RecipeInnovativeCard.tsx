"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

import { toggleFavoriteAction } from "@/app/actions/interaction"

/* --- Components --- */
import { AuthModal } from "@/components/layout/navbar/AuthModal"

/* --- Types --- */
import type { InnovativeRecipeDto } from "@/lib/dto"

/* --- Assets --- */
import { BookmarkIcon } from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkedIcon } from "@heroicons/react/24/solid"

/* === Contracts ============================================================ */
interface RecipeInnovativeCardProps {
	recipe: InnovativeRecipeDto
	isLoggedIn: boolean
	initialFavorited: boolean
}

/* === Main Component ======================================================= */
export default function RecipeInnovativeCard({
	recipe,
	isLoggedIn,
	initialFavorited,
}: RecipeInnovativeCardProps) {
	/* ─── States ─────────────────────────────────────────────────────────── */
	const [favorited, setFavorited] = useState(initialFavorited)
	const [showAuth, setShowAuth] = useState(false)

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	/* --- Favorite Handler --- */
	async function handleFavorite(e: React.MouseEvent): Promise<void> {
		e.preventDefault()
		e.stopPropagation()

		if (!isLoggedIn) {
			setShowAuth(true)
			return
		}
		const res = await toggleFavoriteAction(recipe.id, recipe.slug)
		if (res.success) {
			setFavorited(res.favorited)
		}
	}

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const innovativeCardContainerClass = [
		"flex flex-col h-full group overflow-hidden cursor-pointer",
		"border border-outline-variant/30 rounded-xl",
		"bg-surface-container-lowest shadow-sm shadow-[#1B3022]/5",
	].join(" ")

	const imageClass =
		"object-cover group-hover:scale-105 transition-transform duration-500"

	const lowerHalfContainerClass =
		"flex flex-col justify-between p-5 grow bg-surface-container-low"

	const infoContainerClass = "flex justify-between items-start mb-2"

	const titleClass =
		"font-headline-md font-medium text-headline-md text-on-surface"

	const bookmarkContainerClass =
		"text-outline hover:text-primary transition-colors cursor-pointer"

	const descriptionClass =
		"font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2"

	const tagsContainerClass = [
		"flex items-center pt-4 gap-4 font-label-md font-semibold",
		"border-t border-outline-variant/30",
		"text-label-md text-on-surface-variant",
	].join(" ")

	const tagClass =
		"bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded"

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			<Link
				key={recipe.id}
				href={`/tarif/${recipe.slug}/`}
				className={innovativeCardContainerClass}
				prefetch={false}
			>
				<div className="relative h-56 overflow-hidden">
					<Image
						src={recipe.imageUrl!}
						alt={recipe.title}
						className={imageClass}
						fill
						sizes="(max-width: 1024px) 100vw, 60vw"
					/>
				</div>

				<div className={lowerHalfContainerClass}>
					<div>
						<div className={infoContainerClass}>
							<h3 className={titleClass}>{recipe.title}</h3>
							<button
								aria-label={
									favorited
										? "Favorilerden çıkar"
										: "Favorilere ekle"
								}
								className={bookmarkContainerClass}
								onClick={handleFavorite}
							>
								<span
									style={{
										fontVariationSettings: favorited
											? "'FILL' 1"
											: "'FILL' 0",
										transition:
											"font-variation-settings 200ms",
									}}
								>
									{favorited ? (
										<BookmarkedIcon className="size-4" />
									) : (
										<BookmarkIcon className="size-4" />
									)}
								</span>
							</button>
						</div>
						<p className={descriptionClass}>{recipe.description}</p>
					</div>

					<div className={tagsContainerClass}>
						{recipe.tags[0] && (
							<span className={tagClass}>
								{recipe.tags[0].name}
							</span>
						)}

						{recipe.tags[1] && (
							<span className={tagClass}>
								{recipe.tags[1].name}
							</span>
						)}

						{recipe.tags[2] && (
							<span className={tagClass}>
								{recipe.tags[2].name}
							</span>
						)}
					</div>
				</div>
			</Link>

			{/* ── Hidden Modal ──────────────────────────────────────────── */}
			{/* Opens when unauthenticated users click the favorite button. */}
			<AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
		</>
	)
}

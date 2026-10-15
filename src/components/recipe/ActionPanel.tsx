/* =============================================================================
                  Floating Action Panel For Recipe Detail
============================================================================= */
/**
 * @fileoverview
 * Interactive action buttons overlaid on the recipe hero image.
 *
 * FEATURES:
 * – Favorite   Auth-gated. Opens AuthModal if not logged in.
 *              Bookmark icon fills when the recipe is favorited.
 * – Like       Public (any visitor). Heart fills when liked.
 * – Share      Opens a popover with Facebook, X/Twitter, and an
 *              Instagram clipboard-copy option (+ toast feedback).
 *
 * PROPS:
 *   recipeId         – database recipe ID
 *   recipeSlug       – URL slug for share URL construction
 *   recipeTitle      – human-readable title for share text
 *   initialLiked     – server-resolved like state for this visitor
 *   initialFavorited – server-resolved favorite state for this user
 *   isLoggedIn       – derived from server session
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useCallback, useEffect, useRef, useState } from "react"

/* --- Actions --- */
import {
	likeRecipe,
	unlikeRecipe,
	toggleFavoriteAction,
} from "@/app/actions/interaction"

/* --- Components --- */
import { AuthModal } from "@/components/layout/navbar/AuthModal"

/* --- Assets --- */
import { BookmarkIcon, HeartIcon, ShareIcon } from "@heroicons/react/24/outline"
import {
	BookmarkIcon as BookmarkedIcon,
	HeartIcon as HeartLikedIcon,
} from "@heroicons/react/24/solid"

/* === Contracts ============================================================ */
interface ShareMenuItemProps {
	onClick: () => void
	icon: React.ReactNode
	label: string
}

interface ActionPanelProps {
	recipeId: number
	recipeSlug: string
	recipeTitle: string
	initialLiked: boolean
	initialFavorited: boolean
	isLoggedIn: boolean
}

/* === Constants ============================================================ */
/** Shared Tailwind classes for each circular action button. */
const BTN = [
	"w-12 h-12 rounded-full bg-white/90 backdrop-blur",
	"flex items-center justify-center organic-shadow",
	"hover:scale-110 active:scale-95 transition-all cursor-pointer",
	"border-0 outline-none",
].join(" ")

/* === Sub-components ======================================================= */
/**
 * Circular-button placeholder for the recipe hero floating action panel.
 *
 * Mirrors the three circular button layout of `ActionPanel` pixel-for-
 * pixel: same `w-12 h-12` dimensions, same `flex-col gap-2` spacing,
 * same absolute positioning. A high-fidelity skeleton prevents layout
 * shift when the real buttons replace the placeholder.
 *
 * @component
 * @returns {React.ReactElement} Three animated skeleton circles.
 */
export function ActionPanelSkeleton(): React.ReactElement {
	/* ── Class Aggregates ────────────────────────────────────────────────── */
	/*
	 * `w-12 h-12` matches ActionPanel's `BTN` constant exactly,
	 * ensuring the skeleton occupies the same space as the real
	 * buttons before they stream in.
	 */
	const skeletonClass = [
		"w-12 h-12 rounded-full",
		"bg-white/70 animate-pulse",
	].join(" ")

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className={skeletonClass} />
			))}
		</div>
	)
}

function ShareMenuItem({ onClick, icon, label }: ShareMenuItemProps) {
	return (
		<button
			type="button"
			role="menuitem"
			onClick={onClick}
			className={[
				"flex items-center gap-2.5 w-full",
				"px-2 py-2 rounded-lg text-left",
				"text-on-surface text-body-md",
				"hover:bg-surface-container transition-colors",
				"cursor-pointer",
			].join(" ")}
		>
			{icon}
			{label}
		</button>
	)
}

function CopyIcon() {
	return (
		<svg
			width="18px"
			height="18px"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			transform="rotate(90)"
		>
			<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
			<g
				id="SVGRepo_tracerCarrier"
				strokeLinecap="round"
				strokeLinejoin="round"
			></g>
			<g id="SVGRepo_iconCarrier">
				{" "}
				<path
					d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736
					5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21
					6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213
					21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736
					22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z"
					stroke="#a43c12"
					strokeWidth="1.5"
				></path>{" "}
				<path
					d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315
					4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18
					3.34315 18 5"
					stroke="#a43c12"
					strokeWidth="1.5"
				></path>{" "}
			</g>
		</svg>
	)
}

function FacebookIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className="text-blue-600 shrink-0"
		>
			<path
				d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12
				12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047
				V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235
				2.686.235v2.953H15.83c-1.491
				0-1.956.925-1.956 1.874v2.25h3.328l-.532
				3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
			/>
		</svg>
	)
}

function XIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className="text-on-surface shrink-0"
		>
			<path
				d="M18.244 2.25h3.308l-7.227 8.26
				8.502 11.24H16.17l-4.714-6.231-5.401
				6.231H2.74l7.73-8.835L1.254
				2.25H8.08l4.253 5.622zm-1.161
				17.52h1.833L7.084 4.126H5.117z"
			/>
		</svg>
	)
}

function InstagramIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="white"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className="shrink-0"
			style={{
				background: [
					"linear-gradient(45deg,",
					"#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
				].join(""),
				borderRadius: "4px",
				padding: "2px",
			}}
		>
			<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
			<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
			<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
		</svg>
	)
}

/* === Main Component ======================================================= */
export default function ActionPanel({
	recipeId,
	recipeSlug,
	recipeTitle,
	initialLiked,
	initialFavorited,
	isLoggedIn,
}: ActionPanelProps) {
	/* ─── References ─────────────────────────────────────────────────────── */
	const shareRef = useRef<HTMLDivElement>(null)

	/* ─── States ─────────────────────────────────────────────────────────── */
	const [liked, setLiked] = useState(initialLiked)
	const [favorited, setFavorited] = useState(initialFavorited)
	const [showAuth, setShowAuth] = useState(false)
	const [shareOpen, setShareOpen] = useState(false)
	const [toast, setToast] = useState<string | null>(null)

	/* ─── Helpers ────────────────────────────────────────────────────────── */
	/* --- Toast helper --- */
	const fireToast = useCallback((msg: string) => {
		setToast(msg)

		const id = setTimeout(() => {
			setToast(null)
		}, 2500)

		return () => clearTimeout(id)
	}, [])

	/* ─── Effects ────────────────────────────────────────────────────────── */
	/* --- Close share menu on outside click --- */
	useEffect(() => {
		if (!shareOpen) return
		function onDocClick(e: MouseEvent) {
			if (
				shareRef.current &&
				!shareRef.current.contains(e.target as Node)
			) {
				setShareOpen(false)
			}
		}
		document.addEventListener("mousedown", onDocClick)
		return () => document.removeEventListener("mousedown", onDocClick)
	}, [shareOpen])

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	/* --- Like handler --- */
	async function handleLike(): Promise<void> {
		if (liked) {
			const res = await unlikeRecipe(recipeId)
			if (res.success) setLiked(false)
		} else {
			const res = await likeRecipe(recipeId)
			if (res.success) setLiked(true)
		}
	}

	/* --- Favorite handler --- */
	async function handleFavorite(): Promise<void> {
		if (!isLoggedIn) {
			setShowAuth(true)
			return
		}
		const res = await toggleFavoriteAction(recipeId, recipeSlug)
		if (res.success) {
			setFavorited(res.favorited)
		}
	}

	/* --- Share handler --- */
	function handleShare(platform: "facebook" | "twitter" | "other"): void {
		const origin = window.location.origin
		const url = `${origin}/tarif/${recipeSlug}/`
		const encodedUrl = encodeURIComponent(url)
		const text = encodeURIComponent(`${recipeTitle} — Tattamam'da gör!`)

		if (platform === "facebook") {
			window.open(
				`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
				"_blank",
				"width=620,height=420",
			)
		} else if (platform === "twitter") {
			window.open(
				`https://twitter.com/intent/tweet` +
					`?text=${text}&url=${encodedUrl}`,
				"_blank",
				"width=620,height=420",
			)
		} else {
			/* Instagram: copy URL to clipboard + show toast */
			navigator.clipboard
				.writeText(url)
				.then(() => fireToast("Link Kopyalandı! 📋"))
				.catch(() => fireToast("Kopyalama başarısız."))
		}
		setShareOpen(false)
	}

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<>
			<div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
				{/* ── Favorite ─────────────────────────────── */}
				<button
					type="button"
					aria-label={
						favorited ? "Favorilerden çıkar" : "Favorilere ekle"
					}
					onClick={handleFavorite}
					className={`${BTN} ${
						favorited ? "text-primary" : "text-on-surface-variant"
					}`}
				>
					{favorited ? (
						<BookmarkedIcon className="size-4" />
					) : (
						<BookmarkIcon className="size-4" />
					)}
				</button>

				{/* ── Like ─────────────────────────────────── */}
				<button
					type="button"
					aria-label={liked ? "Beğeniyi kaldır" : "Beğen"}
					onClick={handleLike}
					className={`
					${BTN} 
					${liked ? "text-error" : "text-on-surface-variant"}
					`}
				>
					{liked ? (
						<HeartLikedIcon className="size-4" />
					) : (
						<HeartIcon className="size-4" />
					)}
				</button>

				{/* ── Share ────────────────────────────────── */}
				<div ref={shareRef} className="relative">
					<button
						type="button"
						aria-label="Paylaş"
						aria-expanded={shareOpen}
						onClick={() => setShareOpen((v) => !v)}
						className={`${BTN} ${
							shareOpen
								? "text-primary"
								: "text-on-surface-variant"
						}`}
					>
						<ShareIcon className="size-4" />
					</button>

					{/* Share popover */}
					{shareOpen && (
						<div
							className={[
								"absolute right-14 top-0 z-20",
								"bg-surface-container-lowest rounded-xl",
								"border border-outline-variant/30",
								"shadow-lg organic-shadow p-3",
								"flex flex-col gap-1 min-w-50",
							].join(" ")}
							role="menu"
						>
							{/* TODO: Turkish character fix */}
							<p
								className={[
									"text-label-sm font-label-sm",
									"text-on-surface-variant uppercase",
									"tracking-wider px-2 pb-2",
									"border-b border-outline-variant/20",
								].join(" ")}
							>
								Paylaş
							</p>

							<ShareMenuItem
								onClick={() => handleShare("other")}
								icon={<CopyIcon />}
								label="Linki Kopyala"
							/>
							<ShareMenuItem
								onClick={() => handleShare("facebook")}
								icon={<FacebookIcon />}
								label="Facebook"
							/>
							<ShareMenuItem
								onClick={() => handleShare("twitter")}
								icon={<XIcon />}
								label="X / Twitter"
							/>
							<ShareMenuItem
								onClick={() => handleShare("other")}
								icon={<InstagramIcon />}
								label="Instagram"
							/>
						</div>
					)}
				</div>
			</div>

			{/* ── Toast notification ──────────────────────────── */}
			{toast !== null && (
				<div
					className={[
						"fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
						"bg-on-surface text-surface",
						"text-label-md font-label-md",
						"px-5 py-2.5 rounded-full shadow-lg",
						"animate-icon-enter pointer-events-none",
					].join(" ")}
					role="status"
					aria-live="polite"
				>
					{toast}
				</div>
			)}

			{/* ── Hidden Modal ──────────────────────────────────────────── */}
			{/* Opens when unauthenticated users click the favorite button. */}
			<AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
		</>
	)
}

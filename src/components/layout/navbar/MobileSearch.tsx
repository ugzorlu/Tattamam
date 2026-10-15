/* =============================================================================
                                Mobile Search
============================================================================= */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/* --- Assets --- */
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"

/* === Main Component ======================================================= */
/**
 * Full-screen mobile search overlay.
 */
export function MobileSearch(): React.ReactElement {
	/* --- Refs ------------------------------------------------------------- */
	const inputRef = useRef<HTMLInputElement>(null)

	/* --- States ----------------------------------------------------------- */
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [query, setQuery] = useState("")

	/* --- Hooks ----------------------------------------*------------------- */
	const router = useRouter()

	/* --- Event Handlers --------------------------------------------------- */
	const openSearch = (): void => {
		setIsOpen(true)
	}

	const closeSearch = (): void => {
		setIsOpen(false)
	}

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!query.trim()) return

		router.push(`/arama/${encodeURIComponent(query)}`)
		closeSearch()
	}

	/* --- Effects ---------------------------------------------------------- */
	useEffect(() => {
		if (!isOpen) {
			return
		}

		inputRef.current?.focus()

		const originalOverflow = document.body.style.overflow

		document.body.style.overflow = "hidden"

		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === "Escape") {
				closeSearch()
			}
		}

		window.addEventListener("keydown", handleKeyDown)

		return () => {
			document.body.style.overflow = originalOverflow

			window.removeEventListener("keydown", handleKeyDown)
		}
	}, [isOpen])

	/* --- Render ----------------------------------------------------------- */
	/**
	 * DESIGN:
	 * - Matches MobileMenu overlay behavior.
	 * - Focuses search input automatically.
	 * - Prepared for future live-search integration.
	 * - Locks page scroll while open.
	 */
	return (
		<>
			{/* Open Search Button */}
			<button
				type="button"
				aria-label="Arama aç"
				aria-expanded={isOpen}
				aria-controls="mobile-search"
				onClick={openSearch}
				className="
					flex md:hidden cursor-pointer
					text-on-surface
					transition-colors duration-200
					hover:text-primary
					active:opacity-80
				"
			>
				<MagnifyingGlassIcon className="size-5" />
			</button>

			{/* Overlay */}
			<div
				id="mobile-search"
				// aria-hidden={!isOpen}
				data-open={isOpen}
				className={`
					fixed inset-0 z-50 md:hidden

					bg-surface/60

					transition-all duration-300

					opacity-0
					pointer-events-none
					invisible

					data-[open=true]:opacity-100
					data-[open=true]:pointer-events-auto
					data-[open=true]:visible
					${isOpen ? "backdrop-blur-md" : ""}
				`}
			>
				<div
					data-open={isOpen}
					className="
						h-full overflow-y-auto

						transition-transform duration-300

						translate-y-4
						data-[open=true]:translate-y-0
					"
				>
					<div
						className="
							max-w-3xl
							mx-auto
                            mt-12
							px-4
							pt-6
							pb-12
						"
					>
						{/* Header */}
						<div
							className="
								flex items-center
								gap-3
								mb-8
							"
						>
							<div className="relative flex-1">
								<span
									className="
										absolute
										left-6
										top-1/2
										-translate-y-1/2
										text-on-surface-variant
									"
									onClick={onSubmit}
								>
									<MagnifyingGlassIcon className="size-4" />
								</span>

								<form onSubmit={onSubmit}>
									<input
										id="mobile-search-form"
										ref={inputRef}
										type="search"
										placeholder="Tarif ara..."
										className="
											w-full
											pl-12
											pr-4
											py-4
											rounded-full
											bg-surface-container-lowest
											text-body-md
											text-on-surface
											outline-none
											border
											border-outline-variant/40
											organic-shadow
										"
										value={query}
										onChange={(e) =>
											setQuery(e.target.value)
										}
										autoComplete="on"
									/>
								</form>
							</div>

							<button
								type="button"
								aria-label="Aramayı kapat"
								onClick={closeSearch}
								className="
                                	absolute top-6 right-6
									text-on-surface
									transition-colors
									hover:text-primary
								"
							>
								<XMarkIcon className="size-6" />
							</button>
						</div>

						{/* Popular Searches */}
						<section className="mb-stack-lg">
							<h2
								className="
									font-headline-md
									text-headline-md
									text-on-surface
									mb-4
								"
							>
								Popüler Aramalar
							</h2>

							<div
								className="
									flex flex-wrap
									gap-3
								"
							>
								<Link
									href={`/etiket/sardalya`}
									className="
										px-4 py-2
										rounded-full
										bg-secondary-fixed
										text-on-secondary-fixed
										text-label-md
									"
									onClick={closeSearch}
								>
									Sardalya
								</Link>

								<Link
									href={`/etiket/kiraz`}
									className="
										px-4 py-2
										rounded-full
										bg-secondary-fixed
										text-on-secondary-fixed
										text-label-md
                                        "
									onClick={closeSearch}
								>
									Kiraz
								</Link>

								<Link
									href={`/etiket/domates`}
									className="
										px-4 py-2
										rounded-full
										bg-secondary-fixed
										text-on-secondary-fixed
										text-label-md
									"
									onClick={closeSearch}
								>
									Domates
								</Link>
							</div>
						</section>
					</div>
				</div>
			</div>
		</>
	)
}

"use client"

/* =============================================================================
                              Mobile Navigation
============================================================================= */

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState } from "react"
import Link from "next/link"

/* --- Assets --- */
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid"

/* === Main Component ======================================================= */
/**
 * Full-screen mobile navigation overlay.
 *
 * @component
 * @returns {React.ReactElement} Full-screen mobile navigation overlay.
 */
export function MobileMenu(): React.ReactElement {
	/* --- States ----------------------------------------------------------- */
	const [isOpen, setIsOpen] = useState<boolean>(false)

	/* --- Event Handlers --------------------------------------------------- */
	const closeMenu = (): void => {
		setIsOpen(false)
	}

	/* --- Render ----------------------------------------------------------- */
	/**
	 * DESIGN:
	 * - Semi-transparent overlay keeps page context visible.
	 * - Uses theme tokens from globals.css.
	 * - Backdrop blur improves visual separation.
	 * - Slide/fade transitions for modern mobile UX.
	 */
	return (
		<>
			{/* Open Menu Button */}
			<button
				type="button"
				aria-label="Menüyü aç"
				aria-expanded={isOpen}
				aria-controls="mobile-navigation"
				onClick={() => setIsOpen(true)}
				className="
					flex md:hidden cursor-pointer
					text-on-surface
					transition-colors duration-200
					hover:text-primary
					active:opacity-80
				"
			>
				<Bars3Icon className="size-5" />
			</button>

			{/* Overlay */}
			<div
				id="mobile-navigation"
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
				{/* Navigation Panel */}
				<div
					data-open={isOpen}
					className="
						flex h-full flex-col
						items-center justify-center

						transition-transform duration-300

						translate-y-4
						data-[open=true]:translate-y-0
					"
				>
					{/* Close Button */}
					<button
						type="button"
						aria-label="Menüyü kapat"
						onClick={closeMenu}
						className="
							absolute top-6 right-6

							text-on-surface
							transition-colors

							hover:text-primary
						"
					>
						<XMarkIcon className="size-6" />
					</button>

					<nav
						className="
							flex flex-col
							items-center
							gap-stack-md
						"
					>
						<Link
							href="/kategori/balik-yemekleri"
							onClick={closeMenu}
							className="
								font-headline-lg
								text-headline-lg
								text-on-surface
								transition-colors
								hover:text-primary
							"
						>
							🐟 Balık Sezonu
						</Link>

						<Link
							href="/kategori/pratik-tarifler"
							onClick={closeMenu}
							className="
								font-headline-lg
								text-headline-lg
								text-on-surface
								transition-colors
								hover:text-primary
							"
						>
							Pratik Tarifler
						</Link>

						<Link
							href="/kategori/ekonomik-tarifler"
							onClick={closeMenu}
							className="
								font-headline-lg
								text-headline-lg
								text-on-surface
								transition-colors
								hover:text-primary
							"
						>
							Ekonomik Tarifler
						</Link>

						<Link
							href="/kategori"
							onClick={closeMenu}
							className="
								font-headline-lg
								text-headline-lg
								text-on-surface
								transition-colors
								hover:text-primary
							"
						>
							Tüm Kategoriler
						</Link>
					</nav>
				</div>
			</div>
		</>
	)
}

/* =============================================================================
                             Navigation Bar
============================================================================= */
/**
 * @fileoverview
 * Responsible for rendering the navigation bar of the application.
 * The Navbar includes the logo, navigation links, search functionality,
 * and user authentication overlay.
 *
 * PURPOSE:
 * Provides a consistent navigation experience across the application.
 *
 * FLOW:
 * ~ Fetches user session.
 * ~ Renders logo, links, search, and auth overlay.
 *
 * NOTE(ARCHITECTURE):
 * Fetches the user's session to determine if the user is logged in.
 * Lazy-loads search & authentication overlay components to optimize performance.
 * Conditionally renders the `AuthOverlay` based on user's authentication status.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"

/* --- Components --- */
import { DesktopSearch } from "@/components/layout/navbar/DesktopSearch"
import { MobileMenu } from "@/components/layout/navbar/MobileMenu"
import { MobileSearch } from "@/components/layout/navbar/MobileSearch"
import NavbarAuth from "@/components/layout/navbar/NavbarAuth"

/* --- Style --- */
import logo from "@/../public/logo.png"

/* === Main Component ======================================================= */
export default function Navbar(): React.ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const navClass = [
		"bg-surface-container-lowest text-on-surface font-serif",
		"fixed top-0 w-full z-50 shadow-sm shadow-stone-900/5",
	].join(" ")

	const navContainerClass =
		"flex justify-between items-center max-w-7xl mx-auto px-3 md:p-6 h-20"

	const navLinksDesktopContainerClass =
		"hidden md:flex mx-2 space-x-4 items-center text-center"

	const homeIconClass = "text-tertiary animate-pulse"

	const navLinkIrregularClass = [
		"relative py-2 px-4 bg-tertiary-container/10 rounded-full",
		"text-tertiary font-medium hover:bg-tertiary-container/20",
		"transition-all duration-200 group flex items-center gap-1",
	].join(" ")

	const navLinkRegularClass = [
		"relative py-2 text-stone-600 font-medium hover:text-primary",
		"transition-colors duration-200 group active:opacity-80",
	].join(" ")

	const navLinkRegularHoverLineClass = [
		"absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary",
		"transition-all duration-300 -translate-x-1/2 group-hover:w-full",
	].join(" ")

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<nav className={navClass}>
			<div className={navContainerClass}>
				{/* Logo */}
				<Link href="/" className="mx-2">
					<Image
						src={logo}
						alt="Tattamam Logo"
						width={240}
						height={80}
						className="object-contain"
						priority
					/>
				</Link>

				{/* Navigation Links (Hidden on Mobile) */}
				<div className={navLinksDesktopContainerClass}>
					<Link
						className={navLinkIrregularClass}
						href="/kategori/balik-yemekleri"
					>
						<span className="inline-block animate-swimming-fish mr-1">
							🐟
						</span>
						Balık Sezonu
					</Link>

					<Link
						className={navLinkRegularClass}
						href="/kategori/pratik-tarifler"
					>
						Pratik Tarifler
						<span className={navLinkRegularHoverLineClass}></span>
					</Link>

					<Link
						className={navLinkRegularClass}
						href="/kategori/ekonomik-tarifler"
					>
						Ekonomik Tarifler
						<span className={navLinkRegularHoverLineClass}></span>
					</Link>

					<Link className={navLinkRegularClass} href="/kategori">
						Tüm Kategoriler
						<span className={navLinkRegularHoverLineClass}></span>
					</Link>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-4">
					{/* Hidden on Mobile */}
					<DesktopSearch />

					{/* Hidden on Desktop */}
					<MobileMenu />
					<MobileSearch />

					{/* Always visible */}
					<Suspense
						fallback={
							<div
								className="flex h-10 w-10"
								aria-hidden="true"
							/>
						}
					>
						<NavbarAuth />
					</Suspense>
				</div>
			</div>
		</nav>
	)
}

/* =============================================================================
                                    Footer
============================================================================= */
/**
 * @fileoverview
 * Shared Footer component for standard page configurations.
 *
 * PURPOSE:
 * Displays persistent links, social media endpoints and trademark declarations.
 *
 * FLOW:
 * ~ Receives layout positioning.
 * ~ Renders structural links and inline media icons.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import Link from "next/link"

/* --- Types --- */
import type { ReactElement } from "react"

/* === Main Component ======================================================= */
/**
 * Persistently rendered Footer interface.
 *
 * @returns {ReactElement} The layout's footer element.
 */
export default function Footer(): ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const footerClass = [
		"bg-surface-container-high",
		"dark:bg-surface-container-highest",
	].join(" ")

	const containerClass = [
		"w-full py-stack-lg px-margin-desktop",
		"flex flex-col items-center text-center",
		"gap-6 lg:gap-8 max-w-container-max mx-auto",
	].join(" ")

	const socialLinkClass = [
		"text-on-surface-variant hover:text-primary",
		"transition-colors duration-200",
	].join(" ")

	const linkClass = [
		"text-on-surface-variant font-body-md text-body-md",
		"hover:text-primary transition-colors",
		"opacity-80 hover:opacity-100",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<footer className={footerClass}>
			<div className={containerClass}>
				<div className="flex gap-6">
					<a
						aria-label="Instagram"
						className={socialLinkClass}
						href="https://instagram.com/tat_tamam"
						target="_blank"
						rel="noopener noreferrer"
					>
						<svg
							fill="none"
							height="24"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							width="24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								x="2"
								y="2"
								width="20"
								height="20"
								rx="5"
								ry="5"
							></rect>
							<path
								d={[
									"M16 11.37A4 4 0 1 1 12.63 8",
									" 4 4 0 0 1 16 11.37z",
								].join("")}
							></path>
							<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
						</svg>
					</a>
					<a
						aria-label="X (Twitter)"
						className={socialLinkClass}
						href="https://x.com/tat_tamam"
						target="_blank"
						rel="noopener noreferrer"
					>
						<svg
							fill="currentColor"
							height="24"
							viewBox="0 0 24 24"
							width="24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d={[
									"M18.901 1.153h3.68l-8.04 9.19L24 22.846",
									"h-7.406l-5.8-7.584-6.638 7.584H.474",
									"l8.6-9.83L0 1.154h7.594l5.243 6.932ZM",
									"17.61 20.644h2.039L6.486 3.24H4.298Z",
								].join("")}
							></path>
						</svg>
					</a>
					<a
						aria-label="Facebook"
						className={socialLinkClass}
						href="https://facebook.com/tattamam"
						target="_blank"
						rel="noopener noreferrer"
					>
						<svg
							fill="none"
							height="24"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							width="24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d={[
									"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4",
									"v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
								].join("")}
							></path>
						</svg>
					</a>
				</div>
				<div className="flex flex-col items-center gap-4">
					<p
						className={[
							"text-on-surface-variant",
							"font-label-sm text-label-sm",
						].join(" ")}
					>
						© 2026 Tattamam
					</p>
				</div>
				<div
					className={[
						"flex flex-wrap justify-center",
						"gap-x-10 gap-y-4",
					].join(" ")}
				>
					<Link className={linkClass} href="/bilgi?tab=about">
						Hakkımızda
					</Link>
					<Link className={linkClass} href="/bilgi?tab=legal">
						Yasal Bilgilendirme
					</Link>
					<Link className={linkClass} href="/bilgi?tab=contact">
						İletişim
					</Link>
					<Link className={linkClass} href="/tarif/">
						Tüm Tarifler
					</Link>
				</div>
			</div>
		</footer>
	)
}

/* =============================================================================
                        	Information Page Tab Bar
============================================================================= */
/**
 * @fileoverview
 * Tab bar UI component for navigating between different information sections.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import Link from "next/link"

/* === Contracts ============================================================ */
interface TabBarProps {
	activeTab: string
}

/* === Main Component ======================================================= */
export default function TabBar({ activeTab }: TabBarProps) {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */

	const mainContainerClass = "flex justify-center mb-stack-lg"

	const tabClass = [
		"pb-4 border-b-2",
		"font-headline text-headline-md",
		"transition-all duration-200",
	].join(" ")
	const activeTabClass = "border-primary text-primary font-semibold"
	const passiveTabClass =
		"border-transparent text-on-surface-variant hover:text-primary"

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className={mainContainerClass}>
			<div className="flex gap-8 md:gap-16">
				<Link
					href="/bilgi?tab=about"
					scroll={false}
					className={` ${tabClass} ${
						activeTab === "about" ? activeTabClass : passiveTabClass
					}`}
				>
					Hakkımızda
				</Link>
				<Link
					href="/bilgi?tab=legal"
					scroll={false}
					className={`${tabClass} ${
						activeTab === "legal" ? activeTabClass : passiveTabClass
					}`}
				>
					Yasal Bilgilendirme
				</Link>
				<Link
					href="/bilgi?tab=contact"
					scroll={false}
					className={`${tabClass} ${
						activeTab === "contact"
							? activeTabClass
							: passiveTabClass
					}`}
				>
					İletişim
				</Link>
			</div>
		</div>
	)
}

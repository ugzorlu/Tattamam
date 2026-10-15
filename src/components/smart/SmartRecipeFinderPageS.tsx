/* =============================================================================
                     Smart Recipe Founder Page Server
============================================================================= */
/**
 * @fileoverview Server entry point for the smart recipe ingredient finder.
 * The interactive ingredient workflow is delegated to its client component.
 *
 * PURPOSE:
 * Renders the page introduction immidiately on the server side to improve
 * perceived performance and SEO, while keeping the interactive ingredient
 * selection workflow on the client.
 */

/* === Imports ============================================================== */
import SmartRecipeFinderPageC from "@/components/smart/SmartRecipeFinderPageC"

/* === Main Component ======================================================= */
interface SmartRecipeFinderPageSProps {
	readonly title: string
	readonly description: string
}

/**
 * Renders the smart recipe finder page.
 *
 * @component
 * @returns {React.ReactElement} The server-rendered page introduction.
 */
export default function SmartRecipeFinderPageS({
	title,
	description,
}: SmartRecipeFinderPageSProps): React.ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const mainClass = "relative flex w-full flex-1 flex-col bg-surface"
	const pageContentClass = "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4"
	const headlineClass = "text-headline-lg font-headline-lg text-on-surface"

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<main className={mainClass}>
			<div className={pageContentClass}>
				{/* --- Page Introduction --- */}
				<section className="pt-8">
					<h1 className={headlineClass}>{title}</h1>
					<p className="mt-2 text-body-md text-on-surface-variant">
						{description}
					</p>
				</section>

				{/* --- Interactive Ingredient Selection --- */}
				<SmartRecipeFinderPageC />
			</div>
		</main>
	)
}

/* =============================================================================
                          Smart Recipe Founder Page
============================================================================= */
/**
 * @fileoverview
 * Serves as the main server component for the Smart Recipe Founder feature.
 *
 * PURPOSE:
 * Responsible for setting metadata, structuring the initial page shell, and
 * delegating initial rendering to a server component, interactive ingredient
 * selection workflow to a client component.
 */

/* === Imports ============================================================== */
/* --- Components --- */
import SmartRecipeFinderPageS from "@/components/smart/SmartRecipeFinderPageS"

/* --- Types --- */
import type { Metadata } from "next"

/* === Constants ============================================================ */
const PAGE_TITLE = "Akıllı Tarif Bulucu"
const PAGE_DESCRIPTION =
	"Mutfağındaki malzemeleri seç, tam sana göre tarifleri ve porsiyon " +
	"miktarını şipşak bulalım."

/* === Metadata ============================================================= */
export const metadata: Metadata = {
	title: PAGE_TITLE,
	description: PAGE_DESCRIPTION,
}

/* === Main Component ======================================================= */
/**
 * Server Component for the Smart Recipe Founder page.
 *
 * Delegates the initial rendering to a server component and the interactive
 * ingredient selection workflow to a client component inside it.
 *
 * @component
 * @returns {React.Element} The rendered ingredient selection page.
 */
export default function SmartRecipeFounderPage(): React.ReactElement {
	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<SmartRecipeFinderPageS
			description={PAGE_DESCRIPTION}
			title={PAGE_TITLE}
		/>
	)
}

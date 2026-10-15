/* =============================================================================
                    Smart Recipe Finder Loading Page
============================================================================= */
/**
 * @fileoverview
 * Mirrors the smart finder form and recipe results while the route loads.
 */

/* === Imports ============================================================== */
/* --- Components --- */
import SmartRecipeFinderSkeleton from "@/components/smart/SmartRecipeFinderPageL"

/**
 * Renders the smart recipe finder route's loading state.
 *
 * @component
 * @returns An accessible skeleton matching the finder page structure.
 */
export default function SmartRecipeFounderLoading(): React.ReactElement {
	return <SmartRecipeFinderSkeleton />
}

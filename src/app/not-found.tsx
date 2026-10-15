/* =============================================================================
                          Global Not Found Boundary                                   
============================================================================= */
/**
 * @fileoverview
 * Renders a custom UI via delegation when the notFound() function is explicitly
 * called within a specific route segment or for any unmatched URLs globally.
 */
/* === Imports ============================================================== */
/* --- Components --- */
import NotFoundClient from "../components/interrupt/NotFoundClient"

/* --- Types --- */
import type { Metadata } from "next"

/* === Metadata ============================================================= */
export const metadata: Metadata = {
	title: "Sayfa Bulunamadı",
	description:
		"Aradığınız sayfaya ulaşamıyoruz ama mutfağımız hala lezzet dolu.",
	robots: {
		index: false,
		follow: false,
	},
}

/* === Main Component ======================================================= */
export default function NotFound() {
	return <NotFoundClient />
}

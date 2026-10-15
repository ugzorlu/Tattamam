/* =============================================================================
                     Static robots.txt File Generator                              
============================================================================= */
/**
 * @fileoverview
 * Static robots.txt file generator for Next.js App Router.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally acts as the highest-level composition root of the application.
 * which helps to centralize:
 * - Persistent UI infrastructure
 * - Localization initialization
 * - Global SEO registration
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { MetadataRoute } from "next"

/* === Main Function ======================================================== */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/profil"],
		},
		sitemap: "https://tattamam.com.tr/sitemap.xml",
	}
}

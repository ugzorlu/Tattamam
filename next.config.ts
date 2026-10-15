/* =============================================================================
                       Configuration for Next.js Server
============================================================================= */
/**
 * @fileoverview
 * Contains the configuration for the Next.js server.
 * Used to customize the behavior of the Next.js server.
 *
 * @see
 * {@link https://nextjs.org/docs/api-reference/next.config.js/introduction}
 */

/* === Imports ============================================================== */
/* --- Types --- */
import type { NextConfig } from "next"

/* === Configuration ======================================================== */
const nextConfig: NextConfig = {
	/**
	 * Allows Next.js to treat the specified packages as external dependencies.
	 * Useful when using packages that are not compatible with Next.js server.
	 */
	serverExternalPackages: ["@prisma/client", "prisma"],

	/**
	 * Ensures that all routes are treated as directories, (/route to /route/)
	 * which is important for SEO and user experience.
	 *
	 * INFO(FRAMEWORK):
	 * Recommended for cPanel/Apache compatibility.
	 */
	trailingSlash: true,

	/**
	 * Allows Next.js to load images from the specified remote patterns.
	 *
	 * NOTE(PERFORMANCE):
	 * Additional image settings below reduce CPU pressure on the
	 * shared server by caching optimised variants aggressively and
	 * limiting the number of size breakpoints Next.js must generate.
	 */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				pathname: "/di6klblik/**",
			},
		],

		/**
		 * Preferred delivery formats, in priority order.
		 *
		 * INFO(FRAMEWORK):
		 * Next.js negotiates format via the browser's Accept header.
		 * AVIF achieves ~30 % smaller files than WebP at the same
		 * perceived quality, which matters on constrained uplinks.
		 * Browsers that do not support AVIF fall back to WebP
		 * automatically.
		 */
		formats: ["image/avif", "image/webp"],

		/**
		 * How long (in seconds) the server caches an optimised image
		 * variant on disk before re-processing it.
		 *
		 * NOTE(PERFORMANCE):
		 * The default TTL is 60 s, meaning the shared-hosting CPU
		 * re-encodes the same image on nearly every cold cache hit.
		 * 30 days (2 592 000 s) is safe because Cloudinary images
		 * have stable, content-addressed URLs — a changed photo gets
		 * a new URL, so stale caches are never an issue.
		 */
		minimumCacheTTL: 2_592_000,

		/**
		 * Viewport widths at which Next.js generates full-bleed
		 * image variants. Tuned to the actual layout breakpoints
		 * used in this project to avoid generating unused sizes.
		 *
		 * INFO(FRAMEWORK):
		 * Default includes 3840 px (4K), which wastes disk on
		 * shared hosting. The recipe hero never exceeds ~1280 px.
		 */
		deviceSizes: [640, 828, 1080, 1280],

		/**
		 * Pixel widths generated for images that are NOT full-bleed
		 * (i.e., images with a fixed `width` prop or a small
		 * `sizes` value). Recipe cards, thumbnails, and avatars fall
		 * into this category.
		 */
		imageSizes: [32, 64, 128, 256, 384],
	},

	/**
	 * Enables the Next.js v16 Cache Components model (`'use cache'`,
	 * `cacheLife`, `cacheTag`). Required for the static-shell +
	 * dynamic-holes architecture on the recipe detail page.
	 */
	cacheComponents: true,

	/**
	 * Forces Next.js to run its build and export process in a single thread.
	 */
	experimental: {
		workerThreads: false,
		cpus: 1,
	},
}

export default nextConfig

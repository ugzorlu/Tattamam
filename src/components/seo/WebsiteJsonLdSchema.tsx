/* === Contracts ============================================================ */
/**
 * Properties for the {@link WebsiteJsonLdSchema} component.
 *
 * @property baseUrl - The public base URL for the website.
 */
interface WebsiteJsonLdSchemaProps {
	baseUrl: string
}

/**
 * Shape of the JSON-LD WebSite schema.
 */
interface WebsiteSchema {
	"@context": "https://schema.org"
	"@type": "WebSite"
	name: string
	url: string
	inLanguage: string
}

/* === Main Component ======================================================= */
/**
 * JSON-LD Schema Component for Home page SEO.
 *
 * PURPOSE:
 * Provides structured data for the main website entry point.
 *
 * NOTE(ARCHITECTURE):
 * Mirrors the other SEO components by rendering a single JSON-LD
 * `<script>` tag for search engines.
 */
export default function WebsiteJsonLdSchema({
	baseUrl,
}: WebsiteJsonLdSchemaProps) {
	const normalizedBaseUrl =
		baseUrl.trim().replace(/\/+$/, "") || "https://tattamam.com.tr"

	const schema: WebsiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "Tattamam",
		url: normalizedBaseUrl,
		inLanguage: "tr-TR",
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
			suppressHydrationWarning
		/>
	)
}

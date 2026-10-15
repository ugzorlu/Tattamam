/* =============================================================================
                     	        About Page
============================================================================= */
/**
 * @fileoverview
 * About page with a brief history and mission statement of the Tattamam project.
 *
 * FLOW:
 * Static server component that renders content about the project.
 * Does not require any client-side interactivity or state management.
 *
 * NOTE(ARCHITECTURE):
 * Server component to leverage server-side rendering and static generation.
 * All content is rendered on the server and sent to the client as HTML.
 *
 * INFO(FRAMEWORK):
 * Uses Next.js App Router with static rendering capabilities.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import Image from "next/image"

/* === Main Component ======================================================= */
export default function AboutPage() {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const quoteClass = [
		"prose max-w-none pl-6 py-2",
		"font-body text-body-lg text-on-surface leading-relaxed italic",
		"border-l-4 border-primary-container",
	].join(" ")

	const textContainerClass =
		"grid grid-cols-1 md:grid-cols-2 gap-stack-md mt-stack-md"
	const textWrapperClass =
		"space-y-4 font-body text-body-md text-on-surface-variant"

	const imageContainerClass = [
		"relative min-h-75",
		"rounded-xlborder border-outline-variant",
		"overflow-hidden shadow-sm",
	].join(" ")

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className="space-y-6">
			<h1 className="font-headline text-headline-xl text-primary">
				Dijital Mutfak Defteriniz
			</h1>
			<div className={quoteClass}>
				&ldquo;Tattamam, 2026 yılında bir tutku projesi olarak başladı.
				Amacımız, klasik tarifleri modern dünyanın hızına ve estetiğine
				adapte ederek geleceğe taşımak.&rdquo;
			</div>
			<div className={textContainerClass}>
				<div className={textWrapperClass}>
					<p>
						Ev aşçıları için tasarlanan arayüzümüzle, karmaşadan
						uzak, sadece lezzete ve sürece odaklanan bir dijital not
						defteri inşa ettik. Sadelik, samimiyet ve kalite;
						Tattamam&apos;ın temel taşlarını oluşturur.
					</p>
					<p>
						Kişiselleştirilmiş algoritmalarımız, damak tadınızı
						geleneksel bilgelikle buluşturur.
					</p>
				</div>
				<div className={imageContainerClass}>
					<Image
						className="object-cover"
						src="/media/info/about-min.jpg"
						alt="Tahta masada kase ve malzemelerle sıcak bir mutfak"
						sizes="(max-w-768px) 100vw, 50vw"
						fill
						priority
					/>
				</div>
			</div>
		</div>
	)
}

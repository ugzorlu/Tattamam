/* =============================================================================
                               Not Found Client
============================================================================= */
/**
 * @fileoverview
 * Interactive client-side view for the 404 Sayfası Bulunamadı screen.
 *
 * PURPOSE:
 * Provides a highly polished fallback page with 3D tilting effect, routing,
 * and semantic search actions when a page or recipe is not found.
 *
 * FLOW:
 * ~ Renders a 3D tilt-sensitive image wrapper on mouse move (desktop only).
 * ~ Provides fallback options returning users to home or triggering search.
 *
 * NOTE(ARCHITECTURE):
 * Extracted into a client component to allow React hooks(`useRef`, `useEffect`)
 * while keeping `src/app/not-found.tsx` a Server Component to support static
 * robots metadata export.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"

/* --- Assets --- */
import { HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"

/* === Main Component ======================================================= */
export default function NotFoundClient() {
	const containerRef = useRef<HTMLElement>(null)

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!containerRef.current) return

			const xAxis = (window.innerWidth / 2 - e.pageX) / 50
			const yAxis = (window.innerHeight / 2 - e.pageY) / 50

			if (window.innerWidth > 768) {
				containerRef.current.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`
			}
		}

		const handleMouseLeave = () => {
			if (!containerRef.current) return
			containerRef.current.style.transform =
				"perspective(1000px) rotateY(0deg) rotateX(0deg)"
		}

		document.addEventListener("mousemove", handleMouseMove)
		document.addEventListener("mouseleave", handleMouseLeave)

		return () => {
			document.removeEventListener("mousemove", handleMouseMove)
			document.removeEventListener("mouseleave", handleMouseLeave)
		}
	}, [])

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const outerWrapperClass = [
		"w-full flex flex-col items-center justify-center",
		"min-h-[75vh] py-10 px-margin-mobile md:px-margin-desktop",
	].join(" ")

	const mainContainerClass = [
		"max-w-4xl w-full flex flex-col items-center",
		"text-center transition-transform duration-200 ease-out",
	].join(" ")

	const blurOverlayClass = [
		"absolute inset-0 bg-surface-container rounded-full",
		"blur-3xl opacity-30 -z-10 transform scale-110",
	].join(" ")

	const imageWrapperClass = [
		"overflow-hidden rounded-xl bg-surface-container-low",
		"p-2 md:p-4 shadow-sm border border-outline-variant/30",
	].join(" ")

	const innerImageClass = [
		"relative w-full aspect-[4/3] rounded-lg shadow-inner",
		"overflow-hidden",
	].join(" ")

	const imageStyleClass = [
		"object-cover transition-transform duration-700",
		"group-hover:scale-[1.02]",
	].join(" ")

	const titleClass = [
		"font-headline text-headline-xl text-primary",
		"mb-2 italic",
	].join(" ")

	const descClass = [
		"font-body text-body-lg text-on-surface-variant",
		"leading-relaxed",
	].join(" ")

	const actionsWrapperClass = [
		"mt-stack-lg flex flex-col sm:flex-row",
		"items-center gap-gutter",
	].join(" ")

	const primaryButtonClass = [
		"inline-flex items-center justify-center gap-2",
		"px-8 py-4 bg-primary text-on-primary",
		"font-label text-label-md rounded-full shadow-md",
		"hover:bg-surface-tint transition-all group active:scale-95",
	].join(" ")

	const secondaryButtonClass = [
		"inline-flex items-center justify-center gap-2",
		"px-8 py-4 bg-transparent border border-outline",
		"text-on-surface-variant font-label text-label-md",
		"rounded-full hover:bg-surface-container",
		"transition-colors active:scale-95",
	].join(" ")

	const footerWrapperClass = [
		"mt-stack-lg pt-12 border-t border-outline-variant/20",
		"w-full max-w-xs opacity-60",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className={outerWrapperClass}>
			<main ref={containerRef} className={mainContainerClass}>
				{/* Artistic Image Wrapper */}
				<div className="relative w-full max-w-lg mb-stack-lg group">
					<div className={blurOverlayClass}></div>

					<div className={imageWrapperClass}>
						<div className={innerImageClass}>
							<Image
								src="/media/not-found-min.webp"
								alt="404 Sayfa Bulunamadı"
								fill
								className={imageStyleClass}
								priority
							/>
						</div>
					</div>
				</div>

				{/* Typography & Content */}
				<div className="space-y-stack-sm max-w-2xl px-4">
					<h1 className={titleClass}>
						Eyvah! Aradığın sayfa buralarda değil.
					</h1>
					<p className={descClass}>
						Üzgünüz şu anda sayfaya ulaşamıyoruz ama mutfağımız hala
						lezzet dolu. Ana sayfamıza dönüp yeni keşifler yapmaya
						ne dersin?
					</p>
				</div>

				{/* Action Section */}
				<div className={actionsWrapperClass}>
					<Link href="/" className={primaryButtonClass}>
						<HomeIcon className="size-4" />
						Ana Sayfaya Dön
					</Link>
					<Link href="/arama/" className={secondaryButtonClass}>
						<MagnifyingGlassIcon className="size-4" />
						Tarif Ara
					</Link>
				</div>

				{/* Minimal Branded Footer for 404 context */}
				<div className={footerWrapperClass}>
					<p className="font-label text-label-sm tracking-widest uppercase">
						Tattamam
					</p>
				</div>
			</main>

			<style
				dangerouslySetInnerHTML={{
					__html: `
						@keyframes fadeIn {
							from { opacity: 0; transform: translateY(10px); }
							to { opacity: 1; transform: translateY(0); }
						}
					`,
				}}
			/>
		</div>
	)
}

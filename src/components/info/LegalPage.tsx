/* =============================================================================
                     	        Legal Page
============================================================================= */
/**
 * @fileoverview
 * Legal page with terms of use and cookie policy for the Tattamam project.
 *
 * FLOW:
 * Client component that manages state for cookie preferences.
 * Renders static content for terms of use and allows users to toggle
 * optional cookie settings.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState } from "react"

/* === Main Component ======================================================= */
export default function LegalPage() {
	/* ─── States ─────────────────────────────────────────────────────────── */
	const [zorunluChecked, setZorunluChecked] = useState(true)
	const [analizChecked, setAnalizChecked] = useState(false)

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const areaContainerClass =
		"bg-surface-container-low p-8 rounded-xl border border-outline-variant"

	const headerClass = "font-headline text-headline-lg text-primary mb-4"

	const textContainerClass = [
		"space-y-4",
		"font-body text-body-md text-on-surface-variant leading-relaxed",
	].join(" ")

	const cookieContainerClass =
		"flex items-start gap-3 p-4 bg-surface rounded-lg"
	const cookieInputClass = "w-5 h-5 mt-1 form-checkbox accent-secondary"
	const cookieLabelClass =
		"font-label text-label-md text-on-surface cursor-default"
	const cookieDescriptionClass = "text-sm font-body text-on-surface-variant"

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className="space-y-stack-md">
			<div className={areaContainerClass}>
				<h2 className={headerClass}>Kullanım Koşulları</h2>
				<div className={textContainerClass}>
					<p>
						Tattamam platformunu kullanarak, belirtilen tüm şartları
						ve politikaları kabul etmiş sayılırsınız. Platformumuzda
						paylaşılan içerikler, kullanıcıların kendi
						sorumluluğundadır. Tariflerin doğruluğu ve
						uygulanabilirliği konusunda Tattamam garanti vermez.
					</p>
					<p>
						Fikri mülkiyet hakları kapsamında, Tattamam üzerinde yer
						alan logolar, tasarımlar ve özel yazılımlar izinsiz
						kopyalanamaz veya ticari amaçla kullanılamaz.
						Kullanıcılar tarafından yüklenen içeriklerin telif
						hakları, paylaşım esnasında belirlenen lisans
						koşullarına tabidir.
					</p>
				</div>
			</div>

			<div className={areaContainerClass}>
				<h2 className={headerClass}>Çerez Politikası</h2>
				<div className={textContainerClass}>
					<p>
						Size daha iyi bir deneyim sunabilmek için çerezleri
						(cookies) kullanıyoruz. Bu küçük veri dosyaları, site
						içi tercihlerinizi hatırlamamıza ve platformumuzu nasıl
						kullandığınızı analiz ederek geliştirmemize yardımcı
						olur.
					</p>

					<div className={cookieContainerClass}>
						<input
							id="cookie-required"
							type="checkbox"
							checked={zorunluChecked}
							className={cookieInputClass}
							disabled
							readOnly
						/>
						<div>
							<label
								htmlFor="cookie-required"
								className={cookieLabelClass}
							>
								Zorunlu Çerezler
							</label>
							<p className={cookieDescriptionClass}>
								Sitenin temel fonksiyonlarının çalışması için
								gereklidir.
							</p>
						</div>
					</div>

					<div className={cookieContainerClass}>
						<input
							id="cookie-analytics"
							type="checkbox"
							checked={analizChecked}
							onChange={(e) => setAnalizChecked(e.target.checked)}
							className={`${cookieInputClass} cursor-pointer`}
						/>
						<div>
							<label
								htmlFor="cookie-analytics"
								className={cookieLabelClass}
							>
								Analiz Çerezleri
							</label>
							<p className={cookieDescriptionClass}>
								Ziyaretçi trafiğini anlamamıza ve performansı
								ölçmemize yarar.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

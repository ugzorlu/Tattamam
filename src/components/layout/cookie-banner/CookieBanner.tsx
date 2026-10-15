/* =============================================================================
                           Cookie Banner                            
============================================================================= */
/**
 * @fileoverview Displays a compact cookie notice with mandatory and optional
 * analytics preferences.
 *
 * NOTE(ARCHITECTURE):
 * Each preference is associated with a visible label, and the analytics
 * checkbox is controlled so its checked state always matches the UI.
 *
 * TODO:
 * Purely presentational at the moment. Business logic will be implemented.
 */
"use client"

/* === Imports ============================================================= */
/* --- Externals --- */
import Link from "next/link"
import React from "react"

/* === Main Component ======================================================= */
export default function CookieBanner() {
	/* ── States ────────────────────────────────────────────────────────────── */
	const [visible, setVisible] = React.useState(true)
	const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true)

	/* ─── Class Aggregates ─────────────────────────────────────────────────── */
	const classes = {
		banner: [
			"sticky bottom-0 z-50 w-full bg-surface-container-lowest/95",
			"backdrop-blur-md border-t border-surface-container-highest",
			"shadow-[0_-4px_20px_rgba(44,42,38,0.06)]",
			"transition-all duration-300",
		].join(" "),
		container: [
			"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
			"py-2.5 sm:py-3",
		].join(" "),
		layout: [
			"flex flex-col lg:flex-row items-center justify-between",
			"gap-3 lg:gap-6",
		].join(" "),
		intro: ["flex items-center gap-3 w-full lg:w-auto flex-1 min-w-0"].join(
			" ",
		),
		iconWrap: [
			"shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-fixed",
			"text-primary flex items-center justify-center p-1.5",
			"border border-primary-fixed-dim shadow-sm",
		].join(" "),
		icon: "w-full h-full",
		copy: "text-xs sm:text-sm text-on-surface leading-snug",
		lead: [
			"font-headline font-bold text-sm sm:text-base text-on-surface mr-1",
		].join(" "),
		bodyDesktop: "text-on-surface-variant hidden sm:inline",
		bodyMobile: "text-on-surface-variant sm:hidden",
		policyLink: [
			"inline-flex items-center text-primary hover:text-primary",
			"font-semibold ml-1 underline decoration-primary/40",
			"underline-offset-2 hover:decoration-primary transition-colors",
			"text-xs sm:text-sm",
		].join(" "),
		controls: [
			"flex flex-wrap sm:flex-nowrap items-center justify-center",
			"sm:justify-end gap-3 w-full lg:w-auto flex-shrink-0 pt-2",
			"lg:pt-0 border-t lg:border-t-0 border-surface-container-high",
		].join(" "),
		options: "flex items-center gap-4 sm:gap-5 text-xs text-on-surface",
		toggleWrap: "relative inline-block w-8 h-4 align-middle select-none",
		essentialInput: [
			"absolute block w-4 h-4 rounded-full bg-primary border-2",
			"border-primary appearance-none cursor-not-allowed right-0",
		].join(" "),
		disabledTrack: [
			"block overflow-hidden h-4 rounded-full bg-primary-fixed-dim",
			"cursor-not-allowed",
		].join(" "),
		optionLabel: [
			"flex items-center gap-2 cursor-default select-none group",
		].join(" "),
		essentialText: "flex flex-col",
		optionTitle: [
			"flex items-center gap-1 font-medium text-on-surface",
			"text-[12px] sm:text-[13px]",
		].join(" "),
		activeBadge: [
			"text-[10px] uppercase font-semibold text-primary",
			"bg-primary-fixed px-1 py-0.2 rounded tracking-wider",
		].join(" "),
		analyticsLabel: [
			"flex items-center gap-2 cursor-pointer select-none group",
		].join(" "),
		analyticsInput: [
			"toggle-checkbox peer absolute block w-4 h-4 rounded-full",
			"bg-white border-2 border-outline-variant appearance-none",
			"cursor-pointer transition-all duration-200 left-0",
			"checked:left-auto checked:right-0 checked:border-primary",
			"checked:bg-primary shadow-sm",
		].join(" "),
		analyticsTrack: [
			"toggle-label block overflow-hidden h-4 rounded-full",
			"bg-surface-container-high peer-checked:bg-primary-fixed-dim",
			"transition-colors duration-200 cursor-pointer",
		].join(" "),
		analyticsText: [
			"font-medium text-on-surface text-[12px] sm:text-[13px]",
			"group-hover:text-primary transition-colors",
		].join(" "),
		divider: "hidden sm:block h-5 w-px bg-outline-variant/60 mx-1",
		actions: [
			"flex items-center gap-2 w-full sm:w-auto justify-center md:justify-end",
		].join(" "),
		rejectButton: [
			"px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold",
			"text-on-surface-variant hover:text-on-surface",
			"bg-surface-container-low hover:bg-surface-container",
			"border border-outline-variant/80 transition-all",
			"active:scale-95 whitespace-nowrap cursor-pointer",
		].join(" "),
		acceptButton: [
			"px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold",
			"text-on-primary bg-primary hover:bg-primary shadow-sm hover:shadow",
			"transition-all active:scale-95 whitespace-nowrap",
			"flex items-center gap-1.5 cursor-pointer",
		].join(" "),
		acceptIcon: "w-3.5 h-3.5",
	}

	/* ── Early Return ──────────────────────────────────────────────────────── */
	if (!visible) return null

	/* ── Render ────────────────────────────────────────────────────────────── */
	return (
		<aside id="tattamam-cookie-banner" className={classes.banner}>
			<div className={classes.container}>
				<div className={classes.layout}>
					{/* Cookie illustration, notice, and policy link. */}
					<div className={classes.intro}>
						<div className={classes.iconWrap}>
							<svg
								viewBox="0 0 48 48"
								fill="none"
								className={classes.icon}
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d={[
										"M24 4C12.954 4 4 12.954 4 24c0 11.046",
										"8.954 20 20 20 9.845 0 18.04-7.11",
										"19.72-16.48-1.52.31-3.09.48-4.72.48",
										"-8.284 0-15-6.716-15-15 0-3.32.99-6.4",
										"2.82-8.98C25.75 4.01 24.88 4 24 4z",
									].join(" ")}
									fill="#E89262"
								/>
								<path
									d={[
										"M24 6C14.059 6 6 14.059 6 24s8.059 18",
										"18 18c8.89 0 16.27-6.46 17.75-15-1.54",
										".34-3.14.5-4.75.5-9.39 0-17-7.61-17-17",
										"0-1.61.16-3.21.5-4.75C28.64 6.78",
										"26.39 6 24 6z",
									].join(" ")}
									fill="#F4A574"
								/>
								<circle
									cx="15.5"
									cy="18.5"
									r="2.5"
									fill="#6A3B20"
								/>
								<circle
									cx="21.5"
									cy="28.5"
									r="3"
									fill="#6A3B20"
								/>
								<circle cx="14" cy="31" r="2" fill="#6A3B20" />
								<circle
									cx="30"
									cy="33"
									r="2.5"
									fill="#6A3B20"
								/>
								<circle cx="25" cy="15" r="2" fill="#6A3B20" />
								<circle
									cx="10"
									cy="24"
									r="0.8"
									fill="#FFF3E8"
								/>
								<circle
									cx="19"
									cy="22"
									r="0.8"
									fill="#FFF3E8"
								/>
								<circle
									cx="27"
									cy="25"
									r="0.8"
									fill="#FFF3E8"
								/>
							</svg>
						</div>

						<div className={classes.copy}>
							<span className={classes.lead}>
								Tariflerimiz kadar lezzetli bir deneyim için:
							</span>
							<span className={classes.bodyDesktop}>
								Size özel tarif önerileri sunabilmek için
								çerezleri (cookies) kullanıyoruz.
							</span>
							<span className={classes.bodyMobile}>
								Daha iyi bir site deneyimi için çerezleri
								(cookies) kullanıyoruz.
							</span>
							<Link
								href="/bilgi/?tab=legal"
								className={classes.policyLink}
							>
								Çerez Politikası
							</Link>
						</div>
					</div>

					{/* Cookie preferences and confirmation actions. */}
					<div className={classes.controls}>
						<div className={classes.options}>
							{/* Essential cookies are required and cannot be disabled. */}
							<label
								className={classes.optionLabel}
								title="Web sitesinin temel işlevleri için zorunludur"
							>
								<div className={classes.toggleWrap}>
									<input
										type="checkbox"
										checked
										readOnly
										aria-label="Zorunlu çerezler"
										className={classes.essentialInput}
									/>
									<span className={classes.disabledTrack} />
								</div>
								<div className={classes.essentialText}>
									<div className={classes.optionTitle}>
										<span>Zorunlu</span>
										<span className={classes.activeBadge}>
											Aktif
										</span>
									</div>
								</div>
							</label>

							{/* Analytics consent is optional and can be toggled. */}
							<label
								htmlFor="cookie-analytics-toggle"
								className={classes.analyticsLabel}
								title="Ziyaret istatistikleri ve tarif analitiği için"
							>
								<div className={classes.toggleWrap}>
									<input
										type="checkbox"
										id="cookie-analytics-toggle"
										checked={analyticsEnabled}
										onChange={(event) =>
											setAnalyticsEnabled(
												event.currentTarget.checked,
											)
										}
										className={classes.analyticsInput}
									/>
									<span className={classes.analyticsTrack} />
								</div>
								<span className={classes.analyticsText}>
									Analiz
								</span>
							</label>
						</div>

						<div className={classes.divider} aria-hidden="true" />

						<div className={classes.actions}>
							<button
								type="button"
								onClick={() => setVisible(false)}
								className={classes.rejectButton}
							>
								Yalnızca Zorunlular
							</button>
							<button
								type="button"
								onClick={() => setVisible(false)}
								className={classes.acceptButton}
							>
								<span>Hepsini Kabul Et</span>
								<svg
									className={classes.acceptIcon}
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d={[
											"M16.707 5.293a1 1 0 010 1.414l-8 8a1",
											"1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414",
											"L8 12.586l7.293-7.293a1 1 0 011.414 0z",
										].join(" ")}
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</aside>
	)
}

/**
 * ============================================================================
 * 						Security Panel for Profile Page
 * ============================================================================
 *
 * @fileoverview
 * Provides the account security panel used on the authenticated profile page.
 *
 * FEATURE(S):
 * - password update workflow
 * - session termination through a styled logout control
 *
 * NOTE(ARCHITECTURE):
 * - Client-side form handling with React hooks.
 * - Uses Next.js server actions for password updates and logout flows.
 * - Displays success and error messages based on server response.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useTransition } from "react"

/* --- Actions --- */
import { logoutAction, updatePasswordAction } from "@/app/actions/auth"

/* --- Assets --- */
import { ShieldCheckIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import {
	LockClosedIcon,
	ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/solid"

/* === Main Component ======================================================= */
export default function SecurityPanel() {
	/* ─── States ─────────────────────────────────────────────────────────── */
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string>("")
	const [successMsg, setSuccessMsg] = useState<string>("")
	const [logoutMsg, setLogoutMsg] = useState<string>("")
	const [logoutError, setLogoutError] = useState<string>("")

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	/**
	 * Submits the password update form and surfaces server feedback.
	 *
	 * @param e - Password update form submission event.
	 * @returns Promise<void>.
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError("")
		setSuccessMsg("")
		setLogoutMsg("")
		setLogoutError("")

		const formData = new FormData(e.currentTarget)

		startTransition(async () => {
			const res = await updatePasswordAction({}, formData)

			if (res.error) {
				setError(res.error)
			} else if (res.success) {
				setSuccessMsg(res.message || "Şifre güncellendi.")
				e.currentTarget?.reset()
			}
		})
	}

	/**
	 * Cleans up the current session by calling the logout server action and
	 * redirects the browser to the homepage once the server clears the auth
	 * cookies.
	 *
	 * @returns Promise<void>.
	 */
	const handleLogout = async () => {
		setError("")
		setSuccessMsg("")
		setLogoutMsg("")
		setLogoutError("")

		startTransition(async () => {
			const res = await logoutAction({}, new FormData())

			if (res.error) {
				setLogoutError(res.error)
				return
			}

			setLogoutMsg(res.message || "Oturum kapatıldı.")
			window.location.assign("/")
		})
	}

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const containerClass = [
		"bg-surface-container-high rounded-xl p-6",
		"border border-outline-variant/30 sticky top-6",
	].join(" ")

	const h2Class = [
		"mb-6 flex items-center gap-2",
		"text-[24px] text-on-surface",
		"font-headline-lg leading-[1.3] font-medium",
	].join(" ")

	const labelClass = [
		"font-label-md text-[14px] leading-[1.2] font-semibold",
		"text-on-surface-variant ml-1",
	].join(" ")

	const inputClass = [
		"w-full bg-surface-container-lowest border border-outline-variant",
		"focus:border-secondary focus:ring-0 rounded-lg p-3 text-[16px]",
		"leading-[1.6] transition-colors",
	].join(" ")

	const btnClass = [
		"w-full bg-primary-container text-white py-4 rounded-xl",
		"font-label-md text-[16px] leading-[1.6] font-semibold",
		"hover:bg-primary transition-all duration-300 transform",
		"active:scale-95 shadow-md hover:shadow-lg mt-4 flex",
		"items-center justify-center gap-2 disabled:opacity-70",
		"cursor-pointer",
	].join(" ")

	const logoutBtnClass = [
		"w-full border border-outline-variant/60 bg-surface-container-lowest",
		"text-on-surface py-3 rounded-xl font-label-md text-[16px]",
		"leading-[1.6] font-semibold hover:bg-surface-container",
		"transition-all duration-300 active:scale-95 shadow-sm",
		"hover:shadow-md mt-4 flex items-center justify-center gap-2",
		"disabled:opacity-70 cursor-pointer",
	].join(" ")

	const errorBox = [
		"mb-4 rounded-xl bg-error-container p-3 text-[16px]",
		"leading-[1.6] text-on-error-container",
	].join(" ")

	const successBox = [
		"mb-4 rounded-xl bg-secondary-container p-3 text-[16px]",
		"leading-[1.6] text-on-secondary-container",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className={containerClass}>
			<h2 className={h2Class}>
				<ShieldCheckIcon className="size-5 text-primary" />
				Hesap Güvenliği
			</h2>

			{error && <div className={errorBox}>{error}</div>}
			{successMsg && <div className={successBox}>{successMsg}</div>}
			{logoutError && <div className={errorBox}>{logoutError}</div>}
			{logoutMsg && <div className={successBox}>{logoutMsg}</div>}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-1">
					<label className={labelClass} htmlFor="currentPassword">
						Mevcut Şifre
						<input
							className={inputClass}
							id="currentPassword"
							name="currentPassword"
							placeholder="••••••••"
							type="password"
							autoComplete="off"
							required
						/>
					</label>
				</div>
				<div className="space-y-1">
					<label className={labelClass} htmlFor="newPassword">
						Yeni Şifre
						<input
							className={inputClass}
							id="newPassword"
							name="newPassword"
							placeholder="••••••••"
							type="password"
							autoComplete="off"
							required
						/>
					</label>
				</div>
				<div className="space-y-1">
					<label className={labelClass} htmlFor="confirmPassword">
						Yeni Şifre (Tekrar)
						<input
							className={inputClass}
							id="confirmPassword"
							name="confirmPassword"
							placeholder="••••••••"
							type="password"
							autoComplete="off"
							required
						/>
					</label>
				</div>
				<button className={btnClass} type="submit" disabled={isPending}>
					{isPending ? "İşleniyor..." : "Şifreyi Güncelle"}
					{!isPending && <LockClosedIcon className="size-4" />}
				</button>
			</form>

			<button
				className={logoutBtnClass}
				type="button"
				onClick={handleLogout}
				disabled={isPending}
			>
				Oturumu Kapat
				<ArrowRightEndOnRectangleIcon className="size-4" />
			</button>

			<div className="mt-6 pt-6 border-t border-outline-variant/30">
				<h4
					className="font-label-md text-[14px] leading-[1.2]
					font-semibold text-on-surface-variant uppercase
					tracking-wider mb-2"
				>
					Güvenlik Önerileri
				</h4>
				<ul className="text-sm text-on-surface-variant space-y-2">
					<li className="flex items-start gap-2">
						<CheckCircleIcon className="size-5 text-secondary" />
						En az 8 karakter kullanın.
					</li>
					<li className="flex items-start gap-2">
						<CheckCircleIcon className="size-5 text-secondary" />
						Başka sitelerde kullanmadığınız bir şifre seçin.
					</li>
				</ul>
			</div>
		</div>
	)
}

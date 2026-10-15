"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

/* --- Actions --- */
import { confirmEmailAction } from "@/app/actions/auth"

/* === Types ================================================================ */
type VerificationStatus = "loading" | "success" | "error"

/* --- Assets --- */
import { ArrowPathIcon } from "@heroicons/react/24/solid"

/* === Main Component ======================================================= */
export default function VerifyPageClient() {
	/* ─── References ─────────────────────────────────────────────────────── */
	const verifiedTokenRef = useRef<string | null>(null)

	/* ─── Hooks ──────────────────────────────────────────────────────────── */
	const searchParams = useSearchParams()
	const token = searchParams.get("token")
	const hasToken = Boolean(token)

	/* ─── States ─────────────────────────────────────────────────────────── */
	// Initialize the UI from the current token so the first render
	// stays stable before the async verification starts.
	const [status, setStatus] = useState<VerificationStatus>(() =>
		hasToken ? "loading" : "error",
	)
	const [message, setMessage] = useState(() =>
		hasToken ? "Doğrulanıyor..." : "Geçersiz veya eksik token.",
	)

	/* ─── Effects ────────────────────────────────────────────────────────── */
	useEffect(() => {
		if (!token) {
			return
		}

		// React Strict Mode can run effects twice in development.
		// Guard the request so the same token is not verified twice.
		if (verifiedTokenRef.current === token) {
			return
		}

		verifiedTokenRef.current = token
		let isActive = true

		// Keep the verification request scoped to the active token so
		// a stale response cannot overwrite a newer request.
		const verifyEmail = async () => {
			try {
				const res = await confirmEmailAction(token)

				if (!isActive) {
					return
				}

				if (res.error) {
					setStatus("error")
					setMessage(res.error)
				} else {
					setStatus("success")
					setMessage(
						res.message ||
							"E-posta adresiniz başarıyla doğrulandı.",
					)
				}
			} catch {
				if (!isActive) {
					return
				}

				setStatus("error")
				setMessage("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
			}
		}

		void verifyEmail()

		return () => {
			isActive = false
		}
	}, [token])

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const containerClass = [
		"w-full max-w-md rounded-2xl p-8 text-center",
		"organic-shadow bg-surface-container-lowest",
	].join(" ")

	const headerClass = "mb-4 text-headline-md font-headline-md text-on-surface"

	const loadingIconClass = "text-primary align-middle mr-2 animate-spin"

	const messageClass = [
		"mb-6 rounded-xl bg-error-container p-4",
		"text-body-md text-on-error-container",
	].join(" ")

	const backLinkClass = [
		"inline-flex rounded-full bg-primary px-6 py-3",
		"text-label-md text-on-primary transition-opacity",
		"hover:opacity-90 cursor-pointer",
	].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className={containerClass}>
				<h1 className={headerClass}>E-posta Doğrulama</h1>

				{status === "loading" && (
					<div className="text-body-lg text-on-surface-variant">
						<span className={loadingIconClass}>
							<ArrowPathIcon className="size-4" />
						</span>
						{message}
					</div>
				)}

				{status === "error" && (
					<div className={messageClass}>{message}</div>
				)}

				{status === "success" && (
					<div className={messageClass}>{message}</div>
				)}

				<div className="mt-8">
					<Link href="/" className={backLinkClass}>
						Ana Sayfaya Dön
					</Link>
				</div>
			</div>
		</div>
	)
}

"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { resetPasswordAction } from "@/app/actions/auth"
import Link from "next/link"

export default function ResetPasswordPageClient() {
	const searchParams = useSearchParams()
	const token = searchParams.get("token")
	const [isPending, startTransition] = useTransition()
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
	const [message, setMessage] = useState("")

	if (!token) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 organic-shadow text-center">
					<div className="mb-6 rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
						Geçersiz veya eksik token. Lütfen şifre sıfırlama
						bağlantınızı kontrol edin.
					</div>
					<Link
						href="/"
						className="inline-flex rounded-full bg-primary px-6 py-3 text-label-md text-on-primary transition-opacity hover:opacity-90 cursor-pointer"
					>
						Ana Sayfaya Dön
					</Link>
				</div>
			</div>
		)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setStatus("idle")
		setMessage("")

		const formData = new FormData(e.currentTarget)
		const password = formData.get("password") as string
		const confirmPassword = formData.get("confirmPassword") as string

		if (password !== confirmPassword) {
			setStatus("error")
			setMessage("Şifreler eşleşmiyor.")
			return
		}

		if (password.length < 8) {
			setStatus("error")
			setMessage("Şifre en az 8 karakter olmalıdır.")
			return
		}

		startTransition(async () => {
			// Append token to formData or just pass it in action
			const data = new FormData()
			data.append("password", password)
			data.append("token", token)

			const res = await resetPasswordAction({}, data)
			if (res.error) {
				setStatus("error")
				setMessage(res.error)
			} else if (res.success) {
				setStatus("success")
				setMessage(res.message || "Şifreniz başarıyla sıfırlandı.")
			}
		})
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 organic-shadow">
				<h1 className="mb-6 text-center text-headline-md font-headline-md text-on-surface">
					Yeni Şifre Belirle
				</h1>

				{status === "error" && (
					<div className="mb-6 rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
						{message}
					</div>
				)}

				{status === "success" ? (
					<div className="text-center">
						<div className="mb-6 rounded-xl bg-primary-container p-4 text-body-md text-on-primary-container">
							{message}
						</div>
						<Link
							href="/"
							className="inline-flex rounded-full bg-primary px-6 py-3 text-label-md text-on-primary transition-opacity hover:opacity-90 cursor-pointer"
						>
							Giriş Yapmak İçin Ana Sayfaya Dön
						</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<input
							type="password"
							name="password"
							placeholder="Yeni Şifre"
							className="
								w-full rounded-full border border-outline-variant/40
								bg-surface px-5 py-4 outline-none focus:border-primary
							"
							required
							autoComplete="off"
							minLength={8}
						/>
						<input
							type="password"
							name="confirmPassword"
							placeholder="Yeni Şifreyi Onayla"
							className="
								w-full rounded-full border border-outline-variant/40
								bg-surface px-5 py-4 outline-none focus:border-primary
							"
							required
							autoComplete="off"
							minLength={8}
						/>
						<button
							type="submit"
							disabled={isPending}
							className="
								mt-4 w-full rounded-full bg-primary px-5 py-4 text-label-md text-on-primary
								transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50
							"
						>
							{isPending ? "Kaydediliyor..." : "Şifreyi Kaydet"}
						</button>
					</form>
				)}
			</div>
		</div>
	)
}

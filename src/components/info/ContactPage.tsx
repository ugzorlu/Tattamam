/* =============================================================================
                     	        Contact Page
============================================================================= */
/**
 * @fileoverview
 * Contact page with public contact details and a feedback submission form.
 *
 * FLOW:
 * The form keeps input state locally and sends values to the server action.
 * A successful response clears the form and shows a submission receipt.
 *
 * NOTE(ARCHITECTURE):
 * Client component because it needs controlled inputs and state.
 * Database access remains behind the server action boundary.
 *
 * INFO(FRAMEWORK):
 * Uses React state and a Next.js Server Action. The action handles durable
 * persistence; this component handles interaction and presentation only.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, type SubmitEvent } from "react"

/* --- Actions --- */
import { addFeedbackAction } from "@/app/actions/feedback"

/* --- Assets --- */
import { EnvelopeIcon, HomeModernIcon } from "@heroicons/react/24/solid"

/* === Main Component ======================================================= */
export default function ContactPage() {
	/* ─── States ─────────────────────────────────────────────────────────── */
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [message, setMessage] = useState("")
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle")

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		setStatus("loading")

		const result = await addFeedbackAction({ name, email, message })

		if ("error" in result) {
			setStatus("error")
			alert(result.error)
			return
		}

		setStatus("success")
		setName("")
		setEmail("")
		setMessage("")
	}

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const contactIcon = [
		"flex items-center justify-center",
		"w-12 h-12 rounded-full",
		"text-primary bg-primary-container/20",
		"group-hover:scale-110 transition-transform",
	].join(" ")

	const socialLinkClass = [
		"flex items-center justify-center",
		"w-10 h-10 rounded-full border border-outline",
		"text-on-surface-variant",
		"hover:bg-primary hover:text-white hover:border-primary transition-all",
	].join(" ")

	const fieldClass = [
		"w-full border border-outline rounded-lg px-4 py-3",
		"text-on-surface bg-surface placeholder-on-surface-variant/50",
		"focus:ring-2 focus:ring-secondary/20 focus:border-secondary",
		"transition-all outline-none",
	].join(" ")

	const submitButtonClass = [
		"flex items-center justify-center",
		"w-full gap-2 py-4 rounded-xl",
		"text-white font-label text-label-md",
		"bg-primary-container hover:bg-primary",
		"transition-all active:scale-[0.98] shadow-md cursor-pointer",
	].join(" ")

	const locationTextClass = "font-label text-label-md text-on-surface"

	const successTitleClass = "font-headline text-headline-md text-primary"
	const successTextClass = "font-body text-body-md text-on-surface-variant"

	const loadingTextClass = [
		"w-5 h-5 rounded-full",
		"border-2 border-white border-t-transparent",
		"animate-spin",
	].join(" ")

	/* ── Render ──────────────────────────────────────────────────────────── */
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
			<div className="space-y-6">
				<h2 className="font-headline text-headline-xl text-primary">
					Bize Ulaşın
				</h2>
				<p className="font-body text-body-lg text-on-surface-variant">
					Bir sorunuz mu var? Yoksa sadece bir yemek hikayesini mi
					paylaşmak istiyorsunuz? Ekibimiz sizinle tanışmaktan
					memnuniyet duyar.
				</p>
				<div className="flex flex-col gap-4 mt-8">
					<div className="flex items-center gap-4 group">
						<div className={contactIcon}>
							<EnvelopeIcon className="size-4" />
						</div>
						<a
							className={
								"font-label text-label-md text-on-surface " +
								"hover:text-primary transition-colors"
							}
							href="mailto:admin@tattamam.com"
						>
							admin@tattamam.com
						</a>
					</div>
					<div className="flex items-center gap-4 group">
						<div className={contactIcon}>
							<HomeModernIcon className="size-4" />
						</div>
						<span className={locationTextClass}>
							İzmir, Türkiye
						</span>
					</div>
				</div>
				<div className="flex gap-4 mt-8">
					<a
						className={socialLinkClass}
						href="https://instagram.com/tat_tamam"
						aria-label="Instagram"
					>
						<svg
							className="w-5 h-5 fill-current"
							viewBox="0 0 24 24"
						>
							<path
								d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062
								2.633.332 3.608 1.308.975.975 1.245 2.242 1.308
								3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07
								4.85c-.063 1.366-.333 2.633-1.308
								3.608-.975.975-2.242 1.245-3.608
								1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.063-1.366.333-2.633
								1.308-3.608.975-.975 2.242-1.245 3.608-1.308
								1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259
								0-3.667.014-4.947.072-1.28.058-2.152.262-2.917.559a6.077
								6.077 0 0 0-2.195 1.43 6.077 6.077 0 0 0-1.43
								2.195c-.297.765-.501 1.637-.559 2.917-.058
								1.28-.072 1.688-.072 4.947s.014 3.667.072
								4.947c.058 1.28.262 2.152.559 2.917a6.077 6.077
								0 0 0 1.43 2.195 6.077 6.077 0 0 0 2.195
								1.43c.765.297 1.637.501 2.917.559 1.28.058
								1.688.072 4.947.072s3.667-.014
								4.947-.072c1.28-.058 2.152-.262 2.917-.559a6.077
								6.077 0 0 0 2.195-1.43 6.077 6.077 0 0 0
								1.43-2.195c.297-.765.501-1.637.559-2.917.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.28-.262-2.152-.559-2.917a6.077
								6.077 0 0 0-1.43-2.195 6.077 6.077 0 0
								0-2.195-1.43c-.765-.297-1.637-.501-2.917-.559-1.28-.058-1.688-.072-4.947-.072z"
							></path>
							<path
								d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162
								6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4
								0 0 1 0 8z"
							></path>
							<path
								d="M18.406 4.14a1.44 1.44 0 1 1 0 2.88 1.44
								1.44 0 0 1 0-2.88z"
							></path>
						</svg>
					</a>

					<a
						className={socialLinkClass}
						href="https://x.com/tat_tamam"
						aria-label="X (Twitter)"
					>
						<svg
							className="w-5 h-5 fill-current"
							viewBox="0 0 24 24"
						>
							<path
								d="M18.244 2.25h3.308l-7.227 8.26 8.502
								11.24H16.17l-5.214-6.817L4.99
								21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713
								6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
							></path>
						</svg>
					</a>

					<a
						className={socialLinkClass}
						href="https://facebook.com/tattamam"
						aria-label="Facebook"
					>
						<svg
							className="w-5 h-5 fill-current"
							viewBox="0 0 24 24"
						>
							<path
								d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12
							12c0 5.99 4.388 10.954 10.125
							11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007
							1.792-4.669 4.533-4.669 1.312 0 2.686.235
							2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956
							1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612
							23.027 24 18.062 24 12.073z"
							></path>
						</svg>
					</a>
				</div>
			</div>

			<div
				className={
					"bg-surface-container shadow-sm p-8 rounded-2xl " +
					"border border-outline-variant"
				}
			>
				{status === "success" ? (
					<div className="text-center py-12 space-y-4">
						<h3 className={successTitleClass}>Teşekkürler!</h3>
						<p className={successTextClass}>
							Mesajınız başarıyla iletildi. En kısa sürede dönüş
							yapacağız.
						</p>
						<button
							type="button"
							onClick={() => setStatus("idle")}
							className={submitButtonClass}
						>
							Yeni Mesaj Gönder
						</button>
					</div>
				) : (
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<label
								className={
									"block font-label text-label-md mb-2 " +
									"text-on-surface"
								}
							>
								Adınız
							</label>
							<input
								className={fieldClass}
								placeholder="İsminizi buraya yazın"
								type="text"
								value={name}
								onChange={(event) =>
									setName(event.target.value)
								}
								required
							/>
						</div>
						<div>
							<label
								className={
									"block font-label text-label-md mb-2 " +
									"text-on-surface"
								}
							>
								E-postanız
							</label>
							<input
								className={fieldClass}
								placeholder="ornek@mail.com"
								type="email"
								value={email}
								onChange={(event) =>
									setEmail(event.target.value)
								}
								required
							/>
						</div>
						<div>
							<label
								className={
									"block font-label text-label-md mb-2 " +
									"text-on-surface"
								}
							>
								Mesajınız
							</label>
							<textarea
								className={fieldClass + " resize-none"}
								placeholder="Düşüncelerinizi paylaşın..."
								rows={4}
								value={message}
								onChange={(event) =>
									setMessage(event.target.value)
								}
								required
							></textarea>
						</div>
						<button
							className={submitButtonClass}
							type="submit"
							disabled={status === "loading"}
						>
							{status === "loading" ? (
								<>
									<span className={loadingTextClass}></span>
									Gönderiliyor...
								</>
							) : (
								"Gönder"
							)}
						</button>
					</form>
				)}
			</div>
		</div>
	)
}

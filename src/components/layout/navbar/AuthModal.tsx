/* =============================================================================
                                Auth Modal
============================================================================= */
/**
 * @fileoverview
 * Standalone authentication modal extracted from AuthOverlay.
 *
 * PURPOSE:
 * Encapsulates all form state (mode, errors, transitions) so it can
 * be independently rendered from both the Navbar (AuthOverlay) and
 * the FloatingActionPanel without duplicating logic.
 *
 * PROPS:
 * – isOpen   : controls backdrop visibility
 * – onClose  : called when backdrop click or Escape key fires
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useCallback, useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

/* --- Actions --- */
import { registerAction, forgotPasswordAction } from "@/app/actions/auth"

/* --- Assets --- */
import { XMarkIcon } from "@heroicons/react/24/solid"

/* === Types ================================================================ */
type AuthMode = "login" | "register" | "forgotPassword"

export interface AuthModalProps {
	isOpen: boolean
	onClose: () => void
}

/* === Helpers ============================================================== */
function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null
	const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
	return match ? match[2] : null
}

function setCookie(name: string, value: string, days = 30): void {
	if (typeof document === "undefined") return
	const date = new Date()
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
	document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`
}

/* === Main Component ======================================================= */
export function AuthModal({
	isOpen,
	onClose,
}: AuthModalProps): React.ReactElement {
	/* ─── Hooks ──────────────────────────────────────────────────────────── */
	/**
	 * Next.js App Router navigation controller.
	 *
	 * Provides imperative routing methods such as push(), replace(), back(),
	 * and refresh() for programmatic navigation inside Client Components.
	 */
	const router = useRouter()

	/* ─── States ─────────────────────────────────────────────────────────── */
	const [mode, setMode] = useState<AuthMode>("register")

	const [error, setError] = useState("")
	const [successMsg, setSuccessMsg] = useState("")
	const [isPending, startTransition] = useTransition()
	const [rememberMe, setRememberMe] = useState(false)

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	const clearMessages = useCallback((): void => {
		setError("")
		setSuccessMsg("")
	}, [])

	const handleModeChange = useCallback(
		(next: AuthMode): void => {
			setMode(next)
			setCookie("auth_overlay_mode", next)
			clearMessages()
		},
		[clearMessages],
	)

	const handleLoginSubmit = async (
		e: React.SyntheticEvent<HTMLFormElement>,
	): Promise<void> => {
		e.preventDefault()
		clearMessages()
		const fd = new FormData(e.currentTarget)
		const username = fd.get("username") as string
		const password = fd.get("password") as string

		if (username.trim().length < 3) {
			setError("Kullanıcı adı en az 3 karakter olmalıdır.")
			return
		}
		if (password.length < 8) {
			setError("Şifre en az 8 karakter olmalıdır.")
			return
		}

		startTransition(async () => {
			const res = await signIn("credentials", {
				username,
				password,
				redirect: false,
			})
			if (res?.error) {
				setError(res.error)
			} else {
				router.refresh()
			}
		})
	}

	const handleRegSubmit = async (
		e: React.SyntheticEvent<HTMLFormElement>,
	): Promise<void> => {
		e.preventDefault()
		clearMessages()
		const fd = new FormData(e.currentTarget)
		startTransition(async () => {
			const state = await registerAction({}, fd)
			if (state.error) {
				setError(state.error)
			} else if (state.success) {
				setSuccessMsg(state.message ?? "Kayıt başarılı!")
				// handleModeChange("login")
			}
		})
	}

	const handleForgotSubmit = async (
		e: React.SyntheticEvent<HTMLFormElement>,
	): Promise<void> => {
		e.preventDefault()
		clearMessages()
		const fd = new FormData(e.currentTarget)
		startTransition(async () => {
			const state = await forgotPasswordAction({}, fd)
			if (state.error) {
				setError(state.error)
			} else if (state.success) {
				setSuccessMsg(state.message ?? "E-posta gönderildi.")
			}
		})
	}

	/* ─── Effects ────────────────────────────────────────────────────────── */
	useEffect(() => {
		if (typeof document === "undefined") return

		const saved = getCookie("auth_overlay_mode")
		if (
			saved === "login" ||
			saved === "register" ||
			saved === "forgotPassword"
		) {
			const frame = window.requestAnimationFrame(() => {
				setMode(saved)
			})

			return () => window.cancelAnimationFrame(frame)
		}
	}, [])

	useEffect(() => {
		if (!isOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = "hidden"
		const onKey = (ev: KeyboardEvent) => {
			if (ev.key === "Escape") onClose()
		}
		window.addEventListener("keydown", onKey)
		return () => {
			document.body.style.overflow = prev
			window.removeEventListener("keydown", onKey)
		}
	}, [isOpen, onClose])

	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const backdropCls = [
		"fixed inset-0 z-50 bg-surface/60",
		"transition-all duration-300",
		"opacity-0 pointer-events-none invisible",
		"data-[open=true]:opacity-100",
		"data-[open=true]:pointer-events-auto",
		"data-[open=true]:visible",
		isOpen ? "backdrop-blur-md" : "",
	].join(" ")

	const wrapperCls = [
		"flex min-h-screen items-center justify-center p-4",
		"transition-transform duration-300 translate-y-4",
		"data-[open=true]:translate-y-0",
	].join(" ")

	const modalCls = [
		"bg-surface shadow-2xl rounded-xl w-full max-w-[480px]",
		"overflow-hidden flex flex-col relative",
		"border border-outline-variant/30",
		"animate-in fade-in zoom-in duration-300",
	].join(" ")

	const labelCls = [
		"font-label-sm text-label-sm",
		"text-on-surface-variant uppercase tracking-wider",
	].join(" ")

	const inputCls = [
		"w-full bg-surface-container-lowest",
		"border border-outline-variant rounded-lg",
		"px-4 py-3 outline-none transition-all",
		"focus:ring-1 focus:ring-primary focus:border-primary",
		"font-body-md text-body-md",
	].join(" ")

	const submitCls = [
		"w-full bg-primary-container text-white",
		"font-label-md text-label-md py-4 rounded-full",
		"shadow-lg hover:brightness-110 active:scale-[0.98]",
		"transition-all flex items-center justify-center",
		"space-x-2 disabled:opacity-50 cursor-pointer",
	].join(" ")

	const tabCls = (active: boolean) =>
		[
			"flex-1 py-4 font-label-md text-label-md",
			"transition-all cursor-pointer",
			active
				? "text-primary border-primary border-b-2"
				: "text-on-surface-variant hover:text-primary",
		].join(" ")

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div
			// aria-hidden={!isOpen}
			data-open={isOpen}
			onClick={onClose}
			className={backdropCls}
		>
			<div
				data-open={isOpen}
				onClick={(e) => e.stopPropagation()}
				className={wrapperCls}
			>
				<div className={modalCls}>
					{/* Close button */}
					<div className="absolute top-4 right-4">
						<button
							type="button"
							onClick={onClose}
							className={[
								"text-on-surface cursor-pointer",
								"hover:text-primary",
							].join(" ")}
						>
							<XMarkIcon className="size-6" />
						</button>
					</div>

					{/* Branding */}
					<div className="pt-12 pb-4 px-10 text-center">
						<h2
							className={[
								"font-headline-lg text-headline-lg",
								"text-primary tracking-tight",
							].join(" ")}
						>
							Tattamam
						</h2>
						<p
							className={[
								"font-body-md text-body-md mt-2 italic",
								"text-on-surface-variant",
							].join(" ")}
						>
							❤︎Tam sana göre tarifler❤︎
						</p>
					</div>

					{/* Tabs */}
					<div
						className={[
							"flex px-10 border-b",
							"border-outline-variant/20",
						].join(" ")}
					>
						<button
							className={tabCls(mode === "login")}
							onClick={() => handleModeChange("login")}
						>
							Giriş
						</button>
						<button
							className={tabCls(mode === "register")}
							onClick={() => handleModeChange("register")}
						>
							Kayıt
						</button>
					</div>

					{/* Content */}
					<div className="px-8 py-4 space-y-6">
						{error && (
							<div
								className={[
									"rounded-xl bg-error-container p-3",
									"text-body-md text-on-error-container",
								].join(" ")}
							>
								{error}
							</div>
						)}
						{successMsg && (
							<div
								className={[
									"rounded-xl bg-primary-container p-3",
									"text-body-md text-on-primary-container",
								].join(" ")}
							>
								{successMsg}
							</div>
						)}

						{/* — Login — */}
						{mode === "login" && (
							<form
								onSubmit={handleLoginSubmit}
								className="space-y-4"
							>
								<div className="space-y-1">
									<label className={labelCls}>
										Kullanıcı Adı ya da E-posta
										<input
											name="username"
											type="text"
											placeholder="örnek_kullanıcı"
											className={inputCls}
											autoComplete="username"
											required
										/>
									</label>
								</div>

								<div className="space-y-1">
									<label className={labelCls}>
										Şifre
										<input
											name="password"
											type="password"
											placeholder="••••••••"
											className={inputCls}
											autoComplete="off"
											required
										/>
									</label>
								</div>

								<div className="flex justify-between pt-1">
									<label
										className={[
											"flex space-x-2 items-center group",
											"cursor-pointer",
										].join(" ")}
									>
										<input
											type="checkbox"
											checked={rememberMe}
											onChange={(e) =>
												setRememberMe(e.target.checked)
											}
											className={[
												"w-5 h-5 mt-0.5",
												"rounded-full shrink-0",
												"cursor-pointer transition-all",
												"form-checkbox",
												"accent-secondary",
											].join(" ")}
										/>
										<span
											className={[
												"font-label-md text-label-md",
												"text-on-surface-variant",
												"group-hover:text-on-surface",
											].join(" ")}
										>
											Beni Hatırla
										</span>
									</label>
									<button
										type="button"
										onClick={() =>
											handleModeChange("forgotPassword")
										}
										className={[
											"font-label-md",
											"text-label-md",
											"text-primary",
											"hover:underline cursor-pointer",
										].join(" ")}
									>
										Şifremi Unuttum
									</button>
								</div>

								<button
									type="submit"
									disabled={isPending}
									className={submitCls}
								>
									{isPending
										? "Giriş yapılıyor..."
										: "Giriş Yap"}
								</button>
							</form>
						)}

						{/* — Register — */}
						{mode === "register" && !successMsg && (
							<form
								onSubmit={handleRegSubmit}
								className="space-y-4"
							>
								<div className="space-y-1">
									<label className={labelCls}>
										E-posta
										<input
											name="email"
											type="email"
											placeholder="ornekeposta@email.com"
											className={inputCls}
											autoComplete="email"
											required
										/>
									</label>
								</div>
								<div className="space-y-1">
									<label className={labelCls}>
										Kullanıcı Adı
										<input
											name="username"
											type="text"
											placeholder="örnek_kullanıcı"
											className={inputCls}
											autoComplete="username"
											required
										/>
									</label>
								</div>
								<div className="space-y-1">
									<label className={labelCls}>
										Şifre
										<input
											name="password"
											type="password"
											placeholder="En az 8 karakter"
											className={inputCls}
											minLength={8}
											autoComplete="off"
											required
										/>
									</label>
								</div>
								<button
									type="submit"
									disabled={isPending}
									className={submitCls}
								>
									{isPending
										? "Kayıt olunuyor..."
										: "Kayıt Ol"}
								</button>
							</form>
						)}

						{/* — Forgot Password — */}
						{mode === "forgotPassword" && (
							<form
								onSubmit={handleForgotSubmit}
								className="space-y-4"
							>
								<p className="text-body-md text-on-surface">
									Şifrenizi sıfırlamak için kayıtlı e-posta
									adresinizi girin.
								</p>
								<div className="space-y-1">
									<label className={labelCls}>
										E-posta
										<input
											name="email"
											type="email"
											placeholder="ornek@email.com"
											className={inputCls}
											autoComplete="email"
											required
										/>
									</label>
								</div>
								<button
									type="submit"
									disabled={isPending}
									className={submitCls}
								>
									{isPending
										? "Gönderiliyor..."
										: "Sıfırlama Bağlantısı Gönder"}
								</button>
							</form>
						)}

						{/* Terms */}
						<p
							className={[
								"text-center font-label-sm text-[11px]",
								"text-on-surface-variant/60",
								"leading-relaxed px-4",
							].join(" ")}
						>
							Devam ederek Tattamam&apos;ın{" "}
							<Link
								className="underline"
								href="/bilgi/?tab=legal"
								onClick={onClose}
							>
								Kullanım Koşullarını
							</Link>{" "}
							ve{" "}
							<Link
								className="underline"
								href="/bilgi/?tab=legal"
								onClick={onClose}
							>
								Gizlilik Politikasını
							</Link>{" "}
							kabul etmiş olursunuz.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

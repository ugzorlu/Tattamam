/* =============================================================================
                     	    Authentication Actions
============================================================================= */
/**
 * @fileoverview
 * Server actions for authentication-related operations, including:
 * - registration
 * - password reset and verification flows
 * - password updates
 * - explicit session termination for a signed-in user
 *
 * FLOW:
 * ~ Client components send form data to these actions.
 * ~ The actions validate the data, perform necessary database operations,
 * and handle email dispatch.
 *
 * NOTE(ARCHITECTURE):
 * Server actions are required because authentication operations involve
 * sensitive data and require server-side validation and persistence.
 *
 * INFO(LIBRARY):
 * Uses Zod for runtime input validation, bcryptjs for password hashing, and
 * NextAuth session cookies for logout handling.
 */

"use server"

/* === Imports ============================================================== */
/* --- Externals --- */
import { cookies } from "next/headers"
import { getServerSession } from "next-auth/next"
import bcrypt from "bcryptjs"
import { z } from "zod"
import crypto from "crypto"

/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"

/* --- Server Infrastructure --- */
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logging"
import { sendMail } from "@/lib/mail/sendMail"
import { confirmationEmail } from "@/lib/mail/templates/confirmationEmail"
import { passwordReset } from "@/lib/mail/templates/passwordReset"

/* === Schemas ============================================================== */
const RegisterSchema = z.object({
	email: z.email("Geçerli bir e-posta adresi giriniz."),
	username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
	password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
})

const ForgotPasswordSchema = z.object({
	email: z.email("Geçerli bir e-posta adresi giriniz."),
})

const ResetPasswordSchema = z.object({
	token: z.string().min(1, "Token eksik."),
	password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
})

const UpdatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Mevcut şifrenizi giriniz."),
		newPassword: z
			.string()
			.min(8, "Yeni şifre en az 8 karakter olmalıdır."),
		confirmPassword: z.string().min(1, "Yeni şifrenizi tekrar giriniz."),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Şifreler uyuşmuyor.",
		path: ["confirmPassword"],
	})

/* === Contracts ============================================================ */
export type ActionState = {
	success?: boolean
	error?: string
	message?: string
}

/* === Actions ============================================================== */
export async function registerAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const rawData = Object.fromEntries(formData.entries())
		const validatedFields = RegisterSchema.safeParse(rawData)

		if (!validatedFields.success) {
			return { error: validatedFields.error.issues[0].message }
		}

		const { email, username, password } = validatedFields.data

		// Check if user exists
		const existingEmail = await prisma.user.findUnique({ where: { email } })
		if (existingEmail) {
			return { error: "Bu e-posta adresi zaten kullanımda." }
		}

		const existingUsername = await prisma.user.findUnique({
			where: { username },
		})
		if (existingUsername) {
			return { error: "Bu kullanıcı adı zaten kullanımda." }
		}

		// Hash password and generate verification token
		const passwordHash = await bcrypt.hash(password, 10)
		const verificationToken = crypto.randomBytes(32).toString("hex")

		// Creates user with pending email verification state.
		// const user = TODO: Use it in rollback.
		await prisma.user.create({
			data: {
				email,
				username,
				passwordHash,
				verificationToken,
			},
		})

		// Stores the newly created user ID. TODO: Use it in rollback.
		// const createdUserId = user.id

		/* ─── Email Dispatch ─────────────────────────────────────────────── */
		// Constructs confirmation link and email content.
		const verificationLink =
			`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=` +
			`${verificationToken}`

		// Prepares email content using template, passing in necessary data.
		const { subject, text, html } = confirmationEmail({
			username,
			verificationLink,
			logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
		})

		// Sends the confirmation email to the user.
		await sendMail({
			to: email,
			subject,
			text,
			html,
		})

		return {
			success: true,
			message: "Kayıt başarılı! Lütfen e-postanızı doğrulayın.",
		}
	} catch (error) {
		logger.error(error, "Register Error:")
		return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
	}
}

export async function forgotPasswordAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const rawData = Object.fromEntries(formData.entries())
		const validatedFields = ForgotPasswordSchema.safeParse(rawData)

		if (!validatedFields.success) {
			return { error: validatedFields.error.issues[0].message }
		}

		const { email } = validatedFields.data

		const user = await prisma.user.findUnique({ where: { email } })

		if (!user) {
			/*
			 * NOTE(ARCHITECTURE):
			 * Returns success message in any case therefore
			 * info of if a user exists or not will not be exposed.
			 **/
			return {
				success: true,
				message: "Şifre sıfırlama e-postası gönderildi.",
			}
		}

		const resetPasswordToken = crypto.randomBytes(32).toString("hex")
		const resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour.

		await prisma.user.update({
			where: { id: user.id },
			data: { resetPasswordToken, resetPasswordExpires },
		})

		/* ─── Email Dispatch ─────────────────────────────────────────────── */
		// Constructs reset password link and email content.
		const resetpasswordLink =
			`${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=` +
			`${resetPasswordToken}`

		// Prepares email content using template, passing in necessary data.
		const { subject, text, html } = passwordReset({
			username: user.username,
			resetLink: resetpasswordLink,
			logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
		})

		// Sends the confirmation email to the user.
		await sendMail({
			to: email,
			subject,
			text,
			html,
		})

		return {
			success: true,
			message: "Şifre sıfırlama e-postası gönderildi.",
		}
	} catch (error) {
		logger.error(error, "Forgot Password Error:")
		return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
	}
}

export async function resetPasswordAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const rawData = Object.fromEntries(formData.entries())
		const validatedFields = ResetPasswordSchema.safeParse(rawData)

		if (!validatedFields.success) {
			return { error: validatedFields.error.issues[0].message }
		}

		const { token, password } = validatedFields.data

		const user = await prisma.user.findFirst({
			where: {
				resetPasswordToken: token,
				resetPasswordExpires: { gt: new Date() },
			},
		})

		if (!user) {
			return {
				error: "Sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
			}
		}

		const passwordHash = await bcrypt.hash(password, 10)

		await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordHash,
				resetPasswordToken: null,
				resetPasswordExpires: null,
			},
		})

		return {
			success: true,
			message: "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.",
		}
	} catch (error) {
		logger.error(error, "Reset Password Error:")
		return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
	}
}

export async function confirmEmailAction(token: string): Promise<ActionState> {
	try {
		if (!token) return { error: "Geçersiz token." }

		const user = await prisma.user.findFirst({
			where: { verificationToken: token },
		})

		if (!user) {
			return { error: "Geçersiz veya kullanılmış doğrulama bağlantısı." }
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerified: new Date(),
				verificationToken: null,
			},
		})

		return {
			success: true,
			message: "E-posta adresiniz başarıyla doğrulandı.",
		}
	} catch (error) {
		logger.error(error, "Confirm Email Error:")
		return { error: "Bir hata oluştu." }
	}
}

/**
 * Explicitly removes the current user's NextAuth session cookies so the
 * browser forgets the authenticated session and the user is logged out.
 *
 * @param prevState - Unused server action state placeholder retained for
 * compatibility with the existing action signature.
 * @param formData - Optional form payload. This action does not read any
 * fields from it.
 * @returns ActionState containing either a success message or a user-facing
 * error response.
 */
export async function logoutAction(
	_prevState: ActionState,
	_formData: FormData,
): Promise<ActionState> {
	void _prevState
	void _formData

	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.email) {
			return {
				success: true,
				message: "Oturum zaten kapatılmış durumda.",
			}
		}

		const cookieStore = await cookies()
		const sessionCookieNames = [
			"next-auth.session-token",
			"__Secure-next-auth.session-token",
			"next-auth.callback-url",
			"__Secure-next-auth.callback-url",
		]

		for (const cookieName of sessionCookieNames) {
			cookieStore.delete(cookieName)
		}

		return {
			success: true,
			message: "Oturumunuz kapatıldı.",
		}
	} catch (error) {
		logger.error(error, "Logout Error:")
		return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
	}
}

/**
 * Updates the authenticated user's password after validating the current
 * password and the new password confirmation flow.
 *
 * @param prevState - Previous action state returned by the form action.
 * @param formData - Submitted password-change form payload.
 * @returns ActionState with either success details or an error message.
 */
export async function updatePasswordAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.email) {
			return { error: "Yetkisiz işlem." }
		}

		const rawData = Object.fromEntries(formData.entries())
		const validated = UpdatePasswordSchema.safeParse(rawData)

		if (!validated.success) {
			return { error: validated.error.issues[0].message }
		}

		const { currentPassword, newPassword } = validated.data

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		})

		if (!user) return { error: "Kullanıcı bulunamadı." }

		const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
		if (!isValid) return { error: "Mevcut şifreniz yanlış." }

		const passwordHash = await bcrypt.hash(newPassword, 10)
		await prisma.user.update({
			where: { id: user.id },
			data: { passwordHash },
		})

		return {
			success: true,
			message: "Şifreniz başarıyla güncellendi!",
		}
	} catch (error) {
		logger.error(error, "Update Password Error:")
		return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
	}
}

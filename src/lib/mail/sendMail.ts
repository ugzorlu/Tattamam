/* =============================================================================
                     		Mail Infrastructure  
============================================================================= */
/**
 * @fileoverview
 * Transactional email infrastructure.
 *
 * PURPOSE:
 * Provides a centralized SMTP delivery boundary for transactional email
 * workflows and outbound application communications.
 *
 * Centralizes transporter configuration, mail delivery behavior,
 * credential management and provider-specific implementation details.
 *
 * USE CASES:
 * - Account confirmation emails
 * - Password recovery emails
 * - Notification delivery
 * - Transactional communications
 * - Future email workflows
 *
 * FLOW:
 * ~ Creates a reusable SMTP transporter.
 * ~ Loads credentials from environment configuration.
 * ~ Provides standardized mail delivery utilities.
 * ~ Delegates transport responsibilities to Nodemailer.
 *
 * NOTE(ARCHITECTURE):
 * Intentionally isolates mail infrastructure concerns from business logic and
 * feature implementations.
 *
 * Features should depend on exported mail utilities rather than
 * directly interacting with SMTP infrastructure.
 *
 * INFO(LIBRARY):
 * Uses Nodemailer as the SMTP abstraction layer.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import nodemailer from "nodemailer"

/* === Contracts ============================================================ */
/**
 * Transactional email payload.
 *
 * PURPOSE:
 * Defines the data required to deliver a transactional email message.
 *
 * @property to - Recipient email address.
 * @property subject - Email subject line.
 * @property text - Plaintext email content.
 * @property html - HTML email content.
 */
interface SendMailOptions {
	to: string
	subject: string
	text: string
	html: string
}

/* === Transporter ========================================================== */
/**
 * Shared SMTP transporter.
 *
 * PURPOSE:
 * Provides a reusable SMTP connection configuration for all outbound email
 * delivery operations.
 *
 * USE CASES:
 * - Transactional emails
 * - Verification workflows
 * - Notification delivery
 *
 * FLOW:
 * ~ Establishes SMTP configuration.
 * ~ Loads authentication credentials.
 * ~ Reuses transporter resources across requests.
 * ~ Delegates message delivery to the mail provider.
 *
 * NOTE(ARCHITECTURE):
 * Transporter reuse reduces initialization overhead
 * and centralizes provider configuration.
 *
 * INFO(LIBRARY):
 * Port 465 uses SMTPS and requires immediate TLS establishment
 * through `secure: true`.
 */
const transporter = nodemailer.createTransport({
	host: "mail.tattamam.com.tr",
	port: 465,

	// Required for SMTPS on port 465.
	secure: true,

	auth: {
		user: process.env.CONFIRMATION_MAIL_USER,
		pass: process.env.CONFIRMATION_MAIL_PASSWORD,
	},
})

/* === Exports ============================================================== */
/**
 * Transactional email delivery.
 *
 * PURPOSE:
 * Sends application-generated email through the configured SMTP infrastructure.
 *
 * USE CASES:
 * - Email confirmation
 * - Password reset workflows
 * - Account notifications
 * - System-generated communications
 *
 * FLOW:
 * ~ Receives transactional email content.
 * ~ Applies sender metadata.
 * ~ Delegates delivery to the shared transporter.
 * ~ Returns when SMTP delivery completes.
 *
 * NOTE(ARCHITECTURE):
 * Mail delivery is centralized to ensure consistent transport behavior
 * and provider configuration throughout the application.
 *
 * INFO(LIBRARY):
 * Both plaintext and HTML content are intentionally provided to:
 * - Improve mail client compatibility
 * - Improve accessibility
 * - Provide multipart email fallback support
 *
 * @async
 * @param options - Transactional mail payload.
 * @returns Promise resolving when message delivery completes.
 */
export async function sendMail({
	to,
	subject,
	text,
	html,
}: SendMailOptions): Promise<void> {
	await transporter.sendMail({
		from: `"Tattamam" <${process.env.CONFIRMATION_MAIL_USER}>`,
		to,
		subject,
		text,
		html,
	})
}

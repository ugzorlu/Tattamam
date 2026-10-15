/* =============================================================================
                     	     Feedback Actions
============================================================================= */
/**
 * @fileoverview
 * Server action for contact-form feedback submissions.
 *
 * FLOW:
 * The client form sends plain values to this action. The action validates
 * them at the server boundary, then delegates the database write to the DAL.
 *
 * NOTE(ARCHITECTURE):
 * A server action is required because ContactPage is a client component.
 * The database-generated timestamp is intentionally not accepted from the
 * client.
 *
 * INFO(LIBRARY):
 * Uses Zod for runtime input validation.
 */

"use server"

/* === Imports ============================================================== */
/* --- Externals --- */
import { z } from "zod"

/* --- Server Infrastructure --- */
import { addFeedback } from "@/lib/dal/feedback"
import { logger } from "@/lib/logging"

/* === Schemas ============================================================== */
const FeedbackSchema = z.object({
	name: z.string().trim().min(1, "Adınızı giriniz."),
	email: z.email("Geçerli bir e-posta adresi giriniz."),
	message: z.string().trim().min(1, "Mesajınızı giriniz."),
})

/* === Contracts ============================================================ */
export type FeedbackActionResult =
	| { success: true }
	| { success: false; error: string }

/* === Actions ============================================================== */
/**
 * Validates and stores a message submitted through ContactPage.
 *
 * @param input - Raw values received from the client form.
 * @returns A client-safe success or validation error result.
 */
export async function addFeedbackAction(
	input: unknown,
): Promise<FeedbackActionResult> {
	const result = FeedbackSchema.safeParse(input)

	if (!result.success) {
		return { success: false, error: result.error.issues[0].message }
	}

	try {
		await addFeedback(result.data)
		return { success: true }
	} catch (error) {
		logger.error(error, "[addFeedbackAction] error:")
		return {
			success: false,
			error: "Mesajınız gönderilemedi. Lütfen tekrar deneyin.",
		}
	}
}

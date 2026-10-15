/**
 * @fileoverview
 * Persistence operations for messages submitted through the contact form.
 *
 * NOTE(ARCHITECTURE):
 * This module owns database writes while the server action owns the public
 * request boundary and input validation. Keeping those responsibilities
 * separate allows other trusted server workflows to reuse this operation.
 *
 * INFO(LIBRARY):
 * Prisma is used for type-safe access to the MySQL feedback table.
 */

import prisma from "@/lib/db"

export type FeedbackInput = {
	name: string
	email: string
	message: string
}

/**
 * Stores one contact message and its database-generated sent date.
 *
 * @param input - Validated contact information and message content.
 * @returns The persisted feedback record.
 */
export async function addFeedback(input: FeedbackInput) {
	return prisma.feedback.create({
		data: {
			name: input.name,
			email: input.email,
			message: input.message,
		},
	})
}

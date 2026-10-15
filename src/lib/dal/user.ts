import prisma from "@/lib/db"

import type { UserProfileDto } from "@/lib/dto"

export async function getUserProfile(
	userId: number,
): Promise<UserProfileDto | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			favoriteRecipes: {
				select: {
					id: true,
					title: true,
					slug: true,
					imageUrl: true,
					prepTimeMinutes: true,
					cookTimeMinutes: true,
					likeCount: true,
					budgetLevel: true,
					difficultyLevel: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	})

	if (!user) return null

	return {
		id: user.id,
		username: user.username,
		email: user.email,
		createdAt: user.createdAt,
		favoriteRecipes: user.favoriteRecipes,
	}
}

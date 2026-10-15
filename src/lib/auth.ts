/* =============================================================================
	  						Authentication Options
============================================================================= */
/**
 * @fileoverview
 * Authentication options for the application.
 *
 * PURPOSE:
 * Configures the authentication behavior for the application.
 *
 * NOTE(ARCHITECTURE):
 * Uses NextAuth.js for authentication management.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

/* --- Object-Relational Mapper --- */
import prisma from "@/lib/db"

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days cookie persistence
	},
	pages: {
		signIn: "/",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					throw new Error("Eksik bilgi girdiniz.")
				}

				const user = await prisma.user.findUnique({
					where: { username: credentials.username },
				})

				if (!user) {
					throw new Error("Geçersiz kullanıcı adı veya şifre.")
				}

				const isValidPassword = await bcrypt.compare(
					credentials.password,
					user.passwordHash,
				)

				if (!isValidPassword) {
					throw new Error("Geçersiz kullanıcı adı veya şifre.")
				}

				return {
					id: user.id.toString(),
					email: user.email,
					name: user.username,
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
			}
			return token
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id
			}
			return session
		},
	},
}

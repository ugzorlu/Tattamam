/* =============================================================================
                       		  Auth Overlay
============================================================================= */
/**
 * @fileoverview
 * Navbar entry-point for authentication.
 *
 * PURPOSE:
 * Renders a profile icon button that opens the shared <AuthModal>.
 * When the user is already logged in, it renders a profile link
 * instead. Modal content and form state live in AuthModal.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useCallback, useState } from "react"
import Link from "next/link"

/* --- Components --- */
import { AuthModal } from "@/components/layout/navbar/AuthModal"

/* --- Assets --- */
import { UserIcon } from "@heroicons/react/24/outline"

/* === Main Component ======================================================  */
export function AuthOverlay({
	isLoggedIn,
}: {
	isLoggedIn?: boolean
}): React.ReactElement {
	const [isOpen, setIsOpen] = useState(false)

	const openOverlay = useCallback(() => setIsOpen(true), [])
	const closeOverlay = useCallback(() => setIsOpen(false), [])

	const btnCls = [
		"flex cursor-pointer text-on-surface",
		"transition-colors duration-200",
		"hover:text-primary active:opacity-80",
	].join(" ")

	/* Logged-in: link to profile page */
	if (isLoggedIn) {
		return (
			<Link href="/profil" className={btnCls} aria-label="Profil">
				<UserIcon className="size-5" />
			</Link>
		)
	}

	/* Logged-out: trigger button + modal */
	return (
		<>
			<button
				type="button"
				aria-label="Hesabım"
				aria-expanded={isOpen}
				onClick={openOverlay}
				className={btnCls}
			>
				<UserIcon className="size-5" />
			</button>

			<AuthModal isOpen={isOpen} onClose={closeOverlay} />
		</>
	)
}

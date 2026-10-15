/* =============================================================================
                            Navbar Auth Provider
============================================================================= */
/**
 * @fileoverview
 * Async Server Component that resolves the user session for the Navbar.
 *
 * PURPOSE:
 * Isolates the dynamic `getServerSession` call into a single component
 * so the main `Navbar` can remain static and cached.
 *
 * NOTE(ARCHITECTURE):
 * Designed to be wrapped in a `<Suspense>` boundary inside the `Navbar`
 * so the rest of the application shell can render instantly.
 */

/* === Imports ============================================================== */
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AuthOverlay } from "@/components/layout/navbar/AuthOverlay"

/* === Main Component ======================================================= */
export default async function NavbarAuth(): Promise<React.ReactElement> {
	const session = await getServerSession(authOptions)
	const isLoggedIn = !!session?.user

	return <AuthOverlay isLoggedIn={isLoggedIn} />
}

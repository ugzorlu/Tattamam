/* === Imports ============================================================== */
/* --- Externals --- */
import { Suspense } from "react"

/* --- Components --- */
import VerifyPageClient from "@/components/auth/VerifyPageClient"
import Spinner from "@/components/ui/Spinner"

/* === Main Component ======================================================= */
export default function VerifyPage() {
	return (
		<Suspense fallback={<Spinner />}>
			<VerifyPageClient />
		</Suspense>
	)
}

import { Suspense } from "react"

import ResetPasswordPageClient from "@/components/auth/ResetPasswordPageClient"
import Spinner from "@/components/ui/Spinner"

export default function VerifyPage() {
	return (
		<Suspense fallback={<Spinner />}>
			<ResetPasswordPageClient />
		</Suspense>
	)
}

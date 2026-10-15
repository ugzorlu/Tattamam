"use client"

/* =============================================================================
                                Desktop Search
============================================================================= */

/* === Imports ============================================================== */
/* --- Externals --- */
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

/* --- Assets --- */
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"

/* === Main Component ======================================================= */
/**
 * Desktop search icon and form.
 */
export function DesktopSearch(): React.ReactElement {
	/* ─── References ─────────────────────────────────────────────────────── */
	const inputRef = useRef<HTMLInputElement>(null)

	/* ─── States ─────────────────────────────────────────────────────────── */
	const [query, setQuery] = useState("")

	/* ─── Hooks ──────────────────────────────────────────────────────────── */
	const router = useRouter()

	/* ─── Event Handlers ─────────────────────────────────────────────────── */
	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!query.trim()) return

		router.push(`/arama/${encodeURIComponent(query)}`)
	}

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className="hidden md:flex relative">
			<span
				className="
					absolute left-3 top-1/2
					transform -translate-y-1/2
					text-outline-variant text-sm
					cursor-pointer
				"
				onClick={onSubmit}
			>
				<MagnifyingGlassIcon className="size-4" />
			</span>
			<form onSubmit={onSubmit}>
				<input
					id="desktop-search"
					ref={inputRef}
					type="search"
					placeholder="Tarif ara..."
					className="
						pl-9 pr-4 py-2 
						bg-surface-container-lowest 
						border border-outline-variant
						rounded-full 
						text-sm text-on-surface
						focus:outline-none focus:border-secondary
						focus:ring-1 focus:ring-secondary
					"
					value={query}
					autoComplete="on"
					onChange={(e) => setQuery(e.target.value)}
				/>
			</form>
		</div>
	)
}

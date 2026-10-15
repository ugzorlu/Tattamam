/* =============================================================================
                    Smart Recipe Finder Skeleton
============================================================================= */
/**
 * @fileoverview
 * Mirrors the smart finder form and recipe results while the route loads.
 */

/**
 * Renders the smart recipe finder route's loading state.
 *
 * @component
 * @returns An accessible skeleton matching the finder page structure.
 */
export default function SmartRecipeFinderSkeleton(): React.ReactElement {
	const skeletonClass = "animate-pulse rounded bg-surface-container"
	const sectionClass = "rounded-xl bg-surface-container p-4 shadow-sm"
	const resultCardClass = [
		"flex min-h-32 overflow-hidden rounded-lg",
		"bg-surface-container-lowest shadow-sm",
	].join(" ")

	return (
		<main
			aria-busy="true"
			aria-label="Akıllı Tarif Bulucu yükleniyor"
			className="flex w-full flex-1 flex-col bg-surface"
		>
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4">
				<header className="space-y-3 pt-8">
					<div className={`h-9 w-64 ${skeletonClass}`} />
					<div className={`h-4 w-full max-w-xl ${skeletonClass}`} />
				</header>

				<section className={sectionClass}>
					<div className={`mb-2 h-4 w-28 ${skeletonClass}`} />
					<div
						className={`h-12 w-full rounded-xl ${skeletonClass}`}
					/>

					<div className="mt-4 flex flex-wrap gap-2">
						{["one", "two", "three", "four", "five"].map((key) => (
							<div
								className={`h-8 w-20 rounded-full ${skeletonClass}`}
								key={key}
							/>
						))}
					</div>

					<div className="mt-6 space-y-3">
						<div className={`h-5 w-48 ${skeletonClass}`} />
						<div
							className={`h-16 w-full rounded-lg ${skeletonClass}`}
						/>
						<div
							className={`h-12 w-full rounded-lg ${skeletonClass}`}
						/>
					</div>

					<div
						className={`mt-5 h-12 w-full rounded-lg ${skeletonClass}`}
					/>
				</section>

				<section aria-label="Tarif sonuçları yükleniyor">
					<div className="mb-3 flex items-center justify-between">
						<div className={`h-8 w-52 ${skeletonClass}`} />
						<div className={`h-5 w-16 ${skeletonClass}`} />
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						{["first", "second"].map((key) => (
							<div className={resultCardClass} key={key}>
								<div
									className={`w-28 shrink-0 ${skeletonClass}`}
								/>
								<div className="flex flex-1 flex-col gap-3 p-4">
									<div
										className={`h-5 w-4/5 ${skeletonClass}`}
									/>
									<div
										className={`h-4 w-3/5 ${skeletonClass}`}
									/>
									<div
										className={`mt-auto h-4 w-2/5 ${skeletonClass}`}
									/>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</main>
	)
}

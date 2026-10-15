/* =============================================================================
                          Recipe Detail — Interactive Panel
============================================================================= */
/**
 * @fileoverview
 * Client-side orchestrator for the interactive recipe experience.
 *
//  * PURPOSE:
//  * Keeps the static page shell server-rendered while deferring the expensive
//  * interaction layer until it reaches the viewport.
//  * Manages shared client state (servings count, instruction mode) and
//  * coordinates data flow between the `ServingsControl`, `IngredientsChecklist`,
//  * `InstructionModeToggle`, preparation steps, and tips sections.
 *
 * NOTE(DESIGN):
 * Renders the two-column layout below the hero section from the Stitch design:
 * - Left column (4 cols): Servings control + Ingredients checklist
 * - Right column (8 cols): Instruction mode toggle + Preparation steps + Tips
 *
//  * NOTE(ARCHITECTURE):
//  * The panel is rendered in a dedicated client chunk, and its heavier sections
//  * only hydrate when they are near the viewport. This keeps the route lighter
//  * during initial load while preserving the rich recipe interaction UX.
 */

"use client"

/* === Imports ============================================================== */
/* --- Externals --- */
import { useState, useCallback, useMemo } from "react"

/* --- Components --- */
import ServingsControl from "@/components/recipe/ServingsControl"
import IngredientsChecklist from "@/components/recipe/IngredientsChecklist"
import ModeToggle from "@/components/recipe/ModeToggle"

/* --- Types --- */
import type { InstructionMode } from "@/components/recipe/ModeToggle"
import type {
	RecipeIngredientDto,
	PreparationStepDto,
	RecipeTipDto,
} from "@/lib/dto"

/* --- Assets --- */
import { LightBulbIcon, SparklesIcon } from "@heroicons/react/24/solid"

/* === Contracts ============================================================ */
interface InteractivePanelProps {
	/** Base serving size for quantity scaling calculations. */
	readonly servingsBase: number
	/** Full ingredient list with base quantities. */
	readonly ingredients: readonly RecipeIngredientDto[]
	/** Ordered preparation steps. */
	readonly steps: readonly PreparationStepDto[]
	/** Cooking tips. */
	readonly tips: readonly RecipeTipDto[]
}

/* === Pure Helpers ========================================================= */
function splitIntoSentences(text: string): string[] {
	const segmenter = new Intl.Segmenter("tr", {
		granularity: "sentence",
	})

	return Array.from(segmenter.segment(text))
		.map(({ segment }) => segment.trim())
		.filter(Boolean)
}

/* === Skeleton ============================================================= */
export function InteractivePanelSkeleton(): React.ReactElement {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const sk = "animate-pulse rounded bg-surface-container"
	const panelGridClass = "grid grid-cols-1 lg:grid-cols-12 gap-12"

	return (
		<div className="flex flex-col gap-10 mt-12">
			<div className="flex justify-center w-full">
				<div className={`h-11 w-72 rounded-full ${sk}`} />
			</div>

			<div className={panelGridClass}>
				<aside className="lg:col-span-4 flex flex-col gap-stack-md">
					<div
						className={
							"bg-surface-container-lowest p-8 rounded-xl " +
							"border border-outline-variant/30 organic-shadow"
						}
					>
						<div className={`h-6 w-32 ${sk} mb-4`} />
						<div className={`h-12 w-full ${sk} mb-8`} />

						<div className="space-y-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center gap-3 py-2"
								>
									<div className={`h-5 w-5 rounded ${sk}`} />
									<div className={`h-4 w-3/4 ${sk}`} />
								</div>
							))}
						</div>
					</div>
				</aside>

				<section className="lg:col-span-8">
					<div className={`h-8 w-36 ${sk} mb-8`} />

					<div className="flex flex-col gap-10">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className={
									"flex gap-6 items-start " +
									(i < 3
										? "border-b border-outline-variant/50 pb-6"
										: "")
								}
							>
								<div
									className={`w-10 h-10 rounded-full shrink-0 mt-1 ${sk}`}
								/>
								<div className="pt-1 w-full space-y-2">
									<div className={`h-4 w-full ${sk}`} />
									<div className={`h-4 w-11/12 ${sk}`} />
									<div className={`h-4 w-4/5 ${sk}`} />
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	)
}

/* === Sub-components ======================================================= */
function ModeSelectorSection({
	mode,
	onModeChange,
	className = "mt-10",
}: {
	mode: InstructionMode
	onModeChange: (mode: InstructionMode) => void
	className?: string
}) {
	return (
		<section className={`${className} flex w-full justify-center`}>
			<ModeToggle mode={mode} onModeChange={onModeChange} />
		</section>
	)
}

function IngredientsSection({
	ingredients,
	servingsBase,
	servingsMultiplier,
	mode,
	onServingsChange,
}: {
	ingredients: readonly RecipeIngredientDto[]
	servingsBase: number
	servingsMultiplier: number
	mode: InstructionMode
	onServingsChange: (value: number) => void
}) {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const ingredientsSectionContainerClass = [
		"rounded-xl border border-outline-variant/30",
		"bg-surface-container-lowest p-8 organic-shadow",
	].join(" ")

	return (
		<section
			data-nosnippet
			className="flex flex-col gap-stack-md lg:col-span-4"
		>
			<div className={ingredientsSectionContainerClass}>
				<ServingsControl
					initialServings={servingsBase}
					onServingsChange={onServingsChange}
				/>

				<IngredientsChecklist
					ingredients={ingredients}
					servingsMultiplier={servingsMultiplier}
					mode={mode}
				/>
			</div>
		</section>
	)
}

function PreparationStepsSection({
	steps,
	mode,
}: {
	steps: readonly PreparationStepDto[]
	mode: InstructionMode
}) {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const instructionTitleContainerClass = [
		"mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center",
		"justify-between",
	].join(" ")
	const instructionTitleClass =
		"font-headline-md text-headline-md text-primary"
	const stepNumberBadgeClass = [
		"mt-1 flex h-10 w-10 shrink-0 items-center justify-center",
		"rounded-full bg-primary font-headline-md text-white self-start",
	].join(" ")
	const stepSubtitleClass = "font-headline-md text-label-md text-primary"
	const stepNumberTextClass = "text-body-lg leading-relaxed text-on-surface"

	return (
		<section className="lg:col-span-8">
			<div className={instructionTitleContainerClass}>
				<h2 className={instructionTitleClass}>Hazırlanış</h2>
			</div>

			<div className="flex flex-col gap-10">
				{steps.map((step, index) => {
					const stepId = step.sectionName
						? `step-${step.id}`
						: undefined
					const isLast = index === steps.length - 1
					const borderClass = isLast
						? ""
						: "border-b border-outline-variant/50 pb-6"
					const stepText =
						mode === "traditional"
							? step.traditionalInstruction
							: mode === "precise" && step.exactInstruction
								? step.exactInstruction
								: step.mixedInstruction
					const subSteps = splitIntoSentences(stepText)

					return (
						<div
							key={step.id}
							id={stepId}
							className="group flex items-start gap-6"
						>
							<span className={stepNumberBadgeClass}>
								{step.stepNumber}
							</span>
							<div className={`w-full pt-3 ${borderClass}`}>
								{step.sectionName && (
									<h3 className={stepSubtitleClass}>
										{step.sectionName}
									</h3>
								)}
								<div className="mt-4 flex flex-col gap-3">
									{subSteps.map((subStep, subStepIndex) => (
										<div
											key={`${step.id}-${subStepIndex}`}
											className={
												"border-l-2 border-inverse-primary " +
												"py-1 pl-4"
											}
										>
											<p className={stepNumberTextClass}>
												{subStep}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</section>
	)
}

function TipsSection({ tips }: { tips: readonly RecipeTipDto[] }) {
	/* ─── Class Aggregates ───────────────────────────────────────────────── */
	const tipsContainerClass = [
		"mt-16 rounded-xl border-2 border-dashed border-secondary/20",
		"bg-secondary-container/30 p-4 md:p-8",
	].join(" ")
	const tipHeaderClass = "font-headline-md text-headline-md text-secondary"
	const tipIconClass = "size-4 text-secondary shrink-0"
	const tipTextClass = "text-body-md text-on-secondary-container"

	/* ─── Early Return ───────────────────────────────────────────────────── */
	if (tips.length === 0) return null

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className={tipsContainerClass}>
			<div className="mb-6 flex items-start gap-3">
				<LightBulbIcon className="size-4 text-secondary mt-1" />
				<h2 className={tipHeaderClass}>Püf Noktaları</h2>
			</div>
			<div
				className={`grid gap-6 ${
					tips.length % 2 === 1
						? "grid-cols-1 md:grid-cols-2 *:last:md:col-span-2"
						: "grid-cols-1 md:grid-cols-2"
				}`}
			>
				{tips.map((tip) => (
					<div key={tip.id} className="flex items-center gap-3">
						<SparklesIcon className={tipIconClass} />
						<p className={tipTextClass}>{tip.content}</p>
					</div>
				))}
			</div>
		</div>
	)
}

/* === Main Component ======================================================= */
export default function InteractivePanel({
	servingsBase,
	ingredients,
	steps,
	tips,
}: InteractivePanelProps) {
	/* ─── States ─────────────────────────────────────────────────────────── */
	const [servings, setServings] = useState<number>(servingsBase)
	const [mode, setMode] = useState<InstructionMode>("mixed")

	const servingsMultiplier = useMemo(
		() => servings / servingsBase,
		[servings, servingsBase],
	)

	/* ─── Handlers ───────────────────────────────────────────────────────── */
	const handleServingsChange = useCallback((value: number) => {
		setServings(value)
	}, [])

	const handleModeChange = useCallback((nextMode: InstructionMode) => {
		setMode(nextMode)
	}, [])

	/* ─── Render ─────────────────────────────────────────────────────────── */
	return (
		<div className="flex flex-col gap-4 lg:gap-10">
			<div className="w-full">
				<ModeSelectorSection
					mode={mode}
					onModeChange={handleModeChange}
				/>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
				{/* Left Column: Servings Control + Ingredients Checklist  */}
				<div className="lg:col-span-4">
					<IngredientsSection
						ingredients={ingredients}
						servingsBase={servingsBase}
						servingsMultiplier={servingsMultiplier}
						mode={mode}
						onServingsChange={handleServingsChange}
					/>
				</div>

				{/* Right Column: Preparation Steps + Tips  */}
				<div className="lg:col-span-8">
					<div className="lg:hidden">
						<ModeSelectorSection
							mode={mode}
							onModeChange={handleModeChange}
							className="mt-0 mb-10"
						/>
					</div>
					<PreparationStepsSection steps={steps} mode={mode} />
					<TipsSection tips={tips} />
				</div>
			</div>
		</div>
	)
}

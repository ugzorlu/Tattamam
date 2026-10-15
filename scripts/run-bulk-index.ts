/* =============================================================================
                 		Run Bulk Indexing Script
============================================================================= */
/**
 * @fileoverview
 * Loads the project's environment files before importing its database layer,
 * then runs the manual bulk-index command.
 *
 * INFO(LIBRARY):
 * Uses Next.js's `@next/env` package to load environment variables, ensuring
 * that the script runs with the same configuration as the Next.js application.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env")

/* === Main Script ========================================================== */
/**
 * Bootstraps environment configuration and executes the CLI.
 *
 * @returns Resolves when the command has completed and sets its exit status.
 */
async function main(): Promise<void> {
	loadEnvConfig(process.cwd())

	const [{ runBulkIndexing }, { default: prisma }] = await Promise.all([
		import("./bulk-index.ts"),
		import("@/lib/db"),
	])

	try {
		const result = await runBulkIndexing({
			dryRun: process.argv.includes("--dry-run"),
		})

		if (result.success === false) {
			console.error(result.error)
			process.exitCode = 1
			return
		}

		if (result.failed > 0) {
			process.exitCode = 1
		}
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Bulk indexing failed: ${message}`)
		process.exitCode = 1
	} finally {
		await prisma.$disconnect()
	}
}

void main()

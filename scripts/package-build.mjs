/* =============================================================================
                 	     Build Deployment Package Script
============================================================================= */
/**
 * @fileoverview
 * Creates a deployment package for the Next.js project by compressing the
 * necessary files into a single ZIP archive. Intended for deployment to
 * production environments and excludes development files.
 *
 * FLOW:
 * ~ Validates the presence of required files and directories.
 * ~ Removes any existing deployment archive to ensure a clean build.
 * ~ Invokes the native `zip` utility to create a new archive with maximum
 *   compression.
 * ~ Outputs the resulting archive's size and contents for verification.
 *
 * NOTE(ARCHITECTURE):
 * Designed to be run from the project root directory.
 *
 * INFO(LIBRARY):
 * Uses Node.js built-in `child_process` module to invoke the native `zip`
 * utility, ensuring compatibility and performance without external dependencies.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

/* === Constants ============================================================ */
const execFileAsync = promisify(execFile)

/**
 * Resolves the project root independently of the current working directory.
 * Makes the script reliable even when invoked from another directory.
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")

/**
 * The deployment archive is intentionally placed outside the archive's contents
 * and recreated on every successful build.
 */
const archiveName = "tattamam-build.zip"
const archivePath = path.join(projectRoot, archiveName)

/**
 * These are the ONLY files/directories that belong in the deployment package.
 * Keeping this list explicit prevents accidental inclusion of source files,
 * environment files, development tooling, or other unnecessary content.
 */
const deploymentFiles = [
	"prisma",
	"public",
	".next",
	"next.config.ts",
	"package.json",
	"package-lock.json",
	"server.js",
]

/* === Main Script ========================================================== */
async function main() {
	console.log("\nCreating deployment package...")

	/**
	 * Validates the deployment manifest before invoking `zip`.
	 *
	 * Failing early gives a much clearer error than producing an incomplete
	 * deployment archive.
	 */
	for (const item of deploymentFiles) {
		const itemPath = path.join(projectRoot, item)

		try {
			await fs.access(itemPath)
		} catch {
			throw new Error(`Required deployment item not found: ${item}`)
		}
	}

	/**
	 * Removes the previous archive so that every build produces a clean,
	 * deterministic deployment package.
	 */
	try {
		await fs.unlink(archivePath)
	} catch (error) {
		/**
		 * ENOENT simply means this is the first build or the previous archive
		 * has already been removed. Any other error should abort the process.
		 */
		if (error.code !== "ENOENT") {
			throw error
		}
	}

	/*
	 * Run the native `zip` utility from the project root.
	 *
	 * `-r` recursively includes directories.
	 * `-9` requests maximum DEFLATE compression.
	 *
	 * Using `execFile` instead of a shell command avoids shell interpolation
	 * and quoting problems because every deployment item is passed as a
	 * separate argument.
	 */
	await execFileAsync("zip", ["-r", "-9", archiveName, ...deploymentFiles], {
		cwd: projectRoot,
	})

	// Retrieves the resulting archive size for a useful build summary.
	const stats = await fs.stat(archivePath)
	const sizeMB = stats.size / 1024 / 1024

	console.log("\nDeployment package created successfully.")
	console.log(`  File: ${archiveName}`)
	console.log(`  Size: ${sizeMB.toFixed(2)} MB`)
	console.log("  Contents:")

	for (const item of deploymentFiles) {
		console.log(`    - ${item}`)
	}

	console.log("")
}

main().catch((error) => {
	console.error("\nFailed to create deployment package.")
	console.error(error.message)
	process.exit(1)
})

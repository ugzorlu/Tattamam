/* =============================================================================
                 	    Compress Next.js Assets Script
============================================================================= */
/**
 * @fileoverview
 * Compresses Next.js assets in the `.next/static` directory using Gzip and
 * Brotli compression algorithms.
 *
 * PURPOSE:
 * Reduce the size of static assets to improve load times and performance
 * for end-users.
 *
 * FLOW:
 * ~ Recursively traverses the directory.
 * ~ Compresses files with specified extensions.
 * ~ Saves the compressed versions alongside the original files.
 *
 * INFO(LIBRARY):
 * Uses Node.js built-in `zlib` module for compression, ensuring compatibility
 * and performance without external dependencies.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import fs from "fs"
import path from "path"
import zlib from "zlib"
import { promisify } from "util"

/* === Constants ============================================================ */
const gzip = promisify(zlib.gzip)
const brotli = promisify(zlib.brotliCompress)
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)

const TARGET_DIR = path.join(process.cwd(), ".next/static")

// const EXTENSIONS_TO_COMPRESS = [".js", ".css", ".html", ".json", ".svg"]
const EXTENSIONS_TO_COMPRESS = [".css"]

/* === Main Script ========================================================== */
async function compressFolder(dir) {
	const files = await readdir(dir)

	for (const file of files) {
		const filePath = path.join(dir, file)
		const fileStat = await stat(filePath)

		if (fileStat.isDirectory()) {
			await compressFolder(filePath) // Recursive lookup
		} else if (EXTENSIONS_TO_COMPRESS.includes(path.extname(file))) {
			const fileBuffer = fs.readFileSync(filePath)

			// 1. Generate .gz (Gzip)
			const gzipped = await gzip(fileBuffer, { level: 9 })
			await writeFile(`${filePath}.gz`, gzipped)

			// 2. Generate .br (Brotli)
			const brotlied = await brotli(fileBuffer, {
				params: {
					[zlib.constants.BROTLI_PARAM_MODE]:
						zlib.constants.BROTLI_MODE_TEXT,
					[zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Max compression
				},
			})
			await writeFile(`${filePath}.br`, brotlied)
		}
	}
}

console.log("🚀 Pre-compressing Next.js assets into Gzip and Brotli...")
compressFolder(TARGET_DIR)
	.then(() => console.log("✅ Asset compression complete!"))
	.catch((err) => console.error("❌ Compression failed:", err))

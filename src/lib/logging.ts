/* =============================================================================
                       		Logging Utilities
============================================================================= */
/**
 * @fileoverview
 * Centralized logging helpers for the application.
 *
 * PURPOSE:
 * Provides a unified logging instance safe for hybrid execution.
 * Handles both server-side environments and client-side web contexts.
 *
 * NOTE(ARCHITECTURE):
 * Configures dynamic log levels based on environment.
 * Uses pino and pino-pretty for structured JSON logging and formatting.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import pino from "pino"

// import fs from "fs"
// import path from "path"

// const productionLog = "/home/sallitur/tattamam/server.log"

// function getLogFile(): string {
// 	if (process.env.NODE_ENV === "production") return productionLog
// 	return path.join(process.cwd(), "server.log")
// }

// export function log(message: string): void {
// 	const file = getLogFile()
// 	try {
// 		fs.mkdirSync(path.dirname(file), { recursive: true })
// 		fs.appendFileSync(file, `${new Date().toISOString()} ${message}\n`)
// 	} catch (e) {
// 		console.warn("Logging failed:", e)
// 		console.log(`${new Date().toISOString()} ${message}`)
// 	}
// }

/* === Constants ============================================================ */
const isServer = typeof window === "undefined"
const isProduction = process.env.NODE_ENV === "production"
const defaultLevel = isProduction ? "info" : "debug"

/* === Logger Configuration ================================================= */
/**
 * Global logger instance for the application.
 * Automatically adapts output format based on environment.
 */
export const logger = pino({
	level: defaultLevel,
	timestamp: pino.stdTimeFunctions.isoTime,
	formatters: {
		level: (label: string) => ({ level: label.toUpperCase() }),
	},
	// Uses pino-pretty only in development on the server side.
	...(isServer && !isProduction
		? {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "SYS:standard",
					},
				},
			}
		: {}),
})

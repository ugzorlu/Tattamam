/* =============================================================================
                                 Database Client                                
============================================================================= */
/**
 * @fileoverview
 * Database client initialization and management.
 *
 * PURPOSE:
 * Provides a stable database client contract between persistence layers,
 * API handlers, and server-rendered application boundaries.
 *
 * Centralizes database client initialization, connection management,
 * and structured observability behavior.
 *
 * USE CASES:
 * - Repository implementations
 * - Service-layer persistence
 * - Database transactions
 * - Background jobs
 *
 * FLOW:
 * ~ Initializes a Prisma client instance with env-driven configuration.
 * ~ Implements a development-only singleton pattern to preserve the client
 *   across module reloads.
 * ~ Exports a shared Prisma client instance for use throughout the app.
 * ~ Configures env-specific logging behavior for development and production.
 * ~ Reserves future support for Prisma Accelerate integration
 * 	 via config placeholders.
 *
 * NOTE(ARCHITECTURE):
 * The database client is intentionally isolated in its own module to:
 * - Avoid coupling database access logic with business logic
 * - Enable shared client reuse across the application
 * - Centralize database connection management
 * - Facilitate future infrastructure evolution
 * 	 (e.g., Prisma v7 migration, Accelerate support)
 * - Prevent connection exhaustion during development reload cycles
 *   through a global singleton cache
 *
 * INFO(LIBRARY):
 * Uses Prisma as the ORM and database access layer.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

/* --- Application --- */
/**
 * NOTE(LIBRARY):
 * Direct import path migrated to generated client output in Prisma v7.
 */
import { PrismaClient } from "../../prisma/generated/client"

/* === Global Prisma Singleton ============================================== */
/**
 * Development-only global Prisma singleton holder.
 *
 * PURPOSE:
 * Provides a globally accessible location for storing a shared Prisma client
 * instance during development runtime execution.
 *
 * USE CASES:
 * - Next.js development mode
 * - Hot Module Replacement (HMR)
 * - Local development servers
 *
 * FLOW:
 * ~ Extends the global runtime object with an optional Prisma instance.
 * ~ Reuses previously created clients when modules reload.
 * ~ Prevents repeated database client initialization during development.
 *
 * NOTE(ARCHITECTURE):
 * Next.js development mode frequently reloads modules.
 * Without a shared singleton cache each reload would create a new Prisma client
 * and potentially exhaust available database connections.
 *
 * INFO(FRAMEWORK):
 * Uses a two-step `unknown` cast because `globalThis` does not natively expose
 * a `prisma` property.
 */
const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient
}

// Configure the adapter with your MySQL connection details
const adapter = new PrismaMariaDb({
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT) || 3306,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,

	// Pool Limits & Timeouts
	connectionLimit: 3, // Maximum active connections in the pool.
	acquireTimeout: 10000, // Time in ms, waiting for free connection from pool.
	connectTimeout: 10000, // Time in ms, establishing initial socket connection.
	idleTimeout: 30, // Time (seconds) before closing idle connections.

	// Passes the full SSL config object.
	// Ignores the `ssl` property in the connection string.
	ssl: {
		rejectUnauthorized: false,
	},
	//
	// ssl: true,
	//
	// Allows password encryption over self-signed SSL.
	// allowPublicKeyRetrieval: true,
})

/* === Prisma Client Initialization ========================================= */
/**
 * Shared Prisma client singleton.
 *
 * PURPOSE:
 * Creates or reuses the application's single database access client and
 * provides a centralized entry point for all database operations.
 *
 * USE CASES:
 * - Repository implementations
 * - Service-layer persistence
 * - Database transactions
 * - Query execution
 * - Background jobs
 *
 * FLOW:
 * ~ Checks for an existing cached Prisma client.
 * ~ Creates a new Prisma client when none exists.
 * ~ Configures environment-specific logging behavior.
 * ~ Exposes a shared database access instance.
 *
 * NOTE(ARCHITECTURE):
 * Singleton usage prevents duplicate Prisma engines, unnecessary db reconnects,
 * and connection exhaustion during development reload cycles.
 *
 * INFO(LIBRARY):
 * Development envs enable verbose Prisma logging for debugging & observability.
 * Production env restrict logging to errors to reduce operational noise.
 */
const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		/**
		 * Prisma Accelerate configuration placeholder.
		 *
		 * PURPOSE:
		 * Reserves future support for Prisma Accelerate integration.
		 *
		 * USE CASES:
		 * - Global database acceleration
		 * - Edge deployments
		 * - Connection pooling optimization
		 *
		 * FLOW:
		 * ~ Reads the Accelerate endpoint from environment configuration.
		 * ~ Supplies the endpoint to Prisma runtime initialization.
		 * ~ Remains disabled until Prisma v7 migration is completed.
		 *
		 * TODO:
		 * Prisma Accelerate support is planned for a future migration and is
		 * intentionally disabled until the Prisma version is upgraded to v7.
		 */
		// accelerateUrl: process.env.PRISMA_ACCELERATE_URL || '',

		adapter,

		log:
			process.env.NODE_ENV === "development"
				? ["query", "info", "warn", "error"]
				: ["error"],
	})

/* === Development Singleton Persistence ==================================== */
/**
 * Development singleton persistence.
 *
 * PURPOSE:
 * Preserves Prisma client instance across module reload cycles in development.
 *
 * USE CASES:
 * - Next.js local development
 * - Hot Module Replacement
 * - Long-running development sessions
 *
 * FLOW:
 * ~ Detects non-production environments.
 * ~ Stores the Prisma instance on the global runtime object.
 * ~ Enables future module reloads to reuse the same client.
 *
 * INFO(FRAMEWORK):
 * Skipped in production because production runtimes already preserve
 * process-level singleton state.
 */
if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma
}

/* === Exports ============================================================== */
/**
 * Application database client singleton.
 *
 * PURPOSE:
 * Provides single supported database access entry point for the entire app.
 *
 * USE CASES:
 * - Repository layer access
 * - Service-layer persistence
 * - Database transactions
 * - Infrastructure integrations
 *
 * FLOW:
 * ~ Exposes the shared Prisma client.
 * ~ Reuses the existing singleton instance.
 * ~ Ensures consistent database access behavior throughout the application.
 *
 * NOTE(ARCHITECTURE):
 * All database operations should be routed through this exported instance
 * to maintain predictable connection management and lifecycle behavior.
 */
export default prisma

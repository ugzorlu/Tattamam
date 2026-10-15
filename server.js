/* =============================================================================
                            Custom Next.js Server
============================================================================= */
/**
 * @fileoverview
 * Custom HTTP server for cPanel environment that require a Node entry point
 * (e.g. Phusion Passenger). Requests are forwarded to the Next.js request
 * handler after the application has been initialized.
 */

/* === Imports ============================================================== */
/* --- Externals --- */
import { createServer } from "http"
import { parse } from "url"
import next from "next"

/* === Application ========================================================== */
// Production mode. Can be changed to true for local debugging if required.
const dev = false

// Initializes the Next.js application and its request handler.
const app = next({ dev })
const handle = app.getRequestHandler()

// Phusion Passenger automatically passes the correct port via process.env.PORT.
const port = process.env.PORT || 3000

/* === Server =============================================================== */
// Prepares Next.js before accepting incoming HTTP requests.
app.prepare().then(() => {
	const server = createServer((req, res) => {
		// Parses the request URL and delegate handling to Next.js.
		const parsedUrl = parse(req.url, true)
		handle(req, res, parsedUrl)
	})

	/**
	 * Forces aggressive connection cleanup.
	 */
	// Kills idle keep-alive sockets after 5 seconds.
	server.keepAliveTimeout = 5000
	// Closes headers timeout slightly higher than `keepAlive`.
	server.headersTimeout = 6000

	server.listen(port, (err) => {
		if (err) throw err

		console.log(`> Ready on port ${port}`)
	})
})

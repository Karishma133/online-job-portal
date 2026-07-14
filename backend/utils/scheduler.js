import { run24HourGuaranteeSweep } from './autoResponseEngine.js'

const THIRTY_MIN_MS = 30 * 60 * 1000

/**
 * Starts the background job that enforces the 24-hour instant response
 * guarantee. Runs every 30 minutes so no application waits more than
 * ~24h30m for a concrete response, even if no recruiter ever logs in.
 *
 * Deliberately implemented with plain setInterval (no extra npm package)
 * so this drops into the existing project with zero new dependencies.
 */
export function startAutoResponseScheduler() {
  const runSweep = async () => {
    try {
      const count = await run24HourGuaranteeSweep()
      if (count > 0) {
        console.log(`⚡ Auto-response sweep: processed ${count} stale application(s)`)
      }
    } catch (err) {
      console.error('Auto-response sweep failed:', err.message)
    }
  }

  // Run once shortly after boot (catches anything that went stale while the
  // server was down), then on a fixed interval after that.
  setTimeout(runSweep, 60 * 1000)
  setInterval(runSweep, THIRTY_MIN_MS)

  console.log('⏱️  24-hour auto-response scheduler started (sweeps every 30 min)')
}

/**
 * TRIGGER 2 — Platform Outage Detector
 *
 * Polls Zomato / Swiggy status endpoints + DownDetector API.
 * Only active during peak windows: 12:00–14:00 and 19:00–21:00 IST.
 * An outage must persist for > 2 hours before a payout fires.
 */

const axios = require('axios');
const cron = require('node-cron');
const payoutService = require('../services/payoutService');

const MOCK_PLATFORM_BASE = process.env.MOCK_PLATFORM_URL || 'http://localhost:4000';
const DOWNDETECTOR_BASE  = 'https://downdetector.in/status';

// ── Peak-hour windows (IST = UTC+5:30) ──────────────────
const PEAK_WINDOWS = [
  { startHour: 12, endHour: 14 },  // lunch
  { startHour: 19, endHour: 21 },  // dinner
];

const OUTAGE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

// ── In-memory outage tracker ─────────────────────────────
// Maps platform → { detectedAt: Date | null }
const outageTracker = {
  zomato: null,
  swiggy: null,
};

// ── Helpers ──────────────────────────────────────────────

/**
 * Check if current IST time falls within a peak window.
 */
function isDuringPeakHours() {
  const now = new Date();
  // IST = UTC + 5:30
  const istHour = (now.getUTCHours() + 5 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0)) % 24;
  return PEAK_WINDOWS.some((w) => istHour >= w.startHour && istHour < w.endHour);
}

/**
 * Poll the mock platform status API for a given platform.
 * Returns { isDown: boolean, reports: number }.
 */
async function checkPlatformStatus(platform) {
  try {
    const { data } = await axios.get(`${MOCK_PLATFORM_BASE}/api/status/${platform}`);
    return { isDown: data.isDown, reports: data.reports || 0 };
  } catch {
    // If we can't reach the mock — assume down (or test scenarios)
    return { isDown: true, reports: 0 };
  }
}

/**
 * Scrape/check DownDetector for spike.
 * In production this would parse the page; for now calls mock endpoint.
 */
async function checkDownDetector(platform) {
  try {
    const { data } = await axios.get(`${MOCK_PLATFORM_BASE}/api/downdetector/${platform}`);
    return { spikeDetected: data.spikeDetected, reportCount: data.reportCount || 0 };
  } catch {
    return { spikeDetected: false, reportCount: 0 };
  }
}

/**
 * Core logic: check both sources, update tracker, fire payout if > 2 hrs.
 */
async function evaluateOutage(platform) {
  const status = await checkPlatformStatus(platform);
  const dd = await checkDownDetector(platform);

  const isOutage = status.isDown || dd.spikeDetected;

  if (isOutage) {
    if (!outageTracker[platform]) {
      outageTracker[platform] = { detectedAt: new Date() };
      console.log(`[OutageTrigger] ${platform} outage detected at ${new Date().toISOString()}`);
    }

    const elapsed = Date.now() - outageTracker[platform].detectedAt.getTime();

    if (elapsed >= OUTAGE_THRESHOLD_MS) {
      console.log(`[OutageTrigger] ${platform} outage exceeded 2h — firing payout`);

      // In a real system we'd iterate affected workers; here we return
      // a signal so the caller / cron can batch-process.
      return {
        platform,
        outageDurationMs: elapsed,
        outageDurationHours: (elapsed / 3600000).toFixed(2),
        shouldPayout: true,
        statusAPI: status,
        downDetector: dd,
      };
    }

    return {
      platform,
      outageDurationMs: elapsed,
      outageDurationHours: (elapsed / 3600000).toFixed(2),
      shouldPayout: false,
      statusAPI: status,
      downDetector: dd,
    };
  }

  // No outage — reset tracker
  if (outageTracker[platform]) {
    console.log(`[OutageTrigger] ${platform} outage resolved`);
  }
  outageTracker[platform] = null;

  return {
    platform,
    outageDurationMs: 0,
    shouldPayout: false,
    statusAPI: status,
    downDetector: dd,
  };
}

/**
 * Fire payout for all affected workers on a platform outage.
 * @param {string} platform
 * @param {Array}  workers – [{ workerId, policyId, upiId, avgHourlyRate }]
 */
async function fireOutagePayouts(platform, workers = []) {
  const result = await evaluateOutage(platform);
  if (!result.shouldPayout) return result;

  const payouts = [];
  for (const w of workers) {
    const amount = Math.round(w.avgHourlyRate * parseFloat(result.outageDurationHours) * 0.8);
    const payout = await payoutService.trigger({
      workerId: w.workerId,
      policyId: w.policyId,
      upiId: w.upiId,
      amount,
      reason: 'platform_outage',
      meta: { platform, ...result },
    });
    payouts.push(payout);
  }

  // Reset tracker after payouts
  outageTracker[platform] = null;
  return { ...result, payoutsIssued: payouts.length };
}

// ── Background poller (runs every 5 min) ─────────────────
function startPolling() {
  // Every 5 minutes, but only during peak hours
  cron.schedule('*/5 * * * *', async () => {
    if (!isDuringPeakHours()) return;

    console.log('[OutageTrigger] polling platform status …');
    for (const platform of ['zomato', 'swiggy']) {
      try {
        const result = await evaluateOutage(platform);
        if (result.shouldPayout) {
          console.log(`[OutageTrigger] ${platform} payout eligible — awaiting worker list`);
          // In production: fetch active workers from Supabase & call fireOutagePayouts
        }
      } catch (err) {
        console.error(`[OutageTrigger] ${platform} poll error:`, err.message);
      }
    }
  });
}

// ── Express handler ──────────────────────────────────────

async function checkOutageTrigger(req, res) {
  try {
    const { platform } = req.body;
    if (!platform || !['zomato', 'swiggy'].includes(platform)) {
      return res.status(400).json({ ok: false, error: 'platform must be "zomato" or "swiggy"' });
    }
    const result = await evaluateOutage(platform);
    return res.json({ ok: true, peakHours: isDuringPeakHours(), result });
  } catch (err) {
    console.error('[OutageTrigger] error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  checkOutageTrigger,
  evaluateOutage,
  fireOutagePayouts,
  startPolling,
};

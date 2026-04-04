/**
 * TRIGGER 1 — Weather & Pollution Disruption
 *
 * Fires a payout when ALL three conditions are met simultaneously:
 *   1. Rainfall > 35 mm/hr sustained for ≥ 45 minutes
 *   2. IMD RSS feed contains an active flood/storm warning for the zone
 *   3. Order volume on mock platform drops > 50 % vs zone baseline
 *
 * Payout formula:  avgHourlyRate × disruptionHours × 0.8
 */

const axios = require('axios');
const RSSParser = require('rss-parser');
const payoutService = require('../services/payoutService');

const rssParser = new RSSParser();

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';
const MOCK_PLATFORM_BASE = process.env.MOCK_PLATFORM_URL || 'http://localhost:4000';

// ── Thresholds ───────────────────────────────────────────
const RAINFALL_THRESHOLD_MM = 35;          // mm per hour
const SUSTAINED_MINUTES     = 45;          // how long rainfall must persist
const ORDER_DROP_THRESHOLD  = 0.50;        // 50 % drop vs baseline
const DISRUPTION_MULTIPLIER = 0.8;         // payout = avg × hours × 0.8

// IMD RSS feed (India Meteorological Department)
const IMD_RSS_URL = 'https://mausam.imd.gov.in/imd_latest/rss/rss_cur_now.xml';

// ── Helpers ──────────────────────────────────────────────

/**
 * Fetch current rainfall for a pincode (uses OWM "weather" endpoint).
 * Returns rainfall in mm/hr (last 1 h) or 0 if not raining.
 */
async function fetchRainfall(pincode) {
  const { data } = await axios.get(`${OWM_BASE}/weather`, {
    params: {
      zip: `${pincode},IN`,
      appid: process.env.OPENWEATHERMAP_KEY,
      units: 'metric',
    },
  });
  // OWM nests rain data under `rain['1h']`
  return data.rain && data.rain['1h'] ? data.rain['1h'] : 0;
}

/**
 * Check IMD RSS feed for flood / storm alerts mentioning the zone.
 * Returns true if any item title/description contains relevant keywords.
 */
async function checkIMDAlerts(zoneName) {
  try {
    const feed = await rssParser.parseURL(IMD_RSS_URL);
    const keywords = ['flood', 'storm', 'heavy rain', 'cyclone', 'waterlogging'];
    const zoneLC = zoneName.toLowerCase();

    return feed.items.some((item) => {
      const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw)) && text.includes(zoneLC);
    });
  } catch {
    // If IMD feed is unreachable, fail-safe → no alert
    return false;
  }
}

/**
 * Fetch order volume from mock platform API and compare against baseline.
 * Returns { currentVolume, baselineVolume, dropPercent }.
 */
async function fetchOrderVolumeDrop(zoneId) {
  const { data } = await axios.get(`${MOCK_PLATFORM_BASE}/api/zones/${zoneId}/orders`);
  const { currentVolume, baselineVolume } = data;
  const dropPercent = baselineVolume > 0
    ? (baselineVolume - currentVolume) / baselineVolume
    : 0;
  return { currentVolume, baselineVolume, dropPercent };
}

// ── In-memory rainfall tracker (per zone) ────────────────
// Maps zoneId → { startedAt: Date | null }
const rainfallTracker = {};

function trackRainfall(zoneId, rainfallMM) {
  if (rainfallMM > RAINFALL_THRESHOLD_MM) {
    if (!rainfallTracker[zoneId]) {
      rainfallTracker[zoneId] = { startedAt: new Date() };
    }
    const elapsed = (Date.now() - rainfallTracker[zoneId].startedAt.getTime()) / 60000;
    return elapsed >= SUSTAINED_MINUTES;
  }
  // Rain stopped or below threshold → reset
  rainfallTracker[zoneId] = null;
  return false;
}

// ── Main trigger check ───────────────────────────────────

/**
 * Evaluate all three conditions for a given worker / zone.
 *
 * @param {Object} params
 * @param {string} params.workerId
 * @param {string} params.zoneId
 * @param {string} params.zoneName   – human-readable zone name for IMD matching
 * @param {string} params.pincode
 * @param {number} params.avgHourlyRate – worker's average hourly earning (₹)
 * @param {string} params.upiId
 * @param {string} params.policyId
 */
async function evaluateTrigger({ workerId, zoneId, zoneName, pincode, avgHourlyRate, upiId, policyId }) {
  // 1. Rainfall
  const rainfallMM = await fetchRainfall(pincode);
  const rainfallSustained = trackRainfall(zoneId, rainfallMM);

  // 2. IMD flood/storm warning
  const floodWarning = await checkIMDAlerts(zoneName);

  // 3. Order volume drop
  const orderData = await fetchOrderVolumeDrop(zoneId);
  const volumeDropped = orderData.dropPercent > ORDER_DROP_THRESHOLD;

  const triggered = rainfallSustained && floodWarning && volumeDropped;

  const diagnostics = {
    rainfallMM,
    rainfallSustained,
    floodWarning,
    orderDrop: `${(orderData.dropPercent * 100).toFixed(1)}%`,
    volumeDropped,
    triggered,
  };

  if (triggered) {
    // Estimate disruption hours from rainfall tracker start time
    const disruptionHours = (Date.now() - rainfallTracker[zoneId].startedAt.getTime()) / 3600000;
    const amount = Math.round(avgHourlyRate * disruptionHours * DISRUPTION_MULTIPLIER);

    await payoutService.trigger({
      workerId,
      policyId,
      upiId,
      amount,
      reason: 'weather_disruption',
      meta: diagnostics,
    });

    diagnostics.payoutAmount = amount;
    diagnostics.disruptionHours = disruptionHours.toFixed(2);

    // Reset tracker after payout
    rainfallTracker[zoneId] = null;
  }

  return diagnostics;
}

// ── Express handler ──────────────────────────────────────

async function checkWeatherTrigger(req, res) {
  try {
    const result = await evaluateTrigger(req.body);
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('[WeatherTrigger] error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { checkWeatherTrigger, evaluateTrigger };

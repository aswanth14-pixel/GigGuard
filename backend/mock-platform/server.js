/**
 * Mock Platform API
 *
 * Simulates Zomato / Swiggy platform data for local development:
 *   - Order volume per zone (with baseline comparison)
 *   - Worker online status
 *   - Restaurant count per zone
 *   - Worker rating history
 *   - Platform status (up/down)
 *   - DownDetector spike simulation
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Seed data ────────────────────────────────────────────

const ZONES = {
  'zone-koramangala': { name: 'Koramangala', city: 'Bangalore', baselineOrders: 320 },
  'zone-indiranagar':  { name: 'Indiranagar',  city: 'Bangalore', baselineOrders: 280 },
  'zone-andheri':      { name: 'Andheri',       city: 'Mumbai',    baselineOrders: 410 },
  'zone-bandra':       { name: 'Bandra',        city: 'Mumbai',    baselineOrders: 370 },
  'zone-connaught':    { name: 'Connaught Place', city: 'Delhi',   baselineOrders: 350 },
  'zone-hauzKhas':     { name: 'Hauz Khas',     city: 'Delhi',    baselineOrders: 290 },
};

const WORKERS = {
  'worker-001': { name: 'Rahul Sharma',   platform: 'zomato', zoneId: 'zone-koramangala', rating: 4.6, online: true  },
  'worker-002': { name: 'Priya Patel',    platform: 'swiggy', zoneId: 'zone-indiranagar',  rating: 4.8, online: true  },
  'worker-003': { name: 'Amit Kumar',     platform: 'zomato', zoneId: 'zone-andheri',      rating: 4.3, online: false },
  'worker-004': { name: 'Sneha Reddy',    platform: 'swiggy', zoneId: 'zone-bandra',       rating: 4.7, online: true  },
  'worker-005': { name: 'Vikram Singh',   platform: 'zomato', zoneId: 'zone-connaught',    rating: 4.1, online: true  },
  'worker-006': { name: 'Deepa Nair',     platform: 'swiggy', zoneId: 'zone-hauzKhas',     rating: 4.9, online: false },
};

const RESTAURANTS_PER_ZONE = {
  'zone-koramangala': 87,
  'zone-indiranagar':  64,
  'zone-andheri':      112,
  'zone-bandra':       95,
  'zone-connaught':    78,
  'zone-hauzKhas':     53,
};

// Simulated platform status — toggle via POST /api/status/:platform/toggle
const platformStatus = {
  zomato: { isDown: false, reports: 12 },
  swiggy: { isDown: false, reports: 8 },
};

const ddSpike = {
  zomato: { spikeDetected: false, reportCount: 45 },
  swiggy: { spikeDetected: false, reportCount: 30 },
};

// ── Helpers ──────────────────────────────────────────────

/** Add ±20 % jitter to a number for realism */
function jitter(base) {
  return Math.round(base * (0.8 + Math.random() * 0.4));
}

/** Generate rating history (last 30 entries) */
function ratingHistory(currentRating) {
  const history = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().slice(0, 10),
      rating: +(currentRating + (Math.random() - 0.5) * 0.4).toFixed(2),
      deliveries: Math.floor(8 + Math.random() * 15),
    });
  }
  return history;
}

// ── Routes ───────────────────────────────────────────────

// Health
app.get('/', (_req, res) => res.json({ service: 'gigguard-mock-platform', status: 'ok' }));

// ── Order volume per zone ────────────────────────────────
app.get('/api/zones/:zoneId/orders', (req, res) => {
  const zone = ZONES[req.params.zoneId];
  if (!zone) return res.status(404).json({ error: 'Zone not found' });

  const currentVolume = jitter(zone.baselineOrders);
  res.json({
    zoneId: req.params.zoneId,
    zoneName: zone.name,
    currentVolume,
    baselineVolume: zone.baselineOrders,
    timestamp: new Date().toISOString(),
  });
});

// All zones summary
app.get('/api/zones', (_req, res) => {
  const zones = Object.entries(ZONES).map(([id, z]) => ({
    zoneId: id,
    ...z,
    currentVolume: jitter(z.baselineOrders),
    restaurantCount: RESTAURANTS_PER_ZONE[id] || 0,
  }));
  res.json(zones);
});

// ── Worker online status ─────────────────────────────────
app.get('/api/workers/:workerId/status', (req, res) => {
  const worker = WORKERS[req.params.workerId];
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  res.json({
    workerId: req.params.workerId,
    name: worker.name,
    online: worker.online,
    platform: worker.platform,
    zoneId: worker.zoneId,
    lastSeen: new Date().toISOString(),
  });
});

// All workers
app.get('/api/workers', (_req, res) => {
  const list = Object.entries(WORKERS).map(([id, w]) => ({
    workerId: id,
    ...w,
  }));
  res.json(list);
});

// ── Restaurant count per zone ────────────────────────────
app.get('/api/zones/:zoneId/restaurants', (req, res) => {
  const count = RESTAURANTS_PER_ZONE[req.params.zoneId];
  if (count === undefined) return res.status(404).json({ error: 'Zone not found' });
  res.json({ zoneId: req.params.zoneId, restaurantCount: count });
});

// ── Worker rating history ────────────────────────────────
app.get('/api/workers/:workerId/ratings', (req, res) => {
  const worker = WORKERS[req.params.workerId];
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  res.json({
    workerId: req.params.workerId,
    currentRating: worker.rating,
    history: ratingHistory(worker.rating),
  });
});

// ── Platform status (simulated) ──────────────────────────
app.get('/api/status/:platform', (req, res) => {
  const p = req.params.platform;
  if (!platformStatus[p]) return res.status(404).json({ error: 'Unknown platform' });
  res.json({ platform: p, ...platformStatus[p] });
});

// Toggle outage on/off for testing
app.post('/api/status/:platform/toggle', (req, res) => {
  const p = req.params.platform;
  if (!platformStatus[p]) return res.status(404).json({ error: 'Unknown platform' });
  platformStatus[p].isDown = !platformStatus[p].isDown;
  platformStatus[p].reports = platformStatus[p].isDown ? jitter(500) : jitter(15);
  res.json({ platform: p, ...platformStatus[p] });
});

// ── DownDetector simulation ──────────────────────────────
app.get('/api/downdetector/:platform', (req, res) => {
  const p = req.params.platform;
  if (!ddSpike[p]) return res.status(404).json({ error: 'Unknown platform' });
  res.json({ platform: p, ...ddSpike[p] });
});

// Toggle DD spike for testing
app.post('/api/downdetector/:platform/toggle', (req, res) => {
  const p = req.params.platform;
  if (!ddSpike[p]) return res.status(404).json({ error: 'Unknown platform' });
  ddSpike[p].spikeDetected = !ddSpike[p].spikeDetected;
  ddSpike[p].reportCount = ddSpike[p].spikeDetected ? jitter(2000) : jitter(40);
  res.json({ platform: p, ...ddSpike[p] });
});

// ── Start ────────────────────────────────────────────────
const PORT = process.env.MOCK_PORT || 4000;
app.listen(PORT, () => {
  console.log(`[Mock Platform] listening on :${PORT}`);
});

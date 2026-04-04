require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const weatherTrigger = require('./triggers/weather');
const outageTrigger = require('./triggers/outage');

const app = express();
app.use(cors());
app.use(express.json());

// ── Health ───────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ service: 'gigguard-backend', status: 'ok' }));

// ── Trigger API routes ──────────────────────────────────
app.post('/api/triggers/weather/check', weatherTrigger.checkWeatherTrigger);
app.post('/api/triggers/outage/check', outageTrigger.checkOutageTrigger);

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[GigGuard Backend] listening on :${PORT}`);

  // Start background pollers
  outageTrigger.startPolling();
  console.log('[GigGuard Backend] outage poller started');
});

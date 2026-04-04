import { useState } from 'react';
import { FlaskConical, Search, CloudRain, Wifi, IndianRupee, Calendar, MapPin, Loader2 } from 'lucide-react';

// ── Simulated historical disruption data (last 30 days) ──
const DISRUPTION_DB = {
  '560034': [ // Koramangala
    { date: '2026-03-28', type: 'weather', rainfallMM: 48, durationHrs: 3.2, orderDrop: 62 },
    { date: '2026-03-22', type: 'outage',  platform: 'zomato', durationHrs: 2.5 },
    { date: '2026-03-15', type: 'weather', rainfallMM: 41, durationHrs: 1.8, orderDrop: 55 },
    { date: '2026-03-10', type: 'weather', rainfallMM: 52, durationHrs: 4.1, orderDrop: 71 },
  ],
  '560038': [ // Indiranagar
    { date: '2026-03-25', type: 'weather', rainfallMM: 37, durationHrs: 1.5, orderDrop: 52 },
    { date: '2026-03-19', type: 'outage',  platform: 'swiggy', durationHrs: 2.1 },
  ],
  '400069': [ // Andheri
    { date: '2026-03-30', type: 'weather', rainfallMM: 65, durationHrs: 5.0, orderDrop: 78 },
    { date: '2026-03-27', type: 'weather', rainfallMM: 42, durationHrs: 2.8, orderDrop: 58 },
    { date: '2026-03-20', type: 'outage',  platform: 'zomato', durationHrs: 3.0 },
    { date: '2026-03-14', type: 'weather', rainfallMM: 39, durationHrs: 1.2, orderDrop: 51 },
    { date: '2026-03-08', type: 'outage',  platform: 'swiggy', durationHrs: 2.3 },
  ],
  '400050': [ // Bandra
    { date: '2026-03-26', type: 'weather', rainfallMM: 44, durationHrs: 2.5, orderDrop: 60 },
    { date: '2026-03-18', type: 'outage',  platform: 'swiggy', durationHrs: 2.8 },
  ],
  '110001': [ // Connaught Place
    { date: '2026-03-29', type: 'weather', rainfallMM: 36, durationHrs: 1.0, orderDrop: 53 },
    { date: '2026-03-21', type: 'outage',  platform: 'zomato', durationHrs: 2.2 },
    { date: '2026-03-12', type: 'weather', rainfallMM: 40, durationHrs: 2.0, orderDrop: 56 },
  ],
};

const AVG_HOURLY_RATE = 150; // ₹
const PAYOUT_MULTIPLIER = 0.8;

function simulatePayouts(pincode) {
  const disruptions = DISRUPTION_DB[pincode] || [];
  return disruptions.map((d) => {
    const amount = Math.round(AVG_HOURLY_RATE * d.durationHrs * PAYOUT_MULTIPLIER);
    return { ...d, payoutAmount: amount };
  });
}

export default function Simulate() {
  const [pincode, setPincode] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = () => {
    setLoading(true);
    // Simulate a short delay for realism
    setTimeout(() => {
      const payouts = simulatePayouts(pincode);
      setResults(payouts);
      setLoading(false);
    }, 800);
  };

  const totalPayout = results?.reduce((sum, r) => sum + r.payoutAmount, 0) || 0;
  const weatherEvents = results?.filter((r) => r.type === 'weather').length || 0;
  const outageEvents = results?.filter((r) => r.type === 'outage').length || 0;

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* ── Header ───────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FlaskConical size={20} className="text-gg-accent" />
          GG Simulate
        </h1>
        <p className="text-sm text-gg-muted mt-1">
          See what payouts would have been generated in your zone over the last 30 days
        </p>
      </div>

      {/* ── Input ────────────────────────────────────────── */}
      <div className="gg-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gg-muted" />
            <input
              id="simulate-pincode"
              type="text"
              maxLength={6}
              placeholder="Enter zone pincode (e.g., 560034)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="gg-input pl-11 font-mono"
            />
          </div>
          <button
            id="simulate-btn"
            onClick={handleSimulate}
            disabled={pincode.length !== 6 || loading}
            className="gg-btn-primary flex items-center justify-center gap-2 sm:w-auto"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Simulate
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gg-muted">Try:</span>
          {['560034', '400069', '110001', '560038'].map((pc) => (
            <button
              key={pc}
              onClick={() => setPincode(pc)}
              className="text-xs text-gg-accent hover:text-gg-accent-light px-2 py-0.5 rounded bg-gg-accent/5 hover:bg-gg-accent/10 transition-colors font-mono"
            >
              {pc}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────── */}
      {results !== null && (
        <div className="animate-slide-up space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Payout',     value: `₹${totalPayout.toLocaleString()}`, icon: IndianRupee, color: 'text-gg-success' },
              { label: 'Weather Events',    value: weatherEvents, icon: CloudRain, color: 'text-blue-400' },
              { label: 'Outage Events',     value: outageEvents, icon: Wifi, color: 'text-gg-warn' },
              { label: 'Events (30 days)',  value: results.length, icon: Calendar, color: 'text-gg-accent' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="gg-card text-center">
                <Icon size={20} className={`${color} mx-auto mb-2`} />
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-gg-muted uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {results.length === 0 ? (
            <div className="gg-card text-center py-12">
              <FlaskConical size={32} className="text-gg-muted mx-auto mb-3" />
              <p className="text-gg-muted">No disruption events found for pincode <span className="font-mono text-gg-text">{pincode}</span></p>
              <p className="text-xs text-gg-muted mt-1">Try a different zone or check back during monsoon season</p>
            </div>
          ) : (
            /* Event timeline */
            <div className="gg-card">
              <h2 className="font-semibold text-sm mb-4">Disruption Timeline</h2>
              <div className="space-y-3">
                {results.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-xl bg-gg-surface border border-gg-border/50 hover:border-gg-border transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      event.type === 'weather' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                    }`}>
                      {event.type === 'weather'
                        ? <CloudRain size={18} className="text-blue-400" />
                        : <Wifi size={18} className="text-amber-400" />
                      }
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">
                          {event.type === 'weather' ? 'Weather Disruption' : 'Platform Outage'}
                        </p>
                        <span className="text-sm font-bold text-gg-success">₹{event.payoutAmount}</span>
                      </div>
                      <p className="text-xs text-gg-muted mt-1">
                        {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}
                        {event.durationHrs}h duration
                        {event.type === 'weather' && ` · ${event.rainfallMM}mm rain · ${event.orderDrop}% order drop`}
                        {event.type === 'outage' && ` · ${event.platform}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formula explanation */}
              <div className="mt-4 p-3 rounded-xl bg-gg-accent/5 border border-gg-accent/10">
                <p className="text-xs text-gg-muted">
                  <span className="text-gg-accent font-semibold">Payout formula:</span>{' '}
                  Avg hourly rate (₹{AVG_HOURLY_RATE}) × Disruption hours × {PAYOUT_MULTIPLIER}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

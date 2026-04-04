import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Map as MapIcon, Circle, RefreshCw } from 'lucide-react';

// ── Zone data with coordinates ───────────────────────────
const ZONES = [
  { id: 'zone-koramangala', name: 'Koramangala',      city: 'Bangalore', lat: 12.9352, lng: 77.6245, risk: 'low' },
  { id: 'zone-indiranagar', name: 'Indiranagar',      city: 'Bangalore', lat: 12.9784, lng: 77.6408, risk: 'low' },
  { id: 'zone-andheri',     name: 'Andheri',           city: 'Mumbai',    lat: 19.1136, lng: 72.8697, risk: 'high' },
  { id: 'zone-bandra',      name: 'Bandra',            city: 'Mumbai',    lat: 19.0596, lng: 72.8295, risk: 'moderate' },
  { id: 'zone-connaught',   name: 'Connaught Place',   city: 'Delhi',     lat: 28.6315, lng: 77.2167, risk: 'moderate' },
  { id: 'zone-hauzKhas',    name: 'Hauz Khas',         city: 'Delhi',     lat: 28.5494, lng: 77.2001, risk: 'low' },
];

const RISK_COLORS = {
  low:      { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: '#10b981', label: 'Low Risk' },
  moderate: { bg: 'bg-amber-500/20',   border: 'border-amber-500/40',   text: 'text-amber-400',   dot: '#f59e0b', label: 'Moderate' },
  high:     { bg: 'bg-red-500/20',     border: 'border-red-500/40',     text: 'text-red-400',     dot: '#ef4444', label: 'High Risk' },
};

const CITIES = ['All', 'Bangalore', 'Mumbai', 'Delhi'];

export default function HeatMap() {
  const [zones, setZones] = useState(ZONES);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedZone, setSelectedZone] = useState(null);

  // ── Supabase Realtime: listen for trigger state changes ─
  useEffect(() => {
    const channel = supabase
      .channel('trigger-states')
      .on('broadcast', { event: 'trigger_update' }, ({ payload }) => {
        setZones((prev) =>
          prev.map((z) =>
            z.id === payload.zoneId ? { ...z, risk: payload.riskLevel } : z,
          ),
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = selectedCity === 'All' ? zones : zones.filter((z) => z.city === selectedCity);

  const getMapSrc = useCallback(() => {
    // Build a static Google Maps embed centered on India with zone markers
    const center = selectedCity === 'Bangalore' ? '12.95,77.63'
      : selectedCity === 'Mumbai' ? '19.08,72.85'
      : selectedCity === 'Delhi' ? '28.59,77.21'
      : '20.5937,78.9629';

    const zoom = selectedCity === 'All' ? 5 : 12;
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

    // Construct marker params
    const markers = filtered
      .map((z) => {
        const color = z.risk === 'high' ? 'red' : z.risk === 'moderate' ? 'orange' : 'green';
        return `markers=color:${color}|label:${z.name[0]}|${z.lat},${z.lng}`;
      })
      .join('&');

    return `https://www.google.com/maps/embed/v1/view?key=${key}&center=${center}&zoom=${zoom}`;
  }, [selectedCity, filtered]);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MapIcon size={20} className="text-gg-accent" />
            GG Heat Map
          </h1>
          <p className="text-sm text-gg-muted mt-1">Live zone risk levels from active triggers</p>
        </div>

        {/* City filter */}
        <div className="flex gap-2">
          {CITIES.map((c) => (
            <button
              key={c}
              id={`city-filter-${c.toLowerCase()}`}
              onClick={() => { setSelectedCity(c); setSelectedZone(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedCity === c
                  ? 'bg-gg-accent text-white shadow-lg shadow-gg-accent/20'
                  : 'bg-gg-card text-gg-muted border border-gg-border hover:border-gg-accent/30'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Map embed ──────────────────────────────────── */}
        <div className="lg:col-span-2 gg-card p-0 overflow-hidden" style={{ minHeight: 420 }}>
          <div className="relative w-full h-full min-h-[420px]">
            {/* Visual map representation */}
            <div className="absolute inset-0 bg-gg-surface flex items-center justify-center">
              <div className="relative w-full h-full p-8">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Zone bubbles */}
                <div className="relative h-full flex flex-wrap items-center justify-center gap-6 p-4">
                  {filtered.map((zone, i) => {
                    const rc = RISK_COLORS[zone.risk];
                    const isSelected = selectedZone?.id === zone.id;
                    return (
                      <button
                        key={zone.id}
                        id={`zone-bubble-${zone.id}`}
                        onClick={() => setSelectedZone(zone)}
                        className={`relative group flex flex-col items-center gap-2 p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${rc.bg} ${rc.border} ${
                          isSelected ? 'scale-110 shadow-xl ring-2 ring-offset-2 ring-offset-gg-surface' : 'hover:scale-105'
                        }`}
                        style={{
                          animationDelay: `${i * 100}ms`,
                          ...(isSelected ? { ringColor: rc.dot } : {}),
                        }}
                      >
                        {/* Pulsing dot */}
                        <div className="relative">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: rc.dot }} />
                          <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-40" style={{ backgroundColor: rc.dot }} />
                        </div>
                        <span className="font-semibold text-sm">{zone.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${rc.text}`}>
                          {rc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Zone list sidebar ──────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Active Zones</h2>
            <button
              id="refresh-zones-btn"
              className="p-2 rounded-lg bg-gg-card border border-gg-border hover:border-gg-accent/30 transition-colors"
              onClick={() => setZones([...ZONES])}
            >
              <RefreshCw size={14} className="text-gg-muted" />
            </button>
          </div>

          {filtered.map((zone) => {
            const rc = RISK_COLORS[zone.risk];
            return (
              <button
                key={zone.id}
                id={`zone-list-${zone.id}`}
                onClick={() => setSelectedZone(zone)}
                className={`w-full text-left gg-card flex items-center gap-3 transition-all ${
                  selectedZone?.id === zone.id ? 'border-gg-accent' : ''
                }`}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: rc.dot }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{zone.name}</p>
                  <p className="text-xs text-gg-muted">{zone.city}</p>
                </div>
                <span className={`gg-badge ${rc.bg} ${rc.text} text-[10px]`}>
                  {rc.label}
                </span>
              </button>
            );
          })}

          {/* Legend */}
          <div className="gg-card mt-4">
            <p className="text-xs text-gg-muted font-medium mb-3">Legend</p>
            <div className="space-y-2">
              {Object.entries(RISK_COLORS).map(([key, rc]) => (
                <div key={key} className="flex items-center gap-2">
                  <Circle size={10} fill={rc.dot} color={rc.dot} />
                  <span className="text-xs text-gg-muted">{rc.label} — {
                    key === 'low' ? 'No active triggers'
                    : key === 'moderate' ? '1 trigger condition met'
                    : 'All trigger conditions met'
                  }</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

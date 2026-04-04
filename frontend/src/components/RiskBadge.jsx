export default function RiskBadge({ risk }) {
  const config = {
    low:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', label: 'Low Risk' },
    moderate: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   bar: 'bg-amber-500',   label: 'Moderate' },
    high:     { color: 'text-red-400',     bg: 'bg-red-500/10',     bar: 'bg-red-500',     label: 'High Risk' },
  };

  const c = config[risk.level] || config.moderate;

  return (
    <div className={`rounded-xl p-4 ${c.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-bold ${c.color}`}>{c.label}</span>
        <span className={`text-2xl font-bold ${c.color}`}>{risk.score}</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-gg-surface overflow-hidden">
        <div
          className={`h-full rounded-full ${c.bar} transition-all duration-700`}
          style={{ width: `${risk.score}%` }}
        />
      </div>
      <p className="text-[10px] text-gg-muted mt-2">Based on weather, pollution, and platform data</p>
    </div>
  );
}

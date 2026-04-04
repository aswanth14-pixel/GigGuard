import { Shield, Calendar, CreditCard, MapPin, Smartphone } from 'lucide-react';

export default function PolicyCard({ policy }) {
  const statusColor = policy.status === 'active'
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gg-border">
      {/* Gradient header */}
      <div className="gradient-accent p-5 pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-white/80" />
            <span className="font-bold text-white">{policy.plan}</span>
          </div>
          <span className={`gg-badge border ${statusColor}`}>
            <div className="live-dot !w-1.5 !h-1.5" style={{ '--tw-bg-opacity': 1 }} />
            {policy.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-gg-card p-5 -mt-5 rounded-t-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: CreditCard, label: 'Premium', value: `₹${policy.weeklyPremium}/week` },
            { icon: Shield,     label: 'Cover Limit', value: `₹${policy.coverageLimit.toLocaleString()}/event` },
            { icon: MapPin,     label: 'Zone', value: `${policy.zone} (${policy.pincode})` },
            { icon: Smartphone, label: 'Platform', value: policy.platform.charAt(0).toUpperCase() + policy.platform.slice(1) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gg-muted uppercase tracking-wide flex items-center gap-1">
                <Icon size={10} /> {label}
              </p>
              <p className="text-sm font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gg-border">
          <div className="flex items-center gap-1.5 text-xs text-gg-muted">
            <Calendar size={12} />
            <span>Since {new Date(policy.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="text-xs">
            <span className="text-gg-muted">Renews </span>
            <span className="text-gg-accent font-medium">
              {new Date(policy.nextRenewal).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

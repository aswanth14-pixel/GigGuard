import { CloudRain, Wifi, Check, Clock, IndianRupee } from 'lucide-react';

const REASON_META = {
  weather_disruption: { icon: CloudRain, label: 'Weather Disruption', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  platform_outage:    { icon: Wifi,      label: 'Platform Outage',    color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const STATUS_META = {
  completed:  { icon: Check, label: 'Completed',  color: 'text-emerald-400' },
  processing: { icon: Clock, label: 'Processing', color: 'text-amber-400' },
};

export default function PayoutHistory({ payouts }) {
  if (!payouts || payouts.length === 0) {
    return (
      <div className="text-center py-8">
        <IndianRupee size={24} className="text-gg-muted mx-auto mb-2" />
        <p className="text-sm text-gg-muted">No payouts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {payouts.map((p) => {
        const reason = REASON_META[p.reason] || REASON_META.weather_disruption;
        const status = STATUS_META[p.status] || STATUS_META.processing;
        const ReasonIcon = reason.icon;
        const StatusIcon = status.icon;

        return (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gg-surface border border-gg-border/50 hover:border-gg-border transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${reason.bg}`}>
              <ReasonIcon size={16} className={reason.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{reason.label}</p>
              <p className="text-[10px] text-gg-muted">
                {new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-gg-success">₹{p.amount}</p>
              <p className={`text-[10px] flex items-center gap-1 justify-end ${status.color}`}>
                <StatusIcon size={10} />
                {status.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

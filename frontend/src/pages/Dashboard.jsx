import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PolicyCard from '../components/PolicyCard';
import PayoutHistory from '../components/PayoutHistory';
import RiskBadge from '../components/RiskBadge';
import {
  Shield, TrendingUp, AlertTriangle, Download,
  IndianRupee, Clock, Zap, Activity,
} from 'lucide-react';

// ── Demo data (until Supabase is wired) ──────────────────
const DEMO_POLICY = {
  id: 'pol_001',
  plan: 'GG Standard',
  status: 'active',
  weeklyPremium: 52,
  coverageLimit: 1200,
  startDate: '2026-03-15',
  nextRenewal: '2026-04-07',
  platform: 'zomato',
  zone: 'Koramangala',
  pincode: '560034',
};

const DEMO_PAYOUTS = [
  { id: 'pay_001', amount: 480,  reason: 'weather_disruption', status: 'completed', createdAt: '2026-03-28T14:30:00Z' },
  { id: 'pay_002', amount: 720,  reason: 'platform_outage',    status: 'completed', createdAt: '2026-03-22T20:15:00Z' },
  { id: 'pay_003', amount: 360,  reason: 'weather_disruption', status: 'completed', createdAt: '2026-03-18T11:45:00Z' },
  { id: 'pay_004', amount: 940,  reason: 'platform_outage',    status: 'processing', createdAt: '2026-04-01T19:22:00Z' },
];

const DEMO_RISK = { level: 'moderate', score: 62, factors: ['Monsoon approaching', 'High order volume zone'] };

export default function Dashboard() {
  const [policy] = useState(DEMO_POLICY);
  const [payouts, setPayouts] = useState(DEMO_PAYOUTS);
  const [risk] = useState(DEMO_RISK);

  // ── Supabase Realtime: listen for new payouts ──────────
  useEffect(() => {
    const channel = supabase
      .channel('payouts-realtime')
      .on('broadcast', { event: 'payout_created' }, (payload) => {
        console.log('[Realtime] new payout:', payload);
        setPayouts((prev) => [payload.payload, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalPaid = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleDownloadPassport = () => {
    // Placeholder: would generate a PDF with policy details + payout history
    alert('GG Passport download will be available soon!');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* ── Header KPIs ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Paid Out',   value: `₹${totalPaid.toLocaleString()}`, icon: IndianRupee, color: 'text-gg-success' },
          { label: 'Active Claims',     value: payouts.filter((p) => p.status === 'processing').length, icon: Clock, color: 'text-gg-warn' },
          { label: 'Triggers Fired',    value: payouts.length, icon: Zap, color: 'text-gg-accent' },
          { label: 'Zone Risk',         value: `${risk.score}/100`, icon: Activity, color: risk.score > 70 ? 'text-gg-danger' : 'text-gg-warn' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="gg-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gg-muted">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Policy Card (col-span-2) ───────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <PolicyCard policy={policy} />

          {/* ── Payout History ───────────────────────────── */}
          <div className="gg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-gg-accent" />
                Payout History
              </h2>
              <span className="text-xs text-gg-muted">{payouts.length} events</span>
            </div>
            <PayoutHistory payouts={payouts} />
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Risk Level */}
          <div className="gg-card">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-gg-warn" />
              Zone Risk Level
            </h2>
            <RiskBadge risk={risk} />
            <ul className="mt-4 space-y-2">
              {risk.factors.map((f) => (
                <li key={f} className="text-xs text-gg-muted flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gg-warn" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* GG Passport */}
          <div className="gg-card relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gg-accent/5" />
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <Shield size={16} className="text-gg-accent" />
              GG Passport
            </h2>
            <p className="text-xs text-gg-muted mb-4">
              Your verified insurance identity — proof of coverage, payout history, and trust score.
            </p>
            <button
              id="download-passport-btn"
              onClick={handleDownloadPassport}
              className="gg-btn-outline w-full flex items-center justify-center gap-2 text-xs"
            >
              <Download size={14} />
              Download Passport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

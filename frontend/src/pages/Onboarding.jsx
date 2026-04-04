import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Phone, MapPin, Zap, ChevronRight, Check, Loader2 } from 'lucide-react';

const PLANS = [
  {
    id: 'basic',
    name: 'GG Basic',
    price: 29,
    color: 'from-slate-600 to-slate-500',
    features: ['Weather disruption cover', 'Up to ₹500/event', 'WhatsApp alerts'],
  },
  {
    id: 'standard',
    name: 'GG Standard',
    price: 52,
    color: 'from-indigo-600 to-violet-500',
    popular: true,
    features: ['Weather + outage cover', 'Up to ₹1,200/event', 'WhatsApp + push alerts', 'GG Passport'],
  },
  {
    id: 'pro',
    name: 'GG Pro',
    price: 89,
    color: 'from-amber-500 to-orange-500',
    features: ['All disruption types', 'Up to ₹2,500/event', 'Priority payouts (<30 min)', 'GG Passport + analytics', 'Demotion protection'],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pincode, setPincode] = useState('');
  const [platform, setPlatform] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Step 1: Phone OTP ───────────────────────────────────
  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
      if (error) throw error;
      setOtpSent(true);
    } catch (err) {
      console.error('OTP send error:', err.message);
      // In dev, skip OTP and proceed
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      setStep(2);
    } catch (err) {
      console.error('OTP verify error:', err.message);
      // Dev fallback
      setStep(2);
    }
    setLoading(false);
  };

  // ── Step 3: Plan confirm ────────────────────────────────
  const handleConfirm = () => {
    // In production: create worker + policy in Supabase
    console.log('Enrolled:', { phone, pincode, platform, plan: selectedPlan });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gg-bg gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* ── Logo ───────────────────────────────────────── */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gg-accent/20">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            Gig<span className="text-gg-accent">Guard</span>
          </h1>
          <p className="text-gg-muted text-sm mt-1">Income insurance for delivery workers</p>
        </div>

        {/* ── Progress indicator ─────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > s
                    ? 'bg-gg-success text-white'
                    : step === s
                    ? 'bg-gg-accent text-white shadow-lg shadow-gg-accent/30'
                    : 'bg-gg-card text-gg-muted border border-gg-border'
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 rounded ${step > s ? 'bg-gg-success' : 'bg-gg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Phone OTP ──────────────────────────── */}
        {step === 1 && (
          <div className="gg-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gg-accent/10 flex items-center justify-center">
                <Phone size={18} className="text-gg-accent" />
              </div>
              <div>
                <h2 className="font-semibold">Verify your phone</h2>
                <p className="text-xs text-gg-muted">We'll send a 6-digit OTP via SMS</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="gg-input w-16 text-center text-gg-muted flex items-center justify-center">+91</div>
                <input
                  id="phone-input"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="gg-input flex-1 font-mono tracking-widest"
                />
              </div>

              {!otpSent ? (
                <button
                  id="send-otp-btn"
                  onClick={handleSendOtp}
                  disabled={phone.length !== 10 || loading}
                  className="gg-btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                  Send OTP
                </button>
              ) : (
                <>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="gg-input text-center font-mono tracking-[0.5em] text-xl"
                  />
                  <button
                    id="verify-otp-btn"
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || loading}
                    className="gg-btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Verify & Continue
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Zone / Platform ────────────────────── */}
        {step === 2 && (
          <div className="gg-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gg-success/10 flex items-center justify-center">
                <MapPin size={18} className="text-gg-success" />
              </div>
              <div>
                <h2 className="font-semibold">Your delivery zone</h2>
                <p className="text-xs text-gg-muted">Enter the pincode where you deliver most</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                id="pincode-input"
                type="text"
                maxLength={6}
                placeholder="6-digit pincode (e.g., 560034)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="gg-input font-mono tracking-widest text-center text-lg"
              />

              <div>
                <p className="text-sm text-gg-muted mb-3">Which platform do you deliver for?</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Zomato', 'Swiggy'].map((p) => (
                    <button
                      key={p}
                      id={`platform-${p.toLowerCase()}-btn`}
                      onClick={() => setPlatform(p.toLowerCase())}
                      className={`gg-card text-center py-4 cursor-pointer transition-all ${
                        platform === p.toLowerCase()
                          ? 'border-gg-accent bg-gg-accent/5 shadow-lg shadow-gg-accent/10'
                          : ''
                      }`}
                    >
                      <span className="text-2xl">{p === 'Zomato' ? '🍽️' : '🛵'}</span>
                      <p className="font-semibold mt-1">{p}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="zone-continue-btn"
                onClick={() => setStep(3)}
                disabled={pincode.length !== 6 || !platform}
                className="gg-btn-primary w-full flex items-center justify-center gap-2"
              >
                <ChevronRight size={16} />
                Choose Plan
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Plan Selection ─────────────────────── */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div className="text-center mb-6">
              <Zap size={20} className="text-gg-accent mx-auto mb-2" />
              <h2 className="font-semibold text-lg">Choose your plan</h2>
              <p className="text-xs text-gg-muted">Weekly premium, cancel anytime</p>
            </div>

            <div className="space-y-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  id={`plan-${plan.id}-btn`}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left gg-card relative overflow-hidden transition-all ${
                    selectedPlan === plan.id
                      ? 'border-gg-accent shadow-lg shadow-gg-accent/10'
                      : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gg-accent text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <ul className="mt-2 space-y-1">
                        {plan.features.map((f) => (
                          <li key={f} className="text-xs text-gg-muted flex items-center gap-1.5">
                            <Check size={12} className="text-gg-success shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">₹{plan.price}</span>
                      <p className="text-[10px] text-gg-muted">/week</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              id="confirm-plan-btn"
              onClick={handleConfirm}
              disabled={!selectedPlan}
              className="gg-btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              <Shield size={16} />
              Activate GigGuard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, FlaskConical, Shield } from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/heatmap',   label: 'Heat Map',  icon: Map },
  { to: '/simulate',  label: 'Simulate',  icon: FlaskConical },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gg-bg gradient-mesh flex flex-col">
      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Gig<span className="text-gg-accent">Guard</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-gg-accent/10 text-gg-accent'
                      : 'text-gg-muted hover:text-gg-text hover:bg-white/5'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="live-dot" title="Live connection" />
            <div className="w-8 h-8 rounded-full bg-gg-accent/20 flex items-center justify-center text-xs font-bold text-gg-accent">
              GG
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 animate-fade-in">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 glass border-t border-white/5 z-50">
        <div className="flex justify-around py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-gg-accent' : 'text-gg-muted'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

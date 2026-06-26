import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './nav';
import { Icon } from '../ui/Icon';
import { GlobalSearch } from './GlobalSearch';
import { AutosaveIndicator } from './AutosaveIndicator';
import { useStore } from '../../store/useStore';
import { cn } from '../ui/cn';

function DemoBanner() {
  return (
    <div className="flex items-center gap-2 bg-warn/10 px-4 py-1.5 text-center text-[11px] font-medium text-warn ring-1 ring-inset ring-warn/20">
      <Icon name="warning" size={13} className="shrink-0" />
      <span className="flex-1">
        Demo workspace only. Do not enter real confidential, personal, customer,
        regulated, or sensitive company data. All data stays in your browser.
      </span>
    </div>
  );
}

function Brand() {
  const org = useStore((s) => s.data.organizationName);
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand ring-1 ring-brand/30">
        <Icon name="shield" size={18} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ink">AI Compliance</div>
        <div className="truncate text-[11px] text-faint">{org || 'Workspace'}</div>
      </div>
    </div>
  );
}

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand/15 text-brand ring-1 ring-inset ring-brand/25'
                : 'text-muted hover:bg-elevated hover:text-ink'
            )
          }
        >
          <Icon name={item.icon} />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-panel md:flex">
          <div className="flex h-14 items-center border-b border-border">
            <Brand />
          </div>
          <SidebarLinks />
          <div className="border-t border-border p-3 text-[10px] leading-snug text-faint">
            Practical workspace for AI governance, risk tracking, evidence &amp; audit
            prep. Not legal advice.
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-panel">
              <div className="flex h-14 items-center justify-between border-b border-border pr-2">
                <Brand />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-1 text-muted hover:bg-elevated"
                >
                  ✕
                </button>
              </div>
              <SidebarLinks onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b border-border bg-panel/80 px-3 backdrop-blur sm:px-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-muted hover:bg-elevated md:hidden"
              aria-label="Open menu"
            >
              <Icon name="menu" size={18} />
            </button>
            <GlobalSearch />
            <div className="ml-auto hidden sm:block">
              <AutosaveIndicator />
            </div>
          </header>

          <main
            key={location.pathname}
            className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8"
          >
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

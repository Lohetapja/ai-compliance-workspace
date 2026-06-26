import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './nav';
import { Icon } from '../ui/Icon';
import { GlobalSearch } from './GlobalSearch';
import { AutosaveIndicator } from './AutosaveIndicator';
import { useStore } from '../../store/useStore';
import { cn } from '../ui/cn';

// Author attribution. GitHub points to the repo owner; update the LinkedIn slug
// if it differs from the default below.
const GITHUB_URL = 'https://github.com/Lohetapja';
const LINKEDIN_URL = 'https://www.linkedin.com/in/riivo-maadla/';

function DemoBanner() {
  return (
    <div className="flex items-center gap-2 bg-warn/10 px-4 py-2 text-center text-xs font-medium text-warn ring-1 ring-inset ring-warn/20">
      <Icon name="warning" size={14} className="shrink-0" />
      <span className="flex-1">
        Demo workspace only. Do not enter real confidential, personal, customer,
        regulated, or sensitive company data. All data stays in your browser.
      </span>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-border px-4 py-3.5">
      <div className="text-[13px] font-medium text-ink">Built by Riivo Maadla</div>
      <div className="mt-1.5 flex items-center gap-3">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-brand"
        >
          GitHub <Icon name="external" size={11} />
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-brand"
        >
          LinkedIn <Icon name="external" size={11} />
        </a>
      </div>
      <div className="mt-2.5 text-xs leading-snug text-faint">
        Practical AI governance workspace — not legal advice.
      </div>
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
        <div className="truncate text-[15px] font-semibold text-ink">AI Compliance</div>
        <div className="truncate text-xs text-muted">{org || 'Workspace'}</div>
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
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-brand/15 font-semibold text-brand ring-1 ring-inset ring-brand/25'
                : 'font-medium text-muted hover:bg-elevated hover:text-ink'
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
          <SidebarFooter />
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
              <SidebarFooter />
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

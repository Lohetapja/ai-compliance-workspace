import type { IconName } from '../ui/Icon';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/about', label: 'About Project', icon: 'shield' },
      { to: '/research', label: 'Research Sources', icon: 'book' },
    ],
  },
  {
    heading: 'Inventory & Intake',
    items: [
      { to: '/systems', label: 'AI Systems', icon: 'systems' },
      { to: '/use-cases', label: 'Use Case Intake', icon: 'inbox' },
      { to: '/vendors', label: 'Vendor Register', icon: 'box' },
    ],
  },
  {
    heading: 'Risk & Controls',
    items: [
      { to: '/risk-helper', label: 'Risk Helper', icon: 'helper' },
      { to: '/risks', label: 'Risk Register', icon: 'risk' },
      { to: '/controls', label: 'Controls & Evidence', icon: 'controls' },
      { to: '/gap-actions', label: 'Gap Actions', icon: 'warning' },
    ],
  },
  {
    heading: 'Assurance',
    items: [
      { to: '/framework-lenses', label: 'Framework Lenses', icon: 'layers' },
      { to: '/review-queue', label: 'Review Queue', icon: 'clock' },
      { to: '/owners', label: 'Owners & Responsibilities', icon: 'users' },
      { to: '/frameworks', label: 'Framework Mapping', icon: 'framework' },
      { to: '/incidents', label: 'Incidents / Issues', icon: 'incident' },
      { to: '/decisions', label: 'Decision Journal', icon: 'decision' },
    ],
  },
  {
    heading: 'Outputs',
    items: [{ to: '/reports', label: 'Reports', icon: 'report' }],
  },
  {
    heading: 'Admin',
    items: [{ to: '/settings', label: 'Settings / Data', icon: 'settings' }],
  },
];

/** Flat list (used by anything that needs every nav destination). */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

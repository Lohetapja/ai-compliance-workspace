import type { IconName } from '../ui/Icon';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/systems', label: 'AI Systems', icon: 'systems' },
  { to: '/risk-helper', label: 'Risk Helper', icon: 'helper' },
  { to: '/risks', label: 'Risk Register', icon: 'risk' },
  { to: '/controls', label: 'Controls & Evidence', icon: 'controls' },
  { to: '/gap-actions', label: 'Gap Actions', icon: 'warning' },
  { to: '/use-cases', label: 'Use Case Intake', icon: 'inbox' },
  { to: '/vendors', label: 'Vendor Register', icon: 'box' },
  { to: '/decisions', label: 'Decision Journal', icon: 'decision' },
  { to: '/incidents', label: 'Incidents / Issues', icon: 'incident' },
  { to: '/reports', label: 'Reports', icon: 'report' },
  { to: '/framework-lenses', label: 'Framework Lenses', icon: 'layers' },
  { to: '/frameworks', label: 'Framework Mapping', icon: 'framework' },
  { to: '/research', label: 'Research Sources', icon: 'book' },
  { to: '/settings', label: 'Settings / Data', icon: 'settings' },
  { to: '/about', label: 'About Project', icon: 'shield' },
];

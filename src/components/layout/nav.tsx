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
  { to: '/decisions', label: 'Decision Journal', icon: 'decision' },
  { to: '/incidents', label: 'Incidents / Issues', icon: 'incident' },
  { to: '/reports', label: 'Reports', icon: 'report' },
  { to: '/frameworks', label: 'Framework Mapping', icon: 'framework' },
  { to: '/settings', label: 'Settings / Data', icon: 'settings' },
];

import type { Evidence } from '../types';
import { reviewState } from './dates';

/** Evidence freshness, derived from status + reviewDate. Not a compliance signal. */
export type Freshness = 'fresh' | 'due-soon' | 'expired' | 'missing-review-date';

export const FRESHNESS_LABELS: Record<Freshness, string> = {
  fresh: 'Fresh',
  'due-soon': 'Due Soon',
  expired: 'Expired',
  'missing-review-date': 'Missing Review Date',
};

export function evidenceFreshness(e: Evidence): Freshness {
  if (e.status === 'expired') return 'expired';
  if (!e.reviewDate) return 'missing-review-date';
  const st = reviewState(e.reviewDate);
  if (st === 'overdue') return 'expired';
  if (st === 'due-7' || st === 'due-30') return 'due-soon';
  return 'fresh';
}

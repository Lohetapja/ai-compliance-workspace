import type { Evidence } from '../types';
import { reviewState } from './dates';

/** Evidence freshness, derived from status + review/expiry dates. Not a compliance signal. */
export type Freshness = 'fresh' | 'due-soon' | 'expired' | 'missing-review-date';

export const FRESHNESS_LABELS: Record<Freshness, string> = {
  fresh: 'Fresh',
  'due-soon': 'Due Soon',
  expired: 'Expired',
  'missing-review-date': 'Missing Review Date',
};

export function evidenceFreshness(e: Evidence): Freshness {
  if (e.status === 'expired') return 'expired';
  // A hard expiry date takes precedence over the review-date heuristic.
  if (e.expiryDate) {
    const ex = reviewState(e.expiryDate);
    if (ex === 'overdue') return 'expired';
    if (ex === 'due-7' || ex === 'due-30') return 'due-soon';
  }
  if (!e.reviewDate) return 'missing-review-date';
  const st = reviewState(e.reviewDate);
  if (st === 'overdue') return 'expired';
  if (st === 'due-7' || st === 'due-30') return 'due-soon';
  return 'fresh';
}

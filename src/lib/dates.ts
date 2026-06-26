/** Review-date helpers used across the dashboard, lists and reports. */

export type ReviewState = 'none' | 'ok' | 'due-30' | 'due-7' | 'overdue';

export const REVIEW_STATE_LABELS: Record<ReviewState, string> = {
  none: 'No review date',
  ok: 'Scheduled',
  'due-30': 'Due in 30 days',
  'due-7': 'Due in 7 days',
  overdue: 'Overdue',
};

const MS_PER_DAY = 86_400_000;

/** Whole-day difference between a date string and today (negative = past). */
export function daysUntil(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function reviewState(dateStr: string | undefined | null): ReviewState {
  const d = daysUntil(dateStr);
  if (d === null) return 'none';
  if (d < 0) return 'overdue';
  if (d <= 7) return 'due-7';
  if (d <= 30) return 'due-30';
  return 'ok';
}

export function isOverdue(dateStr: string | undefined | null): boolean {
  return reviewState(dateStr) === 'overdue';
}

export function isDueSoon(dateStr: string | undefined | null, days = 30): boolean {
  const d = daysUntil(dateStr);
  return d !== null && d >= 0 && d <= days;
}

/** Friendly "in 5 days" / "3 days overdue" / "today" text. */
export function relativeReview(dateStr: string | undefined | null): string {
  const d = daysUntil(dateStr);
  if (d === null) return '—';
  if (d === 0) return 'due today';
  if (d > 0) return `in ${d} day${d === 1 ? '' : 's'}`;
  const n = Math.abs(d);
  return `${n} day${n === 1 ? '' : 's'} overdue`;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr.length <= 10 ? dateStr + 'T00:00:00' : dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** Short, collision-resistant id generator (no external dependency). */
export function newId(prefix = 'id'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().split('-')[0]
      : Math.random().toString(16).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Today's date as YYYY-MM-DD (local). */
export function todayISODate(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

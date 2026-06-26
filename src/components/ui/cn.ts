/** Tiny className combiner — filters falsy values and joins with spaces. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

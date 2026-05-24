/**
 * Merge class names (lightweight clsx-style helper).
 * Pass strings, undefined, null, false — all falsy values are ignored.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Return the percentage (0-100) of completed vs total, clamped to [0, 100].
 */
export function calcPercent(completed, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

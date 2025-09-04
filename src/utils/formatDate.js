// lib/formatRange.js
export function formatRange(start, end) {
  const options = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString(undefined, options);
  const endStr = end.toLocaleDateString(undefined, options);

  return `${startStr} – ${endStr}`;
}

/* ── Credit Quest: Shared Utilities ─────────────────────────────────────────── */

/* Fisher-Yates shuffle — returns a new array */
export function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Escape user-provided text before interpolating it into HTML */
export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

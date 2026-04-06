/* ── Credit Quest: Hover-to-Define Tooltip System ───────────────────────────── */

'use strict';

let _dictionary = null;

async function loadDictionary() {
  if (_dictionary) return _dictionary;
  try {
    const res = await fetch('./data/pf_dictionary.json');
    const arr = await res.json();
    _dictionary = {};
    for (const entry of arr) {
      _dictionary[entry.id] = entry;
    }
  } catch (e) {
    console.warn('Could not load pf_dictionary.json', e);
    _dictionary = {};
  }
  return _dictionary;
}

/* ── Tooltip DOM element (singleton) ─────────────────────────────────────────── */

let _tooltipEl = null;

function getTooltipEl() {
  if (_tooltipEl) return _tooltipEl;
  _tooltipEl = document.createElement('div');
  _tooltipEl.className = 'tooltip';
  _tooltipEl.style.display = 'none';
  document.body.appendChild(_tooltipEl);
  return _tooltipEl;
}

function showTooltip(termEl, dict) {
  // Convert data-term (hyphen-separated) to dict key (underscore)
  const rawKey = termEl.dataset.term || '';
  const key = rawKey.replace(/-/g, '_');
  const entry = dict[key];
  if (!entry) return;

  const tooltip = getTooltipEl();
  tooltip.innerHTML = `<strong>${entry.term_en}</strong><br>${entry.definition_en || '<em>No definition available.</em>'}`;
  tooltip.style.display = 'block';
  tooltip.style.opacity = '0';

  // Position above the term span
  const rect = termEl.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  tooltip.style.left = '0';
  tooltip.style.top = '0';
  tooltip.style.maxWidth = '320px';

  // Force a layout to get the tooltip dimensions
  const ttW = tooltip.offsetWidth;
  const ttH = tooltip.offsetHeight;

  let left = rect.left + scrollX + rect.width / 2 - ttW / 2;
  let top  = rect.top  + scrollY - ttH - 10;

  // Keep within viewport
  const vpW = window.innerWidth;
  if (left + ttW > vpW + scrollX - 8) left = vpW + scrollX - ttW - 8;
  if (left < scrollX + 8) left = scrollX + 8;
  if (top < scrollY + 8) top = rect.bottom + scrollY + 10; // flip below

  tooltip.style.left = `${left}px`;
  tooltip.style.top  = `${top}px`;

  // Fade in
  requestAnimationFrame(() => {
    tooltip.style.transition = 'opacity 150ms ease';
    tooltip.style.opacity = '1';
  });
}

function hideTooltip() {
  const tooltip = getTooltipEl();
  tooltip.style.transition = 'opacity 150ms ease';
  tooltip.style.opacity = '0';
  setTimeout(() => {
    if (tooltip.style.opacity === '0') tooltip.style.display = 'none';
  }, 160);
}

/* ── Attach listeners to all .term spans inside a container ─────────────────── */

function attachTooltips(container, dict) {
  const terms = container.querySelectorAll('.term[data-term]');
  terms.forEach(el => {
    el.addEventListener('mouseenter', () => showTooltip(el, dict));
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('focus',      () => showTooltip(el, dict));
    el.addEventListener('blur',       hideTooltip);
  });
}

/* ── Track encountered terms for vocabulary review ──────────────────────────── */

function trackTerms(container, gameState) {
  const terms = container.querySelectorAll('.term[data-term]');
  terms.forEach(el => {
    const key = (el.dataset.term || '').replace(/-/g, '_');
    if (key) gameState.termsEncountered.add(key);
  });
}

// Fuzzy search with live suggestions. Desktop: the taskbar search box with a
// results panel above it. Phone: a "Search" pill above the dock that opens a
// full-screen sheet. Both share one index (js/search-index.js) and one engine.

const KINDS = { game: 'Games', person: 'People', studio: 'Studio', app: 'Apps' };
const TINTS = ['#0a66c2', '#7a3ee8', '#e0663a', '#138a5e', '#c2378a'];
const LIMIT = 10;
const SVG_SEARCH = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Fuse.js from the CDN (see the import map in index.html). If it can't load,
// a plain substring search keeps things working.
async function makeEngine(index) {
  try {
    const { default: Fuse } = await import('fuse.js');
    const fuse = new Fuse(index, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'keywords', weight: 0.3 },
        { name: 'subtitle', weight: 0.12 },
        { name: 'text', weight: 0.08 },
      ],
      threshold: 0.34,
      ignoreLocation: true,
      includeMatches: true,
      includeScore: true,
      minMatchCharLength: 2,
    });
    return (q) => fuse.search(q, { limit: LIMIT }).map((r) => ({ item: r.item, matches: r.matches || [] }));
  } catch (e) {
    console.warn('Fuzzy search unavailable, using plain search.', e);
    return (q) => {
      const t = q.toLowerCase();
      const fields = ['title', 'keywords', 'subtitle', 'text'];
      return index
        .map((item) => {
          const at = fields.findIndex((k) => [].concat(item[k] || []).join(' ').toLowerCase().includes(t));
          return { item, rank: at, matches: [] };
        })
        .filter((r) => r.rank >= 0)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, LIMIT);
    };
  }
}

// wrap matched ranges in <mark>; ranges come from Fuse (inclusive [start, end])
function mark(str, ranges = []) {
  const s = String(str || '');
  const rs = ranges.filter(([a, b]) => b - a >= 1).sort((x, y) => x[0] - y[0]);
  if (!rs.length) return esc(s);
  let out = '', i = 0;
  for (const [a, b] of rs) {
    if (a < i) continue;
    out += esc(s.slice(i, a)) + '<mark>' + esc(s.slice(a, b + 1)) + '</mark>';
    i = b + 1;
  }
  return out + esc(s.slice(i));
}

// plain-text highlight for the substring fallback / snippets
function markText(str, q) {
  const s = String(str || '');
  const i = q ? s.toLowerCase().indexOf(q.toLowerCase()) : -1;
  return i < 0 ? esc(s) : mark(s, [[i, i + q.length - 1]]);
}

// a short window of `text` around its first good match
function snippet(text, ranges, q) {
  const r = (ranges || []).filter(([a, b]) => b - a >= 2).sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]))[0];
  let at = r ? r[0] : String(text).toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return '';
  const from = Math.max(0, at - 32);
  const to = Math.min(text.length, at + 70);
  const piece = text.slice(from, to);
  const shifted = r ? [[r[0] - from, r[1] - from]] : null;
  return (from ? '…' : '') + (shifted ? mark(piece, shifted) : markText(piece, q)) + (to < text.length ? '…' : '');
}

export async function initSearch({ index, actions }) {
  const root = document.getElementById('home');
  const screen = root.querySelector('.os-screen');
  const search = await makeEngine(index);
  let tintN = 0;
  const tintOf = new Map(index.filter((r) => r.kind === 'person').map((r) => [r.id, TINTS[tintN++ % TINTS.length]]));

  const suggestions = () => [
    ...index.filter((r) => r.kind === 'game' && ['live', 'testing'].includes(r.status)),
    ...index.filter((r) => r.kind === 'studio' || (r.kind === 'app' && r.id === 'careers')),
  ].map((item) => ({ item, matches: [] }));

  function iconFor(r) {
    if (r.icon) return `<img src="${esc(r.icon)}" alt="">`;
    if (r.kind === 'person') return `<span class="srch-av" style="--tint:${tintOf.get(r.id)}">${esc(initials(r.title))}</span>`;
    if (r.kind === 'studio') return actions.logoHtml?.() || '';
    if (r.kind === 'app') return actions.appIconHtml?.(r.id) || '';
    return `<span class="srch-av" style="--tint:${esc(r.accent || '#f4b942')}">${esc((r.title || '?')[0])}</span>`;
  }

  function rowHtml({ item: r, matches }, i, q) {
    const by = (k) => matches.filter((m) => m.key === k);
    const title = q && matches.length ? mark(r.title, by('title')[0]?.indices) : q ? markText(r.title, q) : esc(r.title);
    // say *why* it matched when it wasn't the name: a keyword chip or a text snippet
    let why = '';
    if (q && !by('title').length) {
      const kw = by('keywords')[0];
      const tx = by('text')[0];
      if (kw) why = `<span class="srch-chip">${mark(kw.value, kw.indices)}</span>`;
      else if (tx) why = `<span class="srch-snip">${snippet(tx.value, tx.indices, q)}</span>`;
      else if (!matches.length && r.text?.toLowerCase().includes(q.toLowerCase())) why = `<span class="srch-snip">${snippet(r.text, null, q)}</span>`;
    }
    return `<button type="button" class="srch-row" data-hit="${i}" role="option" id="srch-opt-${i}">
      <span class="srch-ic">${iconFor(r)}</span>
      <span class="srch-t"><b>${title}</b><small>${esc(r.subtitle || '')}</small>${why}</span>
      <span class="srch-go" aria-hidden="true">›</span>
    </button>`;
  }

  // one input + one results list; two of these exist (desktop, phone)
  function controller(input, list, { onOpen, onClose } = {}) {
    let hits = [], active = -1;

    function render() {
      const q = input.value.trim();
      const raw = q ? search(q) : suggestions();
      // group by kind, groups ordered by their best hit
      const order = [...new Set(raw.map((h) => h.item.kind))];
      hits = order.flatMap((k) => raw.filter((h) => h.item.kind === k));
      active = q && hits.length ? 0 : -1;
      let n = 0;
      list.innerHTML = hits.length
        ? (q ? '' : '<p class="srch-h srch-h-top">Suggested</p>') +
          order.map((k) => {
            const group = hits.filter((h) => h.item.kind === k);
            return `${q ? `<p class="srch-h">${KINDS[k]}</p>` : ''}${group.map((h) => rowHtml(h, n++, q)).join('')}`;
          }).join('')
        : `<p class="srch-empty">No results for “${esc(q)}”</p>`;
      paint();
    }

    function paint() {
      list.querySelectorAll('.srch-row').forEach((b, i) => b.classList.toggle('on', i === active));
      input.setAttribute('aria-activedescendant', active >= 0 ? `srch-opt-${active}` : '');
      list.querySelector('.srch-row.on')?.scrollIntoView({ block: 'nearest' });
    }

    function choose(i) {
      const r = hits[i]?.item;
      if (!r) return;
      onClose?.(true);
      if (r.kind === 'game') actions.openGame(r.id);
      else if (r.kind === 'person') actions.openMember(r.id);
      else actions.openAppById(r.id);
    }

    input.addEventListener('input', () => { onOpen?.(); render(); });
    input.addEventListener('focus', () => { onOpen?.(); render(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!hits.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
        paint();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        choose(active >= 0 ? active : 0);
      } else if (e.key === 'Escape') {
        if (input.value) { input.value = ''; render(); } else onClose?.();
      }
    });
    // pointerdown so the input doesn't blur (and close the panel) first
    list.addEventListener('pointerdown', (e) => { if (e.target.closest('.srch-row')) e.preventDefault(); });
    list.addEventListener('click', (e) => {
      const row = e.target.closest('[data-hit]');
      if (row) choose(+row.dataset.hit);
    });
    list.addEventListener('pointermove', (e) => {
      const row = e.target.closest('[data-hit]');
      if (row && +row.dataset.hit !== active) { active = +row.dataset.hit; paint(); }
    });
    return { render };
  }

  // ── desktop: taskbar box + panel above it ──
  const box = root.querySelector('.os-search');
  box.innerHTML = `${SVG_SEARCH}<input type="search" placeholder="Search games, people, studio…" aria-label="Search Nixin"
      role="combobox" aria-expanded="false" aria-controls="srch-panel" autocomplete="off" spellcheck="false"><kbd>/</kbd>`;
  const dInput = box.querySelector('input');
  const panel = document.createElement('div');
  panel.className = 'srch-panel';
  panel.id = 'srch-panel';
  panel.setAttribute('role', 'listbox');
  panel.innerHTML = '<div class="srch-list"></div>';
  screen.appendChild(panel);
  const openPanel = () => { panel.classList.add('open'); box.classList.add('on'); dInput.setAttribute('aria-expanded', 'true'); };
  const closePanel = (picked) => {
    panel.classList.remove('open'); box.classList.remove('on'); dInput.setAttribute('aria-expanded', 'false');
    if (picked) { dInput.value = ''; dInput.blur(); }
  };
  controller(dInput, panel.querySelector('.srch-list'), { onOpen: openPanel, onClose: closePanel });
  dInput.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== dInput) closePanel(); }, 120));
  box.addEventListener('click', () => dInput.focus());

  addEventListener('keydown', (e) => {
    if (!root.classList.contains('unlocked') || innerWidth < 720) return;
    const typing = /^(input|textarea|select)$/i.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      dInput.focus();
      dInput.select();
    }
  });

  // ── phone: pill above the dock → full-screen sheet ──
  const pill = root.querySelector('.srch-pill');
  const sheet = document.createElement('div');
  sheet.className = 'srch-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'Search');
  sheet.innerHTML = `<div class="srch-sheet-bar">
      <label class="srch-field">${SVG_SEARCH}<input type="search" placeholder="Games, people, studio…" aria-label="Search Nixin"
        role="combobox" aria-controls="srch-sheet-list" autocomplete="off" spellcheck="false" enterkeyhint="go"></label>
      <button type="button" class="srch-cancel">Cancel</button>
    </div>
    <div class="srch-list" id="srch-sheet-list" role="listbox"></div>`;
  screen.appendChild(sheet);
  const mInput = sheet.querySelector('input');
  const openSheet = () => {
    if (sheet.classList.contains('open')) return;
    sheet.classList.add('open');
    mInput.value = '';
    mCtl.render();
    mInput.focus({ preventScroll: true });
  };
  const closeSheet = () => { sheet.classList.remove('open'); mInput.blur(); };
  const mCtl = controller(mInput, sheet.querySelector('.srch-list'), { onClose: closeSheet });
  pill?.addEventListener('click', openSheet);
  sheet.querySelector('.srch-cancel').addEventListener('click', closeSheet);
  sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.classList.contains('srch-list')) closeSheet(); });
}

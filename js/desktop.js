// Section 1: the home screen. A desktop OS on wide screens, a phone home
// screen on mobile. It starts locked (logo + clock + slide-to-unlock); once
// unlocked, icons act as the site menu. Opened apps show in the taskbar (desktop)
// or dock (mobile); clicking an opened app there minimises / restores it.
import { apps, studio } from './data.js';
import { assetUrl } from './catalog.js';
import { logoDataURL } from './logo.js';

const glyph = {
  folder: '<svg viewBox="0 0 48 48"><path fill="#f4b942" d="M4 12a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v3H4z"/><path fill="#ffd36e" d="M4 17h40v20a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/></svg>',
  txt: '<svg viewBox="0 0 48 48"><path fill="#eef1f7" d="M10 4h20l10 10v30H10z"/><path fill="#c5ccdb" d="M30 4v10h10z"/><path stroke="#8a96ad" stroke-width="2.4" d="M15 22h18M15 28h18M15 34h12"/></svg>',
  mail: '<svg viewBox="0 0 48 48"><rect x="4" y="10" width="40" height="28" rx="4" fill="#3d6bff"/><path fill="none" stroke="#fff" stroke-width="2.6" d="m7 14 17 13 17-13"/></svg>',
  bin: '<svg viewBox="0 0 48 48"><path fill="#9fb3c8" d="M12 14h24l-2.4 28H14.4z"/><rect x="9" y="9" width="30" height="5" rx="2" fill="#c9d6e3"/><path stroke="#6c7f94" stroke-width="2" d="M20 19v18M28 19v18"/></svg>',
  gamepad: '<svg viewBox="0 0 48 48"><path fill="#ff3b4f" d="M14 13h20a10 10 0 0 1 9.7 12.4l-2.2 8.8a5 5 0 0 1-8.6 2.1L29 32H19l-3.9 4.3a5 5 0 0 1-8.6-2.1l-2.2-8.8A10 10 0 0 1 14 13z"/><path stroke="#fff" stroke-width="3" stroke-linecap="round" d="M15 20v8M11 24h8"/><circle cx="32" cy="21.5" r="2.4" fill="#fff"/><circle cx="36" cy="26.5" r="2.4" fill="#fff"/></svg>',
  zip: '<svg viewBox="0 0 48 48"><path fill="#ffcf6b" d="M10 4h28v40H10z"/><path stroke="#8a5a00" stroke-width="3" stroke-dasharray="3 3" d="M24 4v20"/><rect x="20" y="24" width="8" height="8" rx="1.5" fill="#8a5a00"/></svg>',
  pdf: '<svg viewBox="0 0 48 48"><path fill="#eef1f7" d="M10 4h20l10 10v30H10z"/><rect x="8" y="26" width="26" height="11" rx="2" fill="#e01e3c"/><text x="21" y="34.5" font-size="8" font-weight="800" fill="#fff" text-anchor="middle" font-family="sans-serif">PDF</text></svg>',
  video: '<svg viewBox="0 0 48 48"><rect x="4" y="10" width="40" height="28" rx="5" fill="#6a2cff"/><path fill="#fff" d="M20 17v14l12-7z"/></svg>',
};

let glyphN = 0;
function instagramSvg() {
  const id = `ig${++glyphN}`;
  return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${id}" x1="6" y1="42" x2="42" y2="6"><stop offset="0" stop-color="#f9ce34"/><stop offset="0.45" stop-color="#ee2a7b"/><stop offset="1" stop-color="#6228d7"/></linearGradient></defs><rect x="4" y="4" width="40" height="40" rx="12" fill="url(#${id})"/><rect x="14" y="14" width="20" height="20" rx="10" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="33.4" cy="14.6" r="2.1" fill="#fff"/></svg>`;
}

function iconMarkup(app) {
  if (app?.iconUrl) return `<img src="${escapeHtml(app.iconUrl)}" alt="">`;
  if (app?.icon === 'instagram') return instagramSvg();
  return glyph[app?.icon] || '';
}

export function initDesktop() {
  const root = document.getElementById('home');
  const iconsEl = root.querySelector('.os-icons');
  const winsEl = root.querySelector('.os-windows');
  const runEl = root.querySelector('.os-running');
  const dockEl = root.querySelector('.os-dock');
  const startBtn = root.querySelector('.os-start');
  const startMenu = root.querySelector('.os-startmenu');
  const logo = logoDataURL(128);
  const isMobile = () => innerWidth < 720;
  let catalog = [];
  let catalogReady = false;

  document.querySelectorAll('[data-logo]').forEach((img) => (img.src = logo));

  // ── icons ──────────────────────────────────────
  iconsEl.innerHTML = apps.map((a, i) => `
    <button class="os-icon ${a.dock ? 'docked' : ''}" data-app="${a.id}" style="--i:${i}">
      <span class="os-glyph">${iconMarkup(a)}</span>
      <span class="os-label">${a.label}</span>
      <span class="os-label-m">${a.short}</span>
    </button>`).join('');

  startMenu.querySelector('.sm-list').innerHTML = apps.map((a) => `
    <button data-app="${a.id}"><span class="os-glyph">${iconMarkup(a)}</span>${a.short}</button>`).join('');

  // ── window manager ─────────────────────────────
  const open = new Map(); // id → { el, app, min }
  let z = 10;

  function contentFor(a) {
    switch (a.type) {
      case 'notepad':
        return `<div class="np-menu"><span>File</span><span>Edit</span><span>View</span></div>
                <pre class="np-body" tabindex="0">${escapeHtml(a.body)}</pre>
                <div class="np-status"><span>Ln 1, Col 1</span><span>UTF-8</span></div>`;
      case 'explorer':
        return a.files.length
          ? `<div class="ex-bar"><span>‹</span><span>›</span><div class="ex-path">This PC › Nixin › ${a.title}</div></div>
             <div class="ex-grid">${a.files.map((f) => `
               <button class="ex-item"><span class="os-glyph">${glyph[f.icon]}</span><span>${f.name}</span></button>`).join('')}</div>`
          : `<div class="ex-empty">${glyph.bin}<p>${a.empty || 'Empty'}</p></div>`;
      case 'library':
        if (!catalogReady) return `<div class="ex-empty"><p>Loading games…</p></div>`;
        if (!catalog.length) return `<div class="ex-empty">${glyph.gamepad}<p>No games yet.</p></div>`;
        return `<div class="ex-bar"><span>‹</span><span>›</span><div class="ex-path">This PC › Nixin › Our Games</div></div>
          <div class="ex-grid ex-apps">${catalog.map((g) => `
            <button class="ex-item ex-app" data-game="${escapeHtml(g.id)}">
              ${gameIcon(g)}
              <span>${escapeHtml(g.name)}</span>
            </button>`).join('')}</div>`;
      case 'viewer':
        return viewerBody(a.game);
      case 'mail':
        return `<form class="mail">
          <label><span>To</span><input value="${studio.email}" readonly></label>
          <label><span>From</span><input type="email" placeholder="you@example.com" required></label>
          <label><span>Subject</span><input placeholder="Hello Nixin!"></label>
          <textarea placeholder="Tell us about your idea, role or question…" aria-label="Message"></textarea>
          <div class="mail-foot"><button type="submit" class="mail-send">Send</button><span class="mail-note"></span></div>
        </form>`;
    }
    return '';
  }

  function gameIcon(g) {
    if (g.icon) return `<img src="${escapeHtml(assetUrl(g.icon))}" alt="">`;
    const letter = escapeHtml((g.name || '?').slice(0, 1));
    return `<span class="ex-dummy" style="background:${escapeHtml(g.accent || '#f4b942')}">${letter}</span>`;
  }

  function viewerBody(g) {
    const store = g.store?.play;
    const shots = g.gallery || [];
    return `<article class="gp gp-win" style="--game-accent:${escapeHtml(g.accent || '#f4b942')}">
      <header class="gp-hero">
        ${g.icon ? `<img class="gp-icon" src="${escapeHtml(assetUrl(g.icon))}" alt="">` : ''}
        <div class="gp-intro">
          <p class="eyebrow">${escapeHtml(g.genre || '')}</p>
          <h1>${escapeHtml(g.name)}</h1>
          <p class="gp-tagline">${escapeHtml(g.tagline || '')}</p>
          ${store ? `<a class="gp-store" href="${escapeHtml(store)}" rel="noopener" target="_blank">Get it on Google Play</a>` : ''}
        </div>
      </header>
      <p class="gp-desc">${escapeHtml(g.description || '')}</p>
      ${shots.length ? `<section class="gp-gallery" aria-label="${escapeHtml(g.name)} screenshots">
        ${shots.map((item) => `
          <figure>
            <img src="${escapeHtml(assetUrl(item.src))}" alt="${escapeHtml(item.title || g.name)}">
            <figcaption>
              ${item.title ? `<b>${escapeHtml(item.title)}</b>` : ''}
              ${item.caption ? `<span>${escapeHtml(item.caption)}</span>` : ''}
            </figcaption>
          </figure>`).join('')}
      </section>` : ''}
    </article>`;
  }

  function viewerApp(g) {
    return {
      id: `view-${g.id}`,
      short: g.name,
      title: g.name,
      iconUrl: g.icon ? assetUrl(g.icon) : '',
      type: 'viewer',
      game: g,
    };
  }

  function refreshLibrary() {
    for (const { el, app } of open.values()) {
      if (app.type !== 'library') continue;
      el.querySelector('.win-body').innerHTML = contentFor(app);
    }
  }

  function openApp(a, opts = {}) {
    if (!a) return;
    if (a.type === 'link') {
      const t = document.querySelector(a.href);
      if (t) t.scrollIntoView({ behavior: 'smooth' });
      else location.href = a.href;
      return;
    }
    if (open.has(a.id)) {
      const w = open.get(a.id);
      restore(a.id);
      if (opts.max) w.el.classList.add('max');
      focus(w.el);
      return;
    }

    const el = document.createElement('section');
    el.className = `os-win win-${a.type}`;
    el.dataset.win = a.id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', a.title);
    const n = open.size;
    el.style.left = `${24 + ((n * 4) % 20)}%`;
    el.style.top = `${8 + ((n * 5) % 22)}%`;
    if (opts.max) el.classList.add('max');
    el.innerHTML = `
      <header class="win-bar">
        <button class="win-back" data-act="min" aria-label="Back to home">‹</button>
        <span class="os-glyph sm">${iconMarkup(a)}</span>
        <span class="win-title">${escapeHtml(a.title)}</span>
        <div class="win-ctl">
          <button data-act="min" aria-label="Minimise">—</button>
          <button data-act="max" aria-label="Maximise">▢</button>
          <button data-act="close" class="x" aria-label="Close">✕</button>
        </div>
      </header>
      <div class="win-body">${contentFor(a)}</div>`;
    winsEl.appendChild(el);
    open.set(a.id, { el, app: a, min: false });
    focus(el);

    el.addEventListener('pointerdown', () => focus(el));
    const bar = el.querySelector('.win-bar');
    bar.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'min') minimise(a.id);
      if (act === 'max') el.classList.toggle('max');
      if (act === 'close') close(a.id);
    });
    bar.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) el.classList.toggle('max'); });
    const form = el.querySelector('form.mail');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const [, from, subj] = form.querySelectorAll('input');
      const body = form.querySelector('textarea').value;
      location.href = `mailto:${studio.email}?subject=${encodeURIComponent(subj.value || 'Hello Nixin')}&body=${encodeURIComponent(body + '\n\n— ' + from.value)}`;
      form.querySelector('.mail-note').textContent = 'Opening your mail app…';
    });
    dragify(el);
  }

  function focus(el) {
    el.style.zIndex = ++z;
    winsEl.querySelectorAll('.os-win').forEach((w) => w.classList.toggle('focused', w === el));
    renderRunning();
  }
  function minimise(id) {
    const w = open.get(id); if (!w) return;
    w.min = true; w.el.classList.add('min'); w.el.classList.remove('focused');
    renderRunning();
  }
  function restore(id) {
    const w = open.get(id); if (!w) return;
    w.min = false; w.el.classList.remove('min');
  }
  function close(id) {
    const w = open.get(id); if (!w) return;
    w.el.classList.add('closing');
    setTimeout(() => w.el.remove(), 180);
    open.delete(id);
    renderRunning();
  }

  function renderRunning() {
    // desktop taskbar: every opened app
    runEl.innerHTML = [...open.values()].map(({ el, app, min }) => `
      <button class="os-task ${min ? 'is-min' : ''} ${el.classList.contains('focused') ? 'is-focus' : ''}" data-run="${app.id}" title="${app.title}">
        <span class="os-glyph sm">${iconMarkup(app)}</span><span class="t">${escapeHtml(app.short)}</span>
      </button>`).join('');
    // mobile dock: docked apps + any other opened app after a divider
    const docked = apps.filter((a) => a.dock);
    const extra = [...open.values()].filter(({ app }) => !app.dock);
    dockEl.innerHTML =
      docked.map((a) => `<button data-app="${a.id}" aria-label="${escapeHtml(a.short)}"><span class="os-glyph">${iconMarkup(a)}</span></button>`).join('') +
      (extra.length ? '<span class="dock-sep"></span>' : '') +
      extra.map(({ app }) => `<button data-run="${app.id}" class="is-open" aria-label="${escapeHtml(app.short)}"><span class="os-glyph">${iconMarkup(app)}</span></button>`).join('');
    root.querySelectorAll('.os-icon[data-app], .os-dock [data-app]').forEach((b) => {
      b.classList.toggle('is-open', open.has(b.dataset.app));
    });
  }

  // ── clicks ─────────────────────────────────────
  root.addEventListener('click', (e) => {
    const gameBtn = e.target.closest('[data-game]');
    if (gameBtn) {
      const game = catalog.find((g) => g.id === gameBtn.dataset.game);
      if (game) openApp(viewerApp(game), { max: true });
      return;
    }
    const run = e.target.closest('[data-run]');
    if (run) {
      const id = run.dataset.run, w = open.get(id);
      if (!w) return;
      if (w.min) { restore(id); focus(w.el); }
      else if (w.el.classList.contains('focused') && !isMobile()) minimise(id);
      else focus(w.el);
      return;
    }
    const b = e.target.closest('.os-icon, .sm-list [data-app], .os-dock [data-app]');
    if (b) {
      openApp(apps.find((x) => x.id === b.dataset.app));
      startMenu.classList.remove('open');
      return;
    }
    if (e.target.closest('[data-lock]')) { lock(); return; }
    if (!e.target.closest('.os-startmenu, .os-start')) startMenu.classList.remove('open');
  });
  startBtn.addEventListener('click', () => startMenu.classList.toggle('open'));

  // drag windows by their title bar (desktop only)
  function dragify(el) {
    const bar = el.querySelector('.win-bar');
    let ox = 0, oy = 0, drag = false;
    bar.addEventListener('pointerdown', (e) => {
      if (isMobile() || el.classList.contains('max') || e.target.closest('button')) return;
      drag = true;
      const r = el.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const pr = winsEl.getBoundingClientRect();
      el.style.left = Math.max(-200, Math.min(pr.width - 120, e.clientX - pr.left - ox)) + 'px';
      el.style.top = Math.max(0, Math.min(pr.height - 40, e.clientY - pr.top - oy)) + 'px';
    });
    bar.addEventListener('pointerup', () => { drag = false; });
  }

  // ── lock / unlock ──────────────────────────────
  const track = root.querySelector('.lock-track');
  const knob = root.querySelector('.lock-knob');
  let kx = 0, startX = 0, dragging = false;
  const maxX = () => track.clientWidth - knob.offsetWidth - 8;

  function setKnob(x, animate) {
    kx = Math.max(0, Math.min(maxX(), x));
    knob.style.transition = animate ? '' : 'none';
    knob.style.transform = `translateX(${kx}px)`;
    track.style.setProperty('--p', (kx / maxX()).toFixed(3));
  }
  knob.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX - kx;
    knob.setPointerCapture(e.pointerId);
  });
  knob.addEventListener('pointermove', (e) => { if (dragging) setKnob(e.clientX - startX, false); });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    if (kx > maxX() * 0.82) unlock();
    else {
      setKnob(0, true);
      if (kx < 6) { track.classList.remove('nudge'); track.offsetWidth; track.classList.add('nudge'); }
    }
  };
  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
  knob.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); unlock(); } });

  function unlock() {
    if (!root.classList.contains('locked')) return;
    setKnob(maxX(), true);
    root.classList.add('unlocking');
    dispatchEvent(new CustomEvent('nixin:burst'));
    setTimeout(() => {
      root.classList.remove('locked', 'unlocking');
      root.classList.add('unlocked');
      setKnob(0, false);
      iconsEl.querySelector('.os-icon:not(.docked)')?.focus({ preventScroll: true });
    }, 380);
  }
  function lock() {
    startMenu.classList.remove('open');
    [...open.keys()].forEach(minimise);
    root.classList.remove('unlocked');
    root.classList.add('locked');
    dispatchEvent(new CustomEvent('nixin:burst'));
    setTimeout(() => knob.focus({ preventScroll: true }), 50);
  }

  // ── clock ──────────────────────────────────────
  const clocks = document.querySelectorAll('[data-clock]');
  const tick = () => {
    const d = new Date();
    clocks.forEach((c) => {
      const k = c.dataset.clock;
      if (k === 'big') {
        const parts = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).formatToParts(d);
        const main = parts.filter((x) => x.type !== 'dayPeriod').map((x) => x.value).join('').trim();
        const period = parts.find((x) => x.type === 'dayPeriod')?.value || '';
        c.innerHTML = `${main}<small>${period}</small>`;
        return;
      }
      c.textContent =
        k === 'date' ? d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
        : k === 'long' ? d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
        : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    });
  };
  tick(); setInterval(tick, 20000);

  renderRunning();

  return {
    setGames(list) {
      catalog = list || [];
      catalogReady = true;
      refreshLibrary();
    },
  };
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

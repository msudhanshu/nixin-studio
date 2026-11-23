// Section 1: the home screen. A desktop OS on wide screens, a phone home
// screen on mobile. It starts locked (logo + clock + slide-to-unlock); once
// unlocked, icons act as the site menu. Opened apps show in the taskbar (desktop)
// or dock (mobile); clicking an opened app there minimises / restores it.
import { apps as allApps, studio } from './data.js';
import { createShell } from './terminal.js';

// Inside the phone preview frame there is no "Mobile View" icon.
const embedded = window.self !== window.top;

// "Desktop view" on a real phone: widen the layout viewport so the desktop layout shows.
const DESK_KEY = 'nixin.desktopView';
const deskForced = () => { try { return !embedded && localStorage.getItem(DESK_KEY) === '1'; } catch { return false; } };
if (deskForced()) document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=1280');
const apps = allApps.filter((a) => !(embedded && a.type === 'mobileview'));
import { assetUrl } from './catalog.js';
import { logoDataURL } from './logo.js';
import { moreSection } from './more.js';

const glyph = {
  folder: '<svg viewBox="0 0 48 48"><path fill="#f4b942" d="M4 12a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v3H4z"/><path fill="#ffd36e" d="M4 17h40v20a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/></svg>',
  txt: '<svg viewBox="0 0 48 48"><path fill="#eef1f7" d="M10 4h20l10 10v30H10z"/><path fill="#c5ccdb" d="M30 4v10h10z"/><path stroke="#8a96ad" stroke-width="2.4" d="M15 22h18M15 28h18M15 34h12"/></svg>',
  mail: '<svg viewBox="0 0 48 48"><rect x="4" y="10" width="40" height="28" rx="4" fill="#3d6bff"/><path fill="none" stroke="#fff" stroke-width="2.6" d="m7 14 17 13 17-13"/></svg>',
  bin: '<svg viewBox="0 0 48 48"><path fill="#9fb3c8" d="M12 14h24l-2.4 28H14.4z"/><rect x="9" y="9" width="30" height="5" rx="2" fill="#c9d6e3"/><path stroke="#6c7f94" stroke-width="2" d="M20 19v18M28 19v18"/></svg>',
  gamepad: '<svg viewBox="0 0 48 48"><path fill="#ff3b4f" d="M14 13h20a10 10 0 0 1 9.7 12.4l-2.2 8.8a5 5 0 0 1-8.6 2.1L29 32H19l-3.9 4.3a5 5 0 0 1-8.6-2.1l-2.2-8.8A10 10 0 0 1 14 13z"/><path stroke="#fff" stroke-width="3" stroke-linecap="round" d="M15 20v8M11 24h8"/><circle cx="32" cy="21.5" r="2.4" fill="#fff"/><circle cx="36" cy="26.5" r="2.4" fill="#fff"/></svg>',
  zip: '<svg viewBox="0 0 48 48"><path fill="#ffcf6b" d="M10 4h28v40H10z"/><path stroke="#8a5a00" stroke-width="3" stroke-dasharray="3 3" d="M24 4v20"/><rect x="20" y="24" width="8" height="8" rx="1.5" fill="#8a5a00"/></svg>',
  pdf: '<svg viewBox="0 0 48 48"><path fill="#eef1f7" d="M10 4h20l10 10v30H10z"/><rect x="8" y="26" width="26" height="11" rx="2" fill="#e01e3c"/><text x="21" y="34.5" font-size="8" font-weight="800" fill="#fff" text-anchor="middle" font-family="sans-serif">PDF</text></svg>',
  phone: '<svg viewBox="0 0 48 48"><rect x="13" y="4" width="22" height="40" rx="5" fill="#2b2f3d"/><rect x="16" y="10" width="16" height="26" rx="2" fill="#6ea8ff"/><rect x="21" y="6.5" width="6" height="1.8" rx=".9" fill="#6c7390"/><circle cx="24" cy="40" r="1.6" fill="#6c7390"/></svg>',
  video: '<svg viewBox="0 0 48 48"><rect x="4" y="10" width="40" height="28" rx="5" fill="#6a2cff"/><path fill="#fff" d="M20 17v14l12-7z"/></svg>',
  in: '<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="8" fill="#0a66c2"/><circle cx="15.2" cy="14.6" r="3.1" fill="#fff"/><rect x="12.5" y="20" width="5.4" height="16" rx=".6" fill="#fff"/><path fill="none" stroke="#fff" stroke-width="5.2" d="M24.2 36V20M24.2 27.4a5.1 5.1 0 0 1 10.2 0V36"/></svg>',
  browser: '<svg viewBox="0 0 48 48"><path fill="#ea4335" d="M24 24 6.68 14A20 20 0 0 1 41.32 14z"/><path fill="#fbbc04" d="M24 24 41.32 14A20 20 0 0 1 24 44z"/><path fill="#34a853" d="M24 24 24 44A20 20 0 0 1 6.68 14z"/><circle cx="24" cy="24" r="10" fill="#fff"/><circle cx="24" cy="24" r="7.8" fill="#4285f4"/></svg>',
  whatsapp: '<svg viewBox="0 0 48 48"><path fill="#25d366" d="M24 4.5a19.5 19.5 0 0 0-16.8 29.3L5 43.2l9.7-2.5A19.5 19.5 0 1 0 24 4.5z"/><path fill="#fff" d="M33.6 28.2c-.4-.2-2.5-1.2-2.9-1.4-.4-.1-.7-.2-.9.2-.3.4-1.1 1.4-1.3 1.6-.2.3-.5.3-.9.1-1.4-.6-2.7-1.4-3.8-2.8-1-1.1-1.8-2.3-2-2.8-.2-.4 0-.6.2-.9.2-.2.4-.5.5-.7.2-.2.2-.4.3-.7.1-.3 0-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.7-.7-.6-1-.6h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 3.9 1.7 4.2c.2.3 2.8 4.5 6.9 6.1 3.3 1.3 3.3.9 4 .8.6 0 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.4-.3-.8-.5z"/></svg>',
  terminal: '<svg viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="36" rx="8" fill="#14151c"/><path fill="none" stroke="#3dd68c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M13 18l7 6-7 6M24 30h11"/></svg>',
  image: '<svg viewBox="0 0 48 48"><rect x="4" y="8" width="40" height="32" rx="6" fill="#2b2f3d"/><circle cx="16" cy="18" r="4" fill="#f4b942"/><path fill="#6ea8ff" d="M8 34l10-10 7 7 5-5 10 8z"/></svg>',
};

// ── About Us: profile pages inside a browser-style window ──
const SVG_BACK = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const SVG_FWD = '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
const SVG_RELOAD = '<svg viewBox="0 0 24 24"><path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v4h-4"/></svg>';
const SVG_LOCK = '<svg viewBox="0 0 24 24"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8.5a3 3 0 0 1 6 0V11"/></svg>';
const SVG_PIN = '<svg viewBox="0 0 24 24"><path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/></svg>';
const AVATAR_TINTS = ['#0a66c2', '#7a3ee8', '#e0663a', '#138a5e', '#c2378a'];

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const esc = (v) => escapeHtml(String(v ?? ''));

function avatar(m, i, cls = '') {
  if (m.photo) return `<img class="pf-avatar ${cls}" src="${esc(m.photo)}" alt="">`;
  return `<span class="pf-avatar ${cls}" style="--tint:${AVATAR_TINTS[i % AVATAR_TINTS.length]}">${esc(initials(m.name))}</span>`;
}

// Games library groups, in display order. A game's `status` in games.json picks its group.
const STATUSES = [
  { id: 'live', label: 'Live games', short: 'Live' },
  { id: 'testing', label: 'In testing', short: 'Testing', tag: 'BETA' },
  { id: 'dev', label: 'Under development', short: 'In dev', tag: 'WIP' },
  { id: 'ideation', label: 'Ideation', short: 'Idea', tag: 'IDEA' },
];
const statusOf = (g) => (STATUSES.some((s) => s.id === g.status) ? g.status : 'live');

const viewGlyph = {
  large: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  small: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="3" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="3" width="4.5" height="4.5" rx="1"/><rect x="3" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="3" y="16.5" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="16.5" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="16.5" width="4.5" height="4.5" rx="1"/></svg>',
  list: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="3" height="3" rx="0.8"/><rect x="8" y="4.5" width="13" height="2" rx="1"/><rect x="3" y="10.5" width="3" height="3" rx="0.8"/><rect x="8" y="11" width="13" height="2" rx="1"/><rect x="3" y="17" width="3" height="3" rx="0.8"/><rect x="8" y="17.5" width="13" height="2" rx="1"/></svg>',
};

// Library view state, remembered per viewer (best effort).
const LIB_KEY = 'nixin.lib';
const lib = (() => {
  const def = { view: 'small', closed: [] };
  try {
    const v = JSON.parse(localStorage.getItem(LIB_KEY) || 'null');
    if (v && ['large', 'small', 'list'].includes(v.view) && Array.isArray(v.closed)) return v;
  } catch {}
  return def;
})();
function saveLib() { try { localStorage.setItem(LIB_KEY, JSON.stringify(lib)); } catch {} }

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? escapeHtml(String(iso)) : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// Pen-on-paper filter for "Ideation" art: edges → blue ink, with a slight hand wobble.
function ensureSketchFilter() {
  if (document.getElementById('nx-sketch')) return;
  document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <filter id="nx-sketch" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0" result="g"/>
      <feConvolveMatrix in="g" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="e"/>
      <feColorMatrix in="e" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.30  0 0 0 0 0.85  3 3 3 0 -0.15" result="ink"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="ink" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
    </filter></svg>`);
}

let glyphN = 0;
function instagramSvg() {
  const id = `ig${++glyphN}`;
  return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${id}" x1="6" y1="42" x2="42" y2="6"><stop offset="0" stop-color="#f9ce34"/><stop offset="0.45" stop-color="#ee2a7b"/><stop offset="1" stop-color="#6228d7"/></linearGradient></defs><rect x="4" y="4" width="40" height="40" rx="12" fill="url(#${id})"/><rect x="14" y="14" width="20" height="20" rx="10" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="33.4" cy="14.6" r="2.1" fill="#fff"/></svg>`;
}

// Phone home screen: "Our Games" is a folder showing a 3x3 preview of the game icons.
let folderGames = [];
function folderPreview() {
  const cells = folderGames.slice(0, 9).map((g) => g.icon
    ? `<img src="${escapeHtml(assetUrl(g.icon))}" alt="">`
    : `<b style="background:${escapeHtml(g.accent || '#f4b942')}">${escapeHtml((g.name || '?').slice(0, 1))}</b>`);
  return `<span class="gl-folder">${cells.join('')}</span>`;
}

function iconMarkup(app) {
  if (app?.type === 'library') return `<span class="gl-gamepad">${glyph.gamepad}</span>${folderPreview()}`;
  if (app?.iconUrl) return `<img src="${escapeHtml(app.iconUrl)}" alt="">`;
  if (app?.icon === 'instagram') return instagramSvg();
  return glyph[app?.icon] || '';
}

export function initDesktop() {
  const root = document.getElementById('home');
  const shell = createShell();
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
  let photo = null; // picture currently shown in Image Viewer

  document.querySelectorAll('[data-logo]').forEach((img) => (img.src = logo));
  ensureSketchFilter();

  // ── icons ──────────────────────────────────────
  iconsEl.innerHTML = apps.map((a, i) => `
    <button class="os-icon ${a.dock ? 'docked' : ''} ${a.rk != null ? 'r' : ''} ${a.locked ? 'is-locked' : ''} ${a.id === 'games' ? 'big' : ''}" data-app="${a.id}" style="--i:${i};--rk:${a.rk ?? 0}">
      <span class="os-glyph">${iconMarkup(a)}${a.locked ? '<svg class="os-padlock" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>' : ''}</span>
      <span class="os-label">${a.label}</span>
      <span class="os-label-m">${a.short}</span>
    </button>`).join('');

  startMenu.querySelector('.sm-list').innerHTML = apps.map((a) => `
    <button data-app="${a.id}"><span class="os-glyph">${iconMarkup(a)}</span>${a.short}</button>`).join('');

  // ── window manager ─────────────────────────────
  const open = new Map(); // id → { el, app, min }
  const tabsState = new Map(); // profile app id → { tabs: ['company', ...memberIds], active }
  let z = 10;

  // ── About Us profile window ────────────────────
  // tab strip: lives in the window's title bar
  function profileTabs(a) {
    const st = tabsState.get(a.id);
    const members = a.members || [];
    return st.tabs.map((t) => {
      const m = members.find((x) => x.id === t);
      const title = m ? m.name : a.title;
      const fav = m ? avatar(m, members.indexOf(m), 'fav') : `<img class="br-fav" src="${logo}" alt="">`;
      return `<div class="br-tab ${t === st.active ? 'on' : ''}" data-tab="${esc(t)}" role="tab" aria-selected="${t === st.active}" title="${esc(title)}">
          ${fav}<span class="br-tab-t">${esc(title)}</span>
          ${m ? `<button class="br-tab-x" data-tabclose="${esc(t)}" aria-label="Close tab">✕</button>` : ''}
        </div>`;
    }).join('') + '<span class="br-new" aria-hidden="true">+</span>';
  }

  function profileBody(a) {
    const st = tabsState.get(a.id);
    const members = a.members || [];
    const member = members.find((m) => m.id === st.active);
    const url = member ? `${a.url}/${member.id}` : a.url;
    return `<div class="br">
      <div class="br-bar">
        <button class="br-nav" data-brback ${member ? '' : 'disabled'} aria-label="Back">${SVG_BACK}</button>
        <button class="br-nav" disabled aria-label="Forward">${SVG_FWD}</button>
        <button class="br-nav" data-brreload aria-label="Reload">${SVG_RELOAD}</button>
        <div class="br-url">${SVG_LOCK}<span><b>${esc(url.split('/')[0])}</b>${esc(url.slice(url.indexOf('/')))}</span></div>
      </div>
      <div class="br-page">${member ? memberPage(member, members.indexOf(member)) : companyPage(a)}</div>
    </div>`;
  }

  function companyPage(a) {
    const c = a.company || {};
    const members = a.members || [];
    const meta = [c.industry, c.location, c.size].filter(Boolean).map(esc).join(' · ');
    const facts = [['Website', c.website], ['Industry', c.industry], ['Company size', c.size], ['Headquarters', c.location], ['Founded', c.founded]]
      .filter(([, v]) => v);
    return `<div class="pf">
      <section class="pf-card pf-top">
        <div class="pf-cover"></div>
        <img class="pf-logo" src="${logo}" alt="${esc(a.title)} logo">
        <h1 class="pf-name">${esc(a.title)}</h1>
        <p class="pf-head">${esc(c.tagline)}</p>
        <p class="pf-meta">${meta}</p>
        <div class="pf-actions">
          <button class="pf-btn" data-app="games">Our games</button>
          <button class="pf-btn ghost" data-app="contact">Message</button>
        </div>
      </section>
      <section class="pf-card">
        <h2>About</h2>
        <p class="pf-text">${esc(c.about)}</p>
        ${facts.length ? `<dl class="pf-facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
        ${c.specialties?.length ? `<h3>Specialties</h3><div class="pf-chips">${c.specialties.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      </section>
      ${members.length ? `<section class="pf-card">
        <h2>People</h2>
        <p class="pf-sub">${members.length} member${members.length > 1 ? 's' : ''} of ${esc(a.title)}</p>
        <div class="pf-people">${members.map((m, i) => `
          <button class="pf-person" data-member="${esc(m.id)}">
            ${avatar(m, i)}
            <span class="pf-person-t"><b>${esc(m.name)}</b><small>${esc(m.headline)}</small></span>
            <span class="pf-link">View profile ›</span>
          </button>`).join('')}
        </div>
        <div class="pf-li-links">${members.filter((m) => m.linkedin).map((m) => `
          <a href="${esc(m.linkedin)}" target="_blank" rel="noopener">${glyph.in}${esc(m.name)} on LinkedIn ↗</a>`).join('')}
        </div>
      </section>` : ''}
    </div>`;
  }

  function memberPage(m, i) {
    return `<div class="pf">
      <section class="pf-card pf-top">
        <div class="pf-cover pf-cover-m" style="--tint:${AVATAR_TINTS[i % AVATAR_TINTS.length]}"></div>
        ${avatar(m, i, 'big')}
        <h1 class="pf-name">${esc(m.name)}</h1>
        <p class="pf-head">${esc(m.headline)}</p>
        <p class="pf-meta">${m.location ? `${SVG_PIN}${esc(m.location)}` : ''}</p>
        <div class="pf-org"><img src="${logo}" alt="">${esc(studio.name)}</div>
        ${m.linkedin ? `<div class="pf-actions"><a class="pf-btn pf-li" href="${esc(m.linkedin)}" target="_blank" rel="noopener">${glyph.in}View on LinkedIn ↗</a></div>` : ''}
      </section>
      ${m.about ? `<section class="pf-card"><h2>About</h2><p class="pf-text">${esc(m.about)}</p></section>` : ''}
      ${m.experience?.length ? `<section class="pf-card"><h2>Experience</h2>
        <ol class="pf-exp">${m.experience.map((x) => `
          <li>
            <span class="pf-exp-dot">${x.org === studio.name ? `<img src="${logo}" alt="">` : esc(initials(x.org || x.role))}</span>
            <div><b>${esc(x.role)}</b>${x.org ? `<span>${esc(x.org)}</span>` : ''}<small>${esc(x.when)}</small>${x.note ? `<p>${esc(x.note)}</p>` : ''}</div>
          </li>`).join('')}
        </ol></section>` : ''}
      ${m.education?.length ? `<section class="pf-card"><h2>Education</h2>
        <ol class="pf-exp">${m.education.map((x) => `
          <li>
            <span class="pf-exp-dot">${esc(x.short || initials(x.school))}</span>
            <div><b>${esc(x.school)}</b>${x.degree ? `<span>${esc(x.degree)}</span>` : ''}${x.when ? `<small>${esc(x.when)}</small>` : ''}</div>
          </li>`).join('')}
        </ol></section>` : ''}
      ${m.certifications?.length ? `<section class="pf-card"><h2>Licenses &amp; certifications</h2>
        <ol class="pf-exp">${m.certifications.map((x) => `
          <li>
            <span class="pf-exp-dot">${esc(initials(x.by || x.name))}</span>
            <div><b>${esc(x.name)}</b>${x.by ? `<span>${esc(x.by)}</span>` : ''}${x.when ? `<small>${esc(x.when)}</small>` : ''}</div>
          </li>`).join('')}
        </ol></section>` : ''}
      ${m.skills?.length ? `<section class="pf-card"><h2>Skills</h2><div class="pf-chips">${m.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</div></section>` : ''}
    </div>`;
  }

  function showMember(st, memberId) {
    if (!st.tabs.includes(memberId)) st.tabs.push(memberId);
    st.active = memberId;
  }

  function renderProfile(id) {
    const w = open.get(id);
    if (!w) return;
    w.el.querySelector('.br-tabs').innerHTML = profileTabs(w.app);
    w.el.querySelector('.win-body').innerHTML = contentFor(w.app);
  }

  function profileOf(target) {
    const id = target.closest('.os-win')?.dataset.win;
    return id && tabsState.has(id) ? id : null;
  }

  // Fake WhatsApp. One open chat with a small FAQ bot; the other threads stay locked.
  const WA_TINTS = ['#3d4f5f', '#4a5560', '#5c4a42', '#3e4d3a'];
  const waMemory = new Map();
  const waClock = (t) => new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  function waThread() {
    if (!waMemory.has('nixin')) {
      waMemory.set('nixin', [{
        from: 'bot',
        t: Date.now(),
        text: 'Hey, this is Nixin. Ask me about our games, jobs, or how to reach the studio.',
      }]);
    }
    return waMemory.get('nixin');
  }
  function asks(q, ...keys) {
    return keys.some((k) => new RegExp(`\\b${k}\\b`, 'i').test(q));
  }
  function nixinReply(raw) {
    const q = raw.trim();
    const named = catalog.find((g) => q.toLowerCase().includes(String(g.name || '').toLowerCase()) && g.name);
    if (named) {
      return `${named.name} — ${named.tagline || 'One of our games.'}${named.description ? ' ' + named.description : ''}`;
    }
    if (asks(q, 'game', 'games', 'play', 'title', 'titles', 'download')) {
      const names = catalog.filter((g) => statusOf(g) === 'live').map((g) => g.name);
      return names.length
        ? `We make small games you can finish in a pocket of time. Out now: ${names.join(', ')}. Open Our Games on the home screen for screenshots and store links.`
        : 'The game list is still loading. Open Our Games on the home screen in a moment.';
    }
    if (asks(q, 'job', 'jobs', 'career', 'careers', 'hire', 'hiring', 'work', 'role', 'roles')) {
      return 'We are a two-person studio and we read portfolios. Open roles we talk about: Unity gameplay, 2D / 3D art, and casual / puzzle design. Write to hello@nixin.studio.';
    }
    if (asks(q, 'contact', 'email', 'mail', 'reach', 'phone')) {
      return `Email ${studio.email}. The Contact app on this desktop opens a new message too.`;
    }
    if (asks(q, 'reel', 'reels', 'instagram', 'feed', 'video')) {
      return 'The Game Reel icon scrolls down to the feed. On desktop, scroll for the next game. On a phone, swipe the phone sideways for more screens.';
    }
    if (asks(q, 'who', 'about', 'studio', 'nixin', 'team')) {
      return 'Nixin Studio is a small independent game studio. We make games that are quick to learn and hard to put down. The About icon has the people behind it.';
    }
    if (asks(q, 'help', 'faq', 'menu')) {
      return 'I can answer a few things: our games, a game by name, jobs, the reel, and how to contact us.';
    }
    if (asks(q, 'hi', 'hey', 'hello', 'yo', 'hola')) {
      return 'Hey. Ask me about our games, jobs, or how to reach the studio.';
    }
    return "I don't have a real answer for that yet. Try games, jobs, or contact.";
  }
  function waBubble(m) {
    return `<div class="wa-bubble ${m.from === 'me' ? 'me' : 'bot'}">${escapeHtml(m.text)}<time>${waClock(m.t)}</time></div>`;
  }
  function whatsAppBody(a) {
    const rows = (a.chats || []).map((c, i) => {
      const tint = WA_TINTS[i % WA_TINTS.length];
      const face = c.open
        ? `<img src="${logo}" alt="">`
        : esc(initials(c.name));
      const last = c.open ? waThread().at(-1)?.text : 'Locked';
      return `<button class="wa-row ${c.open ? 'on' : ''}" ${c.locked ? 'disabled' : 'data-wa-open'} type="button">
        <span class="wa-av" style="--tint:${tint}">${face}</span>
        <span class="wa-meta"><b>${esc(c.name)}</b><small>${esc(last || '')}</small></span>
        ${c.locked ? `<span class="wa-lock" aria-hidden="true">${SVG_LOCK}</span>` : ''}
      </button>`;
    }).join('');
    return `<div class="wa">
      <aside class="wa-side">
        <header class="wa-side-h"><b>Chats</b></header>
        <div class="wa-list">${rows}</div>
      </aside>
      <section class="wa-chat">
        <header class="wa-head">
          <button class="wa-back" type="button" data-wa-back aria-label="Back to chats">‹</button>
          <span class="wa-av"><img src="${logo}" alt=""></span>
          <span class="wa-meta"><b>Nixin</b><small>studio</small></span>
        </header>
        <div class="wa-log" aria-live="polite">${waThread().map(waBubble).join('')}</div>
        <div class="wa-chips">
          <button type="button" data-wa-q="What games do you make?">Games</button>
          <button type="button" data-wa-q="Are you hiring?">Jobs</button>
          <button type="button" data-wa-q="How do I contact you?">Contact</button>
        </div>
        <form class="wa-form">
          <input type="text" name="msg" placeholder="Message" autocomplete="off" aria-label="Message Nixin">
          <button type="submit" aria-label="Send">➤</button>
        </form>
      </section>
    </div>`;
  }
  function bindWhatsApp(el) {
    const root = el.querySelector('.wa');
    const log = el.querySelector('.wa-log');
    const form = el.querySelector('.wa-form');
    const input = form.querySelector('input');
    const thread = waThread();
    const preview = el.querySelector('.wa-row.on small');
    const paint = () => {
      log.innerHTML = thread.map(waBubble).join('');
      log.scrollTop = log.scrollHeight;
      const last = thread.at(-1);
      if (preview && last) preview.textContent = last.text;
    };
    log.scrollTop = log.scrollHeight;
    let pending = 0;
    function say(text) {
      const clean = text.trim();
      if (!clean || pending) return;
      thread.push({ from: 'me', t: Date.now(), text: clean });
      paint();
      input.value = '';
      pending = 1;
      const hold = document.createElement('div');
      hold.className = 'wa-bubble bot typing';
      hold.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(hold);
      log.scrollTop = log.scrollHeight;
      setTimeout(() => {
        pending = 0;
        thread.push({ from: 'bot', t: Date.now(), text: nixinReply(clean) });
        paint();
      }, 420);
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); say(input.value); });
    el.querySelector('.wa-chips').addEventListener('click', (e) => {
      const q = e.target.closest('[data-wa-q]')?.dataset.waQ;
      if (q) say(q);
    });
    el.querySelector('[data-wa-back]')?.addEventListener('click', () => root.classList.add('show-list'));
    el.querySelector('[data-wa-open]')?.addEventListener('click', () => root.classList.remove('show-list'));
  }

  function contentFor(a) {
    switch (a.type) {
      case 'profile':
        return profileBody(a);
      case 'notepad':
        return `<div class="np-menu"><span>File</span><span>Edit</span><span>View</span></div>
                <pre class="np-body" tabindex="0">${escapeHtml(a.body)}</pre>
                <div class="np-status"><span>Ln 1, Col 1</span><span>UTF-8</span></div>`;
      case 'explorer':
        return a.files.length
          ? `<div class="ex-bar"><span>‹</span><span>›</span><div class="ex-path">SystemGrid › Nixin › ${a.title}</div></div>
             <div class="ex-grid">${a.files.map((f) => `
               <button class="ex-item"><span class="os-glyph">${glyph[f.icon]}</span><span>${f.name}</span></button>`).join('')}</div>`
          : `<div class="ex-empty">${glyph.bin}<p>${a.empty || 'Empty'}</p></div>`;
      case 'library':
        if (isMobile()) return foldBody();
        if (!catalogReady) return `<div class="ex-empty"><p>Loading games…</p></div>`;
        if (!catalog.length) return `<div class="ex-empty">${glyph.gamepad}<p>No games yet.</p></div>`;
        return libraryBody();
      case 'viewer':
        return viewerBody(a.game);
      case 'whatsapp':
        return whatsAppBody(a);
      case 'image':
        return imageBody();
      case 'terminal':
        return `<div class="term">
          <div class="term-log" role="log" aria-live="polite"></div>
          <div class="term-line">
            <span class="term-prompt"></span>
            <input class="term-in" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Terminal command">
          </div>
        </div>`;
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

  // ── games library: view modes + status groups ──
  function libraryBody() {
    const views = [['large', 'Large icons'], ['small', 'Small icons'], ['list', 'List']];
    const groups = STATUSES
      .map((s) => ({ ...s, games: catalog.filter((g) => statusOf(g) === s.id) }))
      .filter((s) => s.games.length);
    return `<div class="ex-bar">
        <span>‹</span><span>›</span>
        <div class="ex-path">SystemGrid › Nixin › Our Games</div>
        <div class="lib-views" role="group" aria-label="View">${views.map(([v, label]) => `
          <button data-view="${v}" class="${lib.view === v ? 'on' : ''}" aria-pressed="${lib.view === v}" title="${label}" aria-label="${label}">${viewGlyph[v]}</button>`).join('')}
        </div>
      </div>
      <div class="lib lib-${lib.view}">
        ${lib.view === 'list' ? `<div class="lib-head"><span></span><span>Name</span><span>Category</span><span class="c-size">Size</span><span class="c-date">Released</span><span>Rating / Downloads</span></div>` : ''}
        ${groups.map((s) => {
          const closed = lib.closed.includes(s.id);
          return `<section class="lib-group st-${s.id} ${closed ? 'closed' : ''}">
            <button class="lib-group-h" data-group="${s.id}" aria-expanded="${!closed}">
              <span class="lib-group-t">${s.label}</span><span class="lib-count">${s.games.length}</span>
              <span class="lib-rule"></span>
              <svg class="lib-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="lib-items"${closed ? ' hidden' : ''}>${s.games.map((g) => libItem(g, s)).join('')}</div>
          </section>`;
        }).join('')}
      </div>`;
  }

  // Phone: the open folder. Just the icons — no path, no back button; tap outside to close.
  function foldBody() {
    const items = STATUSES.flatMap((s) => catalog.filter((g) => statusOf(g) === s.id).map((g) => ({ g, s })));
    return `<div class="fold">
      <h2 class="fold-title">Our Games</h2>
      <div class="fold-panel">${items.length
        ? `<div class="fold-grid">${items.map(({ g, s }) => `
            <button class="fold-app st-${s.id}" data-game="${escapeHtml(g.id)}">
              <span class="lib-art">${gameIcon(g)}${s.tag ? `<i class="lib-tag">${s.tag}</i>` : ''}</span>
              <span class="lib-name">${escapeHtml(g.name)}</span>
            </button>`).join('')}</div>`
        : `<p class="fold-empty">${catalogReady ? 'No games yet.' : 'Loading games…'}</p>`}</div>
    </div>`;
  }

  function libItem(g, s) {
    const id = escapeHtml(g.id);
    const name = escapeHtml(g.name);
    const tag = s.tag ? `<i class="lib-tag">${s.tag}</i>` : '';
    if (lib.view === 'large') {
      const shot = g.gallery?.[0]?.src || g.thumbnail;
      return `<button class="lib-card" data-game="${id}">
        <span class="lib-art lib-shot">
          ${shot ? `<img class="lib-img" src="${escapeHtml(assetUrl(shot))}" alt="" loading="lazy">` : gameIcon(g)}
          ${tag}
        </span>
        <span class="lib-meta">${gameIcon(g)}<span><b class="lib-name">${name}</b><small>${escapeHtml(g.genre || '')}</small></span></span>
      </button>`;
    }
    if (lib.view === 'list') {
      const stats = [g.rating != null ? `★ ${Number(g.rating).toFixed(1)}` : '', escapeHtml(g.downloads || '')]
        .filter(Boolean).join(' · ') || '—';
      return `<button class="lib-row" data-game="${id}">
        <span class="lib-art">${gameIcon(g)}</span>
        <span class="lib-name">${name} <i class="lib-chip">${s.short}</i></span>
        <span>${escapeHtml(g.genre || '—')}</span>
        <span class="c-size">${g.sizeMb != null ? `${escapeHtml(String(g.sizeMb))} MB` : '—'}</span>
        <span class="c-date">${formatDate(g.released)}</span>
        <span>${stats}</span>
      </button>`;
    }
    return `<button class="ex-item ex-app lib-icon" data-game="${id}">
      <span class="lib-art">${gameIcon(g)}${tag}</span>
      <span class="lib-name">${name}</span>
    </button>`;
  }

  // large-icon hover: play the preview gif/video, or cycle the screenshots
  let hoverCard = null, hoverTimer = 0;
  function startPreview(card) {
    const g = catalog.find((x) => x.id === card.dataset.game);
    const art = card.querySelector('.lib-shot');
    if (!g || !art) return;
    if (g.preview) {
      const src = escapeHtml(assetUrl(g.preview));
      art.insertAdjacentHTML('beforeend', /\.(mp4|webm)$/i.test(g.preview)
        ? `<video class="lib-prev" src="${src}" autoplay muted loop playsinline></video>`
        : `<img class="lib-prev" src="${src}" alt="">`);
      return;
    }
    const shots = (g.gallery || []).map((x) => assetUrl(x.src));
    const img = art.querySelector('.lib-img');
    if (!img || shots.length < 2) return;
    let i = 0;
    hoverTimer = setInterval(() => { i = (i + 1) % shots.length; img.src = shots[i]; }, 800);
  }
  function stopPreview(card) {
    clearInterval(hoverTimer);
    card.querySelector('.lib-prev')?.remove();
    const g = catalog.find((x) => x.id === card.dataset.game);
    const img = card.querySelector('.lib-img');
    const first = g?.gallery?.[0]?.src || g?.thumbnail;
    if (img && first) img.src = assetUrl(first);
  }
  winsEl.addEventListener('pointerover', (e) => {
    const card = e.target.closest('.lib-card');
    if (card === hoverCard) return;
    if (hoverCard) stopPreview(hoverCard);
    hoverCard = card;
    if (card) startPreview(card);
  });
  winsEl.addEventListener('pointerleave', () => { if (hoverCard) stopPreview(hoverCard); hoverCard = null; });

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
          <div class="gp-actions">
            ${store ? `<a class="gp-store" href="${escapeHtml(store)}" rel="noopener" target="_blank">Get it on Google Play</a>` : ''}
            <button class="gp-share" data-share="${escapeHtml(g.id)}">${shareSvg}<span>Share</span></button>
          </div>
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
      ${moreSection(catalog.filter((x) => x.id !== g.id), { inWindow: true })}
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
    clearInterval(hoverTimer); hoverCard = null;
    for (const { el, app } of open.values()) {
      if (app.type !== 'library') continue;
      el.querySelector('.win-body').innerHTML = contentFor(app);
    }
  }

  function openApp(a, opts = {}) {
    if (!a) return;
    if (a.locked) {
      const b = iconsEl.querySelector(`[data-app="${a.id}"]`);
      b?.classList.remove('deny'); b?.offsetWidth; b?.classList.add('deny');
      return;
    }
    if (a.type === 'viewer') setGameParam(a.game);
    if (a.type === 'mobileview') {
      if (deskForced()) { try { localStorage.removeItem(DESK_KEY); } catch {} location.reload(); }
      else openPhone();
      return;
    }
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
      if (a.type === 'terminal') w.el.querySelector('.term-in')?.focus({ preventScroll: true });
      return;
    }

    if (a.type === 'profile') tabsState.set(a.id, { tabs: ['company'], active: 'company' });
    const el = document.createElement('section');
    el.className = `os-win win-${a.type}`;
    el.dataset.win = a.id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', a.title);
    const n = open.size;
    el.style.left = `${24 + ((n * 4) % 20)}%`;
    el.style.top = `${8 + ((n * 5) % 22)}%`;
    if (a.type === 'library') { el.style.left = 'calc((100% - min(1200px, 94%)) / 2)'; el.style.top = '3%'; }
    if (a.type === 'profile') { el.style.left = 'calc((100% - min(1100px, 94%)) / 2)'; el.style.top = '4%'; }
    if (a.type === 'whatsapp') { el.style.left = 'calc((100% - min(980px, 90%)) / 2)'; el.style.top = '4%'; }
    if (opts.max) el.classList.add('max');
    if (a.type === 'library' && isMobile()) el.classList.add('win-folder');
    const barLead = a.type === 'profile'
      // browser window: browser icon, then the tabs, all in the title bar
      ? `<span class="os-glyph sm br-logo">${glyph.browser}</span>
         <div class="br-tabs" role="tablist">${profileTabs(a)}</div>`
      : `<button class="win-back" data-act="min" aria-label="Back to home">‹</button>
         <span class="os-glyph sm">${iconMarkup(a)}</span>
         <span class="win-title">${escapeHtml(a.title)}</span>`;
    el.innerHTML = `
      <header class="win-bar ${a.type === 'profile' ? 'br-titlebar' : ''}">
        ${barLead}
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
    bar.addEventListener('dblclick', (e) => { if (!e.target.closest('button, .br-tab')) el.classList.toggle('max'); });
    if (a.type === 'whatsapp') bindWhatsApp(el);
    if (a.type === 'terminal') bindTerminal(el);
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
    if (w.app.type === 'viewer') setGameParam(null);
    w.el.classList.add('closing');
    setTimeout(() => w.el.remove(), 180);
    open.delete(id);
    tabsState.delete(id);
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
      docked.map((a) => `<button data-app="${a.id}" aria-label="${escapeHtml(a.short)}"><span class="os-glyph">${iconMarkup(a)}</span><span class="dk-label">${escapeHtml(a.short)}</span></button>`).join('') +
      (extra.length ? '<span class="dock-sep"></span>' : '') +
      extra.map(({ app }) => `<button data-run="${app.id}" class="is-open" aria-label="${escapeHtml(app.short)}"><span class="os-glyph">${iconMarkup(app)}</span><span class="dk-label">${escapeHtml(app.short)}</span></button>`).join('');
    root.querySelectorAll('.os-icon[data-app], .os-dock [data-app]').forEach((b) => {
      b.classList.toggle('is-open', open.has(b.dataset.app));
    });
  }

  // ── mobile view: the same page in a phone-sized frame ──
  function openPhone() {
    if (document.querySelector('.phone-overlay')) return;
    const ov = document.createElement('div');
    ov.className = 'phone-overlay';
    ov.innerHTML = `<div class="phone-frame"><iframe title="Nixin mobile view" src="${location.pathname}${location.search}"></iframe></div>
      <button class="phone-close" aria-label="Close mobile view">✕</button>`;
    const close = () => { ov.remove(); removeEventListener('keydown', onKey); removeEventListener('message', onMsg); };
    const onMsg = (e) => { if (e.data?.nixin === 'close-phone') close(); };
    addEventListener('message', onMsg);
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    ov.addEventListener('click', (e) => { if (!e.target.closest('.phone-frame') || e.target.closest('.phone-close')) close(); });
    ov.querySelector('.phone-close').addEventListener('click', close);
    addEventListener('keydown', onKey);
    document.body.appendChild(ov);
  }

  // ── terminal ───────────────────────────────────
  // Keys often stay on the icon button that opened the window (a delayed
  // focus() is ignored). While Terminal is the front window, route those
  // keys into the prompt ourselves.
  document.addEventListener('keydown', (e) => {
    const input = root.querySelector('.win-terminal.focused:not(.min):not(.closing) .term-in');
    if (!input?._termKey || e.target === input) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
    if (root.querySelector('.srch-sheet.open')) return;
    if (!input._termKey(e, 'route')) return;
    e.stopPropagation();
    if (document.activeElement !== input) input.focus();
  }, true);

  function bindTerminal(el) {
    const log = el.querySelector('.term-log');
    const promptEl = el.querySelector('.term-prompt');
    const input = el.querySelector('.term-in');
    const write = (text, err) => {
      if (text == null || text === '') return;
      const row = document.createElement('div');
      row.className = 'term-block' + (err ? ' term-err' : '');
      row.textContent = text.endsWith('\n') ? text.slice(0, -1) : text;
      log.appendChild(row);
    };
    const freeze = (line) => {
      const row = document.createElement('div');
      row.className = 'term-row term-cmd';
      const p = document.createElement('span');
      p.className = 'term-prompt';
      p.textContent = promptEl.textContent;
      const c = document.createElement('span');
      c.textContent = line;
      row.append(p, c);
      log.appendChild(row);
    };
    const wipe = () => log.replaceChildren();
    const scroll = () => { log.scrollTop = log.scrollHeight; };
    const refresh = () => { promptEl.textContent = shell.prompt(); };
    const placeEnd = () => {
      const n = input.value.length;
      try { input.setSelectionRange(n, n); } catch { /* input not focused yet */ }
    };
    const putChar = (ch) => {
      const s = input.selectionStart ?? input.value.length;
      const t = input.selectionEnd ?? s;
      if (typeof input.setRangeText === 'function') input.setRangeText(ch, s, t, 'end');
      else input.value = input.value.slice(0, s) + ch + input.value.slice(t);
    };
    const rub = (back) => {
      const s = input.selectionStart ?? input.value.length;
      const t = input.selectionEnd ?? s;
      if (s !== t) input.setRangeText('', s, t, 'end');
      else if (back && s > 0) input.setRangeText('', s - 1, s, 'end');
      else if (!back && t < input.value.length) input.setRangeText('', t, t + 1, 'end');
    };
    const submit = () => {
      const line = input.value;
      freeze(line);
      input.value = '';
      const res = shell.exec(line);
      if (res.clear) wipe();
      for (const b of res.blocks) write(b.text, b.err);
      refresh();
      runActions(res.actions);
      scroll();
    };

    input._termKey = (e, source) => {
      const plain = !e.metaKey && !e.ctrlKey && !e.altKey;
      if (e.key === 'Enter') { e.preventDefault(); submit(); return true; }
      if (e.key === 'ArrowUp') { e.preventDefault(); input.value = shell.older(input.value); placeEnd(); return true; }
      if (e.key === 'ArrowDown') { e.preventDefault(); input.value = shell.newer(input.value); placeEnd(); return true; }
      if (e.key === 'Tab') {
        e.preventDefault();
        const done = shell.complete(input.value);
        input.value = done.line;
        if (done.matches.length > 1) { write(done.matches.join('  ')); scroll(); }
        return true;
      }
      if (e.key === 'l' && e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); wipe(); scroll(); return true; }
      if (e.key === 'c' && e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        freeze(input.value + '^C');
        input.value = '';
        shell.cancelHistory();
        scroll();
        return true;
      }
      if (source !== 'route' || !plain) return false;
      if (e.key === 'Backspace') { e.preventDefault(); rub(true); return true; }
      if (e.key === 'Delete') { e.preventDefault(); rub(false); return true; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const n = input.value.length;
        let s = input.selectionStart ?? n;
        if (e.key === 'Home') s = 0;
        else if (e.key === 'End') s = n;
        else if (e.key === 'ArrowLeft') s = Math.max(0, s - 1);
        else s = Math.min(n, s + 1);
        input.focus();
        input.setSelectionRange(s, s);
        return true;
      }
      if (e.key.length === 1) { e.preventDefault(); putChar(e.key); return true; }
      return false;
    };

    write('Nixin Studio terminal\nType `help` for commands. `open <name>` launches an app or page.');
    refresh();
    input.focus();

    input.addEventListener('keydown', (e) => input._termKey(e, 'input'));
    el.querySelector('.term').addEventListener('pointerdown', (e) => {
      if (e.target.closest('.win-bar, button, a')) return;
      if (e.target === input) return;
      input.focus();
      placeEnd();
    });
  }

  function imageBody() {
    if (!photo?.src) {
      return `<div class="iv iv-empty"><p>No picture open.</p><p>Click a picture on a game or About page, or run <b>open file.jpg</b> in Terminal.</p></div>`;
    }
    return `<div class="iv">
      <div class="iv-stage"><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.title || '')}"></div>
      <p class="iv-cap">${escapeHtml(photo.title || '')}</p>
    </div>`;
  }

  function fileTitle(src) {
    if (!src || src.startsWith('data:')) return 'Image';
    try { return decodeURIComponent(src.split('/').pop().split('?')[0]) || 'Image'; }
    catch { return 'Image'; }
  }

  function openImage(src, title) {
    if (!src) return;
    photo = { src, title: title || fileTitle(src) };
    const a = apps.find((x) => x.id === 'photos');
    if (!open.has('photos')) openApp(a, { max: true });
    const w = open.get('photos');
    if (!w) return;
    w.el.classList.add('max');
    w.el.setAttribute('aria-label', photo.title);
    const titleEl = w.el.querySelector('.win-title');
    if (titleEl) titleEl.textContent = photo.title;
    w.el.querySelector('.win-body').innerHTML = imageBody();
    restore('photos');
    focus(w.el);
  }

  function runActions(actions) {
    for (const a of actions || []) {
      if (a.type === 'image') openImage(a.src, a.title);
      else if (a.type === 'app' || a.type === 'locked') openApp(apps.find((x) => x.id === a.id));
      else if (a.type === 'game') {
        const game = catalog.find((g) => g.id === a.id);
        if (game) openApp(viewerApp(game), { max: true });
      } else if (a.type === 'member') {
        const app = apps.find((x) => x.type === 'profile' && (x.members || []).some((m) => m.id === a.id));
        if (!app) continue;
        openApp(app);
        const st = tabsState.get(app.id);
        if (!st) continue;
        showMember(st, a.id);
        renderProfile(app.id);
      } else if (a.type === 'url' && a.url) window.open(a.url, '_blank', 'noopener');
    }
  }

  // ── clicks ─────────────────────────────────────
  root.addEventListener('click', (e) => {
    const pic = e.target.closest?.('img');
    if (pic?.src && pic.closest('.gp-gallery, .gp-hero, .pf') && !pic.closest('.gp-more, a')) {
      const cap = pic.closest('figure')?.querySelector('b')?.textContent;
      openImage(pic.currentSrc || pic.src, (cap || pic.alt || '').trim());
      return;
    }
    // About Us browser: tabs, member links, toolbar
    const pid = profileOf(e.target);
    if (pid) {
      const st = tabsState.get(pid);
      const closeT = e.target.closest('[data-tabclose]')?.dataset.tabclose;
      const memberId = e.target.closest('[data-member]')?.dataset.member;
      const tabId = e.target.closest('[data-tab]')?.dataset.tab;
      let changed = true;
      if (closeT) {
        const i = st.tabs.indexOf(closeT);
        st.tabs = st.tabs.filter((t) => t !== closeT);
        if (st.active === closeT) st.active = st.tabs[Math.min(i, st.tabs.length - 1)] || 'company';
      } else if (memberId) {
        showMember(st, memberId);
      } else if (tabId) {
        st.active = tabId;
      } else if (e.target.closest('[data-brback]')) {
        st.active = 'company';
      } else if (!e.target.closest('[data-brreload]')) {
        changed = false;
      }
      if (changed) {
        renderProfile(pid);
        const on = open.get(pid).el.querySelector('.br-tab.on');
        if (on) { // keep the active tab visible on narrow screens
          const strip = on.parentElement, r = on.getBoundingClientRect(), sr = strip.getBoundingClientRect();
          if (r.left < sr.left) strip.scrollLeft -= sr.left - r.left + 8;
          else if (r.right > sr.right) strip.scrollLeft += r.right - sr.right + 8;
        }
        return;
      }
      const appBtn = e.target.closest('.pf-btn[data-app]');
      if (appBtn) { openApp(apps.find((x) => x.id === appBtn.dataset.app)); return; }
    }
    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) {
      lib.view = viewBtn.dataset.view; saveLib(); refreshLibrary();
      return;
    }
    const groupBtn = e.target.closest('[data-group]');
    if (groupBtn) {
      const id = groupBtn.dataset.group;
      lib.closed = lib.closed.includes(id) ? lib.closed.filter((x) => x !== id) : [...lib.closed, id];
      saveLib();
      const sec = groupBtn.closest('.lib-group');
      const closed = lib.closed.includes(id);
      sec.classList.toggle('closed', closed);
      sec.querySelector('.lib-items').hidden = closed;
      groupBtn.setAttribute('aria-expanded', String(!closed));
      return;
    }
    const fold = e.target.closest('.fold');
    if (fold && !e.target.closest('.fold-app, .fold-panel')) { close(fold.closest('.os-win').dataset.win); return; }
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
      const app = apps.find((x) => x.id === b.dataset.app);
      openApp(app);
      startMenu.classList.remove('open');
      if (app?.type === 'terminal') {
        b.blur();
        root.querySelector('.win-terminal.focused .term-in')?.focus();
      }
      return;
    }
    const shareBtn = e.target.closest('[data-share]');
    if (shareBtn) {
      const game = catalog.find((g) => g.id === shareBtn.dataset.share);
      if (game) shareGame(game, shareBtn);
      return;
    }
    if (e.target.closest('[data-deskview]')) {
      if (embedded) parent.postMessage({ nixin: 'close-phone' }, '*');
      else { try { localStorage.setItem(DESK_KEY, '1'); } catch {} location.reload(); }
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
      if (isMobile() || el.classList.contains('max') || e.target.closest('button, .br-tab')) return;
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

  root.querySelector('.lock-login').addEventListener('submit', (e) => { e.preventDefault(); unlock(); });

  function unlock(then) {
    if (!root.classList.contains('locked')) return;
    setKnob(maxX(), true);
    root.classList.add('unlocking');
    dispatchEvent(new CustomEvent('nixin:burst'));
    setTimeout(() => {
      root.classList.remove('locked', 'unlocking');
      root.classList.add('unlocked');
      setKnob(0, false);
      iconsEl.querySelector('.os-icon:not(.docked)')?.focus({ preventScroll: true });
      if (!isMobile()) openApp(apps.find((x) => x.type === 'library')); // Our Games opens by default
      then?.();
    }, 380);
  }
  function lock() {
    startMenu.classList.remove('open');
    [...open.keys()].forEach(minimise);
    root.classList.remove('unlocked');
    root.classList.add('locked');
    dispatchEvent(new CustomEvent('nixin:burst'));
    setTimeout(() => (isMobile() ? knob : root.querySelector('.lock-go')).focus({ preventScroll: true }), 50);
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

  // ── shareable game links: index.html?game=<slug> ──
  let linkHandled = false;
  function openLinkedGame() {
    if (linkHandled) return;
    linkHandled = true;
    const id = new URLSearchParams(location.search).get('game');
    const game = id && catalog.find((g) => g.slug === id || g.id === id);
    if (!game) { if (id) setGameParam(null); return; }
    scrollTo(0, 0);
    const show = () => openApp(viewerApp(game), { max: true });
    if (root.classList.contains('locked')) unlock(show); else show();
  }

  renderRunning();

  return {
    apps,
    openAppById(id) { openApp(apps.find((x) => x.id === id)); },
    openGame(id) {
      const game = catalog.find((g) => g.id === id);
      if (game) openApp(viewerApp(game), { max: true });
    },
    openMember(memberId) {
      const a = apps.find((x) => x.type === 'profile' && (x.members || []).some((m) => m.id === memberId));
      if (!a) return;
      openApp(a);
      const st = tabsState.get(a.id);
      if (!st) return;
      showMember(st, memberId);
      renderProfile(a.id);
    },
    appIconHtml(id) { return iconMarkup(apps.find((x) => x.id === id)); },
    logoHtml() { return `<img src="${logo}" alt="">`; },
    setGames(list) {
      catalog = list || [];
      catalogReady = true;
      shell.setGames(catalog);
      root.querySelectorAll('.win-terminal .term-line .term-prompt').forEach((el) => { el.textContent = shell.prompt(); });
      folderGames = STATUSES.flatMap((st) => catalog.filter((g) => statusOf(g) === st.id));
      const libApp = apps.find((a) => a.type === 'library');
      if (libApp) root.querySelectorAll(`.os-icon[data-app="${libApp.id}"] .os-glyph, .sm-list [data-app="${libApp.id}"] .os-glyph`)
        .forEach((g) => { g.innerHTML = iconMarkup(libApp); });
      renderRunning();
      refreshLibrary();
      openLinkedGame();
    },
  };
}

const shareSvg = '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>';

function gameLink(game) {
  const u = new URL(location.href);
  u.search = ''; u.hash = '';
  u.searchParams.set('game', game.slug || game.id);
  return u.href;
}

function setGameParam(game) {
  if (window.self !== window.top) return; // the phone preview frame keeps its own URL
  const u = new URL(location.href);
  if (game) u.searchParams.set('game', game.slug || game.id);
  else u.searchParams.delete('game');
  if (u.href !== location.href) history.replaceState(history.state, '', u);
}

async function shareGame(game, btn) {
  const url = gameLink(game);
  const label = btn.querySelector('span');
  const flash = (t) => {
    label.textContent = t;
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { label.textContent = 'Share'; }, 1800);
  };
  // phones: native share sheet
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ title: `${game.name} by Nixin Studio`, text: game.tagline || '', url }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(url); flash('Link copied!'); }
  catch { prompt('Copy this link:', url); }
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

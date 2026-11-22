// Section 2: pinned phone with a Reels-style feed of our games.
// Page scroll (vertical) moves through games; horizontal swipe / wheel / arrow
// keys move through the current game's screenshots. Screenshots that are not
// on the phone fan out left and right as 3D card decks.
import { studio } from './data.js';
import { placeholderScreens } from './art.js';
import { logoDataURL } from './logo.js';

const icons = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.3 2.4h2c.7-1.3 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  comment: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.1A8.5 8.5 0 1 1 21 11.5z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M22 3 9.2 13.3M22 3l-6.5 18-4.2-7.7L3 9.2z"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
};

export function initReels(games) {
  if (!games?.length) return;
  const section = document.getElementById('games');
  const sticky = section.querySelector('.games-sticky');
  const track = section.querySelector('.reel-track');
  const deck = section.querySelector('.deck');
  const list = section.querySelector('.games-list');
  const ambient = section.querySelector('.games-ambient');
  const counter = section.querySelector('.games-counter');
  const phone = section.querySelector('.phone');
  const avatar = logoDataURL(96);

  // Resolve screens (real images or placeholders)
  games.forEach((g) => { if (!g.screens || !g.screens.length) g.screens = placeholderScreens(g); });

  // ── build reels ────────────────────────────────
  track.innerHTML = games.map((g, gi) => `
    <article class="reel" data-i="${gi}" aria-label="${g.title}">
      <div class="reel-slides">
        ${g.screens.map((s, si) => `<img src="${s}" alt="${g.title} screenshot ${si + 1}" draggable="false" decoding="async">`).join('')}
      </div>
      <div class="reel-dots">${g.screens.map(() => '<i></i>').join('')}</div>
      <div class="reel-shade"></div>
      <div class="reel-actions">
        <button class="act like" aria-label="Like">${icons.heart}${g.likes ? `<span>${g.likes}</span>` : ''}</button>
        <button class="act" aria-label="Comments">${icons.comment}${g.comments ? `<span>${g.comments}</span>` : ''}</button>
        <button class="act" aria-label="Share">${icons.share}${g.shares ? `<span>${g.shares}</span>` : ''}</button>
        <button class="act" aria-label="More">${icons.more}</button>
        <img class="act-disc" src="${avatar}" alt="">
      </div>
      <div class="reel-info">
        <div class="reel-user">
          <img src="${avatar}" alt="">
          <b>${studio.handle}</b>
          <span class="follow">Follow</span>
        </div>
        <h3>${g.title}</h3>
        <p>${g.caption} <span class="tags">${g.tags.join(' ')}</span></p>
        <div class="reel-music">${icons.music}<span><em>${g.title} · Original soundtrack · ${g.genre}</em></span></div>
        <a class="reel-play" href="${g.playUrl}">${icons.play} View game</a>
      </div>
      <div class="reel-heart">${icons.heart}</div>
    </article>`).join('');

  list.innerHTML = games.map((g, i) => `<li><button data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${g.title}</button></li>`).join('');

  const reels = [...track.children];
  const slideIdx = games.map(() => 0);
  let current = -1;

  // ── deck of cards for current game ─────────────
  let deckCards = [];
  function buildDeck(gi) {
    const g = games[gi];
    deck.innerHTML = g.screens.map((s) => `<div class="card"><img src="${s}" alt="" draggable="false" decoding="async"></div>`).join('');
    deckCards = [...deck.children];
    deckCards.forEach((c, i) => c.addEventListener('click', () => setSlide(i)));
    // first frame: start collapsed behind the phone, then fan out
    deckCards.forEach((c) => { c.style.transition = 'none'; c.style.transform = 'translate(-50%,-50%) scale(.6)'; c.style.opacity = 0; });
    deck.offsetWidth; // reflow
    deckCards.forEach((c) => { c.style.transition = ''; });
    layoutDeck();
  }

  function layoutDeck() {
    const s = slideIdx[current];
    const mobile = innerWidth < 720;
    const base = mobile ? phone.offsetWidth / 2 + 24 : Math.min(330, innerWidth * 0.2);
    const gap = mobile ? 26 : 70;
    deckCards.forEach((c, i) => {
      const o = i - s, a = Math.abs(o), side = Math.sign(o);
      if (o === 0) {
        c.style.transform = 'translate(-50%,-50%) translateZ(-200px) scale(.7)';
        c.style.opacity = 0;
        c.style.zIndex = 0;
        c.style.pointerEvents = 'none';
        return;
      }
      const x = side * (base + (a - 1) * gap);
      const rotY = -side * (mobile ? 30 : 24);
      const z = -a * 70;
      const rotZ = side * a * 2.5;
      c.style.transform = `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
      c.style.opacity = a > 3 ? 0 : 1 - (a - 1) * 0.18;
      c.style.zIndex = 10 - a;
      c.style.pointerEvents = 'auto';
      c.style.setProperty('--dim', ((a - 1) * 0.18).toFixed(2));
    });
  }

  function setSlide(si) {
    const g = games[current];
    si = Math.max(0, Math.min(g.screens.length - 1, si));
    slideIdx[current] = si;
    const reel = reels[current];
    const sl = reel.querySelector('.reel-slides');
    sl.style.transition = '';
    sl.style.transform = `translate3d(${-si * 100}%,0,0)`;
    reel.querySelectorAll('.reel-dots i').forEach((d, i) => d.classList.toggle('on', i === si));
    ambient.style.backgroundImage = `url(${g.screens[si]})`;
    layoutDeck();
  }

  function setGame(gi) {
    if (gi === current) return;
    current = gi;
    reels.forEach((r, i) => r.classList.toggle('active', i === gi));
    list.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === gi));
    counter.textContent = `${gi + 1}/${games.length}`;
    buildDeck(gi);
    setSlide(slideIdx[gi]);
  }

  // ── vertical: scroll-linked track ──────────────
  // The track follows the scroll continuously: each game "holds" for a while,
  // then glides into the next. A light lerp smooths out chunky wheel steps.
  const PER_GAME = 0.9; // viewport-heights of scroll per game
  const HOLD = 0.5;     // share of each game's scroll where the reel stays put
  let secTop = 0, span = 1, lastW = 0, lastH = 0;
  function sizeSection() {
    lastW = innerWidth; lastH = innerHeight;
    section.style.height = `${innerHeight * (1 + games.length * PER_GAME)}px`;
    secTop = section.getBoundingClientRect().top + scrollY;
    span = Math.max(1, section.offsetHeight - innerHeight);
  }
  function targetPos() {
    const p = Math.max(0, Math.min(1, (scrollY - secTop) / span));
    const u = Math.max(0, Math.min(games.length - 1, p * games.length - 0.5));
    const k = Math.floor(u), t = u - k;
    const s = Math.max(0, Math.min(1, (t - HOLD / 2) / (1 - HOLD)));
    return k + s * s * (3 - 2 * s); // smoothstep
  }
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shown = targetPos(), raf = 0;
  function paint() {
    track.style.transform = `translate3d(0,${-shown * 100}%,0)`;
    setGame(Math.round(shown));
  }
  function tick() {
    const target = targetPos();
    shown += (target - shown) * (reduceMotion ? 1 : 0.2);
    if (Math.abs(target - shown) < 0.001) shown = target;
    paint();
    raf = shown === target ? 0 : requestAnimationFrame(tick);
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };

  sizeSection();
  addEventListener('resize', () => {
    // mobile URL bar show/hide fires resize; ignore small height-only changes
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 150) return;
    sizeSection(); shown = targetPos(); paint(); layoutDeck();
  });
  addEventListener('scroll', onScroll, { passive: true });
  paint();

  list.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const i = +b.dataset.i;
    scrollTo({ top: secTop + span * ((i + 0.5) / games.length), behavior: 'smooth' });
  });

  // ── horizontal: wheel / swipe / keys ───────────
  const screen = phone.querySelector('.phone-screen');
  const slidesOf = () => reels[current].querySelector('.reel-slides');
  // Move the current slides live by px (finger / trackpad follows), with
  // rubber-band resistance past the first and last screenshot.
  function dragTo(px) {
    const si = slideIdx[current], last = games[current].screens.length - 1;
    if ((si === 0 && px > 0) || (si === last && px < 0)) px *= 0.3;
    const sl = slidesOf();
    sl.style.transition = 'none';
    sl.style.transform = `translate3d(calc(${-si * 100}% + ${px}px),0,0)`;
  }

  // Trackpad: one gesture = at most one slide. After a page turn the momentum
  // tail (decaying deltas) is swallowed, but a new swipe is detected right away:
  // its deltas rise again or change direction, so no need to wait for quiet.
  let wheelX = 0, wheelIdle = 0, wheelSpent = false, lastAbs = 0, lastSign = 0;
  phone.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical → page scroll
    e.preventDefault();
    const dx = e.deltaX * (e.deltaMode === 1 ? 16 : 1);
    const abs = Math.abs(dx), sign = Math.sign(dx);
    clearTimeout(wheelIdle);
    wheelIdle = setTimeout(() => {
      wheelSpent = false;
      if (wheelX) { wheelX = 0; setSlide(slideIdx[current]); } // snap back
    }, 120);
    if (wheelSpent) {
      const newGesture = sign !== lastSign || (abs > lastAbs + 4 && abs > 10);
      lastAbs = abs; lastSign = sign;
      if (!newGesture) return;
      wheelSpent = false; wheelX = 0;
    }
    lastAbs = abs; lastSign = sign;
    wheelX -= dx;
    if (Math.abs(wheelX) > screen.clientWidth * 0.2) {
      const dir = -Math.sign(wheelX);
      wheelX = 0; wheelSpent = true;
      setSlide(slideIdx[current] + dir);
    } else dragTo(wheelX);
  }, { passive: false });

  // Pointer drag (mouse + touch). touch-action: pan-y lets vertical scroll through.
  let sx = 0, sy = 0, st = 0, dragging = false, axis = '';
  phone.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button') || e.button > 0) return;
    sx = e.clientX; sy = e.clientY; st = performance.now();
    dragging = true; axis = '';
  });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis === 'x') dragTo(dx);
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (axis !== 'x') return;
    const dx = e.clientX - sx;
    const fast = Math.abs(dx) > 20 && performance.now() - st < 250; // flick
    // pointercancel = browser took over (vertical scroll) → just snap back
    if (e.type === 'pointerup' && (fast || Math.abs(dx) > screen.clientWidth * 0.2)) setSlide(slideIdx[current] - Math.sign(dx));
    else setSlide(slideIdx[current]);
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  // double-tap / double-click to like
  phone.addEventListener('dblclick', (e) => {
    if (e.target.closest('a,button')) return;
    like(true);
    const h = reels[current].querySelector('.reel-heart');
    h.classList.remove('pop'); h.offsetWidth; h.classList.add('pop');
  });
  track.addEventListener('click', (e) => {
    const b = e.target.closest('.like');
    if (b) like(!b.classList.contains('on'));
  });
  function like(on) { reels[current].querySelector('.like').classList.toggle('on', on); }

  // arrow keys while pinned
  addEventListener('keydown', (e) => {
    const r = sticky.getBoundingClientRect();
    if (Math.abs(r.top) > 2) return;
    if (e.key === 'ArrowRight') setSlide(slideIdx[current] + 1);
    if (e.key === 'ArrowLeft') setSlide(slideIdx[current] - 1);
  });

  section.querySelector('.deck-prev').addEventListener('click', () => setSlide(slideIdx[current] - 1));
  section.querySelector('.deck-next').addEventListener('click', () => setSlide(slideIdx[current] + 1));
}

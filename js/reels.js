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
        ${g.screens.map((s, si) => `<img src="${s}" alt="${g.title} screenshot ${si + 1}" draggable="false" ${gi > 1 ? 'loading="lazy"' : ''}>`).join('')}
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
    deck.innerHTML = g.screens.map((s) => `<div class="card"><img src="${s}" alt="" draggable="false"></div>`).join('');
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
    const base = mobile ? 118 : Math.min(330, innerWidth * 0.2);
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
      c.style.filter = `brightness(${1 - (a - 1) * 0.18})`;
    });
  }

  function setSlide(si) {
    const g = games[current];
    si = Math.max(0, Math.min(g.screens.length - 1, si));
    slideIdx[current] = si;
    const reel = reels[current];
    reel.querySelector('.reel-slides').style.transform = `translateX(${-si * 100}%)`;
    reel.querySelectorAll('.reel-dots i').forEach((d, i) => d.classList.toggle('on', i === si));
    ambient.style.backgroundImage = `url(${g.screens[si]})`;
    layoutDeck();
  }

  function setGame(gi) {
    if (gi === current) return;
    current = gi;
    track.style.transform = `translateY(${-gi * 100}%)`;
    reels.forEach((r, i) => r.classList.toggle('active', i === gi));
    list.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === gi));
    counter.textContent = `${String(gi + 1).padStart(2, '0')} / ${String(games.length).padStart(2, '0')}`;
    buildDeck(gi);
    setSlide(slideIdx[gi]);
  }

  // ── scroll → game index ────────────────────────
  const PER_GAME = 0.9; // viewport-heights of scroll per game
  function sizeSection() {
    section.style.height = `${innerHeight * (1 + games.length * PER_GAME)}px`;
  }
  function onScroll() {
    const top = section.offsetTop;
    const span = section.offsetHeight - innerHeight;
    const p = Math.max(0, Math.min(0.9999, (scrollY - top) / span));
    setGame(Math.floor(p * games.length));
  }
  sizeSection();
  addEventListener('resize', () => { sizeSection(); onScroll(); layoutDeck(); });
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (current < 0) setGame(0);

  list.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const i = +b.dataset.i;
    const span = section.offsetHeight - innerHeight;
    scrollTo({ top: section.offsetTop + span * ((i + 0.5) / games.length), behavior: 'smooth' });
  });

  // ── horizontal: wheel / swipe / keys ───────────
  let wheelAcc = 0, wheelLock = 0;
  phone.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical → page scroll
    e.preventDefault();
    if (performance.now() < wheelLock) return;
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 40) {
      setSlide(slideIdx[current] + Math.sign(wheelAcc));
      wheelAcc = 0;
      wheelLock = performance.now() + 450;
    }
  }, { passive: false });

  // pointer drag (mouse + touch). touch-action: pan-y lets vertical scroll through.
  let sx = 0, sy = 0, dragging = false, moved = false;
  const slidesOf = () => reels[current].querySelector('.reel-slides');
  phone.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button')) return;
    sx = e.clientX; sy = e.clientY; dragging = true; moved = false;
  });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 6) moved = true;
    const sl = slidesOf();
    sl.style.transition = 'none';
    sl.style.transform = `translateX(calc(${-slideIdx[current] * 100}% + ${dx * 0.9}px))`;
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    const sl = slidesOf();
    sl.style.transition = '';
    const dx = e.clientX - sx, dy = e.clientY - sy;
    // pointercancel = browser took over (vertical scroll) → just snap back
    if (e.type === 'pointerup' && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) setSlide(slideIdx[current] - Math.sign(dx));
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

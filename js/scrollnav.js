// Explicit page-to-page navigation. Natural scrolling never leaves the home
// screen on its own: at the bottom of the home screen a translucent down arrow
// appears and must be clicked to go to the reels. While scrolling up through
// the reels (past the first one) a glowing up arrow offers a way back home.
export function initScrollNav() {
  const home = document.getElementById('home');
  const games = document.getElementById('games');
  if (!home || !games) return;

  const mk = (cls, label, path) => {
    const b = document.createElement('button');
    b.className = `scroll-arrow ${cls}`;
    b.setAttribute('aria-label', label);
    b.innerHTML = `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`;
    document.body.appendChild(b);
    return b;
  };
  const down = mk('sa-down', 'Go to our games reel', 'M5 9l7 7 7-7');
  const up = mk('sa-up', 'Back to home screen', 'M5 15l7-7 7 7');

  let navigating = false, navTimer = 0, downTimer = 0, upTimer = 0;
  // Only hold the page when a window is showing: with no open window there's
  // nothing on the home screen to scroll, so scrolling goes straight to the reels.
  const hasOpenWindow = () => !!home.querySelector('.os-win:not(.min):not(.closing)');
  const atHome = () => scrollY < 4 && !navigating && home.classList.contains('unlocked') && hasOpenWindow();

  function go(top) {
    navigating = true;
    hide(down); hide(up);
    scrollTo({ top, behavior: 'smooth' });
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { navigating = false; }, 1400);
  }
  const show = (el, ms) => {
    el.classList.add('show');
    return setTimeout(() => el.classList.remove('show'), ms);
  };
  const hide = (el) => el.classList.remove('show');
  const offerDown = () => { clearTimeout(downTimer); downTimer = show(down, 6000); };

  down.addEventListener('click', () => go(games.getBoundingClientRect().top + scrollY));
  up.addEventListener('click', () => go(0));

  // Can an inner scroller (a window's content) still move in this direction?
  const innerCanScroll = (t, dir) => {
    for (let el = t; el && el !== document.body; el = el.parentElement) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
        if (dir > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
        if (dir < 0 && el.scrollTop > 0) return true;
      }
    }
    return false;
  };

  addEventListener('wheel', (e) => {
    if (e.deltaY <= 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY) || !atHome()) return;
    if (innerCanScroll(e.target, 1)) return;
    e.preventDefault();
    offerDown();
  }, { passive: false });

  let ty = 0, tt = null;
  addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; tt = e.target; }, { passive: true });
  addEventListener('touchmove', (e) => {
    if (!atHome() || !tt) return;
    if (ty - e.touches[0].clientY < 6 || innerCanScroll(tt, 1)) return;
    if (e.cancelable) e.preventDefault();
    offerDown();
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'PageDown', 'End'].includes(e.key) || !atHome()) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable]') || innerCanScroll(e.target, 1)) return;
    e.preventDefault();
    offerDown();
  });

  // up arrow: scrolling up while on any reel after the first
  let lastY = scrollY;
  const reelIndex = () => [...games.querySelectorAll('.games-list button')].findIndex((b) => b.classList.contains('on'));
  addEventListener('scroll', () => {
    const y = scrollY, goingUp = y < lastY;
    lastY = y;
    if (y > 4) hide(down);
    if (navigating) return;
    const r = games.getBoundingClientRect();
    const inReels = r.top <= 0 && r.bottom > innerHeight * 0.5;
    if (inReels && goingUp && reelIndex() > 0) {
      up.classList.add('show');
      clearTimeout(upTimer);
      upTimer = setTimeout(() => hide(up), 3500);
    } else if (!goingUp || !inReels || reelIndex() === 0) hide(up);
  }, { passive: true });
}

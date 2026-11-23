import { initHero } from './hero.js';
import { initReels } from './reels.js';
import { initDesktop } from './desktop.js';
import { initScrollNav } from './scrollnav.js';
import { loadLogo, logoDataURL } from './logo.js';
import { loadGames, toReelGame } from './catalog.js';
import { buildIndex } from './search-index.js';
import { initSearch } from './search.js';

await loadLogo();

// favicon
const fav = document.createElement('link');
fav.rel = 'icon';
fav.href = logoDataURL(128);
document.head.appendChild(fav);

initScrollNav();
const desktop = initDesktop(); // home screen (lays out the logo slot the particles fit into)
try { initHero(); } catch (e) { console.error(e); document.body.classList.add('no-webgl'); }

let games = [];
try {
  games = await loadGames();
  desktop.setGames(games);
  // the reel only features games people can already play: live + testing
  initReels(games.filter((g) => ['live', 'testing'].includes(g.status || 'live')).map(toReelGame));
} catch (e) {
  console.error(e);
  desktop.setGames([]);
}

// site-wide search: games, studio, people, apps
initSearch({ index: buildIndex(games, desktop.apps), actions: desktop }).catch((e) => console.error(e));

// PWA: lets Chrome offer "Install app" (needs https or localhost)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service worker not registered', e));
}

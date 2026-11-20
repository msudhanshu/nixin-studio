import { initHero } from './hero.js';
import { initReels } from './reels.js';
import { initDesktop } from './desktop.js';
import { loadLogo, logoDataURL } from './logo.js';
import { loadGames, toReelGame } from './catalog.js';

await loadLogo();

// favicon
const fav = document.createElement('link');
fav.rel = 'icon';
fav.href = logoDataURL(128);
document.head.appendChild(fav);

const desktop = initDesktop(); // home screen (lays out the logo slot the particles fit into)
try { initHero(); } catch (e) { console.error(e); document.body.classList.add('no-webgl'); }

try {
  const games = await loadGames();
  desktop.setGames(games);
  initReels(games.map(toReelGame));
} catch (e) {
  console.error(e);
  desktop.setGames([]);
}

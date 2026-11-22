import { loadGames, findGame, assetUrl, pageUrl } from './catalog.js';
import { loadLogo, logoDataURL } from './logo.js';
import { moreSection } from './more.js';

const icons = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function render(game, others) {
  const root = document.getElementById('game');
  const icon = assetUrl(game.icon);
  const store = game.store?.play;
  const video = game.video && (typeof game.video === 'string' ? { src: game.video } : game.video);
  const videoSrc = video?.src ? assetUrl(video.src) : '';
  const poster = video?.poster ? assetUrl(video.poster) : assetUrl(game.thumbnail);

  document.title = `${game.name} — Nixin Studio`;
  document.documentElement.style.setProperty('--game-accent', game.accent || '#f4b942');
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = game.description || game.tagline || '';

  root.innerHTML = `
    <header class="gp-hero">
      <img class="gp-icon" src="${esc(icon)}" alt="${esc(game.name)} icon" width="120" height="120">
      <div class="gp-intro">
        <p class="eyebrow">${esc(game.genre)}</p>
        <h1>${esc(game.name)}</h1>
        <p class="gp-tagline">${esc(game.tagline)}</p>
        ${store ? `<a class="gp-store" href="${esc(store)}" rel="noopener" target="_blank">${icons.play} Get it on Google Play</a>` : ''}
      </div>
    </header>

    <p class="gp-desc">${esc(game.description)}</p>

    ${videoSrc ? `
      <section class="gp-video">
        <video src="${esc(videoSrc)}" poster="${esc(poster)}" controls playsinline></video>
      </section>` : ''}

    <section class="gp-gallery" aria-label="${esc(game.name)} screenshots">
      ${(game.gallery || []).map((item) => `
        <figure>
          <img src="${esc(assetUrl(item.src))}" alt="${esc(item.title || game.name)}" loading="lazy">
          <figcaption>
            ${item.title ? `<b>${esc(item.title)}</b>` : ''}
            ${item.caption ? `<span>${esc(item.caption)}</span>` : ''}
          </figcaption>
        </figure>`).join('')}
    </section>

    ${moreSection(others)}
  `;
}

function renderMissing() {
  document.title = 'Game not found — Nixin Studio';
  document.getElementById('game').innerHTML = `
    <header class="gp-hero">
      <div class="gp-intro">
        <p class="eyebrow">Nixin Studio</p>
        <h1>Game not found</h1>
        <p class="gp-tagline">That title is not in the catalog yet.</p>
        <a class="gp-store" href="index.html#games">Back to our games</a>
      </div>
    </header>`;
}

await loadLogo();

const fav = document.createElement('link');
fav.rel = 'icon';
fav.href = logoDataURL(128);
document.head.appendChild(fav);
document.querySelectorAll('[data-logo]').forEach((img) => { img.src = logoDataURL(96); });

const id = new URLSearchParams(location.search).get('id')
  || document.body.dataset.gameId
  || '';

try {
  const games = await loadGames();
  const game = findGame(games, id);
  if (!game) renderMissing();
  else render(game, games.filter((g) => g.id !== game.id));
} catch (err) {
  console.error(err);
  renderMissing();
}

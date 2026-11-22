// "More from Nixin": a horizontal, endlessly auto-scrolling strip of game cards.
// Shared by the standalone game page (links) and the home-screen game viewer (in-window buttons).
import { assetUrl, pageUrl } from './catalog.js';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function moreSection(others, { inWindow = false } = {}) {
  if (!others.length) return '';
  const card = (g, dup) => {
    const attrs = inWindow
      ? `data-game="${esc(g.id)}" type="button"`
      : `href="${esc(pageUrl(g.page))}"`;
    const tag = inWindow ? 'button' : 'a';
    return `<${tag} class="gp-card" ${attrs} style="--card-accent:${esc(g.accent || '#f4b942')}"${dup ? ' tabindex="-1"' : ''}>
      <img src="${esc(assetUrl(g.icon))}" alt="" loading="lazy">
      <span><b>${esc(g.name)}</b><small>${esc(g.tagline)}</small></span>
    </${tag}>`;
  };
  // repeat the set so one copy is wider than the viewport, then duplicate it for a seamless loop
  const reps = Math.max(1, Math.ceil(6 / others.length));
  const set = Array.from({ length: reps }, () => others).flat();
  const dur = Math.max(20, set.length * 5);
  return `
    <section class="gp-more" aria-label="More from Nixin">
      <p class="eyebrow">More from Nixin</p>
      <div class="gp-marquee" style="--dur:${dur}s">
        <div class="gp-track">
          <div class="gp-set">${set.map((g) => card(g, false)).join('')}</div>
          <div class="gp-set" aria-hidden="true">${set.map((g) => card(g, true)).join('')}</div>
        </div>
      </div>
    </section>`;
}

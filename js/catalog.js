// Games catalog. Source of truth: data/games.json
const catalogUrl = new URL('../data/games.json', import.meta.url);

export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return new URL('../' + path.replace(/^\.?\//, ''), import.meta.url).href;
}

export function pageUrl(path) {
  return assetUrl(path);
}

export async function loadGames() {
  const res = await fetch(catalogUrl);
  if (!res.ok) throw new Error(`Could not load games catalog (${res.status})`);
  const data = await res.json();
  return (data.games || []).filter((g) => g.published !== false);
}

export function findGame(games, id) {
  return games.find((g) => g.id === id || g.slug === id) || null;
}

/** Shape the reels feed expects. */
export function toReelGame(game) {
  const gallery = (game.gallery || []).map((item) => assetUrl(item.src));
  const thumb = assetUrl(game.thumbnail);
  return {
    id: game.id,
    title: game.name,
    genre: game.genre,
    caption: game.tagline,
    tags: (game.tags || []).map((t) => (t.startsWith('#') ? t : '#' + t)),
    likes: game.likes || '',
    comments: game.comments || '',
    shares: game.shares || '',
    palette: game.palette,
    playUrl: pageUrl(game.page),
    screens: gallery.length ? gallery : (thumb ? [thumb] : []),
  };
}

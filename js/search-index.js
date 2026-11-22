// Search index: one flat list of records built at runtime from data/games.json
// and js/data.js, so it never goes stale. Add extra synonyms to a game with an
// optional `keywords: []` field in games.json.
import { assetUrl } from './catalog.js';

const STATUS_WORDS = {
  live: ['live', 'released', 'out now', 'available', 'play store'],
  testing: ['testing', 'beta', 'early access', 'test'],
  dev: ['in development', 'dev', 'wip', 'upcoming', 'coming soon'],
  ideation: ['ideation', 'idea', 'concept', 'planned'],
};
const STATUS_LABEL = { live: 'Live', testing: 'Beta', dev: 'In development', ideation: 'Idea' };

// "hiddenObject" → "hidden object"
const words = (s) => String(s || '').replace(/([a-z])([A-Z])/g, '$1 $2');
const clean = (arr) => arr.flat(2).filter(Boolean).map((s) => words(s).trim()).filter(Boolean);
// keywords: lower-case, no duplicates
const kws = (arr) => [...new Set(clean(arr).map((s) => s.toLowerCase()))];

export function buildIndex(games = [], apps = []) {
  const out = [];

  for (const g of games) {
    const status = STATUS_WORDS[g.status] ? g.status : 'live';
    out.push({
      kind: 'game',
      id: g.id,
      title: g.name,
      subtitle: [g.genre, STATUS_LABEL[status]].filter(Boolean).join(' · '),
      icon: g.icon ? assetUrl(g.icon) : '',
      accent: g.accent || '',
      status,
      keywords: kws([g.tags || [], (g.genre || '').split('·'), g.keywords || [], STATUS_WORDS[status]]),
      text: clean([g.tagline, g.description, (g.gallery || []).flatMap((x) => [x.title, x.caption])]).join(' · '),
    });
  }

  for (const a of apps) {
    if (a.locked || a.type === 'mobileview') continue;

    if (a.type === 'profile') {
      const c = a.company || {};
      out.push({
        kind: 'studio',
        id: a.id,
        title: a.title,
        subtitle: [c.industry, c.location, c.founded && `Founded ${c.founded}`].filter(Boolean).join(' · '),
        icon: '',
        keywords: kws([c.specialties || [], c.industry, c.location, c.website, 'about us', 'company', 'studio', 'team']),
        text: clean([c.tagline, c.about]).join(' · '),
      });
      for (const m of a.members || []) {
        out.push({
          kind: 'person',
          id: m.id,
          appId: a.id,
          title: m.name,
          subtitle: m.headline,
          icon: m.photo ? assetUrl(m.photo) : '',
          keywords: kws([m.skills || [], (m.experience || []).flatMap((x) => [x.role, x.org]), m.location, 'team', 'people', 'founder']),
          text: clean([m.about, (m.experience || []).map((x) => x.note)]).join(' · '),
        });
      }
      continue; // the studio record above stands in for the About Us app
    }

    out.push({
      kind: 'app',
      id: a.id,
      title: a.label,
      subtitle: a.type === 'profile' ? 'Studio profile' : a.title,
      icon: a.iconUrl || '',
      glyph: a.icon,
      keywords: kws([a.short, a.title, a.id, (a.files || []).map((f) => f.name)]),
      text: clean([a.body]).join(' '),
    });
  }

  return out;
}

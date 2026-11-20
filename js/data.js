// ─────────────────────────────────────────────────────────────
//  Studio + desktop apps. Games live in data/games.json.
// ─────────────────────────────────────────────────────────────

export const studio = {
  name: 'Nixin Studio',
  handle: 'nixin.studio',
  email: 'hello@nixin.studio',
};

// Home-screen apps (section 1).
// type: 'notepad' | 'explorer' | 'library' | 'mail' | 'link' (href = where it scrolls/goes)
// dock: true → lives in the mobile dock instead of the mobile app grid.
export const apps = [
  {
    id: 'about',
    label: 'About Us.txt',
    short: 'About',
    icon: 'txt',
    type: 'notepad',
    dock: true,
    title: 'About Us.txt — Notepad',
    body:
`NIXIN STUDIO
============

We are a small independent game studio.

We make games that fit in your pocket and stay in your head:
quick to learn, hard to put down, and polished until they shine.

What we care about
  • Feel first. If it isn't fun to touch, it isn't done.
  • Small teams, fast loops, honest playtests.
  • Respect for the player's time (and wallet).

(Placeholder text. Replace in js/data.js)`,
  },
  {
    id: 'games',
    label: 'Our Games',
    short: 'Games',
    icon: 'gamepad',
    type: 'library',
    dock: true,
    title: 'Our Games',
  },
  {
    id: 'reels',
    label: 'Game Reel',
    short: 'Reel',
    icon: 'instagram',
    type: 'link',
    href: '#games',
    title: 'Game Reel',
  },
  {
    id: 'careers',
    label: 'Careers.txt',
    short: 'Careers',
    icon: 'txt',
    type: 'notepad',
    dock: true,
    title: 'Careers.txt — Notepad',
    body:
`JOIN NIXIN
==========

We are always looking for people who love making games.

Open roles
  [ ] Unity Gameplay Developer
  [ ] 2D / 3D Game Artist
  [ ] Game Designer (Casual / Puzzle)

Send your portfolio to the Contact app on this desktop.

(Placeholder text. Replace in js/data.js)`,
  },
  {
    id: 'contact',
    label: 'Contact',
    short: 'Contact',
    icon: 'mail',
    type: 'mail',
    dock: true,
    title: 'New Message',
  },
  {
    id: 'press',
    label: 'Press Kit',
    short: 'Press',
    icon: 'folder',
    type: 'explorer',
    title: 'Press Kit',
    files: [
      { name: 'Logo Pack.zip', icon: 'zip' },
      { name: 'Studio Fact Sheet.pdf', icon: 'pdf' },
      { name: 'Screenshots', icon: 'folder' },
      { name: 'Trailer.mp4', icon: 'video' },
    ],
  },
  {
    id: 'bin',
    label: 'Recycle Bin',
    short: 'Bin',
    icon: 'bin',
    type: 'explorer',
    title: 'Recycle Bin',
    files: [],
    empty: 'Nothing here. We ship everything.',
  },
];

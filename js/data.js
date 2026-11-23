// ─────────────────────────────────────────────────────────────
//  Studio + desktop apps. Games live in data/games.json.
// ─────────────────────────────────────────────────────────────

export const studio = {
  name: 'Nixin Studio',
  handle: 'nixin.studio',
  email: 'hello@nixin.studio',
};

// Home-screen apps (section 1).
// type: 'notepad' | 'explorer' | 'library' | 'mail' | 'profile' | 'whatsapp' | 'link' (href = where it scrolls/goes)
// dock: true → lives in the mobile dock instead of the mobile app grid.
export const apps = [
  {
    // Profile page shown in a browser-style window. Clicking a member opens their tab.
    id: 'about',
    label: 'About Us',
    short: 'About',
    icon: 'in',
    type: 'profile',
    dock: true,
    title: 'Nixin Studio',
    url: 'nixin.studio/about',
    company: {
      tagline: 'Pocket-sized games that stay in your head.',
      industry: 'Computer Games',
      location: 'India',
      founded: '2024',
      size: '2 people',
      website: 'nixin.studio',
      about:
`We are a small independent game studio.

We make games that fit in your pocket and stay in your head: quick to learn, hard to put down, and polished until they shine.

What we care about
• Feel first. If it isn't fun to touch, it isn't done.
• Small teams, fast loops, honest playtests.
• Respect for the player's time (and wallet).

(Placeholder. Replace in js/data.js)`,
      specialties: ['Mobile games', 'Puzzle', 'Casual', 'Unity'],
    },
    members: [
      {
        id: 'manjeet-sudhanshu',
        name: 'Manjeet Sudhanshu',
        headline: 'Co-founder · Game Developer at Nixin Studio',
        location: 'India',
        linkedin: 'https://www.linkedin.com/in/sudhanshumanjeet/',
        photo: '', // e.g. 'assets/team/manjeet.jpg'
        about: 'Placeholder bio. Write a few lines about what Manjeet builds, loves and plays. (Replace in js/data.js)',
        experience: [
          { role: 'Co-founder · Game Developer', org: 'Nixin Studio', when: '2024 – Present', note: 'Gameplay, systems and shipping.' },
          { role: 'Previous role', org: 'Company name', when: '20XX – 20XX', note: 'Placeholder.' },
        ],
        skills: ['Unity', 'C#', 'Game Design', 'Gameplay Programming'],
      },
      {
        id: 'manoj-himanshu',
        name: 'Manoj Himanshu',
        headline: 'Co-founder at Nixin Studio · Torno Solutions · IIT Kharagpur',
        location: 'Bengaluru, Karnataka, India',
        linkedin: 'https://www.linkedin.com/in/manoj-himanshu-834a3111/',
        photo: '', // e.g. 'assets/team/manoj.jpg'
        about: 'IIT Kharagpur graduate based in Bengaluru, currently at Torno Solutions. AWS Certified Solutions Architect and Neo4j Certified Professional. Co-founder of Nixin Studio.',
        experience: [
          { role: 'Co-founder', org: 'Nixin Studio', when: 'Present' },
          { role: 'Torno Solutions', when: 'Present' }, // add the job title here
        ],
        education: [
          { school: 'Indian Institute of Technology, Kharagpur', short: 'IIT' },
        ],
        certifications: [
          { name: 'AWS Certified Solutions Architect', by: 'Amazon Web Services', when: 'Issued Jun 2023' },
          { name: 'Neo4j Certified Professional', by: 'Neo4j', when: 'Issued Aug 2023' },
        ],
        skills: ['AWS', 'Neo4j', 'Software Engineering'],
      },
    ],
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
    icon: 'instagram', // fallback glyph
    iconUrl: 'assets/brand/reels-icon.png',
    type: 'link',
    dock: true,
    href: '#games',
    title: 'Game Reel',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    short: 'WhatsApp',
    icon: 'whatsapp',
    type: 'whatsapp',
    title: 'WhatsApp',
    chats: [
      { id: 'nixin', name: 'Nixin', open: true },
      { id: 'playtest', name: 'Playtesters', locked: true },
      { id: 'alex', name: 'Alex', locked: true },
      { id: 'sam', name: 'Sam', locked: true },
      { id: 'riya', name: 'Riya', locked: true },
    ],
  },
  {
    id: 'careers',
    rk: 1, // desktop: right column, 2nd from bottom
    label: 'Careers.txt',
    short: 'Careers',
    icon: 'txt',
    type: 'notepad',
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
    locked: true,
    label: 'RnD Secrets',
    short: 'RnD',
    icon: 'folder',
    type: 'explorer',
    title: 'RnD Secrets',
    files: [
      { name: 'Logo Pack.zip', icon: 'zip' },
      { name: 'Studio Fact Sheet.pdf', icon: 'pdf' },
      { name: 'Screenshots', icon: 'folder' },
      { name: 'Trailer.mp4', icon: 'video' },
    ],
  },
  {
    id: 'bin',
    rk: 0, // desktop: right column, bottom
    label: 'Recycle Bin',
    short: 'Bin',
    icon: 'bin',
    type: 'explorer',
    title: 'Recycle Bin',
    files: [],
    empty: 'Nothing here. We ship everything.',
  },
  {
    id: 'photos',
    label: 'Image Viewer',
    short: 'Photos',
    icon: 'image',
    type: 'image',
    title: 'Image Viewer',
  },
  {
    id: 'terminal',
    rk: 3, // desktop: right column, above Mobile View
    label: 'Terminal',
    short: 'Terminal',
    icon: 'terminal',
    type: 'terminal',
    title: 'Terminal',
  },
  {
    id: 'mobileview',
    label: 'Mobile View',
    short: 'Mobile',
    icon: 'phone',
    type: 'mobileview', // desktop only: previews the phone layout
    rk: 2,
    title: 'Mobile View',
  },
];

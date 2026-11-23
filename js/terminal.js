// In-window Linux shell. Read commands run against a fake home directory.
// Write commands are recognized and refused (the fan account has no sudo).
// `open` returns launch actions; the desktop turns those into real windows.
import { apps, studio } from './data.js';
import { assetUrl } from './catalog.js';

const HOME = ['home', 'fan'];
const USER = 'fan';
const HOST = 'nixin';
const GROUP = 'nixin';

const WRITE = new Set([
  'rm', 'cp', 'mv', 'mkdir', 'rmdir', 'touch', 'chmod', 'chown', 'chgrp', 'ln',
  'sudo', 'su', 'doas', 'pkexec', 'apt', 'apt-get', 'dpkg', 'snap', 'yum', 'dnf',
  'pacman', 'brew', 'systemctl', 'service', 'kill', 'killall', 'reboot', 'shutdown',
  'poweroff', 'halt', 'mount', 'umount', 'dd', 'mkfs', 'useradd', 'userdel',
  'adduser', 'deluser', 'groupadd', 'groupdel', 'usermod', 'passwd', 'nano', 'vim',
  'vi', 'emacs', 'tee', 'install', 'wget', 'curl', 'unlink', 'truncate', 'rsync',
  'scp', 'sftp', 'ftp', 'ssh', 'crontab', 'iptables', 'ufw',
]);

const READ = [
  'pwd', 'ls', 'll', 'cd', 'tree', 'find', 'stat', 'file', 'du', 'df',
  'cat', 'head', 'tail', 'wc', 'less', 'more', 'grep', 'echo', 'printf',
  'whoami', 'id', 'hostname', 'uname', 'date', 'uptime', 'env', 'which',
  'type', 'history', 'clear', 'help', 'man', 'open',
];

export function createShell() {
  let root = null;
  let cwd = HOME.slice();
  let prev = null;
  let games = [];
  const hist = [];
  let histI = 0;
  let draft = '';
  const boot = Date.now();

  function rebuild() {
    const saved = cwd.join('/');
    root = makeDir({
      home: makeDir({ fan: homeDir() }),
    });
    const again = resolve('/' + saved);
    cwd = again.node && again.node.kind === 'dir' ? again.path : HOME.slice();
  }

  function homeDir() {
    const about = apps.find((a) => a.id === 'about');
    const careers = apps.find((a) => a.id === 'careers');
    const bin = apps.find((a) => a.id === 'bin');
    const kids = {};

    kids['README.txt'] = makeFile(
`Nixin Studio
Type \`help\` for commands.
\`open <file>\` launches an app, a game page, or a profile.

Try:
  ls
  cd games
  open alchemy
  open team/manjeet-sudhanshu`);

    kids['About Us'] = makeFile(companyText(about), { type: 'app', id: 'about' }, namesOf(about));
    const gameList = games.length
      ? games.map((g) => `${g.name || g.slug}${g.tagline ? ' — ' + g.tagline : ''}`).join('\n')
      : 'No games yet.';
    kids['Our Games'] = makeFile(gameList, { type: 'app', id: 'games' }, namesOf(apps.find((a) => a.id === 'games')));
    kids['Game Reel'] = makeFile('Game Reel\n\nOpen this file to watch the reel.', { type: 'app', id: 'reels' }, namesOf(apps.find((a) => a.id === 'reels')));
    kids['WhatsApp'] = makeFile('WhatsApp\n\nOpen this file to chat with Nixin.', { type: 'app', id: 'whatsapp' }, namesOf(apps.find((a) => a.id === 'whatsapp')));
    kids['Careers.txt'] = makeFile((careers?.body || '').trim(), { type: 'app', id: 'careers' }, namesOf(careers));
    kids['Contact'] = makeFile(`To: ${studio.email}\n\nOpen this file to write a message.`, { type: 'app', id: 'contact' }, namesOf(apps.find((a) => a.id === 'contact')));
    kids['RnD Secrets'] = makeFile('', { type: 'locked', id: 'press' }, namesOf(apps.find((a) => a.id === 'press')), { locked: true });
    kids['Recycle Bin'] = makeFile(bin?.empty || 'Empty.', { type: 'app', id: 'bin' }, namesOf(bin));
    kids.games = makeDir(gameFolders(), { type: 'app', id: 'games' }, ['games', 'our games']);
    kids.team = makeDir(teamFolders());
    return makeDir(kids);
  }

  function gameFolders() {
    const kids = {};
    for (const g of games) {
      const slug = g.slug || g.id;
      const launch = { type: 'game', id: g.id };
      const aliases = [g.slug, g.name, g.id].filter(Boolean).map((s) => String(s).toLowerCase());
      const files = {
        'about.txt': makeFile(gameText(g), launch, aliases),
      };
      const used = new Set(['about.txt']);
      for (const shot of g.gallery || []) {
        let name = String(shot.src || '').split('/').pop() || 'shot.jpg';
        if (used.has(name)) {
          const dot = name.lastIndexOf('.');
          const stem = dot > 0 ? name.slice(0, dot) : name;
          const ext = dot > 0 ? name.slice(dot) : '';
          let n = 2;
          while (used.has(`${stem}-${n}${ext}`)) n += 1;
          name = `${stem}-${n}${ext}`;
        }
        used.add(name);
        files[name] = makeFile('', {
          type: 'image',
          src: assetUrl(shot.src),
          title: shot.title || name,
        }, [name], { binary: true, mime: mimeFor(name), size: 48000 });
      }
      kids[slug] = makeDir(files, launch, aliases);
    }
    return kids;
  }

  function teamFolders() {
    const about = apps.find((a) => a.id === 'about');
    const kids = {};
    for (const m of about?.members || []) {
      const aliases = [m.id, m.name, m.name.split(/\s+/)[0]].filter(Boolean).map((s) => s.toLowerCase());
      const files = {
        profile: makeFile(memberText(m), { type: 'member', id: m.id }, aliases),
      };
      if (m.linkedin) {
        files['linkedin.url'] = makeFile(m.linkedin + '\n', { type: 'url', url: m.linkedin });
      }
      kids[m.id] = makeDir(files, { type: 'member', id: m.id }, aliases);
    }
    return kids;
  }

  function setGames(list) {
    games = list || [];
    rebuild();
  }
  rebuild();

  function nodeAt(parts) {
    let node = root;
    for (const p of parts) {
      if (!node || node.kind !== 'dir' || !node.children[p]) return null;
      node = node.children[p];
    }
    return node;
  }

  function resolve(input, from = cwd) {
    if (input == null || input === '' || input === '.') return { node: nodeAt(from), path: from.slice() };
    let raw = input;
    let parts;
    if (raw === '~' || raw.startsWith('~/')) parts = HOME.concat(raw.slice(2).split('/'));
    else if (raw.startsWith('/')) parts = raw.split('/');
    else parts = from.concat(raw.split('/'));
    const norm = [];
    for (const p of parts) {
      if (!p || p === '.') continue;
      if (p === '..') norm.pop();
      else norm.push(p);
    }
    let node = root;
    const walked = [];
    for (const p of norm) {
      if (!node || node.kind !== 'dir' || !node.children[p]) return { node: null, path: norm, missing: p };
      node = node.children[p];
      walked.push(p);
    }
    return { node, path: walked };
  }

  function absPath(parts = cwd) {
    return '/' + parts.join('/') || '/';
  }

  function pretty(parts) {
    const p = parts.join('/');
    const home = HOME.join('/');
    if (p === home) return '~';
    if (p.startsWith(home + '/')) return '~/' + p.slice(home.length + 1);
    return '/' + p;
  }

  function prompt() {
    return `${USER}@${HOST}:${pretty(cwd)}$ `;
  }

  function byteLen(s) {
    return new TextEncoder().encode(s || '').length;
  }

  function nodeSize(node) {
    if (!node) return 0;
    if (node.kind === 'file') return node.binary ? (node.size || 0) : byteLen(node.text);
    let n = 0;
    for (const child of Object.values(node.children)) n += nodeSize(child);
    return n;
  }

  function ok(text = '', extra = {}) {
    return { ok: true, text, ...extra };
  }
  function fail(text, extra = {}) {
    return { ok: false, text, err: true, ...extra };
  }

  function deny(cmd, args) {
    const target = args.find((a) => a && !String(a).startsWith('-')) ?? '';
    const no = "you don't have sudo permission";
    if (cmd === 'sudo' || cmd === 'su' || cmd === 'doas' || cmd === 'pkexec') return `${cmd}: ${no}`;
    if (cmd === 'rm' || cmd === 'unlink') return `rm: cannot remove '${target}': ${no}`;
    if (cmd === 'cp') return `cp: cannot copy '${target}': ${no}`;
    if (cmd === 'mv') return `mv: cannot move '${target}': ${no}`;
    if (cmd === 'mkdir') return `mkdir: cannot create directory '${target}': ${no}`;
    if (cmd === 'rmdir') return `rmdir: cannot remove directory '${target}': ${no}`;
    if (cmd === 'touch') return `touch: cannot touch '${target}': ${no}`;
    if (cmd === 'chmod' || cmd === 'chown' || cmd === 'chgrp') return `${cmd}: changing permissions of '${target}': ${no}`;
    if (cmd === 'ln') return `ln: cannot create link '${target}': ${no}`;
    if (cmd === 'nano' || cmd === 'vim' || cmd === 'vi' || cmd === 'emacs') return `${cmd}: cannot edit '${target}': ${no}`;
    if (cmd === 'reboot' || cmd === 'shutdown' || cmd === 'poweroff' || cmd === 'halt') return `${cmd}: ${no}`;
    return `${cmd}: ${no}`;
  }

  function readText(spec, cmd) {
    const r = resolve(spec);
    if (!r.node) return { error: `${cmd}: ${spec}: No such file or directory` };
    if (r.node.kind === 'dir') return { error: `${cmd}: ${spec}: Is a directory` };
    if (r.node.locked) return { error: `${cmd}: ${spec}: Permission denied` };
    if (r.node.binary) return { error: `${cmd}: ${spec}: binary file` };
    return { text: r.node.text || '' };
  }

  function eachFile(args, cmd, ctx, stdin, onText) {
    if (!args.length) {
      if (ctx.piped) return ok(onText(stdin ?? ''));
      return fail(`${cmd}: missing file operand`);
    }
    const chunks = [];
    let bad = false;
    for (const a of args) {
      const r = readText(a, cmd);
      if (r.error) { chunks.push(r.error); bad = true; continue; }
      chunks.push(onText(r.text, a));
    }
    const text = chunks.filter((c) => c != null && c !== '').join('\n');
    return bad ? fail(text) : ok(text);
  }

  function parseN(args, def) {
    let n = def;
    const rest = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-n' && args[i + 1] != null) { n = parseInt(args[++i], 10); continue; }
      if (/^-\d+$/.test(a)) { n = parseInt(a.slice(1), 10); continue; }
      if (/^-n\d+$/.test(a)) { n = parseInt(a.slice(2), 10); continue; }
      rest.push(a);
    }
    if (!Number.isFinite(n) || n < 0) n = def;
    return { n, rest };
  }

  function linesOf(text) {
    if (text == null || text === '') return [];
    const parts = String(text).split('\n');
    if (parts.length && parts[parts.length - 1] === '') parts.pop();
    return parts;
  }

  function fmtBlocks(bytes, human) {
    if (!human) return String(Math.ceil(bytes / 1024));
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${trimNum(bytes / 1024)}K`;
    return `${trimNum(bytes / (1024 * 1024))}M`;
  }
  function trimNum(n) {
    return String(Math.round(n * 10) / 10).replace(/\.0$/, '');
  }

  function stamp() {
    return 'Nov 23 10:00';
  }

  function longLine(name, node) {
    const dir = node.kind === 'dir';
    const mode = dir ? 'drwxr-xr-x' : (node.locked ? '-r--------' : '-rw-r--r--');
    const links = dir ? 2 + Object.keys(node.children).length : 1;
    const size = String(nodeSize(node)).padStart(6);
    return `${mode} ${String(links).padStart(2)} ${USER} ${GROUP} ${size} ${stamp()} ${name}`;
  }

  const commands = {
    pwd() { return ok(absPath()); },
    ls(args) {
      let all = false;
      let long = false;
      const paths = [];
      for (const a of args) {
        if (a === '--all') { all = true; continue; }
        if (a.startsWith('--')) continue;
        if (a.startsWith('-') && a !== '-') {
          if (a.includes('a')) all = true;
          if (a.includes('l')) long = true;
          continue;
        }
        paths.push(a);
      }
      if (!paths.length) paths.push('.');
      const blocks = [];
      let bad = false;
      for (const spec of paths) {
        const r = resolve(spec);
        if (!r.node) { blocks.push(`ls: cannot access '${spec}': No such file or directory`); bad = true; continue; }
        const entries = r.node.kind === 'dir'
          ? dirEntries(r.node, r.path, all)
          : [{ name: spec, node: r.node }];
        if (paths.length > 1 && r.node.kind === 'dir') blocks.push(`${spec}:`);
        if (long && r.node.kind === 'dir') {
          const total = entries.reduce((s, e) => s + Math.max(1, Math.ceil(nodeSize(e.node) / 1024)), 0);
          blocks.push(`total ${total}`);
        }
        for (const e of entries) blocks.push(long ? longLine(e.name, e.node) : e.name);
      }
      return bad ? fail(blocks.join('\n')) : ok(blocks.join('\n'));
    },
    cd(args) {
      const dest = args[0];
      if (!dest || dest === '~') { prev = cwd.slice(); cwd = HOME.slice(); return ok(); }
      if (dest === '-') {
        if (!prev) return fail('cd: OLDPWD not set');
        const back = cwd.slice();
        cwd = prev;
        prev = back;
        return ok(absPath());
      }
      const r = resolve(dest);
      if (!r.node) return fail(`cd: ${dest}: No such file or directory`);
      if (r.node.kind !== 'dir') return fail(`cd: ${dest}: Not a directory`);
      prev = cwd.slice();
      cwd = r.path;
      return ok();
    },
    tree(args) {
      const spec = args.find((a) => !a.startsWith('-')) || '.';
      const r = resolve(spec);
      if (!r.node) return fail(`tree: ${spec}: No such file or directory`);
      const lines = [];
      let dirs = 0;
      let files = 0;
      const walk = (node, name, prefix, last, rootName) => {
        const branch = rootName ? '' : (last ? '└── ' : '├── ');
        lines.push(prefix + branch + name);
        if (node.kind !== 'dir') { files += 1; return; }
        if (!rootName) dirs += 1;
        const kids = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
        const pad = rootName ? '' : prefix + (last ? '    ' : '│   ');
        kids.forEach((k, i) => walk(node.children[k], k, pad, i === kids.length - 1, false));
      };
      walk(r.node, r.node.kind === 'dir' ? (spec === '.' ? '.' : spec) : spec, '', true, true);
      if (r.node.kind === 'dir') lines.push(`\n${dirs} directories, ${files} files`);
      return ok(lines.join('\n'));
    },
    find(args) {
      let spec = '.';
      let pat = null;
      const pos = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-name' && args[i + 1] != null) { pat = args[++i]; continue; }
        if (args[i].startsWith('-')) continue;
        pos.push(args[i]);
      }
      if (pos[0]) spec = pos[0];
      const r = resolve(spec);
      if (!r.node) return fail(`find: '${spec}': No such file or directory`);
      const re = pat ? globToReg(pat) : null;
      const out = [];
      const walk = (node, label) => {
        const base = label === '.' ? '.' : label.split('/').pop();
        if (!re || re.test(base)) out.push(label);
        if (node.kind !== 'dir') return;
        for (const name of Object.keys(node.children).sort((a, b) => a.localeCompare(b))) {
          const next = label === '.' ? `./${name}` : `${label.replace(/\/$/, '')}/${name}`;
          walk(node.children[name], next);
        }
      };
      walk(r.node, spec === '.' ? '.' : spec);
      return ok(out.join('\n'));
    },
    stat(args) {
      if (!args[0]) return fail('stat: missing operand');
      const lines = [];
      let bad = false;
      for (const spec of args) {
        const r = resolve(spec);
        if (!r.node) { lines.push(`stat: cannot stat '${spec}': No such file or directory`); bad = true; continue; }
        const dir = r.node.kind === 'dir';
        const size = nodeSize(r.node);
        const mode = dir ? '0755/drwxr-xr-x' : (r.node.locked ? '0400/-r--------' : '0644/-rw-r--r--');
        lines.push(
          `  File: ${spec}`,
          `  Size: ${size}\tBlocks: ${Math.max(1, Math.ceil(size / 512))}\tIO Block: 4096\t${dir ? 'directory' : 'regular file'}`,
          `Access: (${mode})\tUid: ( 1000/    ${USER})\tGid: ( 1000/   ${GROUP})`,
        );
      }
      return bad ? fail(lines.join('\n')) : ok(lines.join('\n'));
    },
    file(args) {
      if (!args.length) return fail('file: missing operand');
      const lines = [];
      let bad = false;
      for (const spec of args) {
        const r = resolve(spec);
        if (!r.node) { lines.push(`file: ${spec}: No such file or directory`); bad = true; continue; }
        if (r.node.kind === 'dir') lines.push(`${spec}: directory`);
        else if (r.node.binary) lines.push(`${spec}: ${r.node.mime || 'binary data'}`);
        else if (!r.node.text) lines.push(`${spec}: empty`);
        else lines.push(`${spec}: ASCII text`);
      }
      return bad ? fail(lines.join('\n')) : ok(lines.join('\n'));
    },
    du(args) {
      let human = false;
      let summary = false;
      const paths = [];
      for (const a of args) {
        if (a.startsWith('-') && a !== '-') {
          if (a.includes('h')) human = true;
          if (a.includes('s')) summary = true;
          continue;
        }
        paths.push(a);
      }
      if (!paths.length) paths.push('.');
      const lines = [];
      let bad = false;
      const walk = (node, label) => {
        if (node.kind === 'dir' && !summary) {
          for (const name of Object.keys(node.children).sort((a, b) => a.localeCompare(b))) {
            if (node.children[name].kind === 'dir') walk(node.children[name], `${label.replace(/\/$/, '')}/${name}`.replace(/^\.\//, './'));
          }
        }
        lines.push(`${fmtBlocks(nodeSize(node), human)}\t${label}`);
      };
      for (const spec of paths) {
        const r = resolve(spec);
        if (!r.node) { lines.push(`du: cannot access '${spec}': No such file or directory`); bad = true; continue; }
        walk(r.node, spec);
      }
      return bad ? fail(lines.join('\n')) : ok(lines.join('\n'));
    },
    df(args) {
      const human = args.some((a) => a === '-h' || a === '--human-readable' || (a.startsWith('-') && a.includes('h')));
      if (human) {
        return ok('Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G  3.0G   17G  15% /');
      }
      return ok('Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1       20971520 3145728  17825792  15% /');
    },
    cat(args, stdin, ctx) { return eachFile(args, 'cat', ctx, stdin, (t) => t); },
    head(args, stdin, ctx) {
      const { n, rest } = parseN(args, 10);
      const take = (t) => linesOf(t).slice(0, n).join('\n');
      return eachFile(rest, 'head', ctx, stdin, take);
    },
    tail(args, stdin, ctx) {
      const { n, rest } = parseN(args, 10);
      const take = (t) => linesOf(t).slice(-n).join('\n');
      return eachFile(rest, 'tail', ctx, stdin, take);
    },
    less(args, stdin, ctx) { return eachFile(args, 'less', ctx, stdin, (t) => t); },
    more(args, stdin, ctx) { return eachFile(args, 'more', ctx, stdin, (t) => t); },
    wc(args, stdin, ctx) {
      let l = false; let w = false; let c = false;
      const files = [];
      for (const a of args) {
        if (a.startsWith('-') && a !== '-') {
          if (a.includes('l')) l = true;
          if (a.includes('w')) w = true;
          if (a.includes('c') || a.includes('m')) c = true;
          continue;
        }
        files.push(a);
      }
      if (!l && !w && !c) { l = true; w = true; c = true; }
      const fmt = (text, name) => {
        const counts = countText(text);
        const cols = [];
        if (l) cols.push(String(counts.lines).padStart(7));
        if (w) cols.push(String(counts.words).padStart(7));
        if (c) cols.push(String(counts.bytes).padStart(7));
        return `${cols.join(' ')}${name ? ' ' + name : ''}`;
      };
      if (!files.length) {
        if (!ctx.piped) return fail('wc: missing file operand');
        return ok(fmt(stdin ?? ''));
      }
      return eachFile(files, 'wc', ctx, stdin, (t, name) => fmt(t, name));
    },
    grep(args, stdin, ctx) {
      let insensitive = false; let numbers = false; let invert = false;
      const rest = [];
      for (const a of args) {
        if (a.startsWith('-') && a !== '-' && !rest.length) {
          if (a.includes('i')) insensitive = true;
          if (a.includes('n')) numbers = true;
          if (a.includes('v')) invert = true;
          continue;
        }
        rest.push(a);
      }
      if (!rest.length) return fail('grep: missing pattern');
      const pattern = rest[0];
      const files = rest.slice(1);
      let re = null;
      try { re = new RegExp(pattern, insensitive ? 'i' : ''); } catch { re = null; }
      const hit = (line) => {
        const yes = re ? re.test(line) : (insensitive ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern));
        return invert ? !yes : yes;
      };
      const filter = (text, name, showName) => linesOf(text).flatMap((line, i) => {
        if (!hit(line)) return [];
        const prefix = `${showName ? name + ':' : ''}${numbers ? (i + 1) + ':' : ''}`;
        return [prefix + line];
      }).join('\n');
      if (!files.length) {
        if (!ctx.piped) return fail('grep: missing file operand');
        const text = filter(stdin ?? '', '', false);
        return text ? ok(text) : { ok: false, text: '' };
      }
      const chunks = [];
      let bad = false;
      let any = false;
      for (const a of files) {
        const r = readText(a, 'grep');
        if (r.error) { chunks.push(r.error); bad = true; continue; }
        const text = filter(r.text, a, files.length > 1);
        if (text) { chunks.push(text); any = true; }
      }
      if (bad) return fail(chunks.join('\n'));
      if (!any) return { ok: false, text: '' };
      return ok(chunks.join('\n'));
    },
    echo(args) {
      let noline = false;
      let i = 0;
      if (args[0] === '-n') { noline = true; i = 1; }
      const text = args.slice(i).join(' ');
      return ok(noline ? text : text + '\n');
    },
    printf(args) {
      if (!args.length) return fail('printf: missing operand');
      const fmt = args[0];
      const vals = args.slice(1);
      let vi = 0;
      let out = '';
      for (let i = 0; i < fmt.length; i++) {
        if (fmt[i] === '\\' && fmt[i + 1] === 'n') { out += '\n'; i += 1; continue; }
        if (fmt[i] === '%' && fmt[i + 1]) {
          const spec = fmt[++i];
          if (spec === '%') { out += '%'; continue; }
          const v = vals[vi++] ?? '';
          if (spec === 'd' || spec === 'i') out += String(parseInt(v, 10) || 0);
          else out += String(v);
          continue;
        }
        out += fmt[i];
      }
      return ok(out);
    },
    whoami() { return ok(USER); },
    id() { return ok(`uid=1000(${USER}) gid=1000(${GROUP}) groups=1000(${GROUP})`); },
    hostname() { return ok(HOST); },
    uname(args) {
      const all = args.includes('-a') || args.includes('--all');
      if (all) return ok(`Linux ${HOST} 6.8.0-nixin #1 SMP PREEMPT_DYNAMIC Mon Nov 23 10:00:00 UTC 2026 x86_64 GNU/Linux`);
      if (args.includes('-r')) return ok('6.8.0-nixin');
      if (args.includes('-n')) return ok(HOST);
      if (args.includes('-m')) return ok('x86_64');
      return ok('Linux');
    },
    date() {
      const d = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const p = (n) => String(n).padStart(2, '0');
      let zone = 'UTC';
      try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { /* keep UTC */ }
      return ok(`${days[d.getDay()]} ${months[d.getMonth()]} ${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${zone} ${d.getFullYear()}`);
    },
    uptime() {
      const sec = Math.max(0, Math.floor((Date.now() - boot) / 1000));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return ok(` ${time} up ${h}h ${m}m, 1 user, load average: 0.08, 0.05, 0.01`);
    },
    env() {
      const vars = {
        USER, LOGNAME: USER, HOME: '/home/fan', HOSTNAME: HOST,
        SHELL: '/bin/bash', PWD: absPath(), TERM: 'xterm-256color',
      };
      return ok(Object.entries(vars).map(([k, v]) => `${k}=${v}`).join('\n'));
    },
    which(args) {
      if (!args.length) return fail('which: missing argument');
      const lines = [];
      let bad = false;
      for (const a of args) {
        if (commands[a] || WRITE.has(a)) lines.push(`/bin/${a}`);
        else if (a === 'll') lines.push('/bin/ls');
        else { lines.push(`which: no ${a} in (/bin:/usr/bin)`); bad = true; }
      }
      return bad ? fail(lines.join('\n')) : ok(lines.join('\n'));
    },
    type(args) {
      if (!args.length) return fail('type: missing argument');
      const lines = [];
      let bad = false;
      for (const a of args) {
        if (a === 'll') lines.push('ll is aliased to `ls -l`');
        else if (commands[a] || WRITE.has(a)) lines.push(`${a} is /bin/${a}`);
        else { lines.push(`bash: type: ${a}: not found`); bad = true; }
      }
      return bad ? fail(lines.join('\n')) : ok(lines.join('\n'));
    },
    history() {
      return ok(hist.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n'));
    },
    clear() { return ok('', { clear: true }); },
    help() {
      return ok(
`Nixin Studio terminal — read-only shell for fan@nixin

${READ.filter((c) => c !== 'll').join('  ')}
ll is ls -l

open <file>          launch an app, game page, profile, or picture
open home.jpg        a screenshot, full screen in Image Viewer
open alchemy         a game, when the name is unique
open "About Us"      a home-screen app
open team/<person>   a profile    linkedin.url opens LinkedIn

Write commands (rm, cp, mv, mkdir, chmod, sudo, …) run into:
  you don't have sudo permission

help   this list      man <command>   short manual`);
    },
    man(args) {
      const name = args[0];
      if (!name) return fail('What manual page do you want?\nTry `man ls` or `help`.');
      if (MAN[name]) return ok(`${name} — ${MAN[name]}`);
      if (WRITE.has(name)) return ok(`${name} — refused. you don't have sudo permission.`);
      return fail(`No manual entry for ${name}`);
    },
    open(args) { return openCmd(args); },
  };

  function dirEntries(node, path, all) {
    const names = Object.keys(node.children).filter((n) => all || !n.startsWith('.')).sort((a, b) => a.localeCompare(b));
    const entries = names.map((name) => ({ name, node: node.children[name] }));
    if (!all) return entries;
    const parent = nodeAt(path.slice(0, -1)) || root;
    return [{ name: '.', node }, { name: '..', node: parent }, ...entries];
  }

  function openCmd(args) {
    if (!args.length) return fail('open: missing file operand');
    const query = args.length === 1 ? args[0] : args.join(' ');
    const direct = resolve(query);
    if (query.includes('/') || direct.node) {
      if (!direct.node) return fail(`open: ${query}: No such file or directory`);
      return launchNode(direct.node, query);
    }
    const hits = [];
    const q = query.toLowerCase();
    walk(root, [], (node, parts) => {
      if (!parts.length || (!node.launch && !node.locked)) return;
      const base = parts[parts.length - 1].toLowerCase();
      const aliases = node.launch?.names || [];
      if (base === q || aliases.includes(q)) hits.push({ node, parts });
    });
    if (!hits.length) return fail(`open: ${query}: No such file or directory`);
    const keys = new Set(hits.map((h) => launchKey(h.node)));
    if (keys.size === 1) return launchNode(hits[0].node, query);
    return fail(`open: ${query}: matches more than one file\n${hits.map((h) => pretty(h.parts)).join('\n')}`);
  }

  function launchNode(node, label) {
    if (node.locked || node.launch?.type === 'locked') {
      const id = node.launch?.id;
      return fail(`open: ${label}: Permission denied`, { actions: id ? [{ type: 'locked', id }] : [] });
    }
    if (!node.launch) return fail(`open: ${label}: no application associated with this file`);
    const action = { ...node.launch };
    delete action.names;
    return ok(`Opening ${label}`, { actions: [action] });
  }

  function walk(node, parts, visit) {
    visit(node, parts);
    if (!node || node.kind !== 'dir') return;
    for (const name of Object.keys(node.children)) walk(node.children[name], parts.concat(name), visit);
  }

  function runStage(tokens, stdin, ctx) {
    if (!tokens.length) return ok(stdin || '');
    let items = tokens;
    if (items[0].value === 'll') {
      items = [{ value: 'ls', quoted: false }, { value: '-l', quoted: true }, ...items.slice(1)];
    }
    const cmd = items[0].value;
    const expanded = [];
    for (const tok of items.slice(1)) {
      if (tok.quoted || !/[*?]/.test(tok.value)) expanded.push(tok.value);
      else expanded.push(...globExpand(tok.value));
    }
    if (WRITE.has(cmd)) return fail(deny(cmd, expanded));
    const fn = commands[cmd];
    if (!fn) return fail(`bash: ${cmd}: command not found`);
    return fn(expanded, stdin, ctx);
  }

  function globExpand(token) {
    const slash = token.lastIndexOf('/');
    const dirPart = slash >= 0 ? (token.slice(0, slash) || '/') : '.';
    const pattern = slash >= 0 ? token.slice(slash + 1) : token;
    const r = resolve(dirPart);
    if (!r.node || r.node.kind !== 'dir') return [token];
    const re = globToReg(pattern);
    const names = Object.keys(r.node.children).filter((n) => !n.startsWith('.') && re.test(n)).sort((a, b) => a.localeCompare(b));
    if (!names.length) return [token];
    const prefix = slash >= 0 ? token.slice(0, slash + 1) : '';
    return names.map((n) => prefix + n);
  }

  function runPipeline(segment) {
    if (hasRedirect(segment)) {
      return fail(`bash: cannot create '${redirectTarget(segment)}': you don't have sudo permission`);
    }
    const stages = splitBy(segment, '|').map((s) => s.trim()).filter(Boolean);
    if (!stages.length) return ok();
    let stdin = '';
    const actions = [];
    let clear = false;
    for (let i = 0; i < stages.length; i++) {
      const res = runStage(tokenize(stages[i]), stdin, { piped: i > 0 });
      if (res.actions) actions.push(...res.actions);
      if (res.clear) clear = true;
      if (!res.ok) return { ...res, actions, clear };
      stdin = res.text || '';
    }
    return { ok: true, text: stdin, actions, clear };
  }

  function exec(raw) {
    const line = String(raw ?? '');
    const trimmed = line.trim();
    if (trimmed) hist.push(trimmed);
    histI = hist.length;
    draft = '';
    if (!trimmed) return { blocks: [], actions: [], clear: false };
    const chain = splitChain(trimmed);
    let blocks = [];
    const actions = [];
    let clear = false;
    for (const seg of chain) {
      const res = runPipeline(seg.text);
      if (res.actions) actions.push(...res.actions);
      if (res.clear) { blocks = []; clear = true; }
      else if (res.text) blocks.push({ text: res.text, err: !!res.err });
      if (!res.ok && seg.next === '&&') break;
    }
    return { blocks, actions, clear };
  }

  function complete(line) {
    const completingCmd = !/\s/.test(line);
    if (completingCmd) {
      const names = [...READ, ...WRITE].filter((n) => n.startsWith(line)).sort();
      return finishComplete('', line, names, true);
    }
    const lead = line.match(/^(.*\s)(\S*)$/);
    const prefix = lead ? lead[1] : line;
    const partial = lead ? lead[2] : '';
    return finishComplete(prefix, partial, completePath(partial), false);
  }

  function completePath(partial) {
    const slash = partial.lastIndexOf('/');
    const dirPart = slash >= 0 ? (partial.slice(0, slash) || '/') : '.';
    const base = slash >= 0 ? partial.slice(slash + 1) : partial;
    const r = resolve(dirPart);
    if (!r.node || r.node.kind !== 'dir') return [];
    const pre = slash >= 0 ? partial.slice(0, slash + 1) : '';
    return Object.keys(r.node.children)
      .filter((n) => n.startsWith(base))
      .sort((a, b) => a.localeCompare(b))
      .map((n) => pre + n + (r.node.children[n].kind === 'dir' ? '/' : ''));
  }

  function older(current) {
    if (!hist.length) return current;
    if (histI === hist.length) draft = current;
    if (histI <= 0) { histI = 0; return hist[0]; }
    histI -= 1;
    return hist[histI];
  }
  function newer(current) {
    if (histI >= hist.length) return current;
    histI += 1;
    if (histI >= hist.length) return draft;
    return hist[histI];
  }
  function cancelHistory() {
    histI = hist.length;
    draft = '';
  }

  return { setGames, exec, complete, older, newer, cancelHistory, prompt };
}

function finishComplete(lead, partial, matches, isCmd) {
  if (!matches.length) return { line: lead + partial, matches };
  if (matches.length === 1) {
    let ins = matches[0];
    const dir = !isCmd && ins.endsWith('/');
    if (/\s/.test(ins)) ins = `'${ins.replace(/\/$/, '')}'` + (dir ? '/' : ' ');
    else if (isCmd || !dir) ins += ' ';
    return { line: lead + ins, matches };
  }
  return { line: lead + commonPrefix(matches), matches };
}

function commonPrefix(list) {
  let pre = list[0];
  for (const item of list) {
    let i = 0;
    while (i < pre.length && i < item.length && pre[i] === item[i]) i += 1;
    pre = pre.slice(0, i);
  }
  return pre;
}

function makeDir(children, launch, names) {
  return { kind: 'dir', children, launch: withNames(launch, names) || null, locked: false };
}
function makeFile(text, launch, names, opt = {}) {
  return {
    kind: 'file',
    text: text ?? '',
    launch: withNames(launch, names) || null,
    locked: !!opt.locked,
    binary: !!opt.binary,
    mime: opt.mime || '',
    size: opt.size || 0,
  };
}
function withNames(launch, names) {
  if (!launch) return null;
  const extra = (names || []).map((s) => String(s).toLowerCase()).filter(Boolean);
  return extra.length ? { ...launch, names: [...new Set([...(launch.names || []), ...extra])] } : launch;
}
function namesOf(app) {
  if (!app) return [];
  return [app.label, app.short, app.id].filter(Boolean);
}

function companyText(app) {
  if (!app) return 'Nixin Studio';
  const c = app.company || {};
  const lines = [app.title || 'Nixin Studio'];
  if (c.tagline) lines.push(c.tagline);
  if (c.about) lines.push('', c.about.trim());
  const facts = [['Industry', c.industry], ['Location', c.location], ['Company size', c.size], ['Founded', c.founded], ['Website', c.website]];
  const shown = facts.filter(([, v]) => v);
  if (shown.length) {
    lines.push('');
    for (const [k, v] of shown) lines.push(`${k}: ${v}`);
  }
  if (c.specialties?.length) lines.push('', 'Specialties: ' + c.specialties.join(', '));
  return lines.join('\n');
}

function gameText(g) {
  const lines = [g.name || g.id];
  if (g.tagline) lines.push(g.tagline);
  if (g.genre) lines.push('', g.genre);
  if (g.description) lines.push('', String(g.description).trim());
  return lines.join('\n');
}

function memberText(m) {
  const lines = [m.name];
  if (m.headline) lines.push(m.headline);
  if (m.location) lines.push(m.location);
  if (m.about) lines.push('', m.about.trim());
  if (m.experience?.length) {
    lines.push('', 'Experience');
    for (const e of m.experience) {
      lines.push(`  ${[e.role, e.org, e.when].filter(Boolean).join(' · ')}`);
      if (e.note) lines.push(`    ${e.note}`);
    }
  }
  if (m.education?.length) {
    lines.push('', 'Education');
    for (const e of m.education) lines.push(`  ${e.school}`);
  }
  if (m.certifications?.length) {
    lines.push('', 'Licenses & certifications');
    for (const e of m.certifications) lines.push(`  ${[e.name, e.by, e.when].filter(Boolean).join(' · ')}`);
  }
  if (m.skills?.length) lines.push('', 'Skills: ' + m.skills.join(', '));
  if (m.linkedin) lines.push('', m.linkedin);
  return lines.join('\n');
}

function mimeFor(name) {
  const ext = String(name).split('.').pop().toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'JPEG image data';
  if (ext === 'png') return 'PNG image data';
  if (ext === 'gif') return 'GIF image data';
  if (ext === 'webp') return 'WebP image data';
  if (ext === 'mp4' || ext === 'webm') return 'video data';
  if (ext === 'pdf') return 'PDF document';
  if (ext === 'zip') return 'Zip archive data';
  return 'binary data';
}

function countText(text) {
  const s = text || '';
  return {
    lines: (s.match(/\n/g) || []).length,
    words: s.trim() ? s.trim().split(/\s+/).length : 0,
    bytes: new TextEncoder().encode(s).length,
  };
}

function globToReg(pat) {
  let s = '^';
  for (const c of pat) {
    if (c === '*') s += '.*';
    else if (c === '?') s += '.';
    else s += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(s + '$');
}

function tokenize(s) {
  const tokens = [];
  let buf = '';
  let q = '';
  let quoted = false;
  const push = () => { tokens.push({ value: buf, quoted }); buf = ''; quoted = false; };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q) q = '';
      else buf += c;
      continue;
    }
    if (c === '"' || c === "'") { q = c; quoted = true; continue; }
    if (/\s/.test(c)) { if (buf || quoted) push(); continue; }
    buf += c;
  }
  if (buf || quoted) push();
  return tokens;
}

function splitBy(line, sep) {
  const parts = [];
  let buf = '';
  let q = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { buf += c; if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") { q = c; buf += c; continue; }
    if (c === sep) { parts.push(buf); buf = ''; continue; }
    buf += c;
  }
  parts.push(buf);
  return parts;
}

function splitChain(line) {
  const items = [];
  let buf = '';
  let q = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { buf += c; if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") { q = c; buf += c; continue; }
    if (c === '&' && line[i + 1] === '&') { items.push({ text: buf, next: '&&' }); buf = ''; i += 1; continue; }
    if (c === ';') { items.push({ text: buf, next: ';' }); buf = ''; continue; }
    buf += c;
  }
  if (buf.trim()) items.push({ text: buf, next: null });
  return items.filter((item) => item.text.trim());
}

function hasRedirect(s) {
  let q = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '>') return true;
  }
  return false;
}

function redirectTarget(s) {
  let q = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '>') {
      let j = i + 1;
      if (s[j] === '>') j += 1;
      const tok = tokenize(s.slice(j).trim())[0];
      return tok ? tok.value : 'file';
    }
  }
  return 'file';
}

function launchKey(node) {
  const a = node.launch;
  if (!a) return 'none';
  if (a.type === 'url') return `url:${a.url}`;
  if (a.type === 'image') return `image:${a.src}`;
  return `${a.type}:${a.id || ''}`;
}

const MAN = {
  pwd: 'print the working directory.\n\npwd',
  ls: 'list files.\n\nls [-a] [-l] [path]\n-a  include . and ..\n-l  long listing',
  ll: 'alias of ls -l.',
  cd: 'change directory.\n\ncd [path]\ncd ~    home\ncd -    previous directory\ncd ..   parent',
  tree: 'list the directory as a tree.\n\ntree [path]',
  find: 'search for files.\n\nfind [path] [-name pattern]',
  stat: 'show file status.\n\nstat <file>',
  file: 'guess the file type.\n\nfile <file>',
  du: 'disk usage of a path.\n\ndu [-s] [-h] [path]',
  df: 'disk space of the filesystem.\n\ndf [-h]',
  cat: 'print a file.\n\ncat <file>...',
  head: 'print the first lines of a file.\n\nhead [-n N] <file>',
  tail: 'print the last lines of a file.\n\ntail [-n N] <file>',
  wc: 'count lines, words, and bytes.\n\nwc [-l] [-w] [-c] <file>',
  less: 'print a file (this terminal has no pager).\n\nless <file>',
  more: 'print a file (this terminal has no pager).\n\nmore <file>',
  grep: 'print lines that match a pattern.\n\ngrep [-i] [-n] [-v] <pattern> [file...]',
  echo: 'print arguments.\n\necho [-n] [text...]',
  printf: 'print a formatted string.\n\nprintf <format> [args...]\n%s string   %d number   %% a percent sign   \\n newline',
  whoami: 'print the current user (fan).',
  id: 'print user and group ids.',
  hostname: 'print the host name (nixin).',
  uname: 'print system information.\n\nuname [-a]',
  date: 'print the date and time.',
  uptime: 'how long this page has been open.',
  env: 'print the environment.',
  which: 'print the path of a command.\n\nwhich <command>',
  type: 'describe a command.\n\ntype <command>',
  history: 'print commands typed in this terminal.',
  clear: 'clear the screen. Ctrl+L does the same.',
  help: 'list commands.',
  man: 'show a short manual.\n\nman <command>',
  open: 'launch a file, app, game page, profile, or picture.\n\nopen <path>\nopen alchemy\nopen home.jpg\nopen "About Us"\nopen team/<person>\nA .jpg, .png, or .webp opens full screen in Image Viewer.\nA linkedin.url file opens that LinkedIn page.\n\nA name with no slash opens a matching game, app, person, or picture when the match is unique.',
  rm: 'remove files. Refused: you don\'t have sudo permission.',
  cp: 'copy files. Refused: you don\'t have sudo permission.',
  mv: 'move files. Refused: you don\'t have sudo permission.',
  mkdir: 'create a directory. Refused: you don\'t have sudo permission.',
  sudo: 'run a command as root. Refused: you don\'t have sudo permission.',
};

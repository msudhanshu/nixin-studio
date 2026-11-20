// Procedural placeholder "screenshots" (portrait 9:16) so the layout works
// before real game art exists. Replace by filling games[].screens in data.js.

const W = 360, H = 640;

function rng(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const scenes = {
  sky(ctx, p, r) {
    for (let i = 0; i < 9; i++) {
      const x = r() * W, y = r() * H * 0.9, s = 30 + r() * 60;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + r() * 0.3) + ')';
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(x + k * s * 0.45, y + Math.sin(k) * 8, s * (0.4 + r() * 0.3), 0, 7);
        ctx.fill();
      }
    }
    // plane / bird
    ctx.save();
    ctx.translate(W * 0.4 + r() * 60, H * 0.55);
    ctx.rotate(-0.2);
    ctx.fillStyle = p[2];
    ctx.beginPath();
    ctx.moveTo(40, 0); ctx.lineTo(-30, -18); ctx.lineTo(-18, 0); ctx.lineTo(-30, 18);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  blocks(ctx, p, r) {
    const cell = 72, ox = (W - cell * 4) / 2, oy = H * 0.3;
    for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) {
      if (r() < 0.25) continue;
      ctx.fillStyle = p[1 + Math.floor(r() * 3)];
      const v = 2 ** (1 + Math.floor(r() * 8));
      rr(ctx, ox + x * cell + 4, oy + y * cell + 4, cell - 8, cell - 8, 14);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = '700 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(v, ox + x * cell + cell / 2, oy + y * cell + cell / 2 + 8);
    }
  },
  hills(ctx, p, r) {
    for (let l = 0; l < 3; l++) {
      ctx.fillStyle = shade(p[1], -l * 18 + 10);
      ctx.beginPath();
      ctx.moveTo(0, H);
      const base = H * (0.55 + l * 0.12);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, base - Math.sin(x / 50 + l * 2 + r()) * 26);
      ctx.lineTo(W, H);
      ctx.fill();
    }
    // castle
    ctx.fillStyle = p[3];
    const cx = W * 0.62, cy = H * 0.5;
    ctx.fillRect(cx, cy, 70, 60);
    for (let i = 0; i < 4; i++) ctx.fillRect(cx + i * 20, cy - 12, 10, 12);
    ctx.fillStyle = p[2];
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(60 + i * 40 + r() * 10, H * 0.78, 9, 0, 7); ctx.fill();
    }
  },
  grid(ctx, p, r) {
    ctx.strokeStyle = p[3];
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.5;
    const hz = H * 0.48;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(W / 2, hz); ctx.lineTo(W / 2 + i * 70, H); ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const y = hz + (H - hz) * (i / 12) ** 2;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // sun
    const g = ctx.createLinearGradient(0, hz - 140, 0, hz);
    g.addColorStop(0, p[2]); g.addColorStop(1, p[1]);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(W / 2, hz, 100, Math.PI, 0); ctx.fill();
    // skyline
    ctx.fillStyle = '#05030f';
    for (let x = 0; x < W; x += 24) {
      const h = 30 + r() * 90;
      ctx.fillRect(x, hz - h, 22, h);
    }
    // runner
    ctx.fillStyle = p[3];
    rr(ctx, W / 2 - 12, H * 0.72, 24, 40, 8); ctx.fill();
  },
  orbs(ctx, p, r) {
    for (let i = 0; i < 26; i++) {
      const x = r() * W, y = H * 0.25 + r() * H * 0.6, s = 14 + r() * 34;
      const g = ctx.createRadialGradient(x - s / 3, y - s / 3, 2, x, y, s);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.3, p[1 + Math.floor(r() * 3)]);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
    }
    // tree
    ctx.fillStyle = '#5b3a24';
    ctx.fillRect(W / 2 - 8, H * 0.62, 16, 80);
    ctx.fillStyle = p[1];
    ctx.beginPath(); ctx.arc(W / 2, H * 0.58, 56, 0, 7); ctx.fill();
  },
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

/** Generate placeholder screens for a game. Returns array of data URLs. */
export function placeholderScreens(game, count = 5) {
  const out = [];
  const sceneNames = Object.keys(scenes);
  for (let i = 0; i < count; i++) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const r = rng(game.id + i);
    const p = game.palette;
    // background
    const g = ctx.createLinearGradient(0, 0, i % 2 ? W : 0, H);
    g.addColorStop(0, p[0]);
    g.addColorStop(0.65, shade(p[1], -30 + i * 8));
    g.addColorStop(1, p[0]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // scene (first screen uses the game's own scene, others vary it)
    const scene = i === 0 ? game.scene : (i % 2 ? game.scene : sceneNames[(sceneNames.indexOf(game.scene) + i) % sceneNames.length]);
    scenes[scene](ctx, p, r);
    // HUD
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    rr(ctx, 16, 56, 110, 34, 17); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('★ ' + Math.floor(r() * 9000 + 1000), 30, 79);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.arc(W - 36, 73, 18, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(W - 42, 66, 4, 14); ctx.fillRect(W - 34, 66, 4, 14);
    // title stamp
    ctx.font = '800 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.fillText(game.title.toUpperCase(), W / 2, H * 0.17);
    ctx.font = '600 12px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.fillText(`PLACEHOLDER SCREEN ${i + 1}`, W / 2, H * 0.17 + 22);
    out.push(c.toDataURL('image/jpeg', 0.82));
  }
  return out;
}

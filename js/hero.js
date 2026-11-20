// Section 1: particle logo.
// Sample the Nixin lockup, then run it like loot.ru's 3D identity: simplex
// noise idle, additive glow, and a fluid mouse field that swirls particles
// aside and lets springs pull them home.
import * as THREE from 'three';
import { drawLogo } from './logo.js';

const LOGO_WORLD = 6;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function sampleLogo(isMobile) {
  const S = 360;
  const step = isMobile ? 3 : 2;
  const full = document.createElement('canvas');
  full.width = full.height = S;
  drawLogo(full.getContext('2d', { willReadFrequently: true }), S, 'all');
  const a = full.getContext('2d').getImageData(0, 0, S, S).data;

  const pts = [];
  for (let y = 0; y < S; y += step) {
    for (let x = 0; x < S; x += step) {
      const i = (y * S + x) * 4;
      if (a[i + 3] < 140) continue;
      let r = a[i] / 255, g = a[i + 1] / 255, b = a[i + 2] / 255;
      const lum = 0.22 * r + 0.7 * g + 0.08 * b;
      if (lum < 0.2) {
        const t = 0.2 / Math.max(lum, 0.02);
        r = Math.min(1, r * t); g = Math.min(1, g * t); b = Math.min(1, b * t);
      }
      pts.push({
        x: (x / S - 0.5) * LOGO_WORLD,
        y: -(y / S - 0.5) * LOGO_WORLD,
        r, g, b,
        front: r + g + b > 1.35,
      });
    }
  }
  return { pts, spacing: (step / S) * LOGO_WORLD };
}

export function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const section = document.getElementById('home');
  const slot = section.querySelector('.home-logo-slot');
  const isMobile = matchMedia('(max-width: 720px)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const { pts, spacing } = sampleLogo(isMobile);

  const LAYERS = isMobile ? 2 : 3;
  const DEPTH = 0.11;
  const count = pts.length * LAYERS;
  const home = new Float32Array(count * 3);
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const rnd = new Float32Array(count);
  const size = new Float32Array(count);

  let k = 0;
  for (let l = 0; l < LAYERS; l++) {
    const dim = l === 0 ? 1 : 0.42 - l * 0.1;
    for (const p of pts) {
      const z = (p.front ? 0.32 : 0) - l * DEPTH;
      home[k * 3] = p.x; home[k * 3 + 1] = p.y; home[k * 3 + 2] = z;
      const ang = Math.atan2(p.y, p.x) + (Math.random() - 0.5) * 1.4 + l * 0.35;
      const rad = 5 + Math.random() * 9 + l * 1.2;
      pos[k * 3] = reduceMotion ? p.x : Math.cos(ang) * rad;
      pos[k * 3 + 1] = reduceMotion ? p.y : Math.sin(ang) * rad;
      pos[k * 3 + 2] = reduceMotion ? z : (Math.random() - 0.5) * 10;
      // Boost neon so additive blending blooms; keep shield readable.
      const glow = p.front ? 1.35 : 1;
      col[k * 3] = Math.min(1, p.r * dim * glow);
      col[k * 3 + 1] = Math.min(1, p.g * dim * glow);
      col[k * 3 + 2] = Math.min(1, p.b * dim * glow);
      rnd[k] = Math.random();
      size[k] = (p.front ? 1.35 : 0.85) * (0.7 + Math.random() * 0.7);
      k++;
    }
  }

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', posAttr);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
  geo.setAttribute('psize', new THREE.BufferAttribute(size, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: { value: spacing * 2.1 },
      uScale: { value: 1 },
      uTime: { value: 0 },
      uNoiseAmp: { value: reduceMotion ? 0 : 0.11 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      attribute float rnd;
      attribute float psize;
      uniform float uSize, uScale, uTime, uNoiseAmp;
      varying vec3 vColor;
      varying float vRnd;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        vec4 j = p - 49.0 * floor(p * 0.020408163265306);
        vec4 x_ = floor(j * 0.142857142857);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * 0.142857142857 - 1.0 + 0.5 * 0.142857142857;
        vec4 y = y_ * 0.142857142857 - 1.0 + 0.5 * 0.142857142857;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m *= m;
        return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vec3 p = position;
        vec3 np = p * 0.55 + vec3(uTime * 0.18, uTime * 0.13, rnd);
        vec3 n = vec3(
          snoise(np),
          snoise(np + vec3(31.4, 0.0, 0.0)),
          snoise(np + vec3(0.0, 74.7, 0.0))
        );
        p += n * uNoiseAmp;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.82 + 0.18 * sin(uTime * 1.6 + rnd * 40.0);
        gl_PointSize = uSize * uScale * psize * tw / max(-mv.z, 0.001);
        vColor = color * tw;
        vRnd = rnd;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vRnd;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float core = exp(-d * d * 22.0);
        float halo = exp(-d * d * 6.0) * 0.4;
        float a = core + halo;
        if (a < 0.03) discard;
        gl_FragColor = vec4(vColor * a, a);
      }`,
  });

  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  let W = 1, H = 1, visH = 1, visW = 1;
  let fit = 0, cx = 0, cy = 0;
  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    visW = visH * camera.aspect;
  }
  function slotTarget() {
    const c = canvas.getBoundingClientRect();
    const r = slot.getBoundingClientRect();
    const s = Math.max(40, Math.min(r.width, r.height));
    return {
      fit: (s / H) * visH / LOGO_WORLD,
      x: ((r.left + r.width / 2 - c.left) / W - 0.5) * visW,
      y: -((r.top + r.height / 2 - c.top) / H - 0.5) * visH,
    };
  }
  resize();
  ({ fit, x: cx, y: cy } = slotTarget());
  addEventListener('resize', resize);

  const ndc = new THREE.Vector2(9, 9);
  let hovering = false;
  let burst = 0;
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane();
  const hit = new THREE.Vector3();
  const local = new THREE.Vector3(999, 999, 0);

  const UI = '.os-win, .os-taskbar, .os-dock, .os-startmenu, .os-icon, .lock, .os-status';
  function setPointer(e) {
    if (e.target.closest(UI)) { hovering = false; return; }
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    hovering = true;
  }
  section.addEventListener('pointermove', setPointer);
  section.addEventListener('pointerdown', (e) => { setPointer(e); if (hovering) burst = 1; });

  addEventListener('nixin:burst', () => {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const a = Math.atan2(home[i3 + 1], home[i3]) + (rnd[i] - 0.5) * 0.9;
      const f = 0.22 + rnd[i] * 0.45;
      vel[i3] += Math.cos(a) * f;
      vel[i3 + 1] += Math.sin(a) * f;
      vel[i3 + 2] += (rnd[i] - 0.4) * f * 2.2;
    }
  });
  section.addEventListener('pointerleave', () => { hovering = false; });
  section.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') hovering = false; });
  section.addEventListener('pointercancel', () => { hovering = false; });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(section);

  const clock = new THREE.Clock();
  let rotX = 0, rotY = 0;
  const RADIUS = 1.05;
  const R2 = RADIUS * RADIUS;

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    mat.uniforms.uTime.value = t;
    const noiseTarget = reduceMotion ? 0 : (hovering ? 0.08 : 0.12);
    mat.uniforms.uNoiseAmp.value += (noiseTarget - mat.uniforms.uNoiseAmp.value) * 0.06;

    const tY = hovering ? ndc.x * 0.38 : Math.sin(t * 0.42) * 0.16;
    const tX = hovering ? -ndc.y * 0.26 : Math.sin(t * 0.31) * 0.05;
    rotY += (tY - rotY) * 0.055;
    rotX += (tX - rotX) * 0.055;
    const tg = slotTarget();
    fit += (tg.fit - fit) * 0.08;
    cx += (tg.x - cx) * 0.08;
    cy += (tg.y - cy) * 0.08;
    group.scale.setScalar(fit);
    mat.uniforms.uScale.value = (H / visH) * camera.position.z * fit * renderer.getPixelRatio();
    group.rotation.set(rotX, rotY, 0);
    group.position.set(cx, cy + Math.sin(t * 0.7) * 0.05 * fit, 0);
    group.updateMatrixWorld();

    let mx = 999, my = 999;
    if (hovering) {
      ray.setFromCamera(ndc, camera);
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion);
      plane.setFromNormalAndCoplanarPoint(n, group.position);
      if (ray.ray.intersectPlane(plane, hit)) {
        local.copy(hit);
        group.worldToLocal(local);
        mx = local.x; my = local.y;
      }
    }

    const radius2 = burst > 0 ? R2 * (1 + burst * 4) : R2;
    const push = 0.038 + burst * 0.14;
    const maxOff = burst > 0.04 ? 2.8 : 0.42;
    burst *= 0.88;
    if (burst < 0.01) burst = 0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];
      let vx = vel[i3], vy = vel[i3 + 1], vz = vel[i3 + 2];

      const dx = px - mx, dy = py - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < radius2) {
        const u = Math.sqrt(d2 / radius2);
        // Light air at the core, stronger blow toward the rim — center stays occupied.
        const hold = rnd[i] < 0.38 ? 0.18 : 1;
        const f = (1 - u) * (0.35 + 0.65 * u) * push * hold;
        const inv = 1 / Math.sqrt(d2 + 1e-4);
        vx += dx * inv * f;
        vy += dy * inv * f;
        vx += -dy * inv * f * 0.35;
        vy += dx * inv * f * 0.35;
        vz += (rnd[i] - 0.3) * f * 0.5;
      }
      const hx = home[i3], hy = home[i3 + 1], hz = home[i3 + 2];
      vx += (hx - px) * 0.028;
      vy += (hy - py) * 0.028;
      vz += (hz - pz) * 0.028;
      vx *= 0.88; vy *= 0.88; vz *= 0.88;

      px += vx; py += vy; pz += vz;
      const ox = px - hx, oy = py - hy, oz = pz - hz;
      const olen = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const cap = rnd[i] < 0.38 ? maxOff * 0.35 : maxOff;
      if (olen > cap) {
        const s = cap / olen;
        px = hx + ox * s;
        py = hy + oy * s;
        pz = hz + oz * s;
        vx *= 0.4; vy *= 0.4; vz *= 0.4;
      }

      pos[i3] = px; pos[i3 + 1] = py; pos[i3 + 2] = pz;
      vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
    }
    posAttr.needsUpdate = true;
    renderer.render(scene, camera);
  }
  frame();
}

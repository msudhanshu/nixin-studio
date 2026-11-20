// Company logo: assets/brand/nixin-studio.png
// Drawn into a square canvas so the particle hero can sample it, and so
// <img data-logo> / favicon stay the same API as before.

export const LOGO_SRC = new URL('../assets/brand/nixin-studio.png', import.meta.url).href;

// Tight crops on the 1024² master (padding stripped).
const CROP = {
  all:    { x: 200, y: 96,  w: 668, h: 760 }, // shield + wordmark + tagline
  mark:   { x: 210, y: 100, w: 648, h: 572 }, // shield + neon X only
  shield: { x: 210, y: 100, w: 648, h: 572 },
};

let img = null;
let ready = null;

export function loadLogo() {
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load Nixin Studio logo'));
    img.src = LOGO_SRC;
  });
  return ready;
}

/** Draw the logo into ctx at `size` px (square). `parts`: 'all' | 'mark'. */
export function drawLogo(ctx, size, parts = 'all') {
  const crop = CROP[parts] || CROP.all;
  const scale = size / Math.max(crop.w, crop.h);
  const dw = crop.w * scale;
  const dh = crop.h * scale;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, (size - dw) / 2, (size - dh) / 2, dw, dh);
}

/** Logo as a data URL (favicon, start button, reels avatar). Defaults to the mark. */
export function logoDataURL(size = 256, parts = 'mark') {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  drawLogo(c.getContext('2d'), size, parts);
  return c.toDataURL('image/png');
}

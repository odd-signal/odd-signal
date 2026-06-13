/* ============================================================
   effects.js — background visuals registered into the glitch engine
   noise field + corruption, canvas tear-bars, VHS tracking, RGB split
   All scale with the engine's intensity; all pause when it pauses.
   ============================================================ */
import { registerFrame, registerTimed, onLevel, getIntensity } from './glitch.js';

const chars = '01アイウエオカキクケコサシスセソ░▒▓█▄▀■□▪◆◇ABCDEF0123456789ERR_SIG_OVF_NULL_REF_BAD_ADDR_CORRUPT_OVERFLOW_SEGFAULT';
const randChars = (n) =>
  Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

/* ---- noise field ---- */
const noiseEl = document.getElementById('bgNoise');
for (let i = 0; i < 110; i++) {
  const s = document.createElement('span');
  s.textContent = randChars(Math.floor(Math.random() * 22) + 4);
  s.style.left = Math.random() * 100 + 'vw';
  s.style.top = Math.random() * 100 + 'vh';
  s.style.animationDelay = (Math.random() * 2) + 's';
  s.style.animationDuration = (Math.random() * 3 + 3) + 's';
  s.style.fontSize = (Math.random() > 0.2 ? 11 : Math.floor(Math.random() * 16 + 14)) + 'px';
  s.style.transform = `rotate(${Math.random() > 0.6 ? 90 : 0}deg)`;
  noiseEl.appendChild(s);
}
const noiseSpans = noiseEl.querySelectorAll('span');
const corruptColors = ['#ff2244', '#ffaa00', '#00aaff', '#39ff6e'];

// noise text/colour corruption — timed, scales with intensity
registerTimed(1400, (intensity) => {
  const count = Math.floor(Math.random() * 5 * intensity) + 1;
  for (let i = 0; i < count; i++) {
    const target = noiseSpans[Math.floor(Math.random() * noiseSpans.length)];
    target.style.color = corruptColors[Math.floor(Math.random() * corruptColors.length)];
    target.style.opacity = '0.5';
    setTimeout(() => {
      target.textContent = randChars(Math.floor(Math.random() * 22) + 4);
      target.style.color = '';
      target.style.opacity = '';
    }, 160);
  }
});

/* ---- canvas tear-bars ---- */
const canvas = document.getElementById('glitch-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
const glitchColors = ['rgba(57,255,110,0.07)', 'rgba(255,34,68,0.09)', 'rgba(0,170,255,0.07)', 'rgba(255,170,0,0.06)'];

registerFrame((intensity) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (Math.random() > (1 - 0.7 * intensity)) {
    const bars = Math.floor(Math.random() * 6 * intensity) + 1;
    for (let i = 0; i < bars; i++) {
      ctx.fillStyle = glitchColors[Math.floor(Math.random() * glitchColors.length)];
      ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 4 + 1);
    }
  }
  if (Math.random() > 0.94 + 0.05 * (1 - intensity)) {
    ctx.fillStyle = 'rgba(57,255,110,0.12)';
    ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 2 + 1);
  }
  if (intensity > 0.6 && Math.random() > 0.985) {
    ctx.fillStyle = 'rgba(255,34,68,0.12)';
    ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 1);
  }
});
// clear the canvas whenever we drop to calm so no bars linger
onLevel((lvl) => { if (lvl === 0) ctx.clearRect(0, 0, canvas.width, canvas.height); });

/* ---- VHS tracking sweep ---- */
const tracking = document.getElementById('tracking');
export function runTracking() {
  if (document.hidden) return;
  tracking.classList.remove('run');
  void tracking.offsetWidth;
  tracking.classList.add('run');
}
registerTimed(5200, (intensity) => { if (Math.random() < 0.65 * intensity) runTracking(); });

/* ---- RGB split on visible headings ---- */
export function rgbHitHeadings() {
  const heads = [...document.querySelectorAll('.mac-window.open .win-body h2, .ios-app.open .app-body h2')];
  if (!heads.length) return;
  const h = heads[Math.floor(Math.random() * heads.length)];
  h.classList.remove('rgb-hit');
  void h.offsetWidth;
  h.classList.add('rgb-hit');
}
registerTimed(4700, (intensity) => { if (Math.random() < 0.55 * intensity) rgbHitHeadings(); });

/* ============================================================
   glitch.js — single rAF compositor + glitchLevel state machine
   One paint-synced loop drives every background effect. Effects
   register here instead of spawning their own timers, so the whole
   site glitches on one clock, pauses when hidden, throttles on
   mobile, and scales to a single glitchLevel dial (0..3).
   ============================================================ */

export const prefersReduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function isMobile() {
  return (window.innerWidth || document.documentElement.clientWidth || screen.width) <= 640;
}

const MAX = 3;
let level = prefersReduced ? 1 : MAX;   // boot: reduced-motion users start calm
let intensity = level / MAX;

const frameEffects = [];   // { fn(intensity, now) } — called (throttled) every frame
const timedEffects = [];   // { base, acc, fn } — fired every base/intensity ms
const levelListeners = []; // fn(level, intensity)

export function registerFrame(fn) { frameEffects.push({ fn }); }
export function registerTimed(base, fn) { timedEffects.push({ base, acc: 0, fn }); }
export function onLevel(fn) { levelListeners.push(fn); fn(level, intensity); }

export function getLevel() { return level; }
export function getIntensity() { return intensity; }

function applyLevel() {
  intensity = level / MAX;
  document.body.dataset.glitch = String(level);
  for (const fn of levelListeners) fn(level, intensity);
}

export function setLevel(n) {
  const next = Math.max(0, Math.min(MAX, n | 0));
  if (next === level) return level;
  level = next;
  applyLevel();
  return level;
}
export function stepLevel(d) { return setLevel(level + d); }
export function isMax() { return level >= MAX; }

/* ---- the loop ---- */
let last = performance.now();
let parity = 0;
let rafId = null;
let running = false;

function tick(now) {
  if (!running) return;
  const dt = Math.min(80, now - last); // clamp after tab-restore
  last = now;

  // reduced motion: no continuous motion at all (a static frame was
  // rendered once at init); just keep the loop idle so level changes
  // still update the static texture via listeners.
  if (!prefersReduced && intensity > 0) {
    parity ^= 1;
    const doFrame = !isMobile() || parity === 0; // ~30fps on phones
    if (doFrame) {
      for (const e of frameEffects) e.fn(intensity, now);
      for (const e of timedEffects) {
        e.acc += dt;
        const period = e.base / Math.max(0.18, intensity); // calmer = rarer
        if (e.acc >= period) { e.acc = 0; e.fn(intensity, now); }
      }
    }
  }
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  last = performance.now();
  rafId = requestAnimationFrame(tick);
}
function stop() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

/* pause when tab hidden / window blurred — saves battery at meetups */
document.addEventListener('visibilitychange', () => {
  document.hidden ? stop() : start();
});
window.addEventListener('blur', stop);
window.addEventListener('focus', start);

export function initGlitch() {
  applyLevel(); // set body[data-glitch] + notify listeners with boot level
  if (prefersReduced) {
    // render one static frame so the look exists without motion
    for (const e of frameEffects) e.fn(intensity, performance.now());
  } else {
    start();
  }
}

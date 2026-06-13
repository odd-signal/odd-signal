/* ============================================================
   ios.js — iPhone OS 1–3 mode: status bar glitches, lock screen,
   springboard, app open/close, services table, iOS alerts
   ============================================================ */
import { registerTimed, onLevel } from './glitch.js';
import { runTracking } from './effects.js';

const isIOS = () => document.body.classList.contains('mode-ios');

/* ---- status bar: signal bars ---- */
const barsEl = document.getElementById('ios-bars');
for (let i = 0; i < 5; i++) {
  const b = document.createElement('i');
  b.style.height = (3 + i * 2) + 'px';
  barsEl.appendChild(b);
}
function setBars(strength) {
  [...barsEl.children].forEach((b, i) => b.style.opacity = i < strength ? '1' : '0.25');
}
setBars(5);
registerTimed(2200, () => {
  if (!isIOS()) return;
  setBars(Math.random() > 0.18 ? 5 : Math.floor(Math.random() * 4) + 1);
});

/* ---- carrier name corruption ---- */
const carrierEl = document.getElementById('ios-carrier');
const carrierGlitches = ['0DD S1GNAL', 'ODD SIGN▓L', '◉DD_SIGNAL', 'NO SERVICE'];
registerTimed(4100, () => {
  if (!isIOS() || Math.random() < 0.45) return;
  carrierEl.textContent = carrierGlitches[Math.floor(Math.random() * carrierGlitches.length)];
  setTimeout(() => { carrierEl.textContent = 'ODD SIGNAL'; }, 220);
});

/* ---- battery jitter ---- */
const battFill = document.getElementById('batt-fill');
registerTimed(5600, () => {
  if (!isIOS() || Math.random() < 0.6) return;
  battFill.style.width = Math.floor(Math.random() * 70 + 15) + '%';
  if (Math.random() > 0.7) {
    battFill.style.background = 'linear-gradient(180deg, #ff8a7a, #b00f00)';
    setTimeout(() => { battFill.style.background = ''; }, 300);
  }
});

/* cleaned phone = stable status bar */
onLevel((lvl) => {
  if (lvl !== 0) return;
  setBars(5);
  carrierEl.textContent = 'ODD SIGNAL';
  battFill.style.width = '64%';
  battFill.style.background = '';
});

/* ---- lock screen: slide to unlock ---- */
const lockscreen = document.getElementById('lockscreen');
const sliderTrack = document.getElementById('slider-track');
const sliderThumb = document.getElementById('slider-thumb');
const sliderLabel = document.getElementById('slider-label');
let unlockedOnce = false;
let sdrag = null;

/* auto "hijack" — the signal seizes the phone if the user just stares */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let hijackTimer = null;
let didUnlock = false;
function cancelHijack() { if (hijackTimer) { clearTimeout(hijackTimer); hijackTimer = null; } }

sliderThumb.addEventListener('pointerdown', e => {
  cancelHijack(); // user took control — no auto-seize mid-drag
  sdrag = { x: e.clientX, dx: 0, max: sliderTrack.clientWidth - sliderThumb.offsetWidth - 8 };
  sliderThumb.style.transition = 'none';
  sliderThumb.setPointerCapture(e.pointerId);
});
sliderThumb.addEventListener('pointermove', e => {
  if (!sdrag) return;
  sdrag.dx = Math.max(0, Math.min(e.clientX - sdrag.x, sdrag.max));
  sliderThumb.style.transform = `translateX(${sdrag.dx}px)`;
  sliderLabel.style.opacity = String(1 - sdrag.dx / sdrag.max);
});
function sliderEnd() {
  if (!sdrag) return;
  if (sdrag.dx >= sdrag.max * 0.85) unlock();
  else {
    sliderThumb.style.transition = 'transform 0.25s';
    sliderThumb.style.transform = 'translateX(0)';
    sliderLabel.style.opacity = '';
  }
  sdrag = null;
}
sliderThumb.addEventListener('pointerup', sliderEnd);
sliderThumb.addEventListener('pointercancel', sliderEnd);

function unlock() {
  didUnlock = true;
  cancelHijack();
  lockscreen.classList.add('unlocked');
  if (!unlockedOnce) {
    unlockedOnce = true;
    setTimeout(() => {
      if (isIOS()) iosAlertShow('INCOMING TRANSMISSION',
        'Tech problem in your practice? Website shame? AI curiosity? A sculpture that should blink? First conversation is free.',
        'Talk to us', () => openApp('contact'));
    }, 5000);
  }
}

registerTimed(6000, () => {
  if (!isIOS() || lockscreen.classList.contains('unlocked') || Math.random() < 0.5) return;
  const alts = ['slide to transmit', 'sl1de t0 unl0ck', 'slide to unlock'];
  sliderLabel.textContent = alts[Math.floor(Math.random() * alts.length)];
  setTimeout(() => { sliderLabel.textContent = 'slide to unlock'; }, 900);
});

/* drives the thumb across with a glitchy jerk, then unlocks */
function hijackUnlock() {
  if (didUnlock || lockscreen.classList.contains('unlocked')) return;
  if (reduceMotion) { sliderLabel.textContent = 'signal seized'; unlock(); return; }
  lockscreen.classList.add('hijacking');
  sliderLabel.style.animation = 'none';
  sliderLabel.textContent = '// SIGNAL HIJACKED';
  const max = sliderTrack.clientWidth - sliderThumb.offsetWidth - 8;
  sliderThumb.style.transition = 'transform 0.5s steps(7)';
  sliderThumb.style.transform = `translateX(${max}px)`;
  setTimeout(() => { lockscreen.classList.remove('hijacking'); unlock(); }, 620);
}

function armHijack() {
  if (!isIOS() || didUnlock || lockscreen.classList.contains('unlocked')) return;
  cancelHijack();
  hijackTimer = setTimeout(hijackUnlock, 4200);
}

/* armed by main.js once the mode is known; ~4s gives time to read the brand.
   QR scanners often open the page in a background tab, where browsers throttle
   or suspend timers — so we also pause the countdown while hidden and (re)start
   it whenever the page becomes visible, so it fires ~4s into the user actually
   looking at the lock screen rather than ~4s into a suspended background load. */
export function initLockHijack() {
  armHijack();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelHijack();
    else armHijack();
  });
}

/* ---- app open/close ---- */
export function openApp(name) {
  const a = document.getElementById('app-' + name);
  if (!a) return;
  a.classList.add('open');
  requestAnimationFrame(() => requestAnimationFrame(() => a.classList.add('in')));
}
export function closeApps() {
  document.querySelectorAll('.ios-app.open').forEach(a => {
    a.classList.remove('in');
    setTimeout(() => a.classList.remove('open'), 290);
  });
}
document.querySelectorAll('.sb-icon[data-app]').forEach(i =>
  i.addEventListener('click', () => openApp(i.dataset.app)));
document.querySelectorAll('[data-app-back]').forEach(b =>
  b.addEventListener('click', closeApps));
document.querySelectorAll('[data-app-open]').forEach(b =>
  b.addEventListener('click', () => openApp(b.dataset.appOpen)));

/* ---- special springboard icons ---- */
document.getElementById('sb-trash')?.addEventListener('click', iosBomb);
document.getElementById('sb-signal')?.addEventListener('click', () => {
  runTracking();
  carrierEl.textContent = 'SIG:ANOMALOUS';
  setTimeout(() => { carrierEl.textContent = 'ODD SIGNAL'; }, 1200);
});
document.getElementById('sb-mail')?.addEventListener('click', () => {
  location.href = 'mailto:hello@oddsignal.net';
});

/* ---- iOS services table ---- */
document.querySelectorAll('.ios-cell[data-isvc]').forEach(c =>
  c.addEventListener('click', () => {
    const desc = document.querySelector(`.ios-cell-desc[data-isvc-desc="${c.dataset.isvc}"]`);
    const was = desc.classList.contains('show');
    document.querySelectorAll('.ios-cell-desc').forEach(d => d.classList.remove('show'));
    if (!was) desc.classList.add('show');
  }));
document.querySelectorAll('[data-ask-ios]').forEach(b =>
  b.addEventListener('click', () => {
    openApp('contact');
    const sel = document.getElementById('serviceSelect');
    [...sel.options].forEach(o => { if (o.text === b.dataset.askIos) o.selected = true; });
  }));

/* ---- iOS alert ---- */
const iosAlertEl = document.getElementById('iosAlert');
let iaAction = null;
export function iosAlertShow(title, msg, primary, onPrimary) {
  document.getElementById('ia-title').textContent = title;
  document.getElementById('ia-msg').textContent = msg;
  document.getElementById('ia-primary').textContent = primary;
  iaAction = onPrimary;
  iosAlertEl.classList.add('open');
}
document.getElementById('ia-cancel').addEventListener('click', () => iosAlertEl.classList.remove('open'));
document.getElementById('ia-primary').addEventListener('click', () => {
  iosAlertEl.classList.remove('open');
  if (iaAction) iaAction();
});
export function iosBomb() {
  iosAlertShow('System Error',
    '"reality.cfg" — error of Type -23 (signal too odd). This is exactly the kind of thing we fix for other people.',
    'Get Help', () => openApp('contact'));
}

/* ---- springboard icon RGB tears ---- */
registerTimed(5100, () => {
  if (!isIOS() || Math.random() < 0.5) return;
  const tiles = document.querySelectorAll('#springboard .tile');
  const t = tiles[Math.floor(Math.random() * tiles.length)];
  t.classList.remove('rgb-hit');
  void t.offsetWidth;
  t.classList.add('rgb-hit');
});

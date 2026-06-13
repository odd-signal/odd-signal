/* ============================================================
   apps.js — diegetic glitch controls
     · Cleaner / Disk Doctor   → steps glitchLevel DOWN (the fix)
     · keygen.dmg              → steps glitchLevel UP; storm at max
     · popup storm             → classic 90s popup chaos
     · B hooks                 → calm-toast + infection-dialog → Contact
   Wires both the Mac windows and the iOS apps off one shared logic.
   ============================================================ */
import { getLevel, setLevel, stepLevel, isMax, onLevel } from './glitch.js';
import { openWin, showDialog } from './windows.js';
import { openApp, iosAlertShow } from './ios.js';
import { showNWAd, NW_POPUPS } from './rival.js';

const isIOS = () => document.body.classList.contains('mode-ios');
function openContact() { isIOS() ? openApp('contact') : openWin('contact'); }

/* status text per glitch level — shown in every Cleaner readout */
const LEVEL_STATUS = {
  3: '⚠ SIGNAL CRITICAL — heavy corruption detected',
  2: 'DEGRADED — corruption falling…',
  1: 'STABILISING — almost clean',
  0: '✓ SYSTEM STABLE — signal clean',
};
const readouts = [];
function refreshReadouts() {
  const txt = '> ' + LEVEL_STATUS[getLevel()];
  readouts.forEach(r => { if (!r.dataset.busy) r.textContent = txt; });
}

/* ============================================================
   CLEANER
   ============================================================ */
function wireCleaner(root) {
  if (!root) return;
  const defrag = root.querySelector('.defrag');
  const readout = root.querySelector('.readout');
  const meter = root.querySelector('.meter > i');
  const btn = root.querySelector('[data-clean]');
  readouts.push(readout);

  // build defrag grid
  for (let i = 0; i < 80; i++) defrag.appendChild(document.createElement('i'));
  const cells = [...defrag.children];

  btn.addEventListener('click', () => {
    if (getLevel() === 0) {
      readout.dataset.busy = '1';
      readout.textContent = '> nothing to repair. already stable.';
      setTimeout(() => { delete readout.dataset.busy; refreshReadouts(); }, 1600);
      return;
    }
    btn.disabled = true;
    readout.dataset.busy = '1';
    readout.textContent = '> scanning sectors…';
    cells.forEach(c => { c.className = Math.random() < 0.45 ? 'bad' : ''; });
    if (meter) meter.style.width = '0%';

    let i = 0;
    const tick = setInterval(() => {
      // sweep: turn next chunk of cells "ok"
      for (let k = 0; k < 6 && i < cells.length; k++, i++) {
        cells[i].className = 'work';
        const j = i;
        setTimeout(() => { cells[j].className = 'ok'; }, 80);
      }
      if (meter) meter.style.width = Math.round((i / cells.length) * 100) + '%';
      readout.textContent = '> repairing… ' + Math.round((i / cells.length) * 100) + '%';
      if (i >= cells.length) {
        clearInterval(tick);
        const lvl = stepLevel(-1);
        delete readout.dataset.busy;
        btn.disabled = false;
        if (lvl === 0) calmToast();
        else refreshReadouts();
      }
    }, 70);
  });
}

/* ============================================================
   keygen.dmg
   ============================================================ */
const SERIAL_CH = 'ABCDEF0123456789';
const randSerial = () =>
  Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => SERIAL_CH[Math.floor(Math.random() * SERIAL_CH.length)]).join('')
  ).join('-');

function wireKeygen(root) {
  if (!root) return;
  const serialEl = root.querySelector('.kg-serial');
  const btn = root.querySelector('[data-keygen]');
  btn.addEventListener('click', () => {
    serialEl.textContent = randSerial();
    if (isMax()) {
      popupStorm();
    } else {
      stepLevel(1);
      const note = root.querySelector('.kg-note');
      if (note) {
        note.textContent = '> payload injected. corruption +1';
        setTimeout(() => { note.textContent = ''; }, 1800);
      }
    }
  });
}

/* ============================================================
   POPUP STORM
   ============================================================ */
const stormEl = document.getElementById('storm');
const POPUPS = [
  ['✉', "YOU'VE GOT MAIL"],
  ['💿', 'CORRUPTED DISC'],
  ['🧠', 'DOWNLOAD MORE RAM'],
  ['☣', 'ВИРУС DETECTED (x47)'],
  ['🐌', 'Your computer is 100% SLOW'],
  ['🎁', 'ПОЗДРАВЛЯЕМ — CLICK TO WIN'],
  ['🗑', 'SYSTEM32 has been deleted'],
  ['❓', 'Cn yu evn rd ths popup'],
  ['🍎', 'FREE iPod — claim now'],
  ['💾', 'DISK FULL: 0 bytes free'],
  ['💥', 'реальность.exe has stopped responding'],
];
let storming = false;
function popupStorm() {
  // iOS havoc = the goblin's NORMAL WAVELENGTH takeover (not win95 popups)
  if (isIOS()) { showNWAd(); return; }
  if (storming) return;
  storming = true;
  stormEl.classList.add('on');
  const pool = POPUPS.concat(NW_POPUPS);
  const n = 9 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const [ico, msg] = pool[Math.floor(Math.random() * pool.length)];
    const p = document.createElement('div');
    p.className = 'popup shake';
    p.style.left = Math.random() * 70 + 4 + 'vw';
    p.style.top = Math.random() * 64 + 14 + 'vh';
    p.style.animationDelay = (Math.random() * 0.15) + 's';
    p.innerHTML =
      `<div class="pu-bar"><span>! Alert</span><span class="pu-x">✕</span></div>` +
      `<div class="pu-body"><span class="pu-ico">${ico}</span><span class="pu-msg">${msg}</span></div>`;
    p.querySelector('.pu-x').addEventListener('click', () => p.remove());
    stormEl.appendChild(p);
  }
  setTimeout(() => {
    stormEl.classList.remove('on');
    stormEl.innerHTML = '';
    storming = false;
    infectionHook();
  }, 2600);
}

/* ============================================================
   B HOOKS → Contact
   ============================================================ */
// 1) Cleaner reaches calm → warm relief toast
const toastEl = document.getElementById('toast');
let toastTimer = null;
function calmToast() {
  refreshReadouts();
  toastEl.innerHTML = '&gt; system stable. we do this for humans too <span class="arrow">→</span>';
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 6500);
}
toastEl.addEventListener('click', () => { toastEl.classList.remove('show'); openContact(); });

// 2) Storm ends → the gag's last popup is real
function infectionHook() {
  if (isIOS()) {
    iosAlertShow('⚠ System Infected',
      '1 threat remains: reality.cfg. Looks broken? Unbreaking things is literally the job.',
      'Get it fixed →', openContact);
  } else {
    showDialog('infectDialog');
  }
}

/* ============================================================
   INIT
   ============================================================ */
export function initApps() {
  wireCleaner(document.getElementById('win-cleaner'));
  wireCleaner(document.getElementById('app-cleaner'));
  wireKeygen(document.getElementById('win-keygen'));
  wireKeygen(document.getElementById('app-keygen'));
  onLevel(refreshReadouts);
}

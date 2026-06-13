/* ============================================================
   goblin.js — the mascot. Face of glitchLevel + gravity to contact.
   Arc: reveal on first interaction → friendly → betrayal heel-turn
   on next move → escalates corruption per poke. Speaks event-driven
   (never on a timer), short, Cyrillic-spiced, dismissable. Always a
   road back to the contact form, which it can never corrupt.
   ============================================================ */
import { onLevel, getLevel, stepLevel, isMax, prefersReduced } from './glitch.js';
import { openWin } from './windows.js';
import { openApp } from './ios.js';

const isIOS = () => document.body.classList.contains('mode-ios');
function openContact() { isIOS() ? openApp('contact') : openWin('contact'); }

const gob = document.getElementById('goblin');
const bubble = document.getElementById('gob-bubble');

let phase = 'pre';        // pre | friendly | trickster
let lastLevel = getLevel();
let quietUntil = 0;       // dismiss cooldown
let speaking = null;      // hide timer
let idleTimer = null;

/* ---- line banks (dry, short, Cyrillic-spiced) ---- */
const LINES = {
  friendly: [
    'oh — привет. a visitor. tap around, i will help. probably.',
    'hello. lost already? the humans are this way →|go',
  ],
  betray: [
    '…heh. you trusted me. ▓▓▒',
    'sike. это мой дом now.',
  ],
  corrupt: [
    'да. more noise.',
    'louder. БОЛЬШЕ.',
    'mmm. broken.',
    'i live in the static.',
  ],
  annoyed: [
    'нет. my glitches…',
    'stop fixing things.',
    'ugh. so… stable. boring.',
  ],
  sulk: [
    "fine. it's clean. you win. now go bother a human →|go",
    'тихо. too quiet. call someone who likes this →|go',
  ],
  idle: [
    'still here? the form is →|go',
    'lost? exit здесь →|go',
    'psst. they fix this for a living →|go',
  ],
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---- speech ---- */
function say(text, { force = false } = {}) {
  const now = Date.now();
  if (!force && now < quietUntil) return;
  // parse "...→|go" suffix = include a contact link
  const wantGo = text.endsWith('|go');
  const body = wantGo ? text.slice(0, -3) : text;
  // colour any Cyrillic run amber
  const html = body.replace(/[Ѐ-ӿ]+/g, m => `<span class="gob-cy">${m}</span>`)
    + (wantGo ? '<br><span class="gob-go">talk to a human →</span>' : '');
  bubble.innerHTML = html;
  positionBubble();
  bubble.classList.add('show');
  bubble.querySelector('.gob-go')?.addEventListener('click', (e) => { e.stopPropagation(); hideBubble(); openContact(); });
  clearTimeout(speaking);
  speaking = setTimeout(hideBubble, 5200);
  armIdle();
}
function hideBubble() { bubble.classList.remove('show'); }

function positionBubble() {
  const r = gob.getBoundingClientRect();
  bubble.style.left = Math.max(10, r.right - 232) + 'px';
  bubble.style.bottom = (window.innerHeight - r.top + 8) + 'px';
  bubble.style.top = 'auto';
}

/* ---- idle nudge (only after inactivity, not a nag loop) ---- */
function armIdle() {
  clearTimeout(idleTimer);
  if (phase === 'pre') return;
  idleTimer = setTimeout(() => {
    if (phase !== 'pre' && Date.now() >= quietUntil) say(pick(LINES.idle));
  }, 32000);
}

/* ---- reveal / heel turn ---- */
function reveal() {
  if (phase !== 'pre') return;
  phase = 'friendly';
  gob.classList.add('show');
  if (!prefersReduced) gob.classList.add('pop');
  setTimeout(() => gob.classList.remove('pop'), 500);
  setTimeout(() => say(pick(LINES.friendly), { force: true }), 420);
  // next interaction betrays
  document.addEventListener('click', betrayOnce, true);
}
function betrayOnce(e) {
  if (e.target.closest('#goblin, #gob-bubble')) return; // shooing/links don't trigger
  document.removeEventListener('click', betrayOnce, true);
  heelTurn();
}
function heelTurn() {
  phase = 'trickster';
  say(pick(LINES.betray), { force: true });
  if (!prefersReduced) startJitter();
  stepLevel(1);
  // further pokes escalate
  document.addEventListener('click', pokeEscalate, true);
}
let jitterStop = null;
function startJitter() {
  gob.classList.add('jitter');
  clearTimeout(jitterStop);
  jitterStop = setTimeout(() => gob.classList.remove('jitter'), 700);
}

/* opening apps ratchets corruption up (escalate, not slam). Scoped to
   icon-pokes only — operating a window (e.g. REPAIR) must NOT re-corrupt. */
let lastPoke = 0;
function pokeEscalate(e) {
  if (!e.target.closest('.desk-icon, .sb-icon')) return;
  const now = Date.now();
  if (now - lastPoke < 600) return; // debounce
  lastPoke = now;
  if (!isMax()) { stepLevel(1); if (!prefersReduced) startJitter(); }
}

/* ---- react to engine level changes (Disk Doctor / keygen / self) ---- */
onLevel((lvl) => {
  if (phase === 'pre') { lastLevel = lvl; return; }
  if (lvl === 0) say(pick(LINES.sulk));
  else if (lvl < lastLevel) say(pick(LINES.annoyed));
  else if (lvl > lastLevel) { if (!prefersReduced) startJitter(); say(pick(LINES.corrupt)); }
  lastLevel = lvl;
});

/* ---- dismiss: click the goblin to shoo it quiet ---- */
gob.addEventListener('click', (e) => {
  e.stopPropagation();
  hideBubble();
  quietUntil = Date.now() + 22000; // stays, but mute for a while
});

window.addEventListener('resize', () => { if (bubble.classList.contains('show')) positionBubble(); });

/* ---- first-interaction reveal ---- */
function firstInteraction(e) {
  if (e.target.closest('#boot, #lockscreen, #goblin, #gob-bubble')) return;
  document.removeEventListener('click', firstInteraction, true);
  reveal();
}

export function initGoblin() {
  document.addEventListener('click', firstInteraction, true);
}

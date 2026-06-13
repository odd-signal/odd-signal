/* ============================================================
   windows.js — Mac OS window manager, menu bar, desktop icons,
   dialogs, Services finder, status line, clock
   ============================================================ */
import { registerTimed } from './glitch.js';

/* every .mac-window keyed by id (win-about -> "about") */
const wins = {};
document.querySelectorAll('.mac-window').forEach(w => {
  wins[w.id.replace('win-', '')] = w;
});

let zTop = 200;

export function focusWin(el) {
  Object.values(wins).forEach(w => w.classList.add('inactive'));
  el.classList.remove('inactive');
  el.style.zIndex = ++zTop;
}
export function openWin(name) {
  const el = wins[name];
  if (!el) return;
  el.classList.add('open');
  el.classList.remove('shaded');
  focusWin(el);
  el.classList.add('glitching');
  setTimeout(() => el.classList.remove('glitching'), 240);
}
export function closeWin(el) { el.classList.remove('open'); }
export function closeAllWins() { Object.values(wins).forEach(closeWin); }
export function getWin(name) { return wins[name]; }

/* per-window chrome: focus, close, shade, drag */
Object.values(wins).forEach(win => {
  win.addEventListener('pointerdown', () => focusWin(win));
  const bar = win.querySelector('.titlebar');
  win.querySelector('[data-win-close]')?.addEventListener('click', e => { e.stopPropagation(); closeWin(win); });
  win.querySelector('[data-win-shade]')?.addEventListener('click', e => { e.stopPropagation(); win.classList.toggle('shaded'); });
  bar?.addEventListener('dblclick', () => win.classList.toggle('shaded'));

  let drag = null;
  bar?.addEventListener('pointerdown', e => {
    if (e.target.closest('.t-btn')) return;
    drag = { x: e.clientX - win.offsetLeft, y: e.clientY - win.offsetTop };
    bar.setPointerCapture(e.pointerId);
  });
  bar?.addEventListener('pointermove', e => {
    if (!drag) return;
    const desk = document.getElementById('desktop');
    let nx = e.clientX - drag.x, ny = e.clientY - drag.y;
    nx = Math.max(-win.offsetWidth + 80, Math.min(nx, desk.clientWidth - 60));
    ny = Math.max(0, Math.min(ny, desk.clientHeight - 30));
    win.style.left = nx + 'px';
    win.style.top = ny + 'px';
  });
  const endDrag = () => { drag = null; };
  bar?.addEventListener('pointerup', endDrag);
  bar?.addEventListener('pointercancel', endDrag);
});

/* random glitch slice on a visible window — Contact is exempt (stable island) */
registerTimed(4000, (intensity) => {
  const open = Object.values(wins).filter(w => w.classList.contains('open') && w.id !== 'win-contact');
  if (open.length && Math.random() < 0.55 * intensity) {
    const w = open[Math.floor(Math.random() * open.length)];
    w.classList.add('glitching');
    setTimeout(() => w.classList.remove('glitching'), 240);
  }
});

/* Contact = stable island: gentle jerk only, never hides fields */
registerTimed(5200, (intensity) => {
  const c = wins.contact;
  if (!c || !c.classList.contains('open')) return;
  if (Math.random() > 0.4 * intensity) return;
  c.classList.remove('form-jerk');
  void c.offsetWidth;
  c.classList.add('form-jerk');
});

/* ---- dialogs ---- */
export function showDialog(id) {
  const d = document.getElementById(id);
  d.classList.add('open');
  d.style.zIndex = ++zTop + 10000;
}
document.querySelectorAll('[data-dlg-close]').forEach(b =>
  b.addEventListener('click', () => b.closest('.dialog').classList.remove('open')));
document.querySelectorAll('[data-dlg-contact]').forEach(b =>
  b.addEventListener('click', () => { b.closest('.dialog').classList.remove('open'); openWin('contact'); }));

/* ---- Services finder ---- */
export function toggleSvc(id, forceOpen) {
  const row = document.querySelector(`.finder-row[data-svc="${id}"]`);
  const desc = document.querySelector(`.finder-desc[data-svc-desc="${id}"]`);
  const isOpen = desc.classList.contains('show');
  document.querySelectorAll('.finder-desc').forEach(d => d.classList.remove('show'));
  document.querySelectorAll('.finder-row').forEach(r => r.classList.remove('expanded'));
  if (forceOpen || !isOpen) { desc.classList.add('show'); row.classList.add('expanded'); }
}
document.querySelectorAll('.finder-row').forEach(r =>
  r.addEventListener('click', () => toggleSvc(r.dataset.svc)));

function preselectService(label) {
  const sel = document.getElementById('serviceSelect');
  [...sel.options].forEach(o => { if (o.text === label.replace('&amp;', '&')) o.selected = true; });
}
document.querySelectorAll('[data-ask]').forEach(b =>
  b.addEventListener('click', () => { openWin('contact'); preselectService(b.dataset.ask); }));

/* ---- desktop icons ---- */
document.querySelectorAll('.desk-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    document.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
    const t = icon.dataset.open;
    if (t === 'trash') showDialog('bombDialog');
    else setTimeout(() => openWin(t), 120);
  });
});
document.querySelectorAll('[data-open-win]').forEach(b =>
  b.addEventListener('click', () => openWin(b.dataset.openWin)));

/* ---- scramble easter egg ---- */
export function scrambleDesktop() {
  document.querySelectorAll('.desk-icon').forEach(i => {
    i.style.transition = 'all 0.4s steps(5)';
    i.style.top = (Math.random() * 70 + 5) + '%';
    i.style.left = (Math.random() * 80 + 2) + '%';
    i.style.right = 'auto';
    i.style.bottom = 'auto';
  });
}

/* ---- menu bar ---- */
const menuItems = document.querySelectorAll('.menu-item[data-menu]');
function closeMenus() { menuItems.forEach(m => m.classList.remove('open')); }
menuItems.forEach(m => {
  m.addEventListener('click', e => {
    e.stopPropagation();
    const was = m.classList.contains('open');
    closeMenus();
    if (!was) m.classList.add('open');
  });
});
document.addEventListener('click', closeMenus);

function doAction(action) {
  if (!action) return;
  if (action.startsWith('open:')) openWin(action.slice(5));
  else if (action === 'closeAll') closeAllWins();
  else if (action === 'reboot') location.reload();
  else if (action === 'bomb') showDialog('bombDialog');
  else if (action === 'scramble') scrambleDesktop();
  else if (action.startsWith('svc:')) { openWin('services'); setTimeout(() => toggleSvc(action.slice(4), true), 150); }
}
document.querySelectorAll('.dd-item[data-action]').forEach(d =>
  d.addEventListener('click', () => doAction(d.dataset.action)));
document.querySelectorAll('[data-action-direct]').forEach(d =>
  d.addEventListener('click', () => doAction(d.dataset.actionDirect)));

document.addEventListener('keydown', e => {
  if (!(e.metaKey || e.ctrlKey)) return;
  const map = { '1': 'open:about', '2': 'open:services', '3': 'open:contact', 'w': 'closeAll' };
  if (map[e.key]) { e.preventDefault(); doAction(map[e.key]); }
});

/* ---- clock (mac + ios) ---- */
function tickClock() {
  const d = new Date();
  const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('menu-clock', t);
  set('ios-time', t);
  set('lock-time', t);
  set('lock-date', d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
}
tickClock();
setInterval(tickClock, 10000);

/* ---- status line cycling ---- */
const statuses = [
  'SIGNAL ACTIVE', 'CARRIER DETECTED', 'TRANSMITTING...',
  'SIG:ANOMALOUS — NOMINAL', 'UPTIME: OK', 'ERR_CORRECTED',
  'FIRST CHAT FREE — NO JARGON',
];
let si = 0;
setInterval(() => {
  si = (si + 1) % statuses.length;
  const el = document.getElementById('statusRight');
  if (el) el.innerHTML = '<span class="status-blink">▮</span> ' + statuses[si];
}, 4000);

/* ============================================================
   main.js — entry point. Imports wire themselves on load; this
   file owns the cross-mode glue: mode switch, the single contact
   form, boot → desktop, funnels, and starts the glitch engine LAST
   (after every effect has registered).
   ============================================================ */
import './effects.js';
import './windows.js';
import { openWin, showDialog } from './windows.js';
import { openApp, iosBomb, initLockHijack } from './ios.js';
import { initApps } from './apps.js';
import { initRival } from './rival.js';
import { initWidgets } from './widgets.js';
import { initGoblin } from './goblin.js';
import { initBoot } from './boot.js';
import { initGlitch, isMobile } from './glitch.js';

const isIOS = () => document.body.classList.contains('mode-ios');

/* ---- mode switch + single contact form reparenting ---- */
const iosFormSlot = document.getElementById('ios-form-slot');
const macFormSlot = document.getElementById('mac-form-slot');
const formWrap = document.getElementById('contact-form-wrap');
function setMode() {
  const ios = isMobile();
  document.body.classList.toggle('mode-ios', ios);
  const slot = ios ? iosFormSlot : macFormSlot;
  if (formWrap.parentElement !== slot) slot.appendChild(formWrap);
}
setMode();
window.addEventListener('resize', setMode);

/* mobile lands on the lock screen — arm the auto "hijack" unlock */
initLockHijack();

/* ---- contact form (Formspree) ---- */
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('.send-btn');
  const confirmEl = document.getElementById('confirm');
  btn.textContent = '⏎ TRANSMITTING...';
  contactForm.style.opacity = '0.4';
  contactForm.style.pointerEvents = 'none';
  const statusEl = document.getElementById('contactStatus');
  if (statusEl) statusEl.textContent = 'carrier: BUSY';
  try {
    const res = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      confirmEl.textContent = '> MESSAGE RECEIVED. EXPECT RESPONSE WITHIN 2 WORKING DAYS._';
      confirmEl.style.color = 'var(--green-dim)';
    } else {
      confirmEl.textContent = '> ERR: TRANSMISSION FAILED. PLEASE EMAIL DIRECTLY._';
      confirmEl.style.color = 'var(--red)';
    }
  } catch {
    confirmEl.textContent = '> ERR: NO CARRIER. PLEASE EMAIL DIRECTLY._';
    confirmEl.style.color = 'var(--red)';
  }
  confirmEl.style.display = 'block';
  if (statusEl) statusEl.textContent = 'carrier: OK';
  setTimeout(() => {
    confirmEl.style.display = 'none';
    contactForm.reset();
    contactForm.style.opacity = '1';
    contactForm.style.pointerEvents = '';
    btn.textContent = '⏎ TRANSMIT';
  }, 7000);
});

/* ---- apps + rival + furniture + mascot ---- */
initApps();
initRival();
initWidgets();
initGoblin();

/* ---- boot → desktop, then funnel (desktop only; iOS funnels post-unlock) ---- */
initBoot(() => {
  openWin('about');
  setTimeout(() => { if (!isIOS()) document.getElementById('helloDialog').classList.add('open'); }, 6000);
});

/* ---- rare spontaneous bomb, late, once ---- */
setTimeout(() => {
  if (Math.random() > 0.5) { isIOS() ? iosBomb() : showDialog('bombDialog'); }
}, 90000);

/* ---- start the glitch engine (everything has registered by now) ---- */
initGlitch();

/* ============================================================
   widgets.js — desktop furniture that fills the void with purpose:
   a sticky note (gravity → contact) and a signal-integrity meter
   that reflects glitchLevel (ties the engine into the furniture).
   ============================================================ */
import { onLevel } from './glitch.js';
import { openWin } from './windows.js';
import { openApp } from './ios.js';

const isIOS = () => document.body.classList.contains('mode-ios');

/* sticky note → contact */
document.getElementById('sticky')?.addEventListener('click', () => {
  isIOS() ? openApp('contact') : openWin('contact');
});

/* signal-integrity meter = inverse of glitchLevel */
const fill = document.querySelector('#meter-widget .mw-fill');
const readout = document.querySelector('#meter-widget .mw-readout');
const STATES = {
  3: ['10%',  '#ff2244', 'INTEGRITY CRITICAL'],
  2: ['45%',  '#ffaa00', 'INTEGRITY DEGRADED'],
  1: ['75%',  '#b8ef62', 'INTEGRITY RECOVERING'],
  0: ['100%', '#39ff6e', 'INTEGRITY NOMINAL'],
};
export function initWidgets() {
  onLevel((lvl) => {
    const [w, c, label] = STATES[lvl];
    if (fill) { fill.style.width = w; fill.style.background = c; }
    if (readout) readout.textContent = '> ' + label;
  });
}

/* ============================================================
   boot.js — Mac OS startup sequence (desktop only)
   ============================================================ */
import { isMobile } from './glitch.js';

const bootLines = [
  ['init oddsignal.kernel', 'ok'],
  ['mount /dev/practice', 'ok'],
  ['load extension: PRIVATE_AI', 'ok'],
  ['load extension: HARDWARE_ART', 'ok'],
  ['load extension: CORPORATE_JARGON', 'err'],
  ['  └ skipped. not needed.', ''],
  ['detect carrier… FOUND (anomalous)', 'ok'],
  ['welcome.', 'ok'],
];

export function initBoot(onDone) {
  const boot = document.getElementById('boot');
  const bootFill = document.getElementById('bootFill');
  const bootLog = document.getElementById('bootLog');
  const bootFace = document.getElementById('bootFace');
  let done = false;

  // phones skip the Mac boot — the iOS lock screen is their entry
  if (isMobile()) { boot.remove(); return; }

  function finish() {
    if (done) return;
    done = true;
    boot.classList.add('done');
    setTimeout(() => { boot.remove(); onDone && onDone(); }, 600);
  }
  boot.addEventListener('click', finish);

  let i = 0, pct = 0;
  const faces = [':|', ':)', ':D', ';)'];
  const step = () => {
    if (done) return;
    if (i < bootLines.length) {
      const [txt, cls] = bootLines[i];
      const div = document.createElement('div');
      div.innerHTML = (cls === 'err' ? '<span class="err">✕</span> '
        : cls === 'ok' ? '<span class="ok">✓</span> ' : '&nbsp;&nbsp;') + txt;
      bootLog.appendChild(div);
      while (bootLog.children.length > 6) bootLog.removeChild(bootLog.firstChild);
      i++;
    }
    pct = Math.min(100, pct + Math.random() * 18 + 6);
    bootFill.style.width = pct + '%';
    bootFace.textContent = faces[Math.min(faces.length - 1, Math.floor(pct / 30))];
    if (pct >= 100 && i >= bootLines.length) setTimeout(finish, 700);
    else setTimeout(step, Math.random() * 300 + 180);
  };
  setTimeout(step, 400);
}

/* ============================================================
   rival.js — NORMAL WAVELENGTH™, the goblin-run corporate rival.
   iOS havoc payload = a full-screen interstitial (replaces the
   win95 popup storm on phones). Desktop storm borrows NW spam.
   Tone: dry corporate menace, played dead straight. Always the
   thing you reject on the way to the contact form.
   ============================================================ */
import { openWin } from './windows.js';
import { openApp } from './ios.js';

const isIOS = () => document.body.classList.contains('mode-ios');
function openContact() { isIOS() ? openApp('contact') : openWin('contact'); }

const ad = document.getElementById('nw-ad');

const STAGE1 = `
  <button class="nw-close" aria-label="Close">✕</button>
  <div class="nw-wrap">
    <div class="nw-sponsor"><span class="gob-mini">👹</span> ADVERTISEMENT · sponsored by НОРМАЛ WAVELENGTH</div>
    <div class="nw-logo">NORMAL <span>WAVELENGTH</span>™</div>
    <div class="nw-tag">Frequency. Normalized.</div>
    <div class="nw-lede">Enterprise technology consulting for serious organizations.</div>
    <div class="nw-jab">(You appear to be an artist. We can correct that.)</div>
    <ul class="nw-feats">
      <li>AI-synergized workflow alignment</li>
      <li>Cloud-native creative-asset orchestration</li>
      <li>Scalable human-bandwidth optimization</li>
      <li>24/7 sentiment surveillance &amp; compliance</li>
    </ul>
    <div class="nw-stars">★★★★★ Trusted by 4 of the Fortune 5.</div>
    <div class="nw-price">
      <div class="big">Plans from £4,999 / mo</div>
      <div class="small">Onboarding £12,000 · 36-month minimum · cancellation processed in 6–8 business years.</div>
    </div>
    <button class="nw-cta">REQUEST A CONSULTATION</button>
    <button class="nw-decline">no thanks</button>
    <div class="nw-fine">условия применяются. мы уже наблюдаем. NORMAL WAVELENGTH™ is a wholly-owned subsidiary of itself. By viewing this advertisement you have entered into a binding 36-month relationship. Resistance is non-scalable.</div>
  </div>`;

const STAGE2 = `
  <button class="nw-close" aria-label="Close">✕</button>
  <div class="nw-wrap">
    <div class="nw-sponsor"><span class="gob-mini">👹</span> NORMAL WAVELENGTH™ · ONBOARDING</div>
    <div class="nw-logo" style="font-size:24px">Thank you.</div>
    <div class="nw-lede" style="margin-top:14px">A NORMAL WAVELENGTH™ representative has been dispatched to your location.</div>
    <div class="nw-jab">An onboarding fee of £12,000 will be deducted automatically. Your creativity has been flagged for optimization.</div>
    <button class="nw-cta" data-nw-bail>[ actually — no ]</button>
    <div class="nw-fine" style="margin-top:14px">мы уже внутри.</div>
  </div>`;

function render(html) {
  ad.innerHTML = html;
  ad.querySelector('.nw-close')?.addEventListener('click', closeAd);
  ad.querySelector('.nw-decline')?.addEventListener('click', () => { closeAd(); openContact(); });
  ad.querySelector('.nw-cta')?.addEventListener('click', (e) => {
    if (e.currentTarget.dataset.nwBail !== undefined) { closeAd(); openContact(); }
    else render(STAGE2); // the trap deepens
  });
}

export function showNWAd() {
  render(STAGE1);
  ad.classList.add('open');
  ad.scrollTop = 0;
}
function closeAd() { ad.classList.remove('open'); }

export function initRival() {
  // tap-the-backdrop (outside the card) also closes
  ad.addEventListener('click', (e) => { if (e.target === ad) closeAd(); });
}

/* desktop popup-storm spam — mixed into the win95 storm in apps.js */
export const NW_POPUPS = [
  ['◈', 'NORMAL WAVELENGTH™ detected inefficiency'],
  ['◈', 'You qualify for ENTERPRISE SYNERGY'],
  ['◈', 'Your creativity is not scalable'],
  ['₽', 'ОПЛАТА REQUIRED: £4,999.00'],
  ['◈', 'Upgrade to a NORMAL wavelength'],
  ['☎', 'A representative is already inside'],
];

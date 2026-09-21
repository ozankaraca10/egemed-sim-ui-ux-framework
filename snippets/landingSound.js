/*
 * EGEMED SIM FRAMEWORK — snippet: landing ortam sesi (WebAudio, dosya yok, kapatılabilir)
 * ============================================================================================
 * Kural: docs/02-ekranlar.md "1. Landing" — "Landing ortam sesi" bölümü.
 * Kaynak: cardai/landing.js SOUND_KEY, scheduleBeat, schedulerTick, startMonitorSound,
 * stopMonitorSound, syncMonitorSound, attemptAudioUnlock (Pulse, Tur 5 — 21 Eylül 2026).
 *
 * NEDEN
 * -----
 * - Ürünün alanına uygun, DÜŞÜK sesli ve döngüsel bir ortam sesi (Pulse: sentetik
 *   EKG monitör "bip"i, 75 vuru/dk) landing'i daha "canlı" hissettirir; ama bu bir
 *   TERCİHTİR — varsayılan AÇIK olsa da düğme her zaman görünür, kapatma tercihi
 *   `localStorage`'a KALICI yazılır (ürün başına ayrı anahtar) ve bir daha sorulmaz.
 * - Tarayıcı otomatik oynatma (autoplay) politikası, kullanıcı bir jest (tıklama/tuş)
 *   yapmadan sesi ÇALDIRMAZ; bu yüzden ses AudioContext'i "askıda" (suspended)
 *   oluşturulur ve ilk `pointerdown`/`keydown` olayında `resume()` ile açılır — sayfa
 *   yüklendiği anda zorla ses çalmaya ÇALIŞILMAZ (başarısız olur ve konsola hata
 *   yazar).
 * - Ses YALNIZ landing görünürken ve sekme görünürken çalışır: uygulamaya girildiğinde
 *   (`enter()`) veya sekme gizlendiğinde (`visibilitychange`) DURDURULUR — öğrenme
 *   ekranlarında dikkat dağıtan bir arka plan sesi bırakılmaz.
 * - Zamanlama "look-ahead" (ileriye bakan) bir zamanlayıcı ile yapılır: her
 *   `SCHEDULE_MS`'de bir, bir sonraki `LOOKAHEAD_SEC` içine düşen tüm vuruşlar
 *   AudioContext'in kendi saatine (`ctx.currentTime`) göre ÖNCEDEN planlanır —
 *   `setInterval`'ın kendi gecikmesine güvenip vuruşu O ANDA çalmaya çalışmak,
 *   tarayıcı arka plan sekmelerinde/yoğun ana thread'de duyulabilir bir "tempo
 *   kayması"na (jitter) yol açar; look-ahead planlama bunu önler.
 *
 * PULSE'TA NEREDE
 * ----------------
 * cardai/landing.js: `SOUND_KEY='pulse.landingSound'`, `BEAT_SEC=0.8` (75/dk),
 * `LOOKAHEAD_SEC=0.5`, `SCHEDULE_MS=250`, `TONE_HZ=880`, `TONE_SEC=0.06`; düğme
 * `#landingSound` (bkz. components/sound-toggle.html), tanılama:
 * `window.CardAILanding.soundState()`. Kabul testi: qa/mode_flow_audit.mjs
 * "L4-sound-toggle-off", "L4-sound-pref-persists", "L4-sound-state-diagnostics".
 */

// Anahtar üründen ürüne değişir (Pulse: 'pulse.landingSound'; Ausculta: 'ausculta.landingSound').
const SOUND_KEY = 'pulse.landingSound';
const BEAT_SEC = 0.8;        // 60/BEAT_SEC = vuru/dk (Pulse: 75/dk)
const LOOKAHEAD_SEC = 0.5;   // her tick'te bu kadar ileriye planla
const SCHEDULE_MS = 250;     // zamanlayıcı döngü periyodu
const TONE_HZ = 880;
const TONE_SEC = 0.06;
const TONE_GAIN = 0.06;      // düşük ses seviyesi — dikkat dağıtmaz

let audioCtx = null, beatTimer = null, nextBeatTime = 0, soundRunning = false;

function soundPref() { try { return localStorage.getItem(SOUND_KEY) !== '0'; } catch { return true; } }
function setSoundPref(on) { try { localStorage.setItem(SOUND_KEY, on ? '1' : '0'); } catch {} }

function ensureAudioCtx() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try { audioCtx = new Ctx(); } catch { audioCtx = null; }
  return audioCtx;
}

// Tek bir vuruşu ctx.currentTime'a göre PLANLAR (o anda çalmaz — look-ahead).
function scheduleBeat(time) {
  const ctx = audioCtx;
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(TONE_HZ, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(TONE_GAIN, time + .008);
    gain.gain.linearRampToValueAtTime(0, time + TONE_SEC);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + TONE_SEC + .02);
  } catch {}
}

function schedulerTick() {
  const ctx = audioCtx;
  if (!ctx || !soundRunning) return;
  while (nextBeatTime < ctx.currentTime + LOOKAHEAD_SEC) {
    scheduleBeat(nextBeatTime);
    nextBeatTime += BEAT_SEC;
  }
}

function startMonitorSound() {
  const ctx = audioCtx;
  if (!ctx || ctx.state !== 'running' || soundRunning) return;
  soundRunning = true;
  nextBeatTime = ctx.currentTime + .05;
  schedulerTick();
  beatTimer = setInterval(schedulerTick, SCHEDULE_MS);
}
function stopMonitorSound() {
  soundRunning = false;
  if (beatTimer) { clearInterval(beatTimer); beatTimer = null; }
}
// Landing görünürlüğü + sekme görünürlüğü + kullanıcı tercihine göre çal/durdur kararı.
function syncMonitorSound(landingHidden) {
  if (document.hidden || landingHidden || !soundPref()) { stopMonitorSound(); return; }
  startMonitorSound();
}

// Düğme görünümünü (ikon + etiket + aria-pressed) tercihe göre günceller.
function applySoundButton(btn, iconEl, on) {
  if (!btn) return;
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.setAttribute('aria-label', on ? 'Monitör sesini kapat' : 'Monitör sesini aç');
  if (iconEl) iconEl.innerHTML = on ? SOUND_ICON.on : SOUND_ICON.off;
  const lbl = btn.querySelector('span');
  if (lbl) lbl.textContent = on ? 'Ses açık' : 'Ses kapalı';
}

const SOUND_ICON = {
  on: '<path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a9 9 0 0 1 0 12"/>',
  off: '<path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M23 9l-6 6"/><path d="M17 9l6 6"/>',
};

// Otomatik oynatma kilidini kullanıcının İLK jestinde açar (yalnız ses tercihi açıksa).
function attemptAudioUnlock(landingHidden) {
  if (!soundPref()) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  ctx.resume().then(() => {
    if (ctx.state === 'running') {
      document.removeEventListener('pointerdown', unlockHandler);
      document.removeEventListener('keydown', unlockHandler);
      syncMonitorSound(landingHidden);
    }
  }).catch(() => {});
}
function unlockHandler() { attemptAudioUnlock(false); }
document.addEventListener('pointerdown', unlockHandler);
document.addEventListener('keydown', unlockHandler);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopMonitorSound(); else syncMonitorSound(false);
});

if (typeof module !== 'undefined') {
  module.exports = {soundPref, setSoundPref, applySoundButton, syncMonitorSound, attemptAudioUnlock};
}

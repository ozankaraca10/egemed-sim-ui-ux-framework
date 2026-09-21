/*
 * EGEMED SIM FRAMEWORK — snippet: açılışta "Tam ekran önerilir" popup'ı
 * =========================================================================
 * Kural: docs/04-etkilesim-ve-erisilebilirlik.md "Açılış tam ekran önerisi" bölümü.
 * Kaynak: cardai/landing.js FS_PROMPT_KEY, fsPromptDone, markFsPromptDone,
 * ackFsPromptChoice, maybeShowFullscreenPrompt (Pulse, Tur 3 — 21 Eylül 2026).
 *
 * NEDEN
 * -----
 * Eğitim simülatörleri küçük pencerede/parçalı ekranda kullanılınca kanvas
 * okunabilirliği ve dokunma hedefleri küçülür. Landing açılır açılmaz kullanıcıya
 * tam ekrana geçmeyi ÖNERMEK (zorunlu kılmadan) deneyimi iyileştirir. Ama:
 *   - Öneri HER açılışta tekrar sorulursa can sıkıcı olur → "Tekrar sorma"
 *     seçeneği kalıcı olarak localStorage'a yazılır (ürün başına ayrı anahtar).
 *   - Bu tercih SCORM/LMS kaydına (suspend_data) YAZILMAZ — yalnızca tarayıcı
 *     konforu; farklı bir cihazda/tarayıcıda öneri yine bir kez daha sorulur.
 *     (bkz. docs/05-kayit-ve-scorm.md "localStorage yalnız konfor tercihleri")
 *   - Zaten açık bir `<dialog>` varsa (ör. devam eden bir onay akışı) öneri
 *     bindirilmez; tam ekran zaten etkinse hiç gösterilmez.
 *
 * PULSE'TA NEREDE
 * ----------------
 * cardai/landing.js: `FS_PROMPT_KEY='pulse.fsPromptDone'`, `maybeShowFullscreenPrompt()`
 * `setTimeout(maybeShowFullscreenPrompt, 400)` ile landing render'ından kısa süre
 * sonra çağrılır; dialog `#fullscreenPrompt` (bkz. components/dialog-fullscreen-prompt.html).
 * "Tam ekrana geç" / "Böyle devam et" / kapat (×) üç çıkış yolu da `ackFsPromptChoice()`
 * çağırır — yalnız checkbox işaretliyse bayrak yazılır.
 */

// Kaynak: cardai/landing.js — anahtar üründen ürüne değişir (ör. Ausculta: 'ausculta.fsPromptDone')
const FS_PROMPT_KEY = 'pulse.fsPromptDone';

function fsPromptDone() {
  try { return localStorage.getItem(FS_PROMPT_KEY) === '1'; } catch { return false; }
}
function markFsPromptDone() {
  try { localStorage.setItem(FS_PROMPT_KEY, '1'); } catch {}
}
function ackFsPromptChoice() {
  if ($('fullscreenPromptDontAsk')?.checked) markFsPromptDone();
}

function maybeShowFullscreenPrompt() {
  const fsEnabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  if (!fsEnabled) return;                                            // API yoksa hiç gösterme
  if (document.fullscreenElement || document.webkitFullscreenElement) return; // zaten tam ekran
  if (document.querySelector('dialog[open]')) return;                 // başka dialog açıksa bindirme
  if (fsPromptDone()) return;                                         // "Tekrar sorma" işaretliyse
  $('fullscreenPrompt')?.showModal();
}

// Üç çıkış yolu: onayla (gerçek tam ekrana geç), vazgeç, kapat — hepsi tercih varsa kaydeder.
$('confirmFullscreenPrompt')?.addEventListener('click', async () => {
  ackFsPromptChoice();
  $('fullscreenPrompt').close();
  try {
    if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
  } catch {}
});
$('cancelFullscreenPrompt')?.addEventListener('click', () => {
  ackFsPromptChoice();
  $('fullscreenPrompt').close();
});
$('closeFullscreenPrompt')?.addEventListener('click', () => {
  ackFsPromptChoice();
  $('fullscreenPrompt').close();
});

// Landing render'ından kısa süre sonra tetikle (DOM'un oturmasını bekle).
setTimeout(maybeShowFullscreenPrompt, 400);

if (typeof module !== 'undefined') {
  module.exports = { fsPromptDone, markFsPromptDone, ackFsPromptChoice, maybeShowFullscreenPrompt };
}

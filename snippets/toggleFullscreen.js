/*
 * EGEMED SIM FRAMEWORK — snippet: tam ekran (kök = document.documentElement, webkit fallback)
 * ================================================================================================
 * Kural: docs/04-etkilesim-ve-erisilebilirlik.md "Tam ekran" bölümü.
 * Kaynak: cardai/features.js toggleFullscreen, syncFullscreen, showUiNote
 * (Pulse, Tur 1 — 18 Eylül 2026; webkit fallback aynı turda eklendi).
 *
 * NEDEN
 * -----
 * 1) Tam ekran kökü `document.documentElement` olmalı, ürünün kendi uygulama
 *    kök elemanı (`#appRoot` vb.) OLMAMALI. Ürün, landing ekranından uygulama
 *    ekranına (veya tersine) geçtiğinde farklı bir DOM elemanı tam ekrana
 *    alınmışsa tarayıcı tam ekrandan otomatik çıkar (geçiş = kök değişimi).
 *    Kökü `document.documentElement` yapmak, landing↔uygulama geçişinde tam
 *    ekranın KORUNMASINI sağlar (kullanıcı F'ye bir daha basmak zorunda kalmaz).
 * 2) Safari/iOS `requestFullscreen`/`fullscreenElement` yerine hâlâ
 *    `webkitRequestFullscreen`/`webkitFullscreenElement` kullanabilir; her iki
 *    API de sırayla denenir (progressive fallback), hiçbiri yoksa kullanıcıya
 *    sessizce başarısız olmak yerine görünür bir bildirim gösterilir.
 * 3) Hata/bildirim `alert()`/`window.confirm()` DEĞİL, sayfa içi `#uiNote`
 *    bölgesidir (bkz. docs/04) — arayüzü bloklamaz, ekran okuyucularla uyumlu
 *    `role=status`, 3 sn sonra kendiliğinden gizlenir.
 *
 * PULSE'TA NEREDE
 * ----------------
 * cardai/features.js: `toggleFullscreen()` (F kısayolu ve düğmeler tarafından
 * çağrılır), `syncFullscreen()` (`fullscreenchange`/`webkitfullscreenchange`
 * olaylarında ikon/etiket senkronu), `showUiNote(text)` (`#uiNote` bildirimi).
 * F kısayolunun düğme odağındayken de çalışması için: cardai/features.js'teki
 * global `keydown` dinleyicisi artık `BUTTON` etiketini kısayol-engelleme
 * listesinden ÇIKARDI (yalnız INPUT/SELECT/TEXTAREA ve contentEditable hâlâ
 * engeller) — bkz. docs/04-etkilesim-ve-erisilebilirlik.md "Kısayol kapsamı".
 */

// Kaynak: cardai/features.js showUiNote
let uiNoteTimer = null;
function showUiNote(text) {
  const el = $('uiNote');
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  clearTimeout(uiNoteTimer);
  uiNoteTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

// Kaynak: cardai/features.js toggleFullscreen
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      // Kök DAİMA document.documentElement — uygulamanın kendi #root'u değil.
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else {
      throw new Error('unsupported');
    }
    C.markFeature('fullscreen');
  } catch {
    showUiNote('Tarayıcı tam ekranı engelledi');
  }
}

// Kaynak: cardai/features.js syncFullscreen (ikon/etiket senkronu)
const FS_ICON_PATHS = {
  open: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  exit: '<path d="M3 8h3a2 2 0 0 0 2-2V3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/>',
};
function syncFullscreen() {
  const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
  const icon = $('fullscreenIcon');
  if (icon) icon.innerHTML = on ? FS_ICON_PATHS.exit : FS_ICON_PATHS.open;
  $('fullscreenBtn').setAttribute('aria-label', on ? 'Tam ekrandan çık' : 'Tam ekrana geç');
  requestAnimationFrame(C.resize);
}
document.addEventListener('fullscreenchange', syncFullscreen);
document.addEventListener('webkitfullscreenchange', syncFullscreen); // webkit fallback

// F kısayolu (düğme odağında da çalışır — BUTTON kısayol-engelleme listesinde YOK):
// document.addEventListener('keydown', e => {
//   if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
//   if (e.key.toLowerCase() === 'f') { toggleFullscreen(); return; }
//   /* ...diğer kısayollar yalnız ilgili görünümde (bkz. docs/04)... */
// });

if (typeof module !== 'undefined') module.exports = { toggleFullscreen, syncFullscreen, showUiNote };

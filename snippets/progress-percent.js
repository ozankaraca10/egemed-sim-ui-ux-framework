/*
 * EGEMED SIM FRAMEWORK — snippet: ilerleme çubuğu yüzdesi (header)
 * ====================================================================
 * Kural: docs/02-ekranlar.md "Header ilerleme çubuğu" + docs/03-mod-akisi-ve-pedagoji.md.
 * Kaynak: cardai/app.js progress() (Pulse, Tur 1 — 18 Eylül 2026 hata düzeltmesi).
 *
 * NEDEN
 * -----
 * Header'daki ince ilerleme çubuğu (`#progressBar`) her görünümde farklı bir
 * paydaya göre doluluk göstermeli: İnceleme'de "toplam izlenen saniye / gerekli
 * toplam saniye", Uygulama'da "gönderilen madde / oturum boyutu", Değerlendirme'de
 * "gönderilen soru / oturum boyutu". BUG (düzeltilen hâli aşağıda): oran
 * `casesSent/COUNT` gibi 0–1 arası bir KESİR olarak hesaplanıp doğrudan
 * `style.width` yüzdesine yazılıyordu — `%` işareti eklense de sayısal değer
 * 0.30 gibi kalıyor, CSS bunu "%0.3" olarak yorumluyordu (çubuk hep boş
 * görünüyordu). Düzeltme: kesri **her zaman ×100 ile yüzdeye çevirip** öyle
 * yaz. Bu, "yüzde/kesir karışıklığı" sınıfındaki bir hatadır — herhangi bir
 * üründe ilerleme çubuğu/halka eklerken bu birim dönüşümü açıkça yapılmalı.
 *
 * PULSE'TA NEREDE
 * ----------------
 * cardai/app.js: fonksiyon `progress()`, satır sonundaki
 * `$('progressBar').style.width = (...)+'%'` ataması. Eski hatalı ifade:
 *   `casesSent/COUNT` (kesir, ×100 YOK) → yeni doğru ifade: `casesSent/COUNT*100`.
 * Aynı fonksiyon üç görünüm için üç farklı payda kullanır (aşağıda tam kod).
 */

// Kaynak: cardai/app.js progress() — üç görünüm için ayrı payda, HER ZAMAN ×100
function progress() {
  const gates = derivePrerequisites();
  let complete = 0;
  for (const m of MODES) {
    const seconds = Math.min(16, state.viewed[m]);
    const yes = seconds >= 16;
    if (yes) complete++;
    // ...tek tek örüntü işaretleri (mark) güncellemesi burada devam eder...
  }
  const sum = MODES.reduce((n, m) => n + Math.min(16, state.viewed[m]), 0);
  const casesSent = state.caseSubmitted.filter(Boolean).length;
  const quizSent = state.quizSubmitted.filter(Boolean).length;

  $('progressText').textContent =
    state.activeView === 'case' ? 'Vaka ' + (state.currentCase + 1) + ' / ' + COUNT :
    state.activeView === 'quiz' ? 'Soru ' + (state.quizPage + 1) + ' / ' + COUNT + ' · ⏱ ' + quizClockText() :
    complete + ' / ' + MODES.length + ' EKG sonucu · 16 gerçek sn';

  // DOĞRU: her payda kesri ×100 ile yüzdeye çevrilir, sonra '%' eklenir.
  $('progressBar').style.width =
    (state.activeView === 'case' ? casesSent / COUNT * 100 :
     state.activeView === 'quiz' ? quizSent / COUNT * 100 :
     sum / (MODES.length * 16) * 100) + '%';

  if (state.activeView === 'modes') renderModes(gates);
  return complete;
}

if (typeof module !== 'undefined') module.exports = { progress };

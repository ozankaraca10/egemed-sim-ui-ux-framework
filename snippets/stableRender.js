/*
 * EGEMED SIM FRAMEWORK — snippet: kararlı yeniden çizim (tıklama hedefi kaybolmasın)
 * ======================================================================================
 * Kural: docs/04-etkilesim-ve-erisilebilirlik.md "9. Tıklama hedefi kararlılığı" bölümü.
 * Kaynak: cardai/app.js renderModes(gates) (Pulse, Tur 5 — 21 Eylül 2026).
 *
 * NEDEN
 * -----
 * Mod seçim kartları, ilerleme çubuğunu güncellemek için 250 ms'de bir çalışan
 * `progress()` döngüsünden `renderModes()` çağırıyordu; eski uygulama HER
 * çağrıda `box.innerHTML=...` ile TÜM kart DOM'unu sıfırdan kuruyordu (kart
 * metni değişmese bile) ve düğmelere `forEach(...).addEventListener(...)` ile
 * HER SEFERİNDE yeniden dinleyici bağlıyordu. Sonuç: kullanıcı bir düğmeye tam
 * bu 250 ms'lik pencerede basarsa (`mousedown`), render düğmeyi DOM'dan söküp
 * yeniden ekliyordu; tarayıcı `mouseup`'ı artık var olmayan eski düğüme
 * bağlayamıyor, tıklama SESSİZCE kayboluyordu — aralıklı, açıklanamayan bir
 * arayüz hatası (basılı tutup düşünen veya parmağını hafif kaydıran kullanıcı
 * daha sık karşılaşır).
 *
 * ÇÖZÜM İKİ PARÇALIDIR:
 * 1) İçerik karşılaştırması: üretilen HTML dizesi bir önceki ile AYNIYSA
 *    `innerHTML` atamasına hiç DOKUNULMAZ (`box.dataset.rendered` önbelleği).
 *    Böylece periyodik döngü, içerik gerçekten değişmediği sürece DOM'u
 *    rahatsız etmez.
 * 2) Olay delegasyonu: tıklama dinleyicisi tek tek düğmelere değil,
 *    KONTEYNERE bağlanır ve yalnız BİR KEZ bağlanır (`box.dataset.bound`
 *    bayrağı). Konteynerin içeriği kaç kez yeniden çizilirse çizilsin
 *    (içerik değiştiği için `innerHTML` güncellendiğinde bile) dinleyici
 *    kaybolmaz ve TEKRAR eklenmez (çoğalıp aynı tıklamayı birden çok kez
 *    işlemez).
 *
 * Bu ikili kalıp, zamanlayıcıyla güncellenen HERHANGİ bir ekranda (ilerleme
 * çubuğu, canlı sayaç, oturum durumu şeridi) genel olarak uygulanmalıdır —
 * yalnız mod kartlarına özgü değildir.
 *
 * PULSE'TA NEREDE
 * ----------------
 * cardai/app.js `renderModes(gates)`; çağıran döngü: `progress()` içindeki
 * `if(state.activeView==='modes')renderModes(gates);` — bu `progress()`
 * fonksiyonu `frame()` içinde `if(now-lastProgress>250){progress();
 * lastProgress=now;}` ile 250 ms'de bir tetiklenir.
 *
 * KABUL TESTİ
 * -----------
 * bkz. docs/06-qa-kabul.md §19 ve tests/click-stability.template.mjs — her
 * görünür/etkin düğme için bas → 300 ms bekle (250 ms'lik döngüden UZUN) →
 * imleci dışarı taşı → bırak; düğüm DOM'da aynı kalmalı. Mod kartlarında
 * 20 ardışık deneme, 20/20 başarı beklenir.
 */

// Kaynak: cardai/app.js renderModes(gates=derivePrerequisites()) — ürün-bağımsız kalıp.
// `box`: kararlı biçimde yeniden çizilecek konteyner elemanı (ör. `$('modeCards')`).
// `buildHtml()`: güncel duruma göre TAM içerik HTML'ini üreten saf (yan etkisiz) fonksiyon.
// `onAction(target, event)`: delege tıklama işleyicisi; `target` `closest()` ile bulunan
// eşleşen alt öğedir (ör. `button[data-view]`), `box.contains(target)` her zaman true'dur.
function renderStable(box, buildHtml, {selector = 'button[data-view]', onAction} = {}) {
  if (!box) return;
  const html = buildHtml();
  // 1) İçerik aynıysa DOM'a hiç dokunma — periyodik çağrılar (ör. ilerleme
  //    çubuğu güncellemesi) tıklanabilir öğeleri sökmesin.
  if (box.dataset.rendered !== html) {
    box.innerHTML = html;
    box.dataset.rendered = html;
  }
  // 2) Dinleyiciyi konteynere YALNIZ BİR KEZ bağla (olay delegasyonu) —
  //    innerHTML kaç kez güncellenirse güncellensin dinleyici sabit kalır.
  if (!box.dataset.bound) {
    box.dataset.bound = '1';
    box.addEventListener('click', (e) => {
      const target = e.target.closest(selector);
      if (!target || !box.contains(target)) return;
      onAction?.(target, e);
    });
  }
}

// Kaynak: cardai/app.js renderModes(gates) — gerçek kullanım örneği.
// function renderModes(gates = derivePrerequisites()) {
//   const box = $('modeCards');
//   if (!box) return;
//   const html = learnCardHtml(gates) + practiceCardHtml(gates) + assessmentCardHtml(gates);
//   renderStable(box, () => html, {
//     selector: 'button[data-view]',
//     onAction: (btn) => (btn.dataset.view === 'results'
//       ? window.CardAResults.show('quiz')
//       : showView(btn.dataset.view)),
//   });
// }

if (typeof module !== 'undefined') module.exports = {renderStable};

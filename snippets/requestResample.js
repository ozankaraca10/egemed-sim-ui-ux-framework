/*
 * EGEMED SIM FRAMEWORK — snippet: oturum içi "yeni örneklem / yeniden başlat" onayı
 * ===================================================================================
 * Kural: docs/03-mod-akisi-ve-pedagoji.md "Örneklem ve onay" bölümü.
 * Kaynak: cardai/app.js requestResample, pendingResample + ilgili dialog dinleyicileri
 * (Pulse, Tur 1 — 18 Eylül 2026).
 *
 * NEDEN
 * -----
 * "Yeni 10 uygulama maddesi" / "Oturumu yeniden başlat" gibi eylemler kullanıcının
 * o ana kadar işaretlediği/gönderdiği yanıtları SİLER. Bu eylem tek tıkla (onay
 * istemeden) çalışırsa, yanlışlıkla tıklama tüm oturum ilerlemesini kaybettirir.
 * Kural: en az bir yanıt işaretlenmiş VEYA gönderilmişse önce bir onay dialogu
 * göster; hiçbir şey işaretlenmemiş "temiz" bir oturumda onaysız doğrudan çalıştır
 * (gereksiz sürtünme yaratma). Onay dialogu native `window.confirm` DEĞİL, uygulamanın
 * kendi `<dialog>`'udur — stil/erişilebilirlik tutarlılığı ve SCORM/iframe ortamlarında
 * `window.confirm`'in bazı LMS konteynerlerinde bastırılması riski nedeniyle.
 *
 * PULSE'TA NEREDE
 * ----------------
 * cardai/app.js: `requestResample(section, action)` — `touched` kontrolüyle karar
 * verir; dokunulmamışsa doğrudan `newSample`/`retrySample` çağırır, dokunulmuşsa
 * `pendingResample` state'ine yazıp `#resampleDialog` dialogunu açar. Dialogun
 * onay/vazgeç/kapat düğmeleri `cardai/index.html` `#resampleDialog` içindedir
 * (bkz. components/dialog-resample.html).
 *
 * ÜRÜN-BAĞIMSIZ UYGULAMA
 * ------------------------
 * `section` yerine ürünün kendi bölüm adı (Ausculta: "vaka"/"soru"; Opaca:
 * [Opaca: belirlenecek] öğe türü) kullanılabilir; `answers`/`submitted` dizileri
 * ürünün kendi state şemasından okunur.
 */

// Kaynak: cardai/app.js requestResample + pendingResample akışı
let pendingResample = null;

function requestResample(section, action) {
  const answers = section === 'case' ? state.caseAnswers : state.answers;
  const submitted = section === 'case' ? state.caseSubmitted : state.quizSubmitted;
  const touched = answers.some(a => a !== null) || submitted.some(Boolean);
  if (!touched) {
    // Dokunulmamış oturum: onay istemeden doğrudan çalıştır.
    (action === 'new' ? newSample : retrySample)(section);
    return;
  }
  // En az bir yanıt var: kendi <dialog>'umuzla onay iste (window.confirm değil).
  pendingResample = { section, action };
  $('resampleDialog').showModal();
}

// Dialog düğmeleri (bkz. components/dialog-resample.html):
$('closeResample').addEventListener('click', () => {
  $('resampleDialog').close();
  pendingResample = null;
});
$('cancelResample').addEventListener('click', () => {
  $('resampleDialog').close();
  pendingResample = null;
});
$('confirmResample').addEventListener('click', () => {
  $('resampleDialog').close();
  const p = pendingResample;
  pendingResample = null;
  if (!p) return;
  (p.action === 'new' ? newSample : retrySample)(p.section);
});

// Tetikleyiciler (araç çubuğu/oturum sonu düğmeleri):
// $('newCaseSessionBar').addEventListener('click', () => requestResample('case', 'new'));
// $('retryCaseSessionBar').addEventListener('click', () => requestResample('case', 'retry'));
// $('newQuizSession').addEventListener('click', () => requestResample('quiz', 'new'));
// $('retryBtn').addEventListener('click', () => requestResample('quiz', 'retry'));

if (typeof module !== 'undefined') module.exports = { requestResample };

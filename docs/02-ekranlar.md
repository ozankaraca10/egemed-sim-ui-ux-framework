# 02 — Ekranlar

Aile genelindeki ekran envanteri ve her ekranın kural gerekçeleri. Ürüne özgü değerler
parantez içinde örnek olarak verilir; kural metinleri ürün-bağımsızdır.

Akış: **Landing → Mod Seçimi → [İnceleme | Uygulama | Değerlendirme] → Sonuçlar**,
her ekrandan **Hakkında**'ya ve **Yardım**'a header üzerinden erişilir.

---

## 1. Landing

- Solda silik, sola yaslı kurum amblemi (`opacity:.08`, grayscale, dosya yoksa gizlenir).
- Ortada: ürün logosu → **tek satırlık** değer önerisi başlığı → 1 cümle alt metin (canlı
  sayılar: madde havuzu büyüklüğü) → birincil CTA ("Simülatörü başlat") → ikincil bağlantılar
  ("Nasıl kullanılır?", "Hakkında ve kaynaklar").
- "Neden güvenilir?" 3 kutu: madde/derivasyon sayısı + doğrulama durumu (dürüst), oturum
  büyüklüğü, SCORM uyumu.
- Alt dürüstlük satırı: "Sinyaller/kayıtlar sentetik öğretim şemalarıdır; klinik tanı için
  kullanılmaz."
- 1366×768'de **footer dahil kaydırmasız** sığar.

**Neden başlık tek satır olmalı:** İki satıra sarılan bir başlık, altındaki "Neden güvenilir?"
kutularını aşağı iter ve 1366×768'de footer'ın görünür kalması garantisini bozar (dikey alan
bütçesi sabittir). Pulse'ta "Elektriksel etkinliği, mekanik yanıtı ve dolaşımı birlikte
keşfedin." başlığı iki satıra sarıyordu; "EKG'yi, kalbi ve dolaşımı birlikte keşfedin."
biçiminde kısaltılarak tek satıra indirildi.

**Pulse'ta nerede:** `cardai/index.html` `#landingPage`; `cardai/landing.js` (sayıların
`pool.cases.length`/`pool.questions.length`'tan CANLI okunması — sabit yazılmaz).

**Açılış tam ekran önerisi (Tur 3):** Landing render'ından kısa süre sonra bir kez
"Tam ekran önerilir" popup'ı gösterilir — bkz. docs/04-etkilesim-ve-erisilebilirlik.md ve
`snippets/fullscreenPrompt.js`.

---

## 2. Mod seçimi

Üç kart: **İnceleme** (yeşil) / **Uygulama** (mavi) / **Değerlendirme** (mor) — bkz.
`components/mode-card.html`. Kartlar HER ZAMAN görünür ve tıklanabilir; kilitli olan bile
gizlenmez/disabled yapılmaz — bkz. docs/03-mod-akisi-ve-pedagoji.md "Kilit ≠ öneri" için
tam gerekçe.

Üstte ince "dürüstlük şeridi" (sentetik içerik uyarısı), kartların üstünde, ayrı bir bileşen
olarak — mod kartlarının İÇİNE karışmaz (her kartın kendi durumuna odaklanmasını sağlar).

**Pulse'ta nerede:** `cardai/index.html` `#modesView`; `cardai/app.js renderModes(gates)`.

---

## 3. Öğretici / Yardım

İlk kullanımda gerçek sahne üzerinde **3 adımlı canlı öğretici** (kalıcı "Tekrar gösterme"
bayrağı ile atlanabilir); header'daki "Yardım" düğmesi AYNI adımları statik bir modalda
metin listesi olarak gösterir (öğreticiyle çakışmaz — biri canlı/etkileşimli, diğeri referans).

**Neden gözlem sayacı öğreticide işlemez:** Öğretici görünümü (`tutorial`) İnceleme
görünümünden (`sim`) AYRI bir durumdur; gözlem sayma mantığı yalnız `sim` görünümüne
bağlıdır. Böylece öğretici adımlarını izlemek, kullanıcının gerçek 16 saniyelik gözlem
bütçesinden bir şey "çalmaz" — öğretme ile ölçme birbirine karışmaz.

**Pulse'ta nerede:** `cardai/features.js` `TUTORIAL` dizisi, `shouldRunTutorial()`,
`renderTutorial()`; `cardai/app.js` `observeEligible()` (yalnız `state.activeView==='sim'`
kapısı — `tutorial` görünümünde `false` döner).

---

## 4. Uygulama (madde) ekranı

İki sütun: solda **sahne** (kayıt/görüntü + araç çubuğu + zoom grubu), sağda **Olgu kartı**
+ **koyu soru kartı**.

### 4.1 Sahne (sol sütun)
- Kayıt kanvası + derivasyon/bölge seçici chip'leri (seçili = dolgu, incelenmiş = ✓).
- Araç çubuğu: karşılaştırma aç/kapa + gösterge (`components/compare-key.html`), kaliper,
  **zoom grubu** (`components/zoom-group.html`), oynat/duraklat, "Simülatörde aç" (yalnız
  doğru gönderim sonrası).
- Sahnenin `data-*` özniteliklerinde MOD/TANI bilgisi **bulunmaz** — bkz.
  docs/03-mod-akisi-ve-pedagoji.md "Arayüz ipucu sızıntısı".

### 4.2 Sağ sütun
- **Olgu kartı**: ikon + "Olgu" başlığı + `N/Toplam` rozeti; stem metni; varsa vitaller.
- **Soru kartı** (koyu, bkz. `components/question-card-dark.html`): tek soru, 5 seçenek,
  "Yanıtla →" (seçim yapılmadan disabled).
- **Geri bildirim** (gönderim sonrası, AYNI kartta) — bkz. `components/feedback.html`.
  CTA "Devam Et" → sonraki madde; son maddede "Maddeyi tamamla".
- **Oturum sonu kartı** (10/10 gönderildiğinde): özet şerit + madde bazlı ✓/✗ şeridi +
  "Yanlışları gözden geçir" + sonraki moda geçiş CTA'sı + "Yeni örneklem"/"Yeniden başlat"
  (onay dialoglu, bkz. docs/03).

**Pulse'ta nerede:** `cardai/index.html` `#caseView`; `cardai/features.js`
`caseStageMarkup`, `questionCardMarkup`, `caseFeedbackMarkup`, `caseEndMarkup`.

---

## 5. Değerlendirme ekranı

Aynı iki sütun düzeni, **mor kimlik**. Farklar (Uygulama'ya göre):

- Üstte **kural şeridi** (`.strict-banner`): ilk soruda TAM metin, sonrakilerde KOMPAKT
  tek satır — tekrar eden bilgiyi kısaltarak dikkat dağınıklığını azaltır.
- Her madde gönderiminden sonra **madde geri bildirimi GÖSTERİLMEZ**; yalnız kart içi
  **"Sonraki soru →"** düğmesiyle ilerlenir (son maddede "Yanıtları değerlendir →").
- Soru sayacı + **nokta ilerlemesi** (`.q-dots`, her nokta done/now durumunda).
- Alt araç çubuğunda **"Yanıtları değerlendir (n/toplam)"** düğmesi TÜM maddeler
  gönderilmeden `disabled` kalır; son maddenin gönderimiyle **otomatik** değerlendirmeye
  geçilir (kullanıcı ayrıca bu düğmeye basmak ZORUNDA değildir).
- Çıkış onayı: marka/mod değiştirme tıklanınca `<dialog>` ile onay (bkz.
  `components/dialog.html` #1).

**Neden madde geri bildirimi sonuç ekranına taşınır:** Değerlendirme SUMATİF bir ölçme
anıdır; her maddeden hemen sonra doğru cevabı göstermek, sonraki maddelerin bağımsız
ölçüm değerini bozabilir (kullanıcı önceki geri bildirimden ipucu taşıyabilir) ve genel
puanın "toplam bir sonuç" olarak deneyimlenmesini zayıflatır. Tam liste yalnız TÜM
maddeler bitince Sonuçlar → Soru raporu'nda verilir.

**Pulse'ta nerede:** `cardai/app.js renderQuiz()`, `submitQuizItem()` (10/10'da otomatik
`grade()`), `$('checkBtn').disabled=answered<10`.

---

## 6. Sonuçlar ekranı

Doküman akışında, sola hizalı, sabit maksimum genişlik. Bileşenler:

1. Başlık — varyanta göre değişir ("Değerlendirme Tamamlandı" / "Vaka Raporu").
2. **Zayıf alanlar** çipleri (başlığın hemen altında, ayrı bölüm değil) — düşük performanslı
   alanlara tıklayınca İnceleme'de ilgili maddeye açılır.
3. **Özet şeridi** — bkz. `components/results-summary.html`.
4. **Alan bazlı performans** — kavramsal alan (objective) başına yüzde + çubuk.
5. **Madde raporu** tablosu — satır tıklanınca genişler: soru, verilen yanıt, doğru yanıt,
   ✓/✗, açıklama (bu, TEK geri bildirim kaynağıdır — değerlendirme sırasında gösterilmez).
6. Eylemler — "Modülden Çık" (LMS bitirme, yalnız Değerlendirme varyantında), "Tekrar dene",
   "Yeni örneklem", "İlgili modda çalış".

**Sonuçlar varyantı (quiz/case) açıkça seçilir:** Aynı şablon iki farklı veri kümesiyle
doldurulur ama HANGİ varyantın gösterildiği düğme etiketinden değil, ÇAĞRI NOKTASINDAN
bellidir — mod kartındaki "Sonuçları gör" düğmesi doğrudan `Results.show('quiz')` çağırır
(genel `showView('results')` değil). Bu, "hangi puan gösteriliyor" belirsizliğini ortadan
kaldırır; vaka oturumu puanı LMS'ye YAZILMAZ, yalnız gösterilir (bkz. docs/05).

**Pulse'ta nerede:** `cardai/index.html` `#resultsView`; `cardai/features.js renderResults()`,
`rowsFor/domainRows/reportRows`; `cardai/app.js` mod kartı CTA'sı
`btn.dataset.view==='results'?window.CardAResults.show('quiz'):showView(btn.dataset.view)`.

---

## 7. Hakkında

Sırasıyla: **Geliştiriciler** (3 lacivert sütun, kişi başına pill rozet) → **Kurum** kartı
(mühür + açıklama + bilimsel kanıt cümlesi/atıf) → **Kaynaklar** (kılavuz/veri seti kartları)
→ **Sınırlılıklar** kutusu → "← Geri".

**Neden Geliştiriciler en üstte:** Aile genelinde şeffaflık ilkesi — kimin, hangi rolde
katkı sağladığı, ürünü kullanmadan ÖNCE görülebilir olmalı. Ünisis profiline bağlantı
verilir ama açıklama cümlesi YAZILMAZ (gereksiz metin, pill rozet zaten bağlamı taşır).

**Pulse'ta nerede:** `cardai/index.html` `#aboutView`; `cardai/features.js renderAbout()`,
`institutionCard()`, `referenceCards()`, `limitationsBox()`; veri kaynağı `cardai/sources.json`.

---

## 8. Dialoglar

Bkz. `components/dialog.html` — çıkış onayı, tam ekran önerisi, örneklem onayı, ilerleme
sıfırlama. Ortak kural: native `<dialog>`, `window.confirm()`/`alert()` KULLANILMAZ.

---

## 9. İkincil ekranlara geçiş TEK bir kapıdan yapılır (diff'te bulunan ek kural)

**Kural:** Değerlendirme (veya başka bir "yanıt kaybı riski taşıyan") moddan HERHANGİ bir
ikincil ekrana (Hakkında, Eğitici, mod seçimi…) geçiş, tek bir merkezi geçiş fonksiyonundan
(`leaveFor`/eşdeğeri) yapılır — asla doğrudan görünüm değiştirme çağrısıyla (`showView`
eşdeğeri) BYPASS EDİLMEZ. Aksi hâlde çıkış onay dialogu (bkz. §8) yalnız BAZI çıkış
yollarında tetiklenir, bazılarında (ör. "Hakkında" düğmesi) SESSİZCE atlanır — kullanıcı
için tutarsız bir davranış.

**Neden bu kural eklendi:** Bu, brifin Tur 1 listesinde AÇIKÇA yer almayan ama
`git diff -- cardai` incelemesinde bulunan bir düzeltmedir: `$('aboutBtn')` düğmesinin
tıklama işleyicisi `C.showView('about')` (çıkış onayını ATLAYAN doğrudan çağrı) yerine
`C.leaveFor('about')` (merkezi kapı — Değerlendirme modundaysa önce onay dialogu açar)
olarak değiştirildi. Genel kural: bir ürüne yeni bir "üstten erişilen ikincil ekran"
düğmesi eklerken, o düğmenin çıkış onayı gerektiren MEVCUT merkezi geçiş fonksiyonunu
çağırdığından emin olun — yeni bir kısayol/bypass YOLU açmayın.

**Pulse'ta nerede:** `cardai/features.js` — `$('aboutBtn').addEventListener('click',
()=>C.showView('about'))` → `()=>C.leaveFor('about'))` (Tur 1). Merkezi kapı:
`cardai/app.js leaveFor(target)` — `if(state.activeView==='quiz'&&target!=='quiz'){
pendingExit=target;$('quizExitDialog').showModal();return;}`.
